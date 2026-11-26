import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DeliveryMap from '../components/DeliveryMap';
import { canCreate } from '../utils/permissions';
import { useSmartRefresh } from '../hooks/useSmartRefresh';

const hasFarmCoords = (farmer) => {
  const lat = Number(farmer?.farmLocation?.lat);
  const lng = Number(farmer?.farmLocation?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
};

const FarmerMap = () => {
  const { authState } = useContext(AuthContext);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const fetchFarmers = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/farmers');
      setFarmers(data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to load farmers');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const silentRefresh = useCallback(() => fetchFarmers({ silent: true }), [fetchFarmers]);
  useSmartRefresh(silentRefresh, 120000);

  const regions = useMemo(
    () => [...new Set(farmers.map((f) => f.weighStation).filter(Boolean))],
    [farmers]
  );

  const visibleFarmers = useMemo(() => {
    return farmers.filter((farmer) => regionFilter === 'All' || farmer.weighStation === regionFilter);
  }, [farmers, regionFilter]);

  const mappedFarmers = useMemo(
    () =>
      visibleFarmers.filter(hasFarmCoords).map((farmer) => ({
        _id: farmer._id,
        name: farmer.name,
        lat: farmer.farmLocation.lat,
        lng: farmer.farmLocation.lng,
        address: farmer.farmLocation.address,
        weighStation: farmer.weighStation,
        cellNumber: farmer.cellNumber,
      })),
    [visibleFarmers]
  );

  const missingCount = visibleFarmers.length - mappedFarmers.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100">Farmer Map</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              High-level view of registered farm locations
              {authState?.assignedRegion ? ` in ${authState.assignedRegion}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/farmers"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Farmer list
            </Link>
            {canCreate(authState?.role, 'farmers') && (
              <Link
                to="/dashboard/farmers/new"
                className="px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F]"
              >
                Add farmer
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-3">
          <Users className="text-[#1B4332]" />
          <div>
            <p className="text-sm text-gray-500">Farmers in view</p>
            <p className="text-xl font-semibold text-[#1B4332] dark:text-gray-100">{visibleFarmers.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-3">
          <MapPin className="text-[#F59E0B]" />
          <div>
            <p className="text-sm text-gray-500">Plotted on map</p>
            <p className="text-xl font-semibold text-[#1B4332] dark:text-gray-100">{mappedFarmers.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <label className="text-sm text-gray-500 block mb-1">Region</label>
          <select
            value={regionFilter}
            onChange={(event) => setRegionFilter(event.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <option value="All">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {missingCount > 0 && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {missingCount} farmer{missingCount === 1 ? '' : 's'} in this view {missingCount === 1 ? 'has' : 'have'} no usable coordinates yet.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {loading && farmers.length === 0 ? (
          <div className="py-16 text-center text-gray-500">Loading farm locations…</div>
        ) : (
          <DeliveryMap
            farmers={mappedFarmers}
            height="70vh"
            zoom={7}
            onMarkerClick={setSelected}
          />
        )}
      </div>

      {selected && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="font-semibold text-[#1B4332] dark:text-gray-100">{selected.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Station: {selected.weighStation || 'N/A'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {selected.cellNumber || 'N/A'}</p>
          {selected.address && <p className="text-sm text-gray-600 dark:text-gray-400">{selected.address}</p>}
          <p className="text-xs text-gray-500 mt-1 font-mono">{selected.lat}, {selected.lng}</p>
        </div>
      )}
    </div>
  );
};

export default FarmerMap;
