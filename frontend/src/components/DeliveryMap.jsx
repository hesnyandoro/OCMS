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
export const DeliveryMap = ({
  centerLat = -1.2,
  centerLng = 34.75,
  zoom = 12,
  farmers = [],
  deliveries = [],
  userLocation = null,
  onMarkerClick = null,
  height = '400px',
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

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

    // Add farmer markers (blue)
    farmers.forEach((farmer) => {
      if (farmer.lat && farmer.lng) {
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

    // Add delivery location markers if available (red)
    deliveries.forEach((delivery) => {
      if (
        delivery.farmer?.farmLocation?.lat &&
        delivery.farmer?.farmLocation?.lng
      ) {
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

        const marker = L.marker(
          [delivery.farmer.farmLocation.lat, delivery.farmer.farmLocation.lng],
          {
            icon: redIcon,
            title: `Delivery: ${delivery.farmer.name}`,
          }
        )
          .bindPopup(
            `
            <div style="font-size: 12px;">
              <strong>Delivery</strong><br />
              Farmer: ${delivery.farmer.name}<br />
              Kgs: ${delivery.kgsDelivered}<br />
              Type: ${delivery.type}<br />
              Date: ${new Date(delivery.date).toLocaleDateString()}
            </div>
          `,
            { maxWidth: 250 }
          )
          .addTo(mapInstanceRef.current);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(delivery));
        }

        markersRef.current.push(marker);
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
    }
  }, [farmers, deliveries, userLocation, onMarkerClick]);

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
