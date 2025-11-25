const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Session = require('../models/Session');
const PasswordReset = require('../models/PasswordReset');

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
  
  const session = new Session({
    userId,
    token,
    deviceInfo: getDeviceInfo(req.headers['user-agent']),
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    expiresAt
  });
  
  await session.save();
  return session;
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, role, assignedRegion, name } = req.body;

  try {
    // ensure username and email are unique
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'Username already exists' });

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ msg: 'Email already in use' });

    const userRole = role || 'fieldagent';
    user = new User({ 
      username, 
      email, 
      password: await bcrypt.hash(password, 10), 
      role: userRole, 
      assignedRegion,
      name 
    });
    await user.save();

    const payload = { user: { id: user.id, role: user.role, assignedRegion: user.assignedRegion } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
      if (err) throw err;
      
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
    });
  } catch (err) {
    console.error("USER REGISTRATION FAILED", err);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // Support login by username OR email
  let { username, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role, assignedRegion: user.assignedRegion } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
      if (err) throw err;
      
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
    });
  } catch (err) {
    res.status(500).send('Server error');
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
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Update user's avatar in database
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      msg: 'Avatar uploaded successfully',
      avatar: avatarPath,
      user
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ msg: 'Server error uploading avatar' });
  }
};

// Configure email transporter
const createEmailTransporter = () => {
  // Check if email credentials are properly configured
  const hasEmailConfig = process.env.EMAIL_HOST && 
                        process.env.EMAIL_USER && 
                        process.env.EMAIL_PASS &&
                        process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                        process.env.EMAIL_PASS !== 'your-app-password-here';
  
  if (hasEmailConfig) {
    console.log('✅ Using configured email service:', process.env.EMAIL_HOST);
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });
  }
  
  // Fallback to console logging with clear warning
  console.warn('⚠️  EMAIL NOT CONFIGURED: Emails will be logged to console only.');
  console.warn('⚠️  To enable email functionality:');
  console.warn('   1. Update .env file with your email credentials');
  console.warn('   2. For Gmail: Enable 2FA and generate an App Password');
  console.warn('   3. Restart the server');
  
  return {
    sendMail: async (mailOptions) => {
      console.log('\n' + '='.repeat(80));
      console.log('📧 EMAIL WOULD BE SENT (Not actually sent - email not configured)');
      console.log('='.repeat(80));
      console.log('To:', mailOptions.to);
      console.log('From:', mailOptions.from);
      console.log('Subject:', mailOptions.subject);
      console.log('\nMessage Preview:');
      console.log('-'.repeat(80));
      // Extract reset URL from HTML
      const urlMatch = mailOptions.html.match(/href="([^"]+)"/);
      if (urlMatch) {
        console.log('Reset URL:', urlMatch[1]);
      }
      console.log('-'.repeat(80));
      console.log('Full HTML:', mailOptions.html.substring(0, 500) + '...');
      console.log('='.repeat(80) + '\n');
      return { messageId: 'dev-email-' + Date.now() };
    }
  };
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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Create new password reset token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email
    const transporter = createEmailTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'OCMS <noreply@ocms.com>',
      to: user.email,
      subject: 'Password Reset Request - OCMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1B4332; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">OCMS</h1>
            <p style="color: #F59E0B; margin: 5px 0;">Organic Coffee Management System</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1B4332; margin-top: 0;">Password Reset Request</h2>
            <p>Hello <strong>${user.name || user.username}</strong>,</p>
            <p>You requested to reset your password for your OCMS account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #1B4332; color: white; padding: 15px 40px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background-color: #e9e9e9; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${resetUrl}</p>
            <div style="background-color: #fff3cd; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 30px; border-radius: 5px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⏰ Important:</strong> This link will expire in 1 hour.<br>
                If you didn't request this, please ignore this email and your password will remain unchanged.
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 OCMS. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log(`📧 Attempting to send password reset email to: ${user.email}`);
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully');
      console.log('Message ID:', info.messageId);
      if (info.accepted) {
        console.log('Accepted recipients:', info.accepted);
      }
      if (info.rejected && info.rejected.length > 0) {
        console.warn('⚠️  Rejected recipients:', info.rejected);
      }
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError.message);
      // Don't throw error to prevent revealing if email exists
      // But log it for debugging
      console.error('Email error details:', {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response
      });
    }

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
