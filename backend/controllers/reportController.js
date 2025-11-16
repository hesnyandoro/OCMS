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