const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { put } = require('@vercel/blob');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Session = require('../models/Session');
const PasswordReset = require('../models/PasswordReset');
const { issuePasswordResetLink } = require('../utils/sendAuthEmail');

// Helper to extract device info
const getDeviceInfo = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) return 'Android Mobile';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS Device';
  if (userAgent.includes('Windows')) return 'Windows Chrome';
  if (userAgent.includes('Macintosh')) return 'Mac Chrome';
  if (userAgent.includes('Linux')) return 'Linux Chrome';
  
  return 'Unknown Device';
};

// Helper to create session
const createSession = async (userId, token, req) => {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  try {
    const session = new Session({
      userId,
      token,
      deviceInfo: getDeviceInfo(req.headers['user-agent']),
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      expiresAt
    });
    
    await session.save();
    return session;
  } catch (err) {
    console.error('Session creation failed:', err);
    throw err;
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // Support login by username OR email
  let { username, password } = req.body;

  try {
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username/email and password are required' });
    }

    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    const payload = { user: { id: user.id, role: user.role, assignedRegion: user.assignedRegion } };
    const token = await new Promise((resolve, reject) => {
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });
    
    // Create session
    await createSession(user.id, token, req);
    
    const userData = { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      name: user.name,
      role: user.role, 
      assignedRegion: user.assignedRegion 
    };
    res.json({ token, user: userData });
  } catch (err) {
    console.error("USER LOGIN FAILED", err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Logout - invalidate current session
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await Session.deleteOne({ token });
    }
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ msg: 'Server error during logout' });
  }
};

// Logout all devices
exports.logoutAll = async (req, res) => {
  try {
    await Session.deleteMany({ userId: req.user.id });
    res.json({ msg: 'Logged out from all devices' });
  } catch (err) {
    console.error('Logout all error:', err);
    res.status(500).json({ msg: 'Server error during logout' });
  }
};

// Get all active sessions
exports.getSessions = async (req, res) => {
  try {
    const currentToken = req.header('Authorization')?.replace('Bearer ', '');
    const sessions = await Session.find({ 
      userId: req.user.id,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActive: -1 });
    
    const sessionsWithCurrent = sessions.map(session => ({
      _id: session._id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
      current: session.token === currentToken
    }));
    
    res.json({ sessions: sessionsWithCurrent });
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ msg: 'Server error fetching sessions' });
  }
};

// Delete specific session
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    
    // Ensure user can only delete their own sessions
    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    
    await Session.deleteOne({ _id: sessionId });
    res.json({ msg: 'Session terminated successfully' });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ msg: 'Server error deleting session' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { username, email, name } = req.body;
    const userId = req.user.id;
    
    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Username already taken' });
      }
    }
    
    // Check if email is taken by another user
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.json({ msg: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    // Invalidate all sessions to force re-login
    await Session.deleteMany({ userId });
    
    res.json({ msg: 'Password changed successfully. Please login again.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ msg: 'Server error changing password' });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const userId = req.user.id;
    const extension = path.extname(req.file.originalname) || '.jpg';
    const { url: avatarUrl } = await put(
      `avatars/${userId}-${Date.now()}${extension}`,
      req.file.buffer,
      { access: 'public', contentType: req.file.mimetype }
    );

    // Update user's avatar in database
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      msg: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      user
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ msg: 'Server error uploading avatar' });
  }
};

// Forgot Password - Send reset link
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Always return success message (don't reveal if email exists)
    if (!user) {
      return res.json({ 
        msg: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    await issuePasswordResetLink(user, { hours: 1, invite: false });

    res.json({ 
      msg: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error processing password reset request' });
  }
};

// Reset Password - Verify token and update password
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    // Hash the token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid password reset token
    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    // Find user
    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the used reset token
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    // Invalidate all sessions for this user
    await Session.deleteMany({ userId: user._id });

    res.json({ msg: 'Password reset successfully. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error resetting password' });
  }
};
