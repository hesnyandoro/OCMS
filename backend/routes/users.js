const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { createFieldAgent, resendInvite, getUsers, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Only admin can manage users
router.post('/field-agent', verifyToken, authorize('admin'), createFieldAgent);
router.post('/:id/resend-invite', verifyToken, authorize('admin'), resendInvite);
router.get('/', verifyToken, authorize('admin'), getUsers);
router.put('/:id', verifyToken, authorize('admin'), updateUser);
router.delete('/:id', verifyToken, authorize('admin'), deleteUser);

module.exports = router;
