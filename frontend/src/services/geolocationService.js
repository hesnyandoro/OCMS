import api from './api';

/**
 * Geolocation API service
 * Handles all geolocation-related API calls
 */

/**
 * Find farmers near a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in km (default: 50)
 * @returns {Promise} Array of nearby farmers with distance
 */
export const getNearbyFarmers = async (lat, lng, radius = 50) => {
  try {
    const { data } = await api.get('/geolocation/farmers/nearby', {
      params: { lat, lng, radius },
    });
    return data;
  } catch (err) {
    console.error('Failed to fetch nearby farmers:', err);
    throw err;
  }
};

/**
 * Find nearest deliveries to driver's location
 * @param {number} lat - Driver's latitude
 * @param {number} lng - Driver's longitude
 * @param {number} limit - Maximum number of deliveries to return (default: 10)
 * @returns {Promise} Array of nearby deliveries sorted by distance
 */
export const getNearestDeliveries = async (lat, lng, limit = 10) => {
  try {
    const { data } = await api.get('/geolocation/deliveries/nearest', {
      params: { lat, lng, limit },
    });
    return data;
  } catch (err) {
    console.error('Failed to fetch nearest deliveries:', err);
    throw err;
  }
};

/**
 * Calculate distance between two points
 * @param {number} fromLat - Starting latitude
 * @param {number} fromLng - Starting longitude
 * @param {number} toLat - Destination latitude
 * @param {number} toLng - Destination longitude
 * @returns {Promise} Object with distance in km
 */
export const calculateDistance = async (fromLat, fromLng, toLat, toLng) => {
  try {
    const { data } = await api.get('/geolocation/distance', {
      params: { fromLat, fromLng, toLat, toLng },
    });
    return data;
  } catch (err) {
    console.error('Failed to calculate distance:', err);
    throw err;
  }
};

/**
 * Validate if user's current location is within their assigned region
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @returns {Promise} Object with validation result and message
 */
export const validateUserLocation = async (lat, lng) => {
  try {
    const { data } = await api.post('/geolocation/validate-location', {
      lat,
      lng,
    });
    return data;
  } catch (err) {
    console.error('Failed to validate location:', err);
    throw err;
  }
};

/**
 * Record pickup location for a delivery
 * @param {string} deliveryId - Delivery ID
 * @param {number} lat - Pickup latitude
 * @param {number} lng - Pickup longitude
 * @param {string} address - Optional human-readable address
 * @returns {Promise} Updated delivery object
 */
export const recordPickupLocation = async (
  deliveryId,
  lat,
  lng,
  address = null
) => {
  try {
    const { data } = await api.post(
      `/geolocation/deliveries/${deliveryId}/pickup`,
      {
        lat,
        lng,
        address,
      }
    );
    return data;
  } catch (err) {
    console.error('Failed to record pickup location:', err);
    throw err;
  }
};

/**
 * Record dropoff location for a delivery
 * @param {string} deliveryId - Delivery ID
 * @param {number} lat - Dropoff latitude
 * @param {number} lng - Dropoff longitude
 * @param {string} address - Optional human-readable address
 * @returns {Promise} Updated delivery object
 */
export const recordDropoffLocation = async (
  deliveryId,
  lat,
  lng,
  address = null
) => {
  try {
    const { data } = await api.post(
      `/geolocation/deliveries/${deliveryId}/dropoff`,
      {
        lat,
        lng,
        address,
      }
    );
    return data;
  } catch (err) {
    console.error('Failed to record dropoff location:', err);
    throw err;
  }
};
