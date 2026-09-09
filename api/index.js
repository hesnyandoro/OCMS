const app = require('../backend/app');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB CONNECTION FAILED', err.message);
    return res.status(503).json({ msg: 'Database unavailable' });
  }

  return app(req, res);
};
