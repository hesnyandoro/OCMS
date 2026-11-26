/**
 * Geolocation utility functions
 * Handles distance calculations, region validation, geographic queries,
 * Nominatim geocoding, and OSRM driving distance with Haversine fallback.
 */

const EARTH_RADIUS_KM = 6371;
const DEFAULT_OSRM_URL = 'https://router.project-osrm.org';
const DEFAULT_NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = process.env.GEO_USER_AGENT || 'OCMS/1.0 (Organic Coffee Management System; https://github.com/hesnyandoro/OCMS)';
const NOMINATIM_MIN_INTERVAL_MS = 1100;

let lastNominatimAt = 0;
const geocodeCache = new Map();
const GEOCODE_CACHE_LIMIT = 200;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return value;
  const parsed = Number(String(value).trim());
  return parsed;
}

/**
 * Validate latitude/longitude pair. Returns { ok, lat, lng, error }.
 */
function validateCoordinates(latInput, lngInput) {
  const lat = parseCoordinate(latInput);
  const lng = parseCoordinate(lngInput);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: 'Latitude and longitude must be valid numbers' };
  }
  if (lat < -90 || lat > 90) {
    return { ok: false, error: 'Latitude must be between -90 and 90' };
  }
  if (lng < -180 || lng > 180) {
    return { ok: false, error: 'Longitude must be between -180 and 180' };
  }
  return { ok: true, lat, lng };
}

function toGeoJSONPoint(lat, lng) {
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

/**
 * Normalize a farmLocation payload into numeric lat/lng plus a GeoJSON Point.
 * @returns {{ error?: string, value?: object, location?: object }}
 */
function normalizeFarmLocation(input) {
  if (input == null || input === '') {
    return { value: undefined };
  }
  if (typeof input !== 'object') {
    return { error: 'Farm location must include latitude and longitude' };
  }

  const hasLat = input.lat !== undefined && input.lat !== null && input.lat !== '';
  const hasLng = input.lng !== undefined && input.lng !== null && input.lng !== '';

  if (!hasLat && !hasLng && !input.address) {
    return { value: undefined };
  }
  if (hasLat !== hasLng) {
    return { error: 'Both latitude and longitude are required' };
  }
  if (!hasLat && !hasLng) {
    const address = typeof input.address === 'string' ? input.address.trim() : '';
    return { value: { address: address || undefined } };
  }

  const coords = validateCoordinates(input.lat, input.lng);
  if (!coords.ok) {
    return { error: coords.error };
  }

  const address = typeof input.address === 'string' ? input.address.trim() : '';
  return {
    value: {
      lat: coords.lat,
      lng: coords.lng,
      address: address || undefined,
    },
    location: toGeoJSONPoint(coords.lat, coords.lng),
  };
}

function isWithinGeofence(lat, lng, centerLat, centerLng, radiusKm) {
  const distance = calculateDistance(lat, lng, centerLat, centerLng);
  return distance <= radiusKm;
}

function findNearest(lat, lng, locations) {
  if (!locations || locations.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  locations.forEach((loc) => {
    const distance = calculateDistance(lat, lng, loc.lat, loc.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...loc, distance };
    }
  });

  return nearest;
}

function filterByRadius(lat, lng, locations, radiusKm = 50) {
  if (!locations || locations.length === 0) return [];

  return locations
    .map((loc) => ({
      ...loc,
      distance: calculateDistance(lat, lng, loc.lat, loc.lng),
    }))
    .filter((loc) => loc.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

function validateAgentLocation(agentLat, agentLng, regionBounds) {
  if (!regionBounds || !regionBounds.centerLat || !regionBounds.centerLng) {
    return {
      isValid: false,
      message: 'Region bounds not configured',
    };
  }

  const distance = calculateDistance(
    agentLat,
    agentLng,
    regionBounds.centerLat,
    regionBounds.centerLng
  );
  const radiusKm = regionBounds.radiusKm || 50;
  const isValid = distance <= radiusKm;

  return {
    isValid,
    distance,
    message: isValid
      ? `Within assigned region (${distance.toFixed(2)}km from center)`
      : `Outside assigned region (${distance.toFixed(2)}km from center, max: ${radiusKm}km)`,
  };
}

function getBoundingBox(lat, lng, radiusKm = 50) {
  const latOffset = radiusKm / 111.32;
  const lngOffset = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latOffset,
    maxLat: lat + latOffset,
    minLng: lng - lngOffset,
    maxLng: lng + lngOffset,
  };
}

function formatLocation(lat, lng, address = null) {
  return {
    lat: parseFloat(Number(lat).toFixed(8)),
    lng: parseFloat(Number(lng).toFixed(8)),
    address: address || null,
    timestamp: new Date(),
  };
}

const MAX_GEOCODE_QUERY_LENGTH = 200;

function clampQuery(query) {
  return String(query || '').trim().slice(0, MAX_GEOCODE_QUERY_LENGTH);
}

function stripKenyaSuffix(query) {
  const trimmed = clampQuery(query);
  const lower = trimmed.toLowerCase();
  // Only a separate country token. "Lukenya" ends in those letters but is a place name.
  if (lower.endsWith(', kenya')) return trimmed.slice(0, -7).trim();
  if (lower.endsWith(',kenya')) return trimmed.slice(0, -6).trim();
  if (lower.endsWith(' kenya')) return trimmed.slice(0, -6).trim();
  return trimmed;
}

function appendKenya(query) {
  const trimmed = clampQuery(query);
  if (!trimmed) return trimmed;
  if (stripKenyaSuffix(trimmed) !== trimmed) return trimmed;
  return `${trimmed}, Kenya`;
}

function allowedOrigin(raw, fallback) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback;
    if (!/^[a-z0-9.-]+$/i.test(parsed.hostname)) return fallback;
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return fallback;
  }
}

