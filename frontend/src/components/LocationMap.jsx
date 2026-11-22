import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const KENYA_CENTER = [-0.42, 36.95];

const hasCoords = (lat, lng) => {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b);
};

/**
 * Single-pin map for the farmer form. The pin is draggable so a user can
 * correct a geocoded location.
 */
const LocationMap = ({
  lat,
  lng,
  onPositionChange,
  height = '280px',
  draggable = true,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const start = hasCoords(lat, lng) ? [Number(lat), Number(lng)] : KENYA_CENTER;
    const map = L.map(mapRef.current).setView(start, hasCoords(lat, lng) ? 13 : 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!hasCoords(lat, lng)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const position = [Number(lat), Number(lng)];
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: DefaultIcon, draggable })
        .addTo(map)
        .bindPopup('Farm location — drag to correct');
      if (draggable && onPositionChange) {
        markerRef.current.on('dragend', (event) => {
          const next = event.target.getLatLng();
          onPositionChange({ lat: next.lat, lng: next.lng });
        });
      }
    } else {
      markerRef.current.setLatLng(position);
    }
    map.setView(position, Math.max(map.getZoom(), 13));
    requestAnimationFrame(() => map.invalidateSize());
  }, [lat, lng, draggable, onPositionChange]);

  return (
    <div
      ref={mapRef}
      data-testid="farm-location-map"
      style={{
        height,
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    />
  );
};

export default LocationMap;
