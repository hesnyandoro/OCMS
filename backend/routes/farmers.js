const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { getFarmers, getFarmer, createFarmer, updateFarmer, deleteFarmer } = require('../controllers/farmerController');

const router = express.Router();

// Both roles can read farmers (region-filtered for field agents)
router.get('/', auth, authorize('admin', 'fieldagent'), getFarmers);
router.get('/:id', auth, authorize('admin', 'fieldagent'), getFarmer);

// Both roles can create farmers
router.post('/', auth, authorize('admin', 'fieldagent'), createFarmer);

// Only admin can update/delete farmers
router.put('/:id', auth, authorize('admin'), updateFarmer);
router.delete('/:id', auth, authorize('admin'), deleteFarmer);

module.exports = router;