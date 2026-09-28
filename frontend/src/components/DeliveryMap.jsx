import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons issue in Leaflet with Webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * DeliveryMap Component
 * Displays farmers, deliveries, and user location on an interactive map
 * @param {Object} props
 * @param {number} props.centerLat - Initial map center latitude
 * @param {number} props.centerLng - Initial map center longitude
 * @param {number} props.zoom - Initial zoom level (default: 12)
 * @param {Array} props.farmers - Array of {_id, name, lat, lng, address, weighStation}
 * @param {Array} props.deliveries - Array of delivery objects with farmer info
 * @param {Object} props.userLocation - User's current location {lat, lng}
 * @param {Function} props.onMarkerClick - Callback when marker is clicked
 * @param {string} props.height - Map container height (default: 400px)
 */
const TruckIcon = L.divIcon({
  className: 'ocms-truck-marker',
  html: '<div style="font-size:22px;line-height:22px;">🚚</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export const DeliveryMap = ({
  centerLat = -1.2,
  centerLng = 34.75,
  zoom = 12,
  farmers = [],
  deliveries = [],
  trucks = [],
  userLocation = null,
  onMarkerClick = null,
  height = '400px',
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const trailsRef = useRef([]);
  const lastFitKeyRef = useRef('');

  useEffect(() => {
    // Initialize map only once
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(
      [centerLat, centerLng],
      zoom
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);
  }, [centerLat, centerLng, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    trailsRef.current.forEach((line) => line.remove());
    trailsRef.current = [];

    // Add farmer markers (blue)
    farmers.forEach((farmer) => {
      if (farmer.lat && farmer.lng && !(Number(farmer.lat) === 0 && Number(farmer.lng) === 0)) {
        const marker = L.marker([farmer.lat, farmer.lng], {
          icon: DefaultIcon,
          title: `Farmer: ${farmer.name}`,
        })
          .bindPopup(
            `
            <div style="font-size: 12px;">
              <strong>${farmer.name}</strong><br />
              Station: ${farmer.weighStation || 'N/A'}<br />
              Phone: ${farmer.cellNumber || 'N/A'}<br />
              ${farmer.address ? `Address: ${farmer.address}` : ''}
            </div>
          `,
            { maxWidth: 250 }
          )
          .addTo(mapInstanceRef.current);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(farmer));
        }

        markersRef.current.push(marker);
      }
    });

    const hasCoords = (lat, lng) => {
      const a = Number(lat);
      const b = Number(lng);
      return Number.isFinite(a) && Number.isFinite(b) && !(a === 0 && b === 0);
    };

    const bounds = [];
    farmers.forEach((farmer) => {
      if (hasCoords(farmer.lat, farmer.lng)) bounds.push([farmer.lat, farmer.lng]);
    });

    const farmerIds = new Set(farmers.map((f) => String(f._id)).filter(Boolean));
    const redIcon = L.icon({
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'red-marker',
    });

    deliveries.forEach((delivery) => {
      const farm = delivery.farmer?.farmLocation;
      const pickup = delivery.pickupLocation;
      const alreadyShownAsFarmer = delivery.farmer?._id && farmerIds.has(String(delivery.farmer._id));
      const coords =
        hasCoords(pickup?.lat, pickup?.lng)
          ? pickup
          : !alreadyShownAsFarmer && hasCoords(farm?.lat, farm?.lng)
            ? farm
            : null;

      if (!coords) return;

      const sameAsFarm =
        alreadyShownAsFarmer &&
        farm?.lat &&
        farm?.lng &&
        Math.abs(Number(coords.lat) - Number(farm.lat)) < 1e-5 &&
        Math.abs(Number(coords.lng) - Number(farm.lng)) < 1e-5;
      if (sameAsFarm) return;

      const marker = L.marker([coords.lat, coords.lng], {
        icon: redIcon,
        title: `Delivery: ${delivery.farmer?.name || 'Pickup'}`,
      })
        .bindPopup(
          `
            <div style="font-size: 12px;">
              <strong>Delivery</strong><br />
              Farmer: ${delivery.farmer?.name || 'N/A'}<br />
              Kgs: ${delivery.kgsDelivered}<br />
              Type: ${delivery.type}<br />
              Date: ${delivery.date ? new Date(delivery.date).toLocaleDateString() : 'N/A'}
            </div>
          `,
          { maxWidth: 250 }
        )
        .addTo(mapInstanceRef.current);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(delivery));
      }

      markersRef.current.push(marker);
      bounds.push([coords.lat, coords.lng]);
    });

    trucks.forEach((truck) => {
      const last = truck.lastPosition;
      if (last?.lat && last?.lng) {
        const marker = L.marker([last.lat, last.lng], {
          icon: TruckIcon,
          title: `Truck: ${truck.driver || 'In transit'}`,
        })
          .bindPopup(
            `
            <div style="font-size: 12px;">
              <strong>${truck.kind === 'driver' ? 'Driver' : 'In transit'}</strong><br />
              Driver: ${truck.driver || 'N/A'}<br />
              ${truck.type ? `Type: ${truck.type}<br />` : ''}
              ${truck.farmer?.name ? `Farmer: ${truck.farmer.name}<br />` : ''}
              Updated: ${last.recordedAt ? new Date(last.recordedAt).toLocaleTimeString() : 'waiting'}
            </div>
          `,
            { maxWidth: 250 }
          )
          .addTo(mapInstanceRef.current);

        markersRef.current.push(marker);
        bounds.push([last.lat, last.lng]);
      }

      const path = (truck.trail || [])
        .filter((p) => p.lat && p.lng)
        .map((p) => [p.lat, p.lng]);
      if (path.length > 1) {
        const line = L.polyline(path, { color: '#1B4332', weight: 4, opacity: 0.7 })
          .addTo(mapInstanceRef.current);
        trailsRef.current.push(line);
      }
    });

    // Add user location marker (green)
    if (userLocation?.lat && userLocation?.lng) {
      const greenIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: greenIcon,
        title: 'Your Location',
      })
        .bindPopup('📍 Your Current Location', { maxWidth: 250 })
        .addTo(mapInstanceRef.current);

      // Draw accuracy circle
      L.circle([userLocation.lat, userLocation.lng], {
        color: 'blue',
        fillColor: '#30b0d5',
        fillOpacity: 0.1,
        radius: userLocation.accuracy || 100,
      }).addTo(mapInstanceRef.current);

      markersRef.current.push(userMarker);
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    const locKey = [
      farmers.map((f) => f._id).join(','),
      deliveries.map((d) => d._id).join(','),
      trucks.some((t) => t.lastPosition?.lat && t.lastPosition?.lng) ? 't' : '',
    ].join('|');

    if (bounds.length && lastFitKeyRef.current !== locKey) {
      lastFitKeyRef.current = locKey;
      if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 13);
      } else {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }

    requestAnimationFrame(() => {
      mapInstanceRef.current?.invalidateSize();
    });
  }, [farmers, deliveries, trucks, userLocation, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    />
  );
};

export default DeliveryMap;
