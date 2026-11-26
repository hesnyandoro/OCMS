const mongoose = require('mongoose');
const { toGeoJSONPoint } = require('../utils/geolocation');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
  },

  cellNumber: {
    type: String,
    required: [true, 'Cell number is required'],
    unique: true,
  },

  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
  },

  season: {
    type: String,
    required: [true, 'Season is required'],
    enum: ['Long', 'Short'],
  },

  farmLocation: {
    lat: { type: Number, min: [-90, 'Latitude must be between -90 and 90'], max: [90, 'Latitude must be between -90 and 90'] },
    lng: { type: Number, min: [-180, 'Longitude must be between -180 and 180'], max: [180, 'Longitude must be between -180 and 180'] },
    address: { type: String, trim: true },
  },

  // GeoJSON Point mirrored from farmLocation lat/lng for 2dsphere queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },

  weighStation: {
    type: String,
    required: true,
    trim: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

}, { timestamps: true });

function syncGeoPoint(doc) {
  const lat = doc?.farmLocation?.lat;
  const lng = doc?.farmLocation?.lng;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    doc.location = toGeoJSONPoint(lat, lng);
  }
}

farmerSchema.pre('save', function syncLocationOnSave(next) {
  syncGeoPoint(this);
  next();
});

farmerSchema.pre('findOneAndUpdate', function syncLocationOnUpdate(next) {
  const update = this.getUpdate() || {};
  const set = update.$set || update;
  const loc = set.farmLocation;
  if (loc && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lng))) {
    const point = toGeoJSONPoint(Number(loc.lat), Number(loc.lng));
    if (update.$set) {
      update.$set.location = point;
    } else {
      update.location = point;
    }
  }
  next();
});

farmerSchema.index({ location: '2dsphere' }, { sparse: true });
farmerSchema.index({ weighStation: 1 });

module.exports = mongoose.model('Farmer', farmerSchema);
