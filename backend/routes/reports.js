const express = require('express');
const auth = require('../middleware/auth');
const { generateReport } = require('../controllers/reportController');

const router = express.Router();

router.get('/', auth, generateReport);

module.exports = router;