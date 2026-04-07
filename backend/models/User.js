const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String }, // Full name (firstName + secondName + lastName)
  role: { type: String, enum: ['admin', 'fieldagent'], required: true },
  assignedRegion: { type: String }, // Locks field agents to specific regions
  regionBounds: {
    centerLat: { type: Number },
    centerLng: { type: Number },
    radiusKm: { type: Number, default: 50 }
    // Geofence bounds for assigned region (optional, for geo-validation)
  },
  avatar: { type: String } // Profile picture URL/path
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
