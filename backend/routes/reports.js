const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const {
  generateReport,
  getSummary,
  getDeliveriesReport,
  getPaymentAnalytics,
  getCashflowForecast,
  getDeliveryTypeAnalytics,
  getFarmerPerformance,
  getRegionalProfitability,
  getOperationalMetrics,
  getComparativeAnalytics
} = require('../controllers/reportController');

const router = express.Router();

// Only admin can access all reports
router.get('/', verifyToken, authorize('admin'), generateReport);
router.get('/deliveries', verifyToken, authorize('admin'), getDeliveriesReport);
router.get('/summary', verifyToken, authorize('admin'), getSummary);

// High Priority Features
router.get('/payment-analytics', verifyToken, authorize('admin'), getPaymentAnalytics);
router.get('/cashflow-forecast', verifyToken, authorize('admin'), getCashflowForecast);
router.get('/farmer-performance', verifyToken, authorize('admin'), getFarmerPerformance);
router.get('/comparative-analytics', verifyToken, authorize('admin'), getComparativeAnalytics);

// Medium Priority Features
router.get('/delivery-type-analytics', verifyToken, authorize('admin'), getDeliveryTypeAnalytics);
router.get('/regional-profitability', verifyToken, authorize('admin'), getRegionalProfitability);
router.get('/operational-metrics', verifyToken, authorize('admin'), getOperationalMetrics);

module.exports = router;