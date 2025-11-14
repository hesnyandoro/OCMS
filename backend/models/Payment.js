const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farmer', 
    required: true 
  },
  
  delivery: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
  amountPaid: { 
    type: Number, required: true, min: 0 },
  date: { 
    type: Date, required: true },
  currency: { 
    type: String, default: 'Ksh' },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true  
  }  
}, { timestamps: true });

paymentSchema.index({ farmer: 1, date: 1 });

module.exports = mongoose.model('Payment', paymentSchema);