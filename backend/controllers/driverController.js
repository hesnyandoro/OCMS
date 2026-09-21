const { validationResult } = require('express-validator');
const Driver = require('../models/Driver');

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ name: 1 }).select('name phone createdAt');
    res.json(drivers);
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({ msg: 'Server error fetching drivers' });
  }
};

exports.createDriver = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const name = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();
    if (!name || !phone) {
      return res.status(400).json({ msg: 'Name and phone are required' });
    }

    const existing = await Driver.findOne({ phone });
    if (existing) {
      return res.status(400).json({ msg: 'A driver with that phone already exists' });
    }

    const driver = await Driver.create({
      name,
      phone,
      createdBy: req.user.id
    });

    res.status(201).json(driver);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'A driver with that phone already exists' });
    }
    console.error('Create driver error:', err);
    res.status(500).json({ msg: 'Server error creating driver' });
  }
};
