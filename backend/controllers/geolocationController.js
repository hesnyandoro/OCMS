const Farmer = require('../models/Farmer');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const geo = require('../utils/geolocation');

function mapFarmerForGeo(farmer) {
  return {
    _id: farmer._id,
    name: farmer.name,
    lat: farmer.farmLocation?.lat,
    lng: farmer.farmLocation?.lng,
    address: farmer.farmLocation?.address,
    weighStation: farmer.weighStation,
    cellNumber: farmer.cellNumber,
    season: farmer.season,
  };
}

/**
 * Find nearby farmers within a specified radius
 * GET /geolocation/farmers/nearby?lat=X&lng=Y&radius=50
 */
exports.getNearbyFarmers = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const coords = geo.validateCoordinates(lat, lng);
    if (!coords.ok) {
      return res.status(400).json({ msg: coords.error });
    }

    const radiusKm = parseFloat(radius);
    // Use stored lat/lng so existing farmers without a GeoJSON `location` still match.
    const farmers = await Farmer.find({
      'farmLocation.lat': { $exists: true, $ne: null },
      'farmLocation.lng': { $exists: true, $ne: null },
    }).populate('createdBy', 'name');

    const nearbyFarmers = geo.filterByRadius(
      coords.lat,
      coords.lng,
      farmers.map(mapFarmerForGeo),
      Number.isFinite(radiusKm) ? radiusKm : 50
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
    const coords = geo.validateCoordinates(lat, lng);
    if (!coords.ok) {
      return res.status(400).json({ msg: coords.error });
    }

    const pendingDeliveries = await Delivery.find({
      pickupLocation: { $exists: false },
    })
      .populate('farmer', 'name farmLocation weighStation')
      .lean();

    const deliveriesWithDistance = pendingDeliveries
      .filter((d) => Number.isFinite(d.farmer?.farmLocation?.lat) && Number.isFinite(d.farmer?.farmLocation?.lng))
      .map((d) => ({
        ...d,
        distance: geo.calculateDistance(
          coords.lat,
          coords.lng,
          d.farmer.farmLocation.lat,
          d.farmer.farmLocation.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit, 10));

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
 */
exports.validateUserLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.id;
    const coords = geo.validateCoordinates(lat, lng);
    if (!coords.ok) {
      return res.status(400).json({ msg: coords.error });
    }

    const user = await User.findById(userId);
    if (!user || !user.regionBounds) {
      return res.status(400).json({
        msg: 'User region bounds not configured',
      });
    }

    const validation = geo.validateAgentLocation(
      coords.lat,
      coords.lng,
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
 * Driving distance via OSRM with Haversine fallback.
 * GET /geolocation/distance?fromLat=X&fromLng=Y&toLat=X&toLng=Y
 */
exports.calculateDistanceBetweenPoints = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;

    const result = await geo.getDrivingDistance(fromLat, fromLng, toLat, toLng);
    if (result.error) {
      return res.status(400).json({ msg: result.error });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Failed to calculate distance:', err);
    res.status(500).json({ msg: 'Server error while calculating distance' });
  }
};

/**
 * Nominatim proxy — identifies the app and throttles requests.
 * GET /geolocation/geocode?q=Kericho
 */
exports.geocodeRegion = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || String(query).trim().length < 3) {
      return res.status(400).json({ msg: 'Enter at least 3 characters to search' });
    }

    const result = await geo.geocodeNominatim(query);
    if (result.error) {
      return res.status(502).json({ msg: result.error, results: [] });
    }

    if (!result.results.length) {
      return res.json({
        success: true,
        results: [],
        msg: 'No matching place found in Kenya. Enter coordinates manually or pick a point on the map.',
      });
    }

    res.json({
      success: true,
      results: result.results,
      cached: Boolean(result.cached),
    });
  } catch (err) {
    console.error('Failed to geocode region:', err);
    res.status(500).json({ msg: 'Server error while geocoding region' });
  }
};

/**
 * Record pickup location for a delivery
 * POST /geolocation/deliveries/:id/pickup
 */
exports.recordPickupLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;
    const coords = geo.validateCoordinates(lat, lng);
    if (!coords.ok) {
      return res.status(400).json({ msg: coords.error });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      {
        pickupLocation: geo.formatLocation(coords.lat, coords.lng, address),
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
 */
exports.recordDropoffLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;
    const coords = geo.validateCoordinates(lat, lng);
    if (!coords.ok) {
      return res.status(400).json({ msg: coords.error });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      {
        dropoffLocation: geo.formatLocation(coords.lat, coords.lng, address),
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
