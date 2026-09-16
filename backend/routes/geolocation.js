const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const {
  getNearbyFarmers,
  getNearestDeliveries,
  validateUserLocation,
  calculateDistanceBetweenPoints,
  recordPickupLocation,
  recordDropoffLocation,
} = require('../controllers/geolocationController');

/**
 * Public geolocation endpoints (no auth required for distance calculations)
 */

// Find farmers near a location
router.get('/farmers/nearby', getNearbyFarmers);

// Calculate distance between two points
router.get('/distance', calculateDistanceBetweenPoints);

/**
 * Protected geolocation endpoints (require authentication)
 */

// Find nearest deliveries to driver
router.get('/deliveries/nearest', verifyToken, getNearestDeliveries);

// Validate user's current location against assigned region
router.post('/validate-location', verifyToken, validateUserLocation);

// Record pickup location for a delivery
router.post('/deliveries/:id/pickup', verifyToken, recordPickupLocation);

// Record dropoff location for a delivery
router.post('/deliveries/:id/dropoff', verifyToken, recordDropoffLocation);

module.exports = router;
