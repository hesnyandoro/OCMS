const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
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
router.get('/', auth, authorize('admin'), generateReport);
router.get('/deliveries', auth, authorize('admin'), getDeliveriesReport);
router.get('/summary', auth, authorize('admin'), getSummary);

// High Priority Features
router.get('/payment-analytics', auth, authorize('admin'), getPaymentAnalytics);
router.get('/cashflow-forecast', auth, authorize('admin'), getCashflowForecast);
router.get('/farmer-performance', auth, authorize('admin'), getFarmerPerformance);
router.get('/comparative-analytics', auth, authorize('admin'), getComparativeAnalytics);

// Medium Priority Features
router.get('/delivery-type-analytics', auth, authorize('admin'), getDeliveryTypeAnalytics);
router.get('/regional-profitability', auth, authorize('admin'), getRegionalProfitability);
router.get('/operational-metrics', auth, authorize('admin'), getOperationalMetrics);

module.exports = router;