const app = require('../backend/app');
const connectDB = require('../backend/config/db');

// Defense in depth: the driver's own timeout options should bound connectDB(),
// but the mongodb+srv DNS lookup phase in this driver version isn't guaranteed
// to respect them on every network, so this race ensures we always fail fast
// instead of hanging until Vercel's own function duration limit.
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB connect timeout')), ms)),
  ]);

module.exports = async (req, res) => {
  try {
    await withTimeout(connectDB(), 9000);
  } catch (err) {
    console.error('MongoDB CONNECTION FAILED', err.message);
    return res.status(503).json({ msg: 'Database unavailable' });
  }

  return app(req, res);
};
