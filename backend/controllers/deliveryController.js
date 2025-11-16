const Delivery = require('../models/Delivery');

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

exports.updateDelivery = async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('farmer', 'name cellNumber');

    if (!updatedDelivery) {
      return res.status(400).json({ msg: 'Delivery not found' });
    }
    res.json(updatedDelivery);
  } catch (err) {
    console.error("DELIVERY UPDATE FAILED", err.message);
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid ID or validation failed' });
    }
    res.status(500).send('Server error');
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!deletedDelivery) {
      return res.status(400).json({ msg: 'Delivery not found' });
    }
    res.json({ msg: 'Delivery successfully deleted' });

  } catch (err) {
    console.error("DELIVERY DELETE FAILED", err.message);
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid ID format' });
    }
    res.status(500).send('Server error');
  }
};