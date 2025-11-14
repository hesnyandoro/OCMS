const express = require('express');
const auth = require('../middleware/auth');
const { getFarmers, getFarmer, createFarmer, updateFarmer, deleteFarmer } = require('../controllers/farmerController');

const router = express.Router();

router.get('/', auth, getFarmers);
router.get('/:id', auth, getFarmer);
router.post('/', auth, createFarmer);
router.put('/:id', auth, updateFarmer);
router.delete('/:id', auth, deleteFarmer);

module.exports = router;