const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.set('autoIndex', false);

const CONNECT_MS = 8000;

// Serverless invocations reuse the same process, so the connection promise is
// memoized on globalThis to keep cold starts from opening a new Atlas pool each time.
let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null, indexesCreated: false };
}

const sanitizeUri = (raw) => {
  if (!raw) return '';
  return String(raw).trim().replace(/^['"]|['"]$/g, '');
};

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(label)), ms)
    ),
  ]);

// Best-effort; never block a user-facing request on index creation.
const ensureCriticalIndexes = async () => {
  if (cached.indexesCreated) return;

  try {
    const Session = require('../models/Session');
    const PasswordReset = require('../models/PasswordReset');

    await Session.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await Session.collection.createIndex({ userId: 1 }).catch(() => {});
    await Session.collection.createIndex({ token: 1 }).catch(() => {});

    await PasswordReset.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await PasswordReset.collection.createIndex({ token: 1 }, { unique: true }).catch(() => {});
    await PasswordReset.collection.createIndex({ userId: 1 }).catch(() => {});

    cached.indexesCreated = true;
  } catch (err) {
    console.warn('Warning: Could not create indexes:', err.message);
  }
};

const connectDB = async () => {
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  const uri = sanitizeUri(process.env.MONGO_URI);
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  if (!cached.promise) {
    console.log('Mongo connecting', {
      srv: uri.startsWith('mongodb+srv://'),
      len: uri.length,
    });

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: CONNECT_MS,
      connectTimeoutMS: CONNECT_MS,
      socketTimeoutMS: 10000,
      maxPoolSize: 1,
      // Atlas + Vercel: prefer IPv4; IPv6 DNS often hangs until timeout
      family: 4,
    }).then((mongooseInstance) => mongooseInstance.connection);
  }

  try {
    cached.conn = await withTimeout(
      cached.promise,
      CONNECT_MS + 1500,
      'DB connect timeout'
    );
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    throw err;
  }

  ensureCriticalIndexes().catch(() => {});
  return cached.conn;
};

module.exports = connectDB;
