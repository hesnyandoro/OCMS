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
      .populate('delivery', 'date kgsDelivered type paymentStatus')
      .populate('recordedBy', 'username name')
      .populate('voidedBy', 'username name')
      .sort({ date: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).send('Server error');
  }
};

exports.createPayment = async (req, res) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  
  try {
    // Start transaction for ACID compliance
    session.startTransaction();
    
    // Admin creates payments, so recordedBy is set
    const paymentData = {
      ...req.body,
      recordedBy: req.user.id
    };

    const payment = new Payment(paymentData);
    await payment.save({ session });
    
    // Update delivery payment status to 'Paid'
    if (payment.delivery) {
      const Delivery = require('../models/Delivery');
      const delivery = await Delivery.findByIdAndUpdate(
        payment.delivery,
        { paymentStatus: 'Paid' },
        { new: true, session }
      );
      
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      console.log(`Payment created: Delivery ${payment.delivery} marked as Paid`);
    }
    
    // Commit the transaction - both operations succeed or both fail
    await session.commitTransaction();
    session.endSession();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('farmer', 'name cellNumber')
      .populate('delivery', 'date kgsDelivered type paymentStatus')
      .populate('recordedBy', 'username name');
    
    console.log(`Payment ${payment._id} created successfully with ACID compliance`);
    res.status(201).json(populatedPayment);
    
  } catch (err) {
    // If any error occurs, rollback all changes
    await session.abortTransaction();
    session.endSession();
    
    console.error('PAYMENT CREATION FAILED - Transaction rolled back:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    }
    res.status(500).json({ msg: 'Server error - transaction rolled back', error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    
    try {
        // Start transaction for ACID compliance
        session.startTransaction();
        
        const payment = await Payment.findById(req.params.id).session(session);
        
        if (!payment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        // If voiding a completed payment, update ALL related deliveries back to Pending
        if (payment.status === 'Completed' && req.body.status === 'Failed' && req.body.voidReason) {
            const Delivery = require('../models/Delivery');
            
            // Find all deliveries linked to this payment
            // This includes the primary delivery and any others that might be linked
            const deliveriesToUpdate = await Delivery.find({
                _id: payment.delivery,
                paymentStatus: 'Paid'
            }).session(session);

            if (deliveriesToUpdate.length > 0) {
                // Update all linked deliveries to Pending status
                const deliveryIds = deliveriesToUpdate.map(d => d._id);
                await Delivery.updateMany(
                    { _id: { $in: deliveryIds } },
                    { $set: { paymentStatus: 'Pending' } },
                    { session }
                );
                
                console.log(`Void Payment: Reset ${deliveriesToUpdate.length} delivery(ies) to Pending status`);
            }
        }

        // Update the payment record
        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, 
            { new: true, runValidators: true, session }
        )
        .populate('farmer', 'name cellNumber')
        .populate('delivery', 'date kgsDelivered type paymentStatus')
        .populate('recordedBy', 'username name')
        .populate('voidedBy', 'username name');

        // Commit the transaction - both operations succeed or both fail
        await session.commitTransaction();
        session.endSession();

        console.log(`Payment ${req.params.id} voided successfully with ACID compliance`);
        res.json(updatedPayment);

    } catch (err) {
        // If any error occurs, rollback all changes
        await session.abortTransaction();
        session.endSession();
        
        console.error("PAYMENT UPDATE FAILED - Transaction rolled back:", err.message);
        if (err.name === 'CastError' || err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Invalid ID format or validation failed.' });
        }
        res.status(500).json({ msg: 'Server error - transaction rolled back', error: err.message });
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