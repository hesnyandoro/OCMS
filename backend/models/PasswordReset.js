const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  token: { 
    type: String, 
    required: true,
    unique: true
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
  }
}, { timestamps: true });

// Index for faster token lookups
passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ userId: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
