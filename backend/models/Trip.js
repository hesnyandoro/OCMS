const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  driverName: {
    type: String,
    trim: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'live', 'ended'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  last: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
    recordedAt: { type: Date }
  }
}, { timestamps: true });

tripSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tripSchema.index({ delivery: 1, status: 1 });
tripSchema.index({ driverName: 1, status: 1 });

module.exports = mongoose.model('Trip', tripSchema);
