import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Link2,
  MapPin,
  Navigation,
  Package,
  Square,
  Truck,
  User,
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { canCreate, canUpdate } from '../utils/permissions';
import DeliveryMap from '../components/DeliveryMap';

const STEPS = [
  { key: 'idle', label: 'Recorded' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'arrived', label: 'Arrived' },
];

const statusHeadline = (status) => {
  if (status === 'in_transit') return 'In transit';
  if (status === 'arrived') return 'Arrived';
  return 'Recorded';
};

const stepIndex = (status) => {
  if (status === 'in_transit') return 1;
  if (status === 'arrived') return 2;
  return 0;
};

const driverLinkFromStart = (data) => {
  try {
    const token = new URL(data.url).pathname.split('/').filter(Boolean).pop();
    return `${window.location.origin}/track/${token}`;
  } catch {
    return data.url;
  }
};

const copyTripLink = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Trip link copied. Send it to the driver’s phone.');
  } catch {
    toast.error(`Copy this link: ${url}`);
  }
};

const DeliveryTrack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [delivery, setDelivery] = useState(null);
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tripBusy, setTripBusy] = useState(false);

  const fetchDelivery = useCallback(async () => {
    const { data } = await api.get(`/deliveries/${id}`);
    setDelivery(data);
    return data;
  }, [id]);

  const fetchInTransit = useCallback(async () => {
    try {
      const { data } = await api.get('/deliveries/in-transit');
      const match = (data || []).find((item) => item._id === id);
      setTruck(match || null);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDelivery();
        if (!cancelled && data.trackingStatus === 'in_transit') {
          await fetchInTransit();
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load delivery');
        navigate('/dashboard/deliveries');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchDelivery, fetchInTransit, navigate]);

  useEffect(() => {
    if (delivery?.trackingStatus !== 'in_transit') return undefined;
    fetchInTransit();
    const tick = () => {
      if (!document.hidden) fetchInTransit();
    };
    const interval = setInterval(tick, 12000);
    const onVis = () => {
      if (!document.hidden) fetchInTransit();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [delivery?.trackingStatus, fetchInTransit]);

  const handleStartTrip = async () => {
    setTripBusy(true);
    try {
      const { data } = await api.post(`/deliveries/${id}/start-trip`);
      const url = driverLinkFromStart(data);
      sessionStorage.setItem(`tripUrl:${id}`, url);
      setDelivery((prev) => (
        prev ? { ...prev, trackingStatus: data.trackingStatus || 'in_transit' } : prev
      ));
      setTruck(null);
      await copyTripLink(url);
      await fetchInTransit();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not start trip');
    } finally {
      setTripBusy(false);
    }
  };

  const handleCopyStoredLink = async () => {
    const stored = sessionStorage.getItem(`tripUrl:${id}`);
    if (stored) {
      await copyTripLink(stored);
      return;
    }
    await handleStartTrip();
  };

  const handleEndTrip = async () => {
    setTripBusy(true);
    try {
      await api.post(`/deliveries/${id}/end-trip`);
      sessionStorage.removeItem(`tripUrl:${id}`);
      setDelivery((prev) => (prev ? { ...prev, trackingStatus: 'arrived' } : prev));
      setTruck(null);
      toast.success('Trip marked arrived');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not end trip');
    } finally {
      setTripBusy(false);
    }
  };

  if (loading || !delivery) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 dark:text-dark-text-tertiary">Loading shipment…</div>
        </div>
      </div>
    );
  }

  const status = delivery.trackingStatus || 'idle';
  const currentStep = stepIndex(status);
  const headline = statusHeadline(status);
  const hasGps = Boolean(truck?.lastPosition?.lat && truck?.lastPosition?.lng);
  const canManageTrip = canCreate(authState?.role, 'deliveries');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard/deliveries')}
          className="flex items-center gap-2 text-[#1B4332] dark:text-dark-green-primary hover:text-[#2D6A4F] mb-4"
        >
          <ArrowLeft size={18} />
          Back to deliveries
        </button>
        <p className="text-sm font-medium uppercase tracking-wide text-[#F59E0B] dark:text-dark-gold-primary">
          Shipment status
        </p>
        <h1 className="text-4xl font-bold text-[#1B4332] dark:text-gray-100 mt-1">{headline}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {delivery.farmer?.name || 'Farmer'} · {delivery.type} · {delivery.kgsDelivered} kg
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between gap-2">
          {STEPS.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center min-w-[72px] flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      done || active
                        ? 'bg-[#1B4332] dark:bg-dark-green-primary border-[#1B4332] dark:border-dark-green-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    } ${active ? 'ring-4 ring-[#F59E0B]/30' : ''}`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium text-center ${
                      done || active
                        ? 'text-[#1B4332] dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mt-5 rounded ${
                      index < currentStep
                        ? 'bg-[#1B4332] dark:bg-dark-green-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-4">Shipment details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Truck size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Driver</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.driver || 'N/A'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Farmer</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.farmer?.name || 'N/A'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.type || 'N/A'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Weight</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.kgsDelivered ?? 0} kg</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Region</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.region || 'N/A'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">
                {delivery.date ? new Date(delivery.date).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-4">Trip actions</h2>
        {status === 'arrived' ? (
          <p className="text-gray-600 dark:text-gray-400">This shipment has arrived. Tracking is closed.</p>
        ) : canManageTrip ? (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              disabled={tripBusy}
              onClick={handleStartTrip}
              className="flex items-center justify-center gap-2 bg-[#1B4332] dark:bg-dark-green-primary text-white px-5 py-3 rounded-lg hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-all shadow-md disabled:opacity-60"
            >
              <Navigation size={18} />
              Start trip
            </button>
            {status === 'in_transit' && (
              <>
                <button
                  type="button"
                  disabled={tripBusy}
                  onClick={handleCopyStoredLink}
                  className="flex items-center justify-center gap-2 border-2 border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary px-5 py-3 rounded-lg hover:bg-[#1B4332] hover:text-white dark:hover:bg-dark-green-primary dark:hover:text-white transition-all"
                >
                  <Link2 size={18} />
                  Copy driver link
                </button>
                <button
                  type="button"
                  disabled={tripBusy}
                  onClick={handleEndTrip}
                  className="flex items-center justify-center gap-2 border-2 border-[#D93025] text-[#D93025] dark:text-red-400 dark:border-red-500 px-5 py-3 rounded-lg hover:bg-[#D93025] hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all"
                >
                  <Square size={18} />
                  End trip
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">You can view this shipment but cannot start or end trips.</p>
        )}
        {canUpdate(authState?.role, 'deliveries') && (
          <button
            type="button"
            onClick={() => navigate(`/dashboard/deliveries/edit/${id}`)}
            className="mt-4 text-sm font-medium text-[#1B4332] dark:text-dark-green-primary hover:underline"
          >
            Edit delivery record
          </button>
        )}
      </div>

      {status === 'in_transit' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-4">Live location</h2>
          {hasGps ? (
            <DeliveryMap
              centerLat={truck.lastPosition.lat}
              centerLng={truck.lastPosition.lng}
              zoom={13}
              farmers={[]}
              deliveries={[delivery]}
              trucks={[truck]}
              height="420px"
            />
          ) : (
            <div className="border border-dashed border-[#F59E0B] bg-amber-50 dark:bg-gray-700/50 rounded-lg p-6">
              <p className="font-medium text-[#1B4332] dark:text-gray-100">Waiting for the driver</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                This trip is pending. The map appears after the driver opens the tracking link and shares location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryTrack;
