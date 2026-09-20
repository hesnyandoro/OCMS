const mongoose = require('mongoose');

const tripPingSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number },
  recordedAt: { type: Date, default: Date.now }
});

tripPingSchema.index({ trip: 1, recordedAt: -1 });
tripPingSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 48 * 60 * 60 });

module.exports = mongoose.model('TripPing', tripPingSchema);
