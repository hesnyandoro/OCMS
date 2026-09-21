const express = require('express');
const { body } = require('express-validator');
const { verifyToken, authorize } = require('../middleware/auth');
const { getDrivers, createDriver } = require('../controllers/driverController');

const router = express.Router();

router.get('/', verifyToken, authorize('admin', 'fieldagent'), getDrivers);
router.post('/', verifyToken, authorize('admin', 'fieldagent'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
], createDriver);

module.exports = router;
