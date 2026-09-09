const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

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
      .connect(uri, { bufferCommands: false })
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
