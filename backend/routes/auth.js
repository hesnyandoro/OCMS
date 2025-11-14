const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('username').notEmpty(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'fieldagent'])
], register);

router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], login);

module.exports = router;