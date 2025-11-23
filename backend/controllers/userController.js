const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Create a new field agent (Admin only)
exports.createFieldAgent = async (req, res) => {
  try {
    const { username, email, password, name, assignedRegion } = req.body;

    // Validation
    if (!username || !email || !password || !assignedRegion) {
      return res.status(400).json({ msg: 'Please provide all required fields: username, email, password, assignedRegion' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ msg: 'Username or email already exists' });
    }

    // Create new field agent
    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role: 'fieldagent',
      assignedRegion
    });

    await user.save();

    res.status(201).json({
      msg: 'Field agent created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        assignedRegion: user.assignedRegion
      }
    });
  } catch (err) {
    console.error('Create field agent error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all users (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, assignedRegion, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (assignedRegion) user.assignedRegion = assignedRegion;
    if (role && ['admin', 'fieldagent'].includes(role)) user.role = role;

    await user.save();

    res.json({
      msg: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        assignedRegion: user.assignedRegion
      }
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete user (Admin only)
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
