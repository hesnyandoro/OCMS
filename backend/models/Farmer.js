const mongoose = require('mongoose');

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
    enum: ['Long', 'Short'], required: true 
  },

  farmLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },

  weighStation: { 
    type: String, 
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);