import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
<<<<<<< HEAD
import { useDismissibleOverlay } from '../hooks/useDismissibleOverlay';
=======
>>>>>>> 2e2537683ede43fb131e29dd6796a16ac18d4bbc

const tripBadge = (status) => {
  if (status === 'live') return { label: 'Live', className: 'bg-green-100 text-green-800' };
  if (status === 'pending') return { label: 'Waiting', className: 'bg-amber-50 text-amber-800' };
  if (status === 'ended') return { label: 'Ended', className: 'bg-gray-200 text-gray-700' };
  return { label: 'No active trip', className: 'bg-gray-100 text-gray-600' };
};

const MonitorDeliveriesModal = ({ open, onClose }) => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const loadDrivers = async () => {
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data || []);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not load drivers');
    }
  };

  const loadTrips = async () => {
    try {
      const { data } = await api.get('/deliveries/in-transit');
      setTrips(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    loadDrivers();
    loadTrips();
    const tick = () => {
      if (!document.hidden) loadTrips();
    };
    const id = setInterval(tick, 12000);
    const onVis = () => {
      if (!document.hidden) loadTrips();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [open]);

<<<<<<< HEAD
  const { onBackdropClick } = useDismissibleOverlay(open, onClose);

=======
>>>>>>> 2e2537683ede43fb131e29dd6796a16ac18d4bbc
  if (!open) return null;

  const tripByDriver = new Map(
    trips.map((trip) => [String(trip.driver || '').trim().toLowerCase(), trip])
  );

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/drivers', { name: name.trim(), phone: phone.trim() });
      setDrivers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setPhone('');
      setShowForm(false);
      toast.success('Driver added');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not add driver');
    } finally {
      setSaving(false);
    }
  };

  return (
<<<<<<< HEAD
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
    >
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
>>>>>>> 2e2537683ede43fb131e29dd6796a16ac18d4bbc
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#1B4332] dark:text-gray-100">Monitor deliveries</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Current trips</h3>
            {trips.length === 0 ? (
              <p className="text-sm text-gray-500">No trucks are in transit right now.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-[#1B4332] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">Driver</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Region</th>
                      <th className="px-3 py-2 text-left">Farmer</th>
                      <th className="px-3 py-2 text-left">Last ping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {trips.map((trip) => {
                      const badge = tripBadge(trip.tripStatus);
                      const last = trip.lastPosition;
                      return (
                        <tr key={trip._id} className="bg-white dark:bg-gray-800">
                          <td className="px-3 py-2 font-medium">{trip.driver || '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>{badge.label}</span>
                          </td>
                          <td className="px-3 py-2">{trip.type}</td>
                          <td className="px-3 py-2">{trip.region}</td>
                          <td className="px-3 py-2">{trip.farmer?.name || '—'}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                            {last?.recordedAt
                              ? `${new Date(last.recordedAt).toLocaleTimeString()}${last.lat != null ? ` (${Number(last.lat).toFixed(4)}, ${Number(last.lng).toFixed(4)})` : ''}`
                              : 'Waiting for GPS'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Drivers</h3>
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1B4332] text-white text-sm font-medium rounded-lg"
              >
                <Plus size={16} />
                Add driver
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddDriver} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  className="form-control"
                  placeholder="Driver name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="form-control"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#1B4332] text-white font-medium rounded-lg py-2 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save driver'}
                </button>
              </form>
            )}

            {drivers.length === 0 ? (
              <p className="text-sm text-gray-500">No drivers in the directory yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                {drivers.map((driver) => {
                  const trip = tripByDriver.get(driver.name.trim().toLowerCase());
                  const badge = tripBadge(trip?.tripStatus);
                  return (
                    <li key={driver._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{driver.name}</p>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>{badge.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MonitorDeliveriesModal;
