const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const {
  register,
  login,
  logout,
  logoutAll,
  getSessions,
  deleteSession,
  updateProfile,
  changePassword,
  uploadAvatar,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter
});

// Registration and Login
router.post('/register', [
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'fieldagent'])
], register);

router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], login);

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    res.status(500).send('Server error during session check');
  }
});

// Profile management
router.put('/profile', verifyToken, [
  body('username').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('name').optional()
], updateProfile);

// Password management
router.put('/change-password', verifyToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], changePassword);

// Avatar upload
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

// Session management
router.get('/sessions', verifyToken, getSessions);
router.delete('/sessions/:sessionId', verifyToken, deleteSession);
router.post('/logout', verifyToken, logout);
router.post('/logout-all', verifyToken, logoutAll);

// Password reset
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

module.exports = router;