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

exports.updatePayment = async (req, res) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, 
            { new: true, runValidators: true }
        ).populate('farmer delivery');

        if (!updatedPayment) {
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        res.json(updatedPayment);

    } catch (err) {
        console.error("PAYMENT UPDATE FAILED:", err.message);
        if (err.name === 'CastError' || err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Invalid ID format or validation failed.' });
        }
        res.status(500).send('Server error');
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);

        if (!deletedPayment) {
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        res.json({ msg: 'Payment record successfully removed' });
        
    } catch (err) {
        console.error("PAYMENT DELETE FAILED:", err.message);
        if (err.name === 'CastError') {
             return res.status(400).json({ msg: 'Invalid ID format.' });
        }
        res.status(500).send('Server error');
    }
};