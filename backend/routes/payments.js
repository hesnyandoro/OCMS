const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { getPayments, createPayment, updatePayment, deletePayment } = require('../controllers/paymentController');

const router = express.Router();

// Field agents can view payment status (region-filtered), admin has full access
router.get('/', auth, authorize('admin', 'fieldagent'), getPayments);

// Only admin can create, update, delete payments
router.post('/', auth, authorize('admin'), createPayment);
router.put('/:id', auth, authorize('admin'), updatePayment);
router.delete('/:id', auth, authorize('admin'), deletePayment);

module.exports = router;