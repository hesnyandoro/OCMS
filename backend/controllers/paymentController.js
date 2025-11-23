const Payment = require('../models/Payment');
const Farmer = require('../models/Farmer');
const User = require('../models/User');

exports.getPayments = async (req, res) => {
  try {
    let query = {};

    // Field agents can only view payment status for their assigned region
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      // Only filter by region if field agent has one assigned
      if (user && user.assignedRegion) {
        // Find farmers in the agent's region
        const farmers = await Farmer.find({ weighStation: user.assignedRegion }).select('_id');
        const farmerIds = farmers.map(f => f._id);
        
        // Only show payments for farmers in their region
        query.farmer = { $in: farmerIds };
      }
      // If no region assigned, they can see all payments
    }

    const payments = await Payment.find(query)
      .populate('farmer', 'name cellNumber weighStation')
      .populate('delivery', 'date kgsDelivered type')
      .populate('recordedBy', 'username name')
      .sort({ date: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).send('Server error');
  }
};

exports.createPayment = async (req, res) => {
  try {
    // Admin creates payments, so recordedBy is set
    const paymentData = {
      ...req.body,
      recordedBy: req.user.id
    };

    const payment = new Payment(paymentData);
    await payment.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('farmer', 'name cellNumber')
      .populate('delivery', 'date kgsDelivered type')
      .populate('recordedBy', 'username name');
    
    res.status(201).json(populatedPayment);
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