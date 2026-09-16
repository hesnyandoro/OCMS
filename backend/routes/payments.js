const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getPayments, createPayment, updatePayment, deletePayment, retryPayment } = require('../controllers/paymentController');

const router = express.Router();

// Field agents can view payment status (region-filtered), admin has full access
router.get('/', verifyToken, authorize('admin', 'fieldagent'), getPayments);

// Only admin can create, update, delete payments
router.post('/', verifyToken, authorize('admin'), createPayment);
router.post('/:id/retry', verifyToken, authorize('admin'), retryPayment);
router.put('/:id', verifyToken, authorize('admin'), updatePayment);
router.delete('/:id', verifyToken, authorize('admin'), deletePayment);

module.exports = router;