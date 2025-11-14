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
  }
}, { timestamps: true });

deliverySchema.index({ farmer: 1, date: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);