import React, { useState, useEffect } from 'react';
import { MapPin, Loader, AlertCircle } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as geoService from '../services/geolocationService';

/**
 * NearbyFarmers Component
 * Displays a list of farmers nearby the user's current location
 * Can be used as a widget on dashboard or delivery pages
 */
export const NearbyFarmers = ({ radius = 50, limit = 5 }) => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const { lat, lng, error: geoError, getLocation } = useGeolocation();

  useEffect(() => {
    if (lat && lng) {
      fetchNearbyFarmers();
    }
  }, [lat, lng]);

  const fetchNearbyFarmers = async () => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      const result = await geoService.getNearbyFarmers(lat, lng, radius);
      setFarmers(result.data.slice(0, limit));
      setSearched(true);
    } catch (err) {
      console.error('Failed to fetch nearby farmers:', err);
      setError('Failed to fetch nearby farmers');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearby = () => {
    setSearched(false);
    getLocation();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={20} className="text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Nearby Farmers
        </h3>
      </div>

      {geoError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">Location Error</p>
            <p className="text-sm text-red-600 dark:text-red-400">{geoError}</p>
          </div>
        </div>
      )}

      {!searched && !lat ? (
        <button
          onClick={handleFindNearby}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Finding location...
            </>
          ) : (
            <>
              <MapPin size={16} />
              Find Nearby Farmers
            </>
          )}
        </button>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Searching nearby farmers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
            {error}
          </p>
          <button
            onClick={handleFindNearby}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
          >
            Try again
          </button>
        </div>
      ) : farmers.length > 0 ? (
        <div className="space-y-3">
          {farmers.map((farmer) => (
            <div
              key={farmer._id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {farmer.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    📱 {farmer.cellNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {farmer.distance.toFixed(1)} km
                  </p>
                </div>
              </div>
              {farmer.weighStation && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  🏢 Station: {farmer.weighStation}
                </p>
              )}
              {farmer.address && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  📍 {farmer.address}
                </p>
              )}
            </div>
          ))}
          <button
            onClick={handleFindNearby}
            className="w-full py-2 px-4 text-sm border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium mt-2"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            No farmers found within {radius} km radius
          </p>
          <button
            onClick={handleFindNearby}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Search again
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyFarmers;
