const crypto = require('crypto');
const Delivery = require('../models/Delivery');
const Trip = require('../models/Trip');
const TripPing = require('../models/TripPing');
const User = require('../models/User');

const TRIP_HOURS = 24;
const MAX_TRAIL = 200;

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const frontendBase = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const assertDeliveryAccess = async (req, delivery) => {
  if (!delivery) return { ok: false, status: 404, msg: 'Delivery not found' };
  if (req.user.role !== 'fieldagent') return { ok: true };
  const user = await User.findById(req.user.id);
  if (user && user.assignedRegion && delivery.region !== user.assignedRegion) {
    return { ok: false, status: 403, msg: 'Access denied' };
  }
  return { ok: true };
};

const endActiveTrips = async (deliveryId) => {
  await Trip.updateMany(
    { delivery: deliveryId, status: { $in: ['pending', 'live'] } },
    { $set: { status: 'ended' } }
  );
};

exports.startTrip = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    const access = await assertDeliveryAccess(req, delivery);
    if (!access.ok) return res.status(access.status).json({ msg: access.msg });

    if (delivery.trackingStatus === 'arrived') {
      return res.status(400).json({ msg: 'This delivery has already arrived. Tracking is closed.' });
    }

    await endActiveTrips(delivery._id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TRIP_HOURS * 60 * 60 * 1000);

    await Trip.create({
      delivery: delivery._id,
      tokenHash: hashToken(rawToken),
      status: 'pending',
      expiresAt
    });

    delivery.trackingStatus = 'in_transit';
    await delivery.save();

    res.status(201).json({
      url: `${frontendBase()}/track/${rawToken}`,
      expiresAt,
      trackingStatus: delivery.trackingStatus
    });
  } catch (err) {
    console.error('Start trip error:', err);
    res.status(500).json({ msg: 'Server error starting trip' });
  }
};

const endDriverTrips = async (driverName) => {
  await Trip.updateMany(
    { driverName, status: { $in: ['pending', 'live'] } },
    { $set: { status: 'ended' } }
  );
};

exports.startDriverTrip = async (req, res) => {
  try {
    const driverName = String(req.body.driver || '').trim();
    if (!driverName) {
      return res.status(400).json({ msg: 'Driver name is required' });
    }

    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (user?.assignedRegion) {
        const known = await Delivery.exists({
          driver: driverName,
          region: user.assignedRegion
        });
        if (!known) {
          return res.status(403).json({ msg: 'You can only track drivers in your assigned region' });
        }
      }
    }

    await endDriverTrips(driverName);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TRIP_HOURS * 60 * 60 * 1000);

    const trip = await Trip.create({
      driverName,
      tokenHash: hashToken(rawToken),
      status: 'pending',
      expiresAt
    });

    res.status(201).json({
      tripId: trip._id,
      driver: driverName,
      url: `${frontendBase()}/track/${rawToken}`,
      expiresAt
    });
  } catch (err) {
    console.error('Start driver trip error:', err);
    res.status(500).json({ msg: 'Server error starting trip' });
  }
};

exports.endDriverTrip = async (req, res) => {
  try {
    const driverName = String(req.body.driver || '').trim();
    if (!driverName) {
      return res.status(400).json({ msg: 'Driver name is required' });
    }

    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (user?.assignedRegion) {
        const known = await Delivery.exists({
          driver: driverName,
          region: user.assignedRegion
        });
        if (!known) {
          return res.status(403).json({ msg: 'You can only track drivers in your assigned region' });
        }
      }
    }

    await endDriverTrips(driverName);
    res.json({ msg: 'Trip ended', driver: driverName });
  } catch (err) {
    console.error('End driver trip error:', err);
    res.status(500).json({ msg: 'Server error ending trip' });
  }
};

exports.endTrip = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    const access = await assertDeliveryAccess(req, delivery);
    if (!access.ok) return res.status(access.status).json({ msg: access.msg });

    await endActiveTrips(delivery._id);
    delivery.trackingStatus = 'arrived';
    if (!delivery.dropoffLocation?.timestamp) {
      delivery.dropoffLocation = {
        ...(delivery.dropoffLocation || {}),
        timestamp: new Date()
      };
    }
    await delivery.save();

    res.json({ msg: 'Trip ended', trackingStatus: delivery.trackingStatus });
  } catch (err) {
    console.error('End trip error:', err);
    res.status(500).json({ msg: 'Server error ending trip' });
  }
};

