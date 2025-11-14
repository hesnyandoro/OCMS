const { validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });
    res.json(farmer);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createFarmer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const farmer = new Farmer(req.body);
    await farmer.save();
    res.json(farmer);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(400).json({ msg: 'Farmer not found' });
    farmer = await Farmer.findByIdAndDeleteAndUpdate(req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(farmer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');

  }
};

exports.deleteFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });
    await Farmer.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Farmer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 

// Similar for updateFarmer, deleteFarmer...