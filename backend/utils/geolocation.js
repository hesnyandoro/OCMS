/**
 * Geolocation utility functions
 * Handles distance calculations, region validation, and geographic queries
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First coordinate latitude
 * @param {number} lon1 - First coordinate longitude
 * @param {number} lat2 - Second coordinate latitude
 * @param {number} lon2 - Second coordinate longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a point is within a circular geofence
 * @param {number} lat - Point latitude
 * @param {number} lng - Point longitude
 * @param {number} centerLat - Geofence center latitude
 * @param {number} centerLng - Geofence center longitude
 * @param {number} radiusKm - Geofence radius in kilometers
 * @returns {boolean} True if point is within geofence
 */
function isWithinGeofence(lat, lng, centerLat, centerLng, radiusKm) {
  const distance = calculateDistance(lat, lng, centerLat, centerLng);
  return distance <= radiusKm;
}

/**
 * Find the closest location from an array of coordinates
 * @param {number} lat - Reference latitude
 * @param {number} lng - Reference longitude
 * @param {Array} locations - Array of {lat, lng, ...otherFields}
 * @returns {Object} Closest location with distance field
 */
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

/**
 * Filter locations within a certain radius
 * @param {number} lat - Reference latitude
 * @param {number} lng - Reference longitude
 * @param {Array} locations - Array of {lat, lng, ...otherFields}
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Array} Filtered locations with distance field
 */
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

/**
 * Validate if field agent's location is within their assigned region
 * Regions are stored as geofences with center + radius
 * @param {number} agentLat - Agent's current latitude
 * @param {number} agentLng - Agent's current longitude
 * @param {Object} regionBounds - {name, centerLat, centerLng, radiusKm}
 * @returns {Object} {isValid: boolean, distance: number, message: string}
 */
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

/**
 * Calculate bounding box for a geographic center point
 * Useful for MongoDB geo-queries
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} {minLat, maxLat, minLng, maxLng}
 */
function getBoundingBox(lat, lng, radiusKm = 50) {
  const latOffset = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const lngOffset = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latOffset,
    maxLat: lat + latOffset,
    minLng: lng - lngOffset,
    maxLng: lng + lngOffset,
  };
}

/**
 * Format location for storage/display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} address - Optional human-readable address
 * @returns {Object} Formatted location object
 */
function formatLocation(lat, lng, address = null) {
  return {
    lat: parseFloat(lat.toFixed(8)),
    lng: parseFloat(lng.toFixed(8)),
    address: address || null,
    timestamp: new Date(),
  };
}

module.exports = {
  calculateDistance,
  isWithinGeofence,
  findNearest,
  filterByRadius,
  validateAgentLocation,
  getBoundingBox,
  formatLocation,
};
