import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for browser geolocation API
 * Returns current coordinates, loading state, and error
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in ms (default: 10000)
 * @param {number} options.enableHighAccuracy - Enable high accuracy (default: false)
 * @param {number} options.maxAge - Max age of cached position in ms (default: 0)
 * @returns {Object} {lat, lng, accuracy, error, loading, getLocation}
 */
export function useGeolocation(options = {}) {
  const {
    timeout = 10000,
    enableHighAccuracy = true,
    maxAge = 0,
  } = options;

  const [coords, setCoords] = useState({
    lat: null,
    lng: null,
    accuracy: null,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to get location';

        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Permission denied. Please enable location access.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = 'Position unavailable';
        } else if (err.code === err.TIMEOUT) {
          errorMessage = 'Geolocation request timeout';
        }

        setError(errorMessage);
        setLoading(false);
      },
      {
        timeout,
        enableHighAccuracy,
        maximumAge: maxAge,
      }
    );
  }, [timeout, enableHighAccuracy, maxAge]);

  // Request location on mount (optional)
  useEffect(() => {
    // Auto-request only if explicitly enabled
    // Prevents automatic requests which may annoy users
  }, []);

  return {
    lat: coords.lat,
    lng: coords.lng,
    accuracy: coords.accuracy,
    error,
    loading,
    getLocation,
    hasLocation: coords.lat !== null && coords.lng !== null,
  };
}

/**
 * Hook to watch user location continuously (for real-time tracking)
 * @param {Object} options - Same as useGeolocation
 * @returns {Object} {lat, lng, accuracy, error, loading, stopWatching}
 */
export function useGeolocationWatch(options = {}) {
  const {
    timeout = 10000,
    enableHighAccuracy = true,
    maxAge = 0,
  } = options;

  const [coords, setCoords] = useState({
    lat: null,
    lng: null,
    accuracy: null,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to watch location';

        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Permission denied. Please enable location access.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = 'Position unavailable';
        } else if (err.code === err.TIMEOUT) {
          errorMessage = 'Geolocation request timeout';
        }

        setError(errorMessage);
        setLoading(false);
      },
      {
        timeout,
        enableHighAccuracy,
        maximumAge: maxAge,
      }
    );

    setWatchId(id);
  }, [timeout, enableHighAccuracy, maxAge]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    lat: coords.lat,
    lng: coords.lng,
    accuracy: coords.accuracy,
    error,
    loading,
    startWatching,
    stopWatching,
    hasLocation: coords.lat !== null && coords.lng !== null,
    isWatching: watchId !== null,
  };
}
