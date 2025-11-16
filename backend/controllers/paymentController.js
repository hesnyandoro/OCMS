const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('farmer delivery');
    res.json(payments);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error('PAYMENT CREATION FAILED:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    }
    res.status(500).send('Server error');
  }
};