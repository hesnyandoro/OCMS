import React, { useEffect, useRef, useState } from 'react';
import { Loader, MapPin, Search } from 'lucide-react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { shouldGeocodeQuery } from '../utils/debounce';
import { geocodeRegion } from '../services/geolocationService';
import LocationMap from './LocationMap';

const FarmLocationPicker = ({ register, setValue, watch, errors, debounceMs = 500 }) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const requestIdRef = useRef(0);
  const boxRef = useRef(null);

  const lat = watch('farmLocation.lat');
  const lng = watch('farmLocation.lng');
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  useEffect(() => {
    const handleClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (!shouldGeocodeQuery(term)) {
      setStatus('idle');
      setResults([]);
      setMessage('');
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    setStatus('searching');
    setMessage('');
    setOpen(true);

    geocodeRegion(term)
      .then((payload) => {
        if (requestId !== requestIdRef.current) return;
        const next = payload?.results || [];
        setResults(next);
        if (!next.length) {
          setStatus('notfound');
          setMessage(payload?.msg || 'No matching place found in Kenya. Enter coordinates manually or pick a point on the map.');
        } else {
          setStatus('results');
        }
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setStatus('error');
        setResults([]);
        setMessage(err?.response?.data?.msg || 'Could not look up that place. Enter coordinates manually.');
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [debouncedQuery]);

  const applyResult = (result) => {
    setValue('farmLocation.lat', result.lat, { shouldValidate: true, shouldDirty: true });
    setValue('farmLocation.lng', result.lng, { shouldValidate: true, shouldDirty: true });
    setValue('farmLocation.address', result.displayName, { shouldValidate: true, shouldDirty: true });
    if (!watch('weighStation')) {
      const regionGuess = result.displayName?.split(',')[0]?.trim();
      if (regionGuess) {
        setValue('weighStation', regionGuess, { shouldDirty: true });
      }
    }
    setQuery(result.displayName);
    setOpen(false);
    setStatus('idle');
    setMessage('');
  };

  const handleMarkerMove = ({ lat: nextLat, lng: nextLng }) => {
    setValue('farmLocation.lat', Number(nextLat.toFixed(6)), { shouldValidate: true, shouldDirty: true });
    setValue('farmLocation.lng', Number(nextLng.toFixed(6)), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="mb-3">
      <label className="form-label">Farm Location</label>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Search a Kenyan region or village, then confirm the pin. You can always type coordinates by hand.
      </p>

      <div className="relative mb-3" ref={boxRef}>
        <label className="form-label" htmlFor="region-geocode">Search region or place</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            id="region-geocode"
            className="form-control pl-9"
            type="text"
            value={query}
            placeholder="e.g. Kericho, Nyeri, Bungoma"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => results.length && setOpen(true)}
          />
          {status === 'searching' && (
            <Loader data-testid="geocode-spinner" className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#1B4332]" size={16} />
          )}
        </div>
        {status === 'searching' && (
          <p className="text-sm text-gray-500 mt-1">Searching Kenya…</p>
        )}
        {open && status === 'results' && results.length > 0 && (
          <ul
            data-testid="geocode-results"
            className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto"
          >
            {results.map((result) => (
              <li key={`${result.lat},${result.lng},${result.displayName}`}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => applyResult(result)}
                >
                  <MapPin size={14} className="inline mr-1 text-[#D93025]" />
                  {result.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
        {(status === 'notfound' || status === 'error') && message && (
          <p className="text-danger mt-1" role="alert">{message}</p>
        )}
      </div>

      <div className="row">
        <div className="col">
          <label className="form-label" htmlFor="farm-lat">Latitude</label>
          <input
            id="farm-lat"
            className="form-control"
            type="number"
            step="any"
            placeholder="-0.367"
            {...register('farmLocation.lat')}
          />
          {errors.farmLocation?.lat && <p className="text-danger">{errors.farmLocation.lat.message}</p>}
        </div>
        <div className="col">
          <label className="form-label" htmlFor="farm-lng">Longitude</label>
          <input
            id="farm-lng"
            className="form-control"
            type="number"
            step="any"
            placeholder="35.283"
            {...register('farmLocation.lng')}
          />
          {errors.farmLocation?.lng && <p className="text-danger">{errors.farmLocation.lng.message}</p>}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">Manual override is always available if the lookup is off.</p>

      <div className="mt-3">
        <label className="form-label" htmlFor="farm-address">Address</label>
        <input
          id="farm-address"
          className="form-control"
          type="text"
          placeholder="Village, ward, or nearest town"
          {...register('farmLocation.address')}
        />
        {errors.farmLocation?.address && <p className="text-danger">{errors.farmLocation.address.message}</p>}
      </div>

      <div className="mt-3">
        <LocationMap lat={lat} lng={lng} onPositionChange={handleMarkerMove} />
        {Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? (
          <p className="text-xs text-gray-500 mt-1">Drag the pin to correct the farm location.</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">Search a place or enter coordinates to drop a pin.</p>
        )}
      </div>
    </div>
  );
};

export default FarmLocationPicker;