function rememberGeocode(key, value) {
  if (geocodeCache.size >= GEOCODE_CACHE_LIMIT) {
    const firstKey = geocodeCache.keys().next().value;
    geocodeCache.delete(firstKey);
  }
  geocodeCache.set(key, value);
}

async function waitForNominatimSlot() {
  const elapsed = Date.now() - lastNominatimAt;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, NOMINATIM_MIN_INTERVAL_MS - elapsed));
  }
  lastNominatimAt = Date.now();
}

/**
 * Geocode a region/place via OpenStreetMap Nominatim, scoped to Kenya.
 */
async function geocodeNominatim(query, options = {}) {
  const q = appendKenya(query);
  if (stripKenyaSuffix(q).length < 3) {
    return { error: 'Enter at least 3 characters to search' };
  }

  const cacheKey = q.toLowerCase();
  if (!options.skipCache && geocodeCache.has(cacheKey)) {
    return { results: geocodeCache.get(cacheKey), cached: true };
  }

  const fetchFn = options.fetch || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    return { error: 'Geocoding is not available in this environment' };
  }

  const origin = allowedOrigin(
    options.nominatimUrl || process.env.NOMINATIM_URL || DEFAULT_NOMINATIM_URL,
    DEFAULT_NOMINATIM_URL
  );
  const url = new URL('/search', `${origin}/`);
  url.hostname = new URL(origin).hostname;
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(options.limit || 5));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'ke');

  if (!options.skipThrottle) {
    await waitForNominatimSlot();
  }

  let response;
  try {
    response = await fetchFn(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    return { error: 'Geocoding service is unavailable. Enter coordinates manually.' };
  }

  if (!response.ok) {
    return { error: 'Geocoding service is unavailable. Enter coordinates manually.' };
  }

  const raw = await response.json();
  const results = (Array.isArray(raw) ? raw : []).map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: item.type,
    importance: item.importance,
  })).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

  rememberGeocode(cacheKey, results);
  return { results };
}

function haversineResult(fromLat, fromLng, toLat, toLng) {
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
  return {
    distance,
    unit: 'km',
    source: 'haversine',
  };
}

/**
 * Real driving distance via public OSRM. Falls back to Haversine on any failure.
 */
async function getDrivingDistance(fromLat, fromLng, toLat, toLng, options = {}) {
  const from = validateCoordinates(fromLat, fromLng);
  const to = validateCoordinates(toLat, toLng);
  if (!from.ok) return { error: from.error };
  if (!to.ok) return { error: to.error };

  const fallback = haversineResult(from.lat, from.lng, to.lat, to.lng);
  const fetchFn = options.fetch || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    return { ...fallback, fallbackReason: 'fetch_unavailable' };
  }

  const origin = allowedOrigin(
    options.osrmUrl || process.env.OSRM_URL || DEFAULT_OSRM_URL,
    DEFAULT_OSRM_URL
  );
  const lng1 = from.lng.toFixed(8);
  const lat1 = from.lat.toFixed(8);
  const lng2 = to.lng.toFixed(8);
  const lat2 = to.lat.toFixed(8);
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}`);
  url.protocol = new URL(origin).protocol;
  url.hostname = new URL(origin).hostname;
  url.search = 'overview=false';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 4000);
    const response = await fetchFn(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { ...fallback, fallbackReason: `osrm_http_${response.status}` };
    }

    const payload = await response.json();
    const route = payload?.routes?.[0];
    if (!route || !Number.isFinite(route.distance)) {
      return { ...fallback, fallbackReason: 'osrm_empty' };
    }

    return {
      distance: route.distance / 1000,
      unit: 'km',
      source: 'osrm',
      durationSeconds: Number.isFinite(route.duration) ? route.duration : undefined,
      haversineKm: fallback.distance,
    };
  } catch (err) {
    return { ...fallback, fallbackReason: err.name === 'AbortError' ? 'osrm_timeout' : 'osrm_error' };
  }
}

module.exports = {
  calculateDistance,
  validateCoordinates,
  parseCoordinate,
  toGeoJSONPoint,
  normalizeFarmLocation,
  isWithinGeofence,
  findNearest,
  filterByRadius,
  validateAgentLocation,
  getBoundingBox,
  formatLocation,
  appendKenya,
  stripKenyaSuffix,
  geocodeNominatim,
  getDrivingDistance,
  USER_AGENT,
};
