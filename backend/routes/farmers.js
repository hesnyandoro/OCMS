const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getFarmers, getFarmer, createFarmer, updateFarmer, deleteFarmer, searchFarmers } = require('../controllers/farmerController');

const router = express.Router();

// Search farmers (for searchable dropdown)
router.get('/search', verifyToken, authorize('admin', 'fieldagent'), searchFarmers);

// Both roles can read farmers (region-filtered for field agents)
router.get('/', verifyToken, authorize('admin', 'fieldagent'), getFarmers);
router.get('/:id', verifyToken, authorize('admin', 'fieldagent'), getFarmer);

// Both roles can create farmers
router.post('/', verifyToken, authorize('admin', 'fieldagent'), createFarmer);

// Only admin can update/delete farmers
router.put('/:id', verifyToken, authorize('admin'), updateFarmer);
router.delete('/:id', verifyToken, authorize('admin'), deleteFarmer);

module.exports = router;