const Farmer = require('../models/Farmer');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const geo = require('../utils/geolocation');

/**
 * Find nearby farmers within a specified radius
 * GET /geolocation/farmers/nearby?lat=X&lng=Y&radius=50
 */
exports.getNearbyFarmers = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ msg: 'Latitude and longitude are required' });
    }

    // Fetch all farmers with farm location
    const farmers = await Farmer.find({
      'farmLocation.lat': { $exists: true },
      'farmLocation.lng': { $exists: true },
    }).populate('createdBy', 'name');

    // Filter by radius
    const nearbyFarmers = geo.filterByRadius(
      parseFloat(lat),
      parseFloat(lng),
      farmers.map((f) => ({
        _id: f._id,
        name: f.name,
        lat: f.farmLocation.lat,
        lng: f.farmLocation.lng,
        address: f.farmLocation.address,
        weighStation: f.weighStation,
        cellNumber: f.cellNumber,
      })),
      parseFloat(radius)
    );

    res.json({
      success: true,
      data: nearbyFarmers,
      totalFound: nearbyFarmers.length,
    });
  } catch (err) {
    console.error('Failed to fetch nearby farmers:', err);
    res.status(500).json({ msg: 'Server error while fetching nearby farmers' });
  }
};

/**
 * Find nearest delivery points to driver's current location
 * GET /geolocation/deliveries/nearest?lat=X&lng=Y&limit=10
 */
exports.getNearestDeliveries = async (req, res) => {
  try {
    const { lat, lng, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ msg: 'Latitude and longitude are required' });
    }

    // Fetch pending deliveries (no pickup location yet)
    const pendingDeliveries = await Delivery.find({
      pickupLocation: { $exists: false },
    })
      .populate('farmer', 'name farmLocation weighStation')
      .lean();

    // Add distance to farmer locations
    const deliveriesWithDistance = pendingDeliveries
      .map((d) => ({
        ...d,
        distance: geo.calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          d.farmer.farmLocation.lat,
          d.farmer.farmLocation.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: deliveriesWithDistance,
      totalFound: deliveriesWithDistance.length,
    });
  } catch (err) {
    console.error('Failed to fetch nearest deliveries:', err);
    res.status(500).json({ msg: 'Server error while fetching nearest deliveries' });
  }
};

/**
 * Validate if user's current location is within their assigned region
 * POST /geolocation/validate-location
 * Body: { lat, lng }
 */
exports.validateUserLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.id;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ msg: 'Latitude and longitude are required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.regionBounds) {
      return res.status(400).json({
        msg: 'User region bounds not configured',
      });
    }

    const validation = geo.validateAgentLocation(
      parseFloat(lat),
      parseFloat(lng),
      user.regionBounds
    );

    res.json({
      success: true,
      data: validation,
    });
  } catch (err) {
    console.error('Failed to validate user location:', err);
    res.status(500).json({ msg: 'Server error while validating location' });
  }
};

/**
 * Calculate distance between two points
 * GET /geolocation/distance?fromLat=X&fromLng=Y&toLat=X&toLng=Y
 */
exports.calculateDistanceBetweenPoints = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({
        msg: 'All coordinates (fromLat, fromLng, toLat, toLng) are required',
      });
    }

    const distance = geo.calculateDistance(
      parseFloat(fromLat),
      parseFloat(fromLng),
      parseFloat(toLat),
      parseFloat(toLng)
    );

    res.json({
      success: true,
      data: {
        distance,
        unit: 'km',
      },
    });
  } catch (err) {
    console.error('Failed to calculate distance:', err);
    res.status(500).json({ msg: 'Server error while calculating distance' });
  }
};

/**
 * Record pickup location for a delivery
 * POST /geolocation/deliveries/:id/pickup
 * Body: { lat, lng, address }
 */
exports.recordPickupLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ msg: 'Latitude and longitude are required' });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      {
        pickupLocation: geo.formatLocation(lat, lng, address),
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }

    res.json({
      success: true,
      data: delivery,
    });
  } catch (err) {
    console.error('Failed to record pickup location:', err);
    res
      .status(500)
      .json({ msg: 'Server error while recording pickup location' });
  }
};

/**
 * Record dropoff location for a delivery
 * POST /geolocation/deliveries/:id/dropoff
 * Body: { lat, lng, address }
 */
exports.recordDropoffLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ msg: 'Latitude and longitude are required' });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      {
        dropoffLocation: geo.formatLocation(lat, lng, address),
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }

    res.json({
      success: true,
      data: delivery,
    });
  } catch (err) {
    console.error('Failed to record dropoff location:', err);
    res
      .status(500)
      .json({ msg: 'Server error while recording dropoff location' });
  }
};
