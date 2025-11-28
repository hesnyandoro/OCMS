const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farmer', 
    required: true },

  date: { 
    type: Date, 
    required: [true, 'Date is required'], 
  },

  type: { 
    type: String, 
    enum: ['Cherry', 'Parchment'], 
    required: true,
  },

  kgsDelivered: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  region: { 
    type: String, 
    required: true, 
  },

  driver: { 
    type: String, 
    required: true 
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to derive payment status from Payment model (Single Source of Truth)
deliverySchema.virtual('paymentStatus').get(function() {
  // This is a placeholder - actual status is computed via aggregation/populate
  // Frontend should use the payment.status field when available
  return this.payment ? 'Linked' : 'Pending';
});

deliverySchema.index({ farmer: 1, date: 1 });
deliverySchema.index({ payment: 1 }); // Index for efficient payment lookups

module.exports = mongoose.model('Delivery', deliverySchema);