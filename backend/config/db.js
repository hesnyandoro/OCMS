const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
// Index creation should be a deliberate one-off (see backend/optimize-db-indexes.js),
// not something that silently runs inside a user-facing request on cold start.
mongoose.set('autoIndex', false);

// Serverless invocations reuse the same process, so the connection promise is
// memoized on globalThis to keep cold starts from opening a new Atlas pool each time.
let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

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
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
