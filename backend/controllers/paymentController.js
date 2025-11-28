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
      .populate('deliveries', 'date kgsDelivered type paymentStatus')
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
  const Delivery = require('../models/Delivery');
  const session = await mongoose.startSession();
  
  try {
    // Start transaction for ACID compliance
    session.startTransaction();
    
    const { deliveryIds, farmer, deliveryType, pricePerKg } = req.body;
    
    // Validate that delivery IDs array is provided
    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      throw new Error('At least one delivery must be selected');
    }
    
    // Fetch all deliveries to validate
    const deliveries = await Delivery.find({ _id: { $in: deliveryIds } }).session(session);
    
    if (deliveries.length !== deliveryIds.length) {
      throw new Error('One or more deliveries not found');
    }
    
    // Validate all deliveries belong to the same farmer
    const farmerMismatch = deliveries.some(d => d.farmer.toString() !== farmer);
    if (farmerMismatch) {
      throw new Error('All deliveries must belong to the same farmer');
    }
    
    // Validate all deliveries are the same type
    const typeMismatch = deliveries.some(d => d.type !== deliveryType);
    if (typeMismatch) {
      throw new Error('All deliveries must be of the same type');
    }
    
    // Validate all deliveries are pending
    const alreadyPaid = deliveries.some(d => d.paymentStatus === 'Paid');
    if (alreadyPaid) {
      throw new Error('One or more deliveries have already been paid');
    }
    
    // Calculate totals
    const totalKgs = deliveries.reduce((sum, d) => sum + d.kgsDelivered, 0);
    const totalAmount = totalKgs * pricePerKg;
    
    // Create payment record
    const paymentData = {
      farmer,
      deliveries: deliveryIds,
      deliveryType,
      kgsDelivered: totalKgs,
      pricePerKg,
      amountPaid: totalAmount,
      status: 'Completed',
      date: req.body.date || Date.now(),
      currency: req.body.currency || 'Ksh',
      recordedBy: req.user.id
    };

    const payment = new Payment(paymentData);
    await payment.save({ session });
    
    // Update all deliveries: set payment reference (status is derived from payment)
    await Delivery.updateMany(
      { _id: { $in: deliveryIds } },
      { 
        $set: { 
          payment: payment._id 
        } 
      },
      { session }
    );
    
    console.log(`Batch Payment created: ${deliveries.length} deliveries (${totalKgs} kgs) marked as Paid`);
    
    // Commit the transaction - all operations succeed or all fail
    await session.commitTransaction();
    session.endSession();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('farmer', 'name cellNumber weighStation')
      .populate('deliveries', 'date kgsDelivered type paymentStatus')
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
    res.status(500).json({ msg: err.message || 'Server error - transaction rolled back' });
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

        // If voiding a completed payment, unlink deliveries (status becomes Pending automatically)
        if (payment.status === 'Completed' && req.body.status === 'Failed' && req.body.voidReason) {
            const Delivery = require('../models/Delivery');
            
            // Unlink payment from deliveries (status derived from absence of payment)
            await Delivery.updateMany(
                { _id: { $in: payment.deliveries } },
                { 
                    $unset: { payment: 1 }
                },
                { session }
            );
            
            console.log(`Void Payment: Unlinked ${payment.deliveries.length} delivery(ies) - status now Pending`);
        }

        // Update the payment record
        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, 
            { new: true, runValidators: true, session }
        )
        .populate('farmer', 'name cellNumber weighStation')
        .populate('deliveries', 'date kgsDelivered type paymentStatus')
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

exports.retryPayment = async (req, res) => {
  const mongoose = require('mongoose');
  const Delivery = require('../models/Delivery');
  const session = await mongoose.startSession();
  
  try {
    // Start transaction for ACID compliance
    session.startTransaction();
    
    const { retryReason, pricePerKg } = req.body;
    
    if (!retryReason || !retryReason.trim()) {
      throw new Error('Retry reason is required');
    }
    
    // Fetch the failed payment
    const failedPayment = await Payment.findById(req.params.id).session(session);
    
    if (!failedPayment) {
      throw new Error('Payment record not found');
    }
    
    if (failedPayment.status !== 'Failed') {
      throw new Error('Only failed payments can be retried');
    }
    
    // Fetch all deliveries linked to this payment
    const deliveries = await Delivery.find({ 
      _id: { $in: failedPayment.deliveries } 
    }).session(session);
    
    if (deliveries.length === 0) {
      throw new Error('No deliveries found for this payment');
    }
    
    // Check if any deliveries are already paid by another admin
    const Payment = require('../models/Payment');
    const alreadyPaidDeliveries = [];
    
    for (const delivery of deliveries) {
      if (delivery.payment && delivery.payment.toString() !== failedPayment._id.toString()) {
        // Check if linked payment is Completed
        const linkedPayment = await Payment.findById(delivery.payment).session(session);
        if (linkedPayment && linkedPayment.status === 'Completed') {
          alreadyPaidDeliveries.push(delivery);
        }
      }
    }
    
    if (alreadyPaidDeliveries.length > 0) {
      const paidCount = alreadyPaidDeliveries.length;
      const totalCount = deliveries.length;
      throw new Error(
        `Cannot retry: ${paidCount} of ${totalCount} delivery(ies) have already been paid by another admin`
      );
    }
    
    // Calculate totals - use new price if provided, else use original
    const finalPricePerKg = pricePerKg ? parseFloat(pricePerKg) : failedPayment.pricePerKg;
    const totalKgs = deliveries.reduce((sum, d) => sum + d.kgsDelivered, 0);
    const totalAmount = totalKgs * finalPricePerKg;
    
    // Create new payment record
    const newPaymentData = {
      farmer: failedPayment.farmer,
      deliveries: failedPayment.deliveries,
      deliveryType: failedPayment.deliveryType,
      kgsDelivered: totalKgs,
      pricePerKg: finalPricePerKg,
      amountPaid: totalAmount,
      status: 'Completed',
      date: new Date(), // New date for retry
      currency: failedPayment.currency || 'Ksh',
      recordedBy: req.user.id,
      isRetry: true,
      retriedFrom: failedPayment._id,
      retryReason: retryReason.trim()
    };
    
    const newPayment = new Payment(newPaymentData);
    await newPayment.save({ session });
    
    // Update all deliveries: link to new payment (status derived from payment)
    await Delivery.updateMany(
      { _id: { $in: failedPayment.deliveries } },
      { 
        $set: { 
          payment: newPayment._id 
        } 
      },
      { session }
    );
    
    console.log(`Payment retry successful: ${deliveries.length} deliveries (${totalKgs} kgs) marked as Paid`);
    console.log(`New payment ${newPayment._id} created from failed payment ${failedPayment._id}`);
    
    // Original failed payment remains unchanged for audit trail
    
    // Commit the transaction - all operations succeed or all fail
    await session.commitTransaction();
    session.endSession();
    
    const populatedPayment = await Payment.findById(newPayment._id)
      .populate('farmer', 'name cellNumber weighStation')
      .populate('deliveries', 'date kgsDelivered type paymentStatus')
      .populate('recordedBy', 'username name')
      .populate('retriedFrom', 'date amountPaid status');
    
    res.status(201).json({
      msg: 'Payment retried successfully',
      payment: populatedPayment,
      originalPaymentId: failedPayment._id
    });
    
  } catch (err) {
    // If any error occurs, rollback all changes
    await session.abortTransaction();
    session.endSession();
    
    console.error('PAYMENT RETRY FAILED - Transaction rolled back:', err);
    res.status(400).json({ msg: err.message || 'Failed to retry payment' });
  }
};