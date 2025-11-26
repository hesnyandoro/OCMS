const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farmer', 
    required: true 
  },
  
  delivery: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Delivery',
    required: true
  },
  
  deliveryType: {
    type: String,
    enum: ['Cherry', 'Parchment'],
    required: true
  },
  
  kgsDelivered: {
    type: Number,
    required: true,
    min: 0
  },
  
  pricePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  
  amountPaid: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  
  date: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },  
  
  currency: { 
    type: String, 
    default: 'Ksh' 
  },
  
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true  
  },
  
  voidReason: {
    type: String
  },
  
  voidedAt: {
    type: Date
  },
  
  voidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

paymentSchema.index({ farmer: 1, date: 1 });

module.exports = mongoose.model('Payment', paymentSchema);