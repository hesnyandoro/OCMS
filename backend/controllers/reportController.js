const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');
const Farmer = require('../models/Farmer');

exports.getSummary = async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments({});
    const totalDeliveries = await Delivery.countDocuments({});
    const pendingPaymentsCount = await Payment.countDocuments({ status: 'pending' });

    res.json({
      totalFarmers,
      totalDeliveries,
      pendingPaymentsCount
    });
  
  } catch (err) {
    console.error("REPORT SUMMARY FETCH FAILED", err);
    res.status(500).send({ error: 'Server error' });
  }
};

exports.generateReport = async (req, res) => {
  const { region, startDate, endDate, driver, farmer } = req.query;

  try {
    const filter = {};
    if (region) filter.region = region;
    if (driver) filter.driver = driver;
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
    if (farmer) filter.farmer = farmer;

    const deliveries = await Delivery.find(filter).populate('farmer');
    const payments = await Payment.find({ ...filter, date: filter.date }).populate('farmer');

    res.json({ deliveries, payments });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Aggregated deliveries report
exports.getDeliveriesReport = async (req, res) => {
  try {
    const { groupBy = 'weighStation', startDate, endDate, region, driver, type } = req.query;

    const match = {};
    // date range
    if (startDate || endDate) match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
    // optional filters
    if (region) match.region = region;
    if (driver) match.driver = driver;
    // Delivery model uses 'type' for delivery type
    if (type) match.type = type;

    const pipeline = [];
    if (Object.keys(match).length) pipeline.push({ $match: match });

    // join farmer to be able to group by farmer or farmer.weighStation
    pipeline.push({
      $lookup: {
        from: 'farmers',
        localField: 'farmer',
        foreignField: '_id',
        as: 'farmer'
      }
    });
    pipeline.push({ $unwind: { path: '$farmer', preserveNullAndEmptyArrays: true } });

    let groupStage;
    if (groupBy === 'farmer') {
      groupStage = {
        _id: '$farmer._id',
        farmerName: { $first: '$farmer.name' },
        totalKgs: { $sum: '$kgsDelivered' },
        deliveries: { $sum: 1 }
      };
    } else if (groupBy === 'month') {
      groupStage = {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        totalKgs: { $sum: '$kgsDelivered' },
        deliveries: { $sum: 1 }
      };
    } else if (groupBy === 'region') {
      groupStage = {
        _id: '$region',
        totalKgs: { $sum: '$kgsDelivered' },
        deliveries: { $sum: 1 }
      };
    } else if (groupBy === 'driver') {
      groupStage = {
        _id: '$driver',
        totalKgs: { $sum: '$kgsDelivered' },
        deliveries: { $sum: 1 }
      };
    } else {
      // default: group by weighStation (farmer.weighStation) or region
      groupStage = {
        _id: { $ifNull: [ '$farmer.weighStation', '$region' ] },
        totalKgs: { $sum: '$kgsDelivered' },
        deliveries: { $sum: 1 }
      };
    }

    pipeline.push({ $group: groupStage });

    pipeline.push({
      $project: {
        _id: 0,
        groupName: '$_id',
        totalKgs: 1,
        deliveries: 1
      }
    });

    pipeline.push({ $sort: { totalKgs: -1 } });

    const result = await Delivery.aggregate(pipeline);
    return res.json(result);
  } catch (err) {
    console.error('GET DELIVERIES REPORT FAILED', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// HIGH PRIORITY: Payment Status Analytics
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    // Payment status breakdown
    const statusBreakdown = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' }
        }
      }
    ]);

    // Voided payments analysis
    const voidedPayments = await Payment.find({
      ...match,
      status: 'Failed',
      voidReason: { $exists: true }
    }).populate('farmer', 'name').populate('voidedBy', 'name username');

    const voidReasons = {};
    voidedPayments.forEach(p => {
      const reason = p.voidReason || 'Unknown';
      voidReasons[reason] = (voidReasons[reason] || 0) + 1;
    });

    // Payment success rate
    const totalPayments = await Payment.countDocuments(match);
    const completedPayments = await Payment.countDocuments({ ...match, status: 'Completed' });
    const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

    // Payment velocity (payments per day)
    const firstPayment = await Payment.findOne(match).sort({ date: 1 });
    const lastPayment = await Payment.findOne(match).sort({ date: -1 });
    
    let paymentVelocity = 0;
    if (firstPayment && lastPayment) {
      const daysDiff = Math.max(1, Math.ceil((new Date(lastPayment.date) - new Date(firstPayment.date)) / (1000 * 60 * 60 * 24)));
      paymentVelocity = totalPayments / daysDiff;
    }

    // Outstanding payment aging
    const pendingPayments = await Payment.find({ ...match, status: 'Pending' });
    const agingBuckets = {
      '0-30': 0,
      '31-60': 0,
      '60+': 0
    };
    
    const now = new Date();
    pendingPayments.forEach(p => {
      const daysPending = Math.ceil((now - new Date(p.date)) / (1000 * 60 * 60 * 24));
      if (daysPending <= 30) agingBuckets['0-30']++;
      else if (daysPending <= 60) agingBuckets['31-60']++;
      else agingBuckets['60+']++;
    });

    res.json({
      statusBreakdown,
      voidedPayments: {
        total: voidedPayments.length,
        totalAmount: voidedPayments.reduce((sum, p) => sum + p.amountPaid, 0),
        reasons: voidReasons,
        details: voidedPayments
      },
      successRate: successRate.toFixed(2),
      paymentVelocity: paymentVelocity.toFixed(2),
      agingBuckets,
      totalPayments
    });
  } catch (err) {
    console.error('PAYMENT ANALYTICS FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// HIGH PRIORITY: Cashflow Forecast
exports.getCashflowForecast = async (req, res) => {
  try {
    const { forecastDays = 30 } = req.query;
    
    // Get historical payment data (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const historicalPayments = await Payment.find({
      date: { $gte: ninetyDaysAgo },
      status: 'Completed'
    });

    // Calculate daily average
    const dailyAverage = historicalPayments.reduce((sum, p) => sum + p.amountPaid, 0) / 90;

    // Get pending deliveries (unpaid) - deliveries without payment or with failed/pending payment
    const pendingDeliveries = await Delivery.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: 'payment',
          foreignField: '_id',
          as: 'paymentInfo'
        }
      },
      {
        $match: {
          $or: [
            { paymentInfo: { $size: 0 } },
            { 'paymentInfo.status': { $in: ['Pending', 'Failed'] } }
          ]
        }
      },
      {
        $lookup: {
          from: 'farmers',
          localField: 'farmer',
          foreignField: '_id',
          as: 'farmerInfo'
        }
      },
      {
        $project: {
          _id: 1,
          type: 1,
          kgsDelivered: 1,
          farmer: { $arrayElemAt: ['$farmerInfo', 0] }
        }
      }
    ]);

    // Calculate expected obligations
    const expectedObligations = await Payment.aggregate([
      { $match: { deliveryType: { $exists: true }, pricePerKg: { $exists: true } } },
      {
        $group: {
          _id: '$deliveryType',
          avgPricePerKg: { $avg: '$pricePerKg' }
        }
      }
    ]);

    const avgPrices = {};
    expectedObligations.forEach(item => {
      avgPrices[item._id] = item.avgPricePerKg;
    });

    let totalPendingObligation = 0;
    pendingDeliveries.forEach(d => {
      const price = avgPrices[d.type] || 50; // fallback price
      totalPendingObligation += d.kgsDelivered * price;
    });

    // Forecast next X days
    const forecast = [];
    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        expectedPayout: dailyAverage,
        cumulativePayout: dailyAverage * i
      });
    }

    res.json({
      historicalDailyAverage: dailyAverage.toFixed(2),
      totalPendingObligation: totalPendingObligation.toFixed(2),
      pendingDeliveriesCount: pendingDeliveries.length,
      forecast,
      next7Days: (dailyAverage * 7).toFixed(2),
      next30Days: (dailyAverage * 30).toFixed(2),
      next90Days: (dailyAverage * 90).toFixed(2)
    });
  } catch (err) {
    console.error('CASHFLOW FORECAST FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// HIGH PRIORITY: Farmer Performance Scorecards
exports.getFarmerPerformance = async (req, res) => {
  try {
    const { limit = 20, sortBy = 'totalValue' } = req.query;

    // Get all farmers with their performance metrics
    const farmerPerformance = await Delivery.aggregate([
      {
        $lookup: {
          from: 'farmers',
          localField: 'farmer',
          foreignField: '_id',
          as: 'farmerInfo'
        }
      },
      { $unwind: '$farmerInfo' },
      {
        $group: {
          _id: '$farmer',
          farmerName: { $first: '$farmerInfo.name' },
          cellNumber: { $first: '$farmerInfo.cellNumber' },
          weighStation: { $first: '$farmerInfo.weighStation' },
          totalDeliveries: { $sum: 1 },
          totalKgs: { $sum: '$kgsDelivered' },
          avgKgsPerDelivery: { $avg: '$kgsDelivered' },
          firstDelivery: { $min: '$date' },
          lastDelivery: { $max: '$date' }
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'farmer',
          as: 'payments'
        }
      },
      {
        $addFields: {
          totalPaid: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    as: 'payment',
                    cond: { $eq: ['$$payment.status', 'Completed'] }
                  }
                },
                as: 'p',
                in: '$$p.amountPaid'
              }
            }
          },
          paymentCount: {
            $size: {
              $filter: {
                input: '$payments',
                as: 'payment',
                cond: { $eq: ['$$payment.status', 'Completed'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          avgPayment: {
            $cond: [
              { $gt: ['$paymentCount', 0] },
              { $divide: ['$totalPaid', '$paymentCount'] },
              0
            ]
          },
          daysSinceLastDelivery: {
            $divide: [
              { $subtract: [new Date(), '$lastDelivery'] },
              1000 * 60 * 60 * 24
            ]
          },
          reliabilityScore: {
            $cond: [
              { $gt: ['$totalDeliveries', 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      '$totalDeliveries',
                      {
                        $add: [
                          {
                            $divide: [
                              { $subtract: [new Date(), '$firstDelivery'] },
                              1000 * 60 * 60 * 24 * 30
                            ]
                          },
                          1
                        ]
                      }
                    ]
                  },
                  10
                ]
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          payments: 0
        }
      },
      {
        $sort: sortBy === 'totalValue' ? { totalPaid: -1 } : 
               sortBy === 'reliability' ? { reliabilityScore: -1 } :
               { totalKgs: -1 }
      },
      { $limit: parseInt(limit) }
    ]);

    // Classify farmers
    const inactiveFarmers = farmerPerformance.filter(f => f.daysSinceLastDelivery > 30);
    const activeFarmers = farmerPerformance.filter(f => f.daysSinceLastDelivery <= 30);
    const vipFarmers = farmerPerformance.filter(f => f.totalPaid > 100000); // Over 100k Ksh

    res.json({
      farmerPerformance,
      summary: {
        total: farmerPerformance.length,
        active: activeFarmers.length,
        inactive: inactiveFarmers.length,
        vip: vipFarmers.length
      },
      inactiveFarmers: inactiveFarmers.slice(0, 10)
    });
  } catch (err) {
    console.error('FARMER PERFORMANCE FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// HIGH PRIORITY: Comparative Analytics (YoY, MoM)
exports.getComparativeAnalytics = async (req, res) => {
  try {
    const now = new Date();
    
    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Previous month
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Current year
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    
    // Previous year
    const previousYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    // Month-over-Month
    const currentMonthDeliveries = await Delivery.aggregate([
      { $match: { date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
      { $group: { _id: null, totalKgs: { $sum: '$kgsDelivered' }, count: { $sum: 1 } } }
    ]);

    const previousMonthDeliveries = await Delivery.aggregate([
      { $match: { date: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
      { $group: { _id: null, totalKgs: { $sum: '$kgsDelivered' }, count: { $sum: 1 } } }
    ]);

    const currentMonthPayments = await Payment.aggregate([
      { $match: { date: { $gte: currentMonthStart, $lte: currentMonthEnd }, status: 'Completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amountPaid' }, count: { $sum: 1 } } }
    ]);

    const previousMonthPayments = await Payment.aggregate([
      { $match: { date: { $gte: previousMonthStart, $lte: previousMonthEnd }, status: 'Completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amountPaid' }, count: { $sum: 1 } } }
    ]);

    // Year-over-Year
    const currentYearDeliveries = await Delivery.aggregate([
      { $match: { date: { $gte: currentYearStart } } },
      { $group: { _id: null, totalKgs: { $sum: '$kgsDelivered' }, count: { $sum: 1 } } }
    ]);

    const previousYearDeliveries = await Delivery.aggregate([
      { $match: { date: { $gte: previousYearStart, $lte: previousYearEnd } } },
      { $group: { _id: null, totalKgs: { $sum: '$kgsDelivered' }, count: { $sum: 1 } } }
    ]);

    const currentYearPayments = await Payment.aggregate([
      { $match: { date: { $gte: currentYearStart }, status: 'Completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amountPaid' }, count: { $sum: 1 } } }
    ]);

    const previousYearPayments = await Payment.aggregate([
      { $match: { date: { $gte: previousYearStart, $lte: previousYearEnd }, status: 'Completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amountPaid' }, count: { $sum: 1 } } }
    ]);

    const calcGrowth = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return (((current - previous) / previous) * 100).toFixed(2);
    };

    res.json({
      monthOverMonth: {
        deliveries: {
          current: currentMonthDeliveries[0] || { totalKgs: 0, count: 0 },
          previous: previousMonthDeliveries[0] || { totalKgs: 0, count: 0 },
          growth: calcGrowth(
            currentMonthDeliveries[0]?.totalKgs || 0,
            previousMonthDeliveries[0]?.totalKgs || 0
          )
        },
        payments: {
          current: currentMonthPayments[0] || { totalAmount: 0, count: 0 },
          previous: previousMonthPayments[0] || { totalAmount: 0, count: 0 },
          growth: calcGrowth(
            currentMonthPayments[0]?.totalAmount || 0,
            previousMonthPayments[0]?.totalAmount || 0
          )
        }
      },
      yearOverYear: {
        deliveries: {
          current: currentYearDeliveries[0] || { totalKgs: 0, count: 0 },
          previous: previousYearDeliveries[0] || { totalKgs: 0, count: 0 },
          growth: calcGrowth(
            currentYearDeliveries[0]?.totalKgs || 0,
            previousYearDeliveries[0]?.totalKgs || 0
          )
        },
        payments: {
          current: currentYearPayments[0] || { totalAmount: 0, count: 0 },
          previous: previousYearPayments[0] || { totalAmount: 0, count: 0 },
          growth: calcGrowth(
            currentYearPayments[0]?.totalAmount || 0,
            previousYearPayments[0]?.totalAmount || 0
          )
        }
      }
    });
  } catch (err) {
    console.error('COMPARATIVE ANALYTICS FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// MEDIUM PRIORITY: Delivery Type Analytics (Cherry vs Parchment)
exports.getDeliveryTypeAnalytics = async (req, res) => {
  try {
    const typeComparison = await Delivery.aggregate([
      {
        $group: {
          _id: '$type',
          totalKgs: { $sum: '$kgsDelivered' },
          deliveries: { $sum: 1 },
          avgKgsPerDelivery: { $avg: '$kgsDelivered' }
        }
      }
    ]);

    // Get pricing by type
    const pricingByType = await Payment.aggregate([
      { $match: { status: 'Completed', deliveryType: { $exists: true } } },
      {
        $group: {
          _id: '$deliveryType',
          avgPricePerKg: { $avg: '$pricePerKg' },
          totalRevenue: { $sum: '$amountPaid' },
          totalKgs: { $sum: '$kgsDelivered' }
        }
      }
    ]);

    // Type by season
    const typeBySeason = await Delivery.aggregate([
      {
        $group: {
          _id: { type: '$type', season: '$season' },
          totalKgs: { $sum: '$kgsDelivered' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          seasons: {
            $push: {
              season: '$_id.season',
              totalKgs: '$totalKgs',
              count: '$count'
            }
          }
        }
      }
    ]);

    res.json({
      typeComparison,
      pricingByType,
      typeBySeason
    });
  } catch (err) {
    console.error('DELIVERY TYPE ANALYTICS FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// MEDIUM PRIORITY: Regional Profitability
exports.getRegionalProfitability = async (req, res) => {
  try {
    const regionalMetrics = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      {
        $lookup: {
          from: 'farmers',
          localField: 'farmer',
          foreignField: '_id',
          as: 'farmerInfo'
        }
      },
      { $unwind: '$farmerInfo' },
      {
        $group: {
          _id: '$farmerInfo.weighStation',
          totalPaid: { $sum: '$amountPaid' },
          totalKgs: { $sum: '$kgsDelivered' },
          paymentCount: { $sum: 1 },
          avgPricePerKg: { $avg: '$pricePerKg' },
          farmerCount: { $addToSet: '$farmer' }
        }
      },
      {
        $project: {
          region: '$_id',
          totalPaid: 1,
          totalKgs: 1,
          paymentCount: 1,
          avgPricePerKg: 1,
          farmerCount: { $size: '$farmerCount' }
        }
      },
      { $sort: { totalPaid: -1 } }
    ]);

    // Calculate growth by region (MoM)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const regionalGrowth = await Payment.aggregate([
      { $match: { status: 'Completed', date: { $gte: lastMonth } } },
      {
        $lookup: {
          from: 'farmers',
          localField: 'farmer',
          foreignField: '_id',
          as: 'farmerInfo'
        }
      },
      { $unwind: '$farmerInfo' },
      {
        $group: {
          _id: '$farmerInfo.weighStation',
          recentTotal: { $sum: '$amountPaid' }
        }
      }
    ]);

    res.json({
      regionalMetrics,
      regionalGrowth
    });
  } catch (err) {
    console.error('REGIONAL PROFITABILITY FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// MEDIUM PRIORITY: Operational Efficiency Metrics
exports.getOperationalMetrics = async (req, res) => {
  try {
    // Average payment cycle time
    const paymentsWithDeliveries = await Payment.find({
      status: 'Completed',
      deliveries: { $exists: true, $ne: [] }
    }).populate('deliveries');

    let totalCycleTime = 0;
    let cycleCount = 0;

    paymentsWithDeliveries.forEach(p => {
      if (p.deliveries && p.deliveries.length > 0) {
        // Use the first delivery's date for cycle time calculation
        const firstDeliveryDate = p.deliveries[0].date;
        if (firstDeliveryDate) {
          const cycleTime = (new Date(p.date) - new Date(firstDeliveryDate)) / (1000 * 60 * 60 * 24);
          if (cycleTime >= 0) {
            totalCycleTime += cycleTime;
            cycleCount++;
          }
        }
      }
    });

    const avgPaymentCycleTime = cycleCount > 0 ? (totalCycleTime / cycleCount).toFixed(2) : 0;

    // Cost per transaction
    const totalPayments = await Payment.countDocuments({ status: 'Completed' });
    const totalAmount = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const avgTransactionSize = totalPayments > 0 ? 
      ((totalAmount[0]?.total || 0) / totalPayments).toFixed(2) : 0;

    // Driver performance
    const driverMetrics = await Delivery.aggregate([
      {
        $group: {
          _id: '$driver',
          totalDeliveries: { $sum: 1 },
          totalKgs: { $sum: '$kgsDelivered' },
          avgKgsPerDelivery: { $avg: '$kgsDelivered' }
        }
      },
      { $sort: { totalKgs: -1 } },
      { $limit: 10 }
    ]);

    // System usage stats
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentDeliveries = await Delivery.countDocuments({ createdAt: { $gte: last30Days } });
    const recentPayments = await Payment.countDocuments({ createdAt: { $gte: last30Days } });
    const recentFarmers = await Farmer.countDocuments({ createdAt: { $gte: last30Days } });

    res.json({
      avgPaymentCycleTime,
      avgTransactionSize,
      driverMetrics,
      systemUsage: {
        last30Days: {
          deliveries: recentDeliveries,
          payments: recentPayments,
          newFarmers: recentFarmers
        }
      }
    });
  } catch (err) {
    console.error('OPERATIONAL METRICS FAILED', err);
    res.status(500).json({ error: 'Server error' });
  }
};