exports.getInTransit = async (req, res) => {
  try {
    const query = { trackingStatus: 'in_transit' };
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (user && user.assignedRegion) {
        query.region = user.assignedRegion;
      }
    }

    const deliveries = await Delivery.find(query)
      .populate('farmer', 'name cellNumber farmLocation')
      .sort({ updatedAt: -1 })
      .lean();

    const deliveryIds = deliveries.map((d) => d._id);
    const trips = await Trip.find({
      delivery: { $in: deliveryIds },
      status: { $in: ['pending', 'live'] }
    }).lean();

    const tripByDelivery = new Map(trips.map((t) => [String(t.delivery), t]));

    const payload = await Promise.all(deliveries.map(async (delivery) => {
      const trip = tripByDelivery.get(String(delivery._id));
      let trail = [];
      if (trip) {
        trail = await TripPing.find({ trip: trip._id })
          .sort({ recordedAt: -1 })
          .limit(MAX_TRAIL)
          .select('lat lng recordedAt accuracy')
          .lean();
        trail.reverse();
      }
      return {
        ...delivery,
        lastPosition: trip?.last || null,
        trail,
        tripStatus: trip?.status || null,
        tripExpiresAt: trip?.expiresAt || null
      };
    }));

    const driverQuery = {
      driverName: { $exists: true, $nin: [null, ''] },
      status: { $in: ['pending', 'live'] },
      expiresAt: { $gt: new Date() }
    };
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (user?.assignedRegion) {
        const names = await Delivery.distinct('driver', { region: user.assignedRegion });
        driverQuery.driverName = { $in: names.filter(Boolean) };
      }
    }

    const driverTrips = await Trip.find(driverQuery).sort({ updatedAt: -1 }).lean();
    const driverPayload = await Promise.all(driverTrips.map(async (trip) => {
      const trail = await TripPing.find({ trip: trip._id })
        .sort({ recordedAt: -1 })
        .limit(MAX_TRAIL)
        .select('lat lng recordedAt accuracy')
        .lean();
      trail.reverse();
      return {
        _id: trip._id,
        driver: trip.driverName,
        type: '',
        farmer: null,
        lastPosition: trip.last || null,
        trail,
        tripStatus: trip.status,
        tripExpiresAt: trip.expiresAt,
        kind: 'driver'
      };
    }));

    const seenDrivers = new Set(driverPayload.map((item) => item.driver));
    const merged = [
      ...driverPayload,
      ...payload.filter((item) => !seenDrivers.has(item.driver))
    ];

    res.json(merged);
  } catch (err) {
    console.error('Get in-transit error:', err);
    res.status(500).json({ msg: 'Server error fetching in-transit deliveries' });
  }
};

exports.getPublicTrip = async (req, res) => {
  try {
    const tokenHash = hashToken(req.params.token);
    const trip = await Trip.findOne({ tokenHash }).populate('delivery', 'driver type region trackingStatus');
    if (!trip || trip.status === 'ended' || trip.expiresAt <= new Date()) {
      return res.status(404).json({ msg: 'This tracking link is invalid or has expired.' });
    }
    res.json({
      status: trip.status,
      driver: trip.driverName || trip.delivery?.driver,
      type: trip.delivery?.type,
      region: trip.delivery?.region,
      expiresAt: trip.expiresAt
    });
  } catch (err) {
    console.error('Get public trip error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.pingTrip = async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ msg: 'lat and lng are required' });
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ msg: 'Invalid coordinates' });
    }

    const tokenHash = hashToken(req.params.token);
    const trip = await Trip.findOne({ tokenHash });
    if (!trip || trip.status === 'ended' || trip.expiresAt <= new Date()) {
      return res.status(404).json({ msg: 'This tracking link is invalid or has expired.' });
    }

    const now = new Date();
    if (trip.last?.recordedAt && now - trip.last.recordedAt < 5000) {
      return res.json({ ok: true, throttled: true });
    }

    const last = {
      lat: latitude,
      lng: longitude,
      accuracy: Number.isFinite(Number(accuracy)) ? Number(accuracy) : undefined,
      recordedAt: now
    };

    trip.last = last;
    trip.status = 'live';
    await trip.save();

    await TripPing.create({
      trip: trip._id,
      lat: last.lat,
      lng: last.lng,
      accuracy: last.accuracy,
      recordedAt: now
    });

    if (trip.delivery) {
      await Delivery.updateOne(
        { _id: trip.delivery },
        { $set: { trackingStatus: 'in_transit' } }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Trip ping error:', err);
    res.status(500).json({ msg: 'Server error recording location' });
  }
};
