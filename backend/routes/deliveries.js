const express = require('express');
const auth = require('../middleware/auth');
const { getDeliveries, createDelivery } = require('../controllers/deliveryController'); // Add more CRUD as needed

const router = express.Router();

router.get('/', auth, getDeliveries);
router.post('/', auth, createDelivery);

module.exports = router;