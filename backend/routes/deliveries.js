const express = require('express');
const auth = require('../middleware/auth');
const { getDeliveries, createDelivery, deleteDelivery, updateDelivery } = require('../controllers/deliveryController');
const router = express.Router();

router.get('/', auth, getDeliveries);
router.post('/', auth, createDelivery);
router.delete('/:id', auth, deleteDelivery);
router.put('/:id', auth, updateDelivery);

module.exports = router;