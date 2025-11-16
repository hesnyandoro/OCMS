// Similar structure to farmerController for getDeliveries, createDelivery, etc.
const Delivery = require('../models/Delivery');

// Implement CRUD...
exports.getDeliveries = async (req, res) => {
  try {
    const deliveries = (await Delivery.find().sort({ date: -1 }).populate('farmer', 'name cellNumber'))
    res.json(deliveries);
  } catch (err) {
    console.error("DELIVERY FETCH FAILED", err);
    res.status(500).send('Server error');
  }
};

exports.createDelivery = async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    }
    res.status(500).send('Server error');
  }
};
