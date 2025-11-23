const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { generateReport, getSummary, getDeliveriesReport } = require('../controllers/reportController');

const router = express.Router();

// Only admin can access all reports
router.get('/', auth, authorize('admin'), generateReport);
router.get('/deliveries', auth, authorize('admin'), getDeliveriesReport);
router.get('/summary', auth, authorize('admin'), getSummary);

module.exports = router;