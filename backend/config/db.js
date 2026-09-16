const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
// Index creation should be a deliberate one-off (see backend/optimize-db-indexes.js),
// not something that silently runs inside a user-facing request on cold start.
mongoose.set('autoIndex', false);

// Serverless invocations reuse the same process, so the connection promise is
// memoized on globalThis to keep cold starts from opening a new Atlas pool each time.
let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null, indexesCreated: false };
}

// Ensure critical indexes exist for Session and PasswordReset models
const ensureCriticalIndexes = async () => {
  if (cached.indexesCreated) return; // Only create indexes once per process
  
  try {
    const Session = require('../models/Session');
    const PasswordReset = require('../models/PasswordReset');
    
    // Session indexes - critical for auth
    await Session.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await Session.collection.createIndex({ userId: 1 }).catch(() => {});
    await Session.collection.createIndex({ token: 1 }).catch(() => {});
    
    // PasswordReset indexes - critical for password recovery
    await PasswordReset.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await PasswordReset.collection.createIndex({ token: 1 }, { unique: true }).catch(() => {});
    await PasswordReset.collection.createIndex({ userId: 1 }).catch(() => {});
    
    cached.indexesCreated = true;
  } catch (err) {
    console.warn('Warning: Could not create indexes:', err.message);
    // Don't throw - indexes not existing shouldn't crash the app
  }
};

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not set');

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 8000,
        family: 4,
      })
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  try {
    cached.conn = await cached.promise;
    
    // Ensure critical indexes exist
    await ensureCriticalIndexes();
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
