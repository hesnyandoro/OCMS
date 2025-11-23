const express = require('express');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { createFieldAgent, getUsers, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Only admin can manage users
router.post('/field-agent', auth, authorize('admin'), createFieldAgent);
router.get('/', auth, authorize('admin'), getUsers);
router.put('/:id', auth, authorize('admin'), updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
