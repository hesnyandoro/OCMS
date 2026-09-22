import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, MapPin, Package, Truck, User } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { canUpdate } from '../utils/permissions';

const DeliveryTrack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDelivery = useCallback(async () => {
    const { data } = await api.get(`/deliveries/${id}`);
    setDelivery(data);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        await fetchDelivery();
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          toast.error('Failed to load delivery');
          navigate('/dashboard/deliveries');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchDelivery, navigate]);

  if (loading || !delivery) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 dark:text-dark-text-tertiary">Loading delivery…</div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100">Delivery</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {delivery.farmer?.name || 'Farmer'} · {delivery.type} · {delivery.kgsDelivered} kg
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-4">Record</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">
                {delivery.date ? new Date(delivery.date).toLocaleDateString() : 'N/A'}
              </dd>
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
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Weight</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.kgsDelivered ?? 0} kg</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Driver</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.driver || 'N/A'}</dd>
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
            <MapPin size={18} className="text-[#F59E0B] mt-0.5" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Region</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{delivery.region || 'N/A'}</dd>
            </div>
          </div>
        </dl>
        {canUpdate(authState?.role, 'deliveries') && (
          <button
            type="button"
            onClick={() => navigate(`/dashboard/deliveries/edit/${id}`)}
            className="mt-6 text-sm font-medium text-[#1B4332] dark:text-dark-green-primary hover:underline"
          >
            Edit delivery record
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryTrack;
