// Similar for payments
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
    res.json(payment);
  } catch (err) {
    res.status(500).send('Server error');
  }
};