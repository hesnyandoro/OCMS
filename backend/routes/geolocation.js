const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { verifyToken, authorize } = require('../middleware/auth');
const {
  getNearbyFarmers,
  getNearestDeliveries,
  validateUserLocation,
  calculateDistanceBetweenPoints,
  recordPickupLocation,
  recordDropoffLocation,
  geocodeRegion,
} = require('../controllers/geolocationController');

const geocodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many geocoding requests. Wait a moment and try again.' },
});

const distanceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many distance requests. Wait a moment and try again.' },
});

const geoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many geolocation requests. Wait a moment and try again.' },
});

router.get('/farmers/nearby', geoLimiter, verifyToken, authorize('admin', 'fieldagent'), getNearbyFarmers);
router.get('/distance', distanceLimiter, verifyToken, calculateDistanceBetweenPoints);
router.get('/geocode', geocodeLimiter, verifyToken, geocodeRegion);

router.get('/deliveries/nearest', geoLimiter, verifyToken, getNearestDeliveries);
router.post('/validate-location', geoLimiter, verifyToken, validateUserLocation);
router.post('/deliveries/:id/pickup', geoLimiter, verifyToken, recordPickupLocation);
router.post('/deliveries/:id/dropoff', geoLimiter, verifyToken, recordDropoffLocation);

module.exports = router;
