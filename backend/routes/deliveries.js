const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getDeliveries, getDelivery, createDelivery, deleteDelivery, updateDelivery, getUnpaidDeliveriesByFarmer, getDeliveryTypesByFarmer, getTotalKgsByType } = require('../controllers/deliveryController');
const { startTrip, endTrip, getInTransit, startDriverTrip, endDriverTrip } = require('../controllers/tripController');
const router = express.Router();

// Payment-related endpoints
router.get('/unpaid/:farmerId', verifyToken, authorize('admin', 'fieldagent'), getUnpaidDeliveriesByFarmer);
router.get('/types/:farmerId', verifyToken, authorize('admin', 'fieldagent'), getDeliveryTypesByFarmer);
router.get('/total/:farmerId/:type', verifyToken, authorize('admin', 'fieldagent'), getTotalKgsByType);

router.get('/in-transit', verifyToken, authorize('admin', 'fieldagent'), getInTransit);
router.post('/trips/start', verifyToken, authorize('admin', 'fieldagent'), startDriverTrip);
router.post('/trips/end', verifyToken, authorize('admin', 'fieldagent'), endDriverTrip);
router.post('/:id/start-trip', verifyToken, authorize('admin', 'fieldagent'), startTrip);
router.post('/:id/end-trip', verifyToken, authorize('admin', 'fieldagent'), endTrip);

// Both roles can read deliveries (region-filtered for field agents)
router.get('/', verifyToken, authorize('admin', 'fieldagent'), getDeliveries);
router.get('/:id', verifyToken, authorize('admin', 'fieldagent'), getDelivery);

// Both roles can create deliveries
router.post('/', verifyToken, authorize('admin', 'fieldagent'), createDelivery);

// Only admin can update/delete deliveries
router.put('/:id', verifyToken, authorize('admin'), updateDelivery);
router.delete('/:id', verifyToken, authorize('admin'), deleteDelivery);

module.exports = router;