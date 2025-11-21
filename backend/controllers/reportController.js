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