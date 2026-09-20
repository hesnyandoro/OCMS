const express = require('express');
const rateLimit = require('express-rate-limit');
const { pingTrip, getPublicTrip } = require('../controllers/tripController');

const router = express.Router();

const pingLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many location updates. Slow down.' }
});

router.get('/:token', getPublicTrip);
router.post('/:token/ping', pingLimiter, pingTrip);

module.exports = router;
