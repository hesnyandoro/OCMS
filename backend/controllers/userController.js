const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { issuePasswordResetLink } = require('../utils/sendAuthEmail');

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name,
  role: user.role,
  assignedRegion: user.assignedRegion
});

const sendInvite = async (user) => {
  return issuePasswordResetLink(user, { hours: 24, invite: true });
};

// Create a field agent or admin (Admin only) and email an invite link
exports.createFieldAgent = async (req, res) => {
  try {
    const { username, email, name, assignedRegion, role } = req.body;
    const userRole = role === 'admin' ? 'admin' : 'fieldagent';

    if (!username || !email || !name) {
      return res.status(400).json({ msg: 'Please provide name, username, and email' });
    }

    if (userRole === 'fieldagent' && !assignedRegion) {
      return res.status(400).json({ msg: 'Assigned region is required for field agents' });
    }

    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ msg: 'Username or email already exists' });
    }

    const randomPassword = crypto.randomBytes(32).toString('hex');
    user = new User({
      username,
      email,
      password: await bcrypt.hash(randomPassword, 10),
      name,
      role: userRole,
      assignedRegion: userRole === 'fieldagent' ? assignedRegion : undefined
    });

    await user.save();

    const { emailSent } = await sendInvite(user);

    res.status(201).json({
      msg: emailSent
        ? 'User created and invite email sent'
        : 'User created. Invite email was logged on the server (email is not configured).',
      emailSent,
      user: publicUser(user)
    });
  } catch (err) {
    console.error('Create field agent error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.resendInvite = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { emailSent } = await sendInvite(user);

    res.json({
      msg: emailSent
        ? `Invite resent to ${user.email}`
        : `Invite regenerated. Email was logged on the server (email is not configured).`,
      emailSent
    });
  } catch (err) {
    console.error('Resend invite error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, assignedRegion, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (assignedRegion) user.assignedRegion = assignedRegion;
    if (role && ['admin', 'fieldagent'].includes(role)) user.role = role;

    await user.save();

    res.json({
      msg: 'User updated successfully',
      user: publicUser(user)
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
