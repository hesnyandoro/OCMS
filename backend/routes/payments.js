const express = require('express');
const auth = require('../middleware/auth');
const { getPayments, createPayment } = require('../controllers/paymentController'); // Add more CRUD as needed

const router = express.Router();

router.get('/', auth, getPayments);
router.post('/', auth, createPayment);

module.exports = router;