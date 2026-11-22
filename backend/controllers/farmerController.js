const { validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');
const { normalizeFarmLocation } = require('../utils/geolocation');

const FARMER_FIELDS = ['name', 'cellNumber', 'nationalId', 'season', 'weighStation'];

function duplicateFarmerMessage(err) {
  if (err?.code !== 11000) return null;
  const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
  if (field === 'cellNumber') return 'A farmer with this phone number already exists';
  if (field === 'nationalId') return 'A farmer with this national ID already exists';
  return 'A farmer with these details already exists';
}

function buildFarmerPayload(body) {
  const payload = {};
  for (const field of FARMER_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field];
  }

  if (body.farmLocation !== undefined) {
    const normalized = normalizeFarmLocation(body.farmLocation);
    if (normalized.error) {
      return { error: normalized.error };
    }
    if (normalized.value) {
      payload.farmLocation = normalized.value;
    }
    if (normalized.location) {
      payload.location = normalized.location;
    }
  }

  return { payload };
}

async function assignedRegionFor(userId) {
  const user = await User.findById(userId);
  return user?.assignedRegion || null;
}

function regionDenied(assignedRegion, weighStation) {
  if (!assignedRegion) return null;
  if (weighStation !== assignedRegion) {
    return `You can only register farmers in your assigned region: ${assignedRegion}`;
  }
  return null;
}

exports.getFarmers = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'fieldagent') {
      const assignedRegion = await assignedRegionFor(req.user.id);
      if (assignedRegion) {
        query.weighStation = assignedRegion;
      }
    }

    if (req.query.hasLocation === '1' || req.query.hasLocation === 'true') {
      query['farmLocation.lat'] = { $exists: true, $ne: null };
      query['farmLocation.lng'] = { $exists: true, $ne: null };
    }

    const requestedLimit = parseInt(req.query.limit, 10);
    let farmersQuery = Farmer.find(query)
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 });
    if (Number.isFinite(requestedLimit) && requestedLimit > 0) {
      farmersQuery = farmersQuery.limit(Math.min(requestedLimit, 20));
    }
    const farmers = await farmersQuery;
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

    if (req.user.role === 'fieldagent') {
      const assignedRegion = await assignedRegionFor(req.user.id);
      if (assignedRegion && farmer.weighStation !== assignedRegion) {
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
    const built = buildFarmerPayload(req.body);
    if (built.error) return res.status(400).json({ msg: built.error });

    const farmerData = {
      ...built.payload,
      createdBy: req.user.id,
    };

    if (req.user.role === 'fieldagent') {
      const assignedRegion = await assignedRegionFor(req.user.id);
      const denied = regionDenied(assignedRegion, farmerData.weighStation);
      if (denied) return res.status(403).json({ msg: denied });
    }

    const farmer = new Farmer(farmerData);
    await farmer.save();

    const populatedFarmer = await Farmer.findById(farmer._id).populate('createdBy', 'username name');
    res.json(populatedFarmer);
  } catch (err) {
    console.error('FARMER CREATION FAILED', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation failed on required fields', errors: err.errors });
    }
    const duplicateMessage = duplicateFarmerMessage(err);
    if (duplicateMessage) return res.status(400).json({ msg: duplicateMessage });
    res.status(500).send('Server error');
  }
};

exports.updateFarmer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const built = buildFarmerPayload(req.body);
    if (built.error) return res.status(400).json({ msg: built.error });

    if (req.user.role === 'fieldagent' && built.payload.weighStation) {
      const assignedRegion = await assignedRegionFor(req.user.id);
      const denied = regionDenied(assignedRegion, built.payload.weighStation);
      if (denied) return res.status(403).json({ msg: denied });
    }

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { $set: built.payload },
      { new: true, runValidators: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }
    res.json(updatedFarmer);
  } catch (err) {
    console.error('FARMER UPDATE FAILED', err.message);
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid ID or validation failed' });
    }
    const duplicateMessage = duplicateFarmerMessage(err);
    if (duplicateMessage) return res.status(400).json({ msg: duplicateMessage });
    res.status(500).send('Server error');
  }
};

exports.deleteFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });

    const [deliveryCount, paymentCount] = await Promise.all([
      Delivery.countDocuments({ farmer: farmer._id }),
      Payment.countDocuments({ farmer: farmer._id }),
    ]);
    if (deliveryCount > 0 || paymentCount > 0) {
      const parts = [];
      if (deliveryCount > 0) {
        parts.push(`${deliveryCount} ${deliveryCount === 1 ? 'delivery' : 'deliveries'}`);
      }
      if (paymentCount > 0) {
        parts.push(`${paymentCount} ${paymentCount === 1 ? 'payment' : 'payments'}`);
      }
      return res.status(400).json({
        msg: `This farmer still has ${parts.join(' and ')}. Remove those records before deleting the farmer.`,
      });
    }

    await Farmer.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Farmer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.searchFarmers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    let query = {
      name: { $regex: q, $options: 'i' },
    };

    if (req.user.role === 'fieldagent') {
      const assignedRegion = await assignedRegionFor(req.user.id);
      if (assignedRegion) {
        query.weighStation = assignedRegion;
      }
    }

    const farmers = await Farmer.find(query)
      .select('_id name cellNumber weighStation farmLocation')
      .limit(20)
      .sort({ name: 1 });

    res.json(farmers);
  } catch (err) {
    console.error('Search farmers error:', err);
    res.status(500).send('Server error');
  }
};

exports.buildFarmerPayload = buildFarmerPayload;
