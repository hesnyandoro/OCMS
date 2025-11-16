const express = require('express');
const auth = require('../middleware/auth');
const { getPayments, createPayment, updatePayment, deletePayment } = require('../controllers/paymentController');

const router = express.Router();

router.get('/', auth, getPayments);
router.post('/', auth, createPayment);
router.put('/:id', auth, updatePayment);
router.delete('/:id', auth, deletePayment);

module.exports = router;