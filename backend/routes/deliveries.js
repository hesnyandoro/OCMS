const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { getDeliveries, getDelivery, createDelivery, deleteDelivery, updateDelivery } = require('../controllers/deliveryController');
const router = express.Router();

// Both roles can read deliveries (region-filtered for field agents)
router.get('/', auth, authorize('admin', 'fieldagent'), getDeliveries);
router.get('/:id', auth, authorize('admin', 'fieldagent'), getDelivery);

// Both roles can create deliveries
router.post('/', auth, authorize('admin', 'fieldagent'), createDelivery);

// Only admin can update/delete deliveries
router.put('/:id', auth, authorize('admin'), updateDelivery);
router.delete('/:id', auth, authorize('admin'), deleteDelivery);

module.exports = router;