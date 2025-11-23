const { validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const User = require('../models/User');

exports.getFarmers = async (req, res) => {
  try {
    let query = {};

    // Field agents can only see farmers in their assigned region
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      // If field agent has assigned region, filter by it
      if (user && user.assignedRegion) {
        // Filter by region (assuming weighStation represents region)
        query.weighStation = user.assignedRegion;
      }
      // If no region assigned, they can see all farmers
    }

    const farmers = await Farmer.find(query)
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) {
    console.error('Get farmers error:', err);
    res.status(500).send('Server error');
  }
};

exports.getFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).populate('createdBy', 'username name');
    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });

    // Field agents can only view farmers in their region
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (farmer.weighStation !== user.assignedRegion) {
        return res.status(403).json({ msg: 'Access denied. Farmer not in your assigned region' });
      }
    }

    res.json(farmer);
  } catch (err) {
    console.error('Get farmer error:', err);
    res.status(500).send('Server error');
  }
};

exports.createFarmer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    // Add createdBy field
    const farmerData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Field agents with assigned region can only create farmers in that region
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (user && user.assignedRegion) {
        // Ensure the weighStation matches assigned region
        if (farmerData.weighStation !== user.assignedRegion) {
          return res.status(403).json({ 
            msg: `You can only register farmers in your assigned region: ${user.assignedRegion}` 
          });
        }
      }
      // If no region assigned, they can create farmers in any region
    }

    const farmer = new Farmer(farmerData);
    await farmer.save();
    
    const populatedFarmer = await Farmer.findById(farmer._id).populate('createdBy', 'username name');
    res.json(populatedFarmer);
  } catch (err) {
    console.error("FARMER CREATION FAILED", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation failed on required fields', errors: err.errors });
    }
    res.status(500).send('Server error');
  }
};

exports.updateFarmer = async (req, res) => {
  try {
    const updatedFarmer = await Farmer.findByIdAndUpdate(req.params.id,
      {$set: req.body },
      { new: true, runValidators: true }
    );


    if (!updatedFarmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }
    res.json(updatedFarmer);
    
  } catch (err) {
    console.error("FARMER UPDATE FAILED", err.message);
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid ID or validation failed' });
    }
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
