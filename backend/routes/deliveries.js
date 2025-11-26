const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { getDeliveries, getDelivery, createDelivery, deleteDelivery, updateDelivery, getUnpaidDeliveriesByFarmer, getDeliveryTypesByFarmer, getTotalKgsByType } = require('../controllers/deliveryController');
const router = express.Router();

// Payment-related endpoints
router.get('/unpaid/:farmerId', auth, authorize('admin', 'fieldagent'), getUnpaidDeliveriesByFarmer);
router.get('/types/:farmerId', auth, authorize('admin', 'fieldagent'), getDeliveryTypesByFarmer);
router.get('/total/:farmerId/:type', auth, authorize('admin', 'fieldagent'), getTotalKgsByType);

// Both roles can read deliveries (region-filtered for field agents)
router.get('/', auth, authorize('admin', 'fieldagent'), getDeliveries);
router.get('/:id', auth, authorize('admin', 'fieldagent'), getDelivery);

// Both roles can create deliveries
router.post('/', auth, authorize('admin', 'fieldagent'), createDelivery);

// Only admin can update/delete deliveries
router.put('/:id', auth, authorize('admin'), updateDelivery);
router.delete('/:id', auth, authorize('admin'), deleteDelivery);

module.exports = router;