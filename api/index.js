const app = require('../backend/app');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB CONNECTION FAILED', err.message);
    return res.status(503).json({
      msg: 'Database unavailable',
      reason: err.message,
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('API HANDLER FAILED', err.message || err);
    if (!res.headersSent) {
      return res.status(500).json({ msg: 'Server error' });
    }
  }
};
