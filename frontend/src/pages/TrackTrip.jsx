import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Coffee, MapPin, AlertTriangle } from 'lucide-react';

const apiBase = import.meta.env.VITE_REACT_APP_API_URL || '/api';

const TrackTrip = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/tracking/${token}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.msg || 'Invalid tracking link');
        }
        if (!cancelled) setTrip(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (watchRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  const sendPing = async (position) => {
    const body = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
    const res = await fetch(`${apiBase}/tracking/${token}/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.msg || 'Could not send location');
    }
    setLastSent(new Date());
    setTrip((prev) => (prev ? { ...prev, status: 'live' } : prev));
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError('This phone does not support location sharing.');
      return;
    }
    setError('');
    setSharing(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        sendPing(position).catch((err) => {
          setError(err.message);
          setSharing(false);
          if (watchRef.current != null) {
            navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
          }
        });
      },
      (geoErr) => {
        setSharing(false);
        setError(geoErr.message || 'Location permission was denied.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  };

  const stopSharing = () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setSharing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Coffee className="text-[#1B4332]" size={28} />
          <h1 className="text-2xl font-bold text-[#1B4332]">OCMS trip</h1>
        </div>

        {error ? (
          <div className="text-center space-y-3">
            <AlertTriangle className="mx-auto text-red-600" size={40} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : !trip ? (
          <p className="text-center text-gray-600">Checking this tracking link…</p>
        ) : (
          <>
            <div className="bg-amber-50 border-l-4 border-[#F59E0B] p-4 rounded mb-6">
              <p className="text-sm text-amber-900 font-semibold">Keep this page open</p>
              <p className="text-sm text-amber-800 mt-1">
                Location sharing pauses if you lock the phone or switch apps. Leave this screen in the foreground until you arrive.
              </p>
            </div>

            <p className="text-gray-700 mb-1">
              Driver: <strong>{trip.driver || 'Assigned driver'}</strong>
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {trip.type} · {trip.region} · link expires {trip.expiresAt ? new Date(trip.expiresAt).toLocaleString() : 'soon'}
            </p>

            {sharing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#1B4332] font-medium">
                  <MapPin size={20} />
                  Sharing live location
                </div>
                <p className="text-sm text-gray-600">
                  {lastSent ? `Last update ${lastSent.toLocaleTimeString()}` : 'Waiting for first GPS fix…'}
                </p>
                <button
                  type="button"
                  onClick={stopSharing}
                  className="w-full border-2 border-[#1B4332] text-[#1B4332] font-semibold py-3 rounded-lg"
                >
                  Pause sharing
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startSharing}
                className="w-full bg-[#1B4332] text-white font-semibold py-3 rounded-lg"
              >
                Allow location and start sharing
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrackTrip;
