const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, role, region, name } = req.body;

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
      region,
      name 
    });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      const userData = { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name,
        role: user.role, 
        region: user.region 
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

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      const userData = { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name,
        role: user.role, 
        region: user.region 
      };
      res.json({ token, user: userData });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
