import React from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

/**
 * GeolocationCapture Component
 * Provides UI for capturing current location with button and display
 * @param {Object} props
 * @param {Function} props.onLocationCapture - Callback when location is captured
 * @param {Object} props.initialLocation - Initial location to display {lat, lng, address}
 */
export const GeolocationCapture = ({
  onLocationCapture,
  initialLocation = null,
}) => {
  const { lat, lng, accuracy, error, loading, getLocation } = useGeolocation();

  const handleCaptureLocation = () => {
    getLocation();
  };

  React.useEffect(() => {
    // When location is captured, call the callback
    if (lat && lng) {
      onLocationCapture({ lat, lng, accuracy });
    }
  }, [lat, lng, accuracy, onLocationCapture]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <MapPin size={20} className="text-blue-600" />
        <h3 className="font-semibold text-gray-800">Current Location</h3>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {(lat || initialLocation?.lat) && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="font-semibold text-blue-900">Captured Location:</div>
          <div className="text-blue-800 font-mono text-xs">
            Latitude: {lat || initialLocation?.lat}
          </div>
          <div className="text-blue-800 font-mono text-xs">
            Longitude: {lng || initialLocation?.lng}
          </div>
          {(accuracy || initialLocation?.accuracy) && (
            <div className="text-blue-700 text-xs mt-1">
              Accuracy: ±{(accuracy || initialLocation?.accuracy).toFixed(2)}m
            </div>
          )}
          {initialLocation?.address && (
            <div className="text-blue-800 text-xs mt-1">
              Address: {initialLocation.address}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleCaptureLocation}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Capturing...
          </>
        ) : (
          <>
            <MapPin size={18} />
            Capture Current Location
          </>
        )}
      </button>

      <p className="text-xs text-gray-600 mt-2">
        Click to capture your current GPS location. Make sure location services
        are enabled.
      </p>
    </div>
  );
};

export default GeolocationCapture;
