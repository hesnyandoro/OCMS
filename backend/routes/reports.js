const express = require('express');
const auth = require('../middleware/auth');
const { generateReport, getSummary } = require('../controllers/reportController');

const router = express.Router();

router.get('/', auth, generateReport);
router.get('/summary', auth, getSummary);

module.exports = router;