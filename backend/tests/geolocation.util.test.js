const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const geo = require('../utils/geolocation');

describe('Haversine calculateDistance', () => {
  it('returns 0 for the same point', () => {
    assert.equal(geo.calculateDistance(-0.42, 36.95, -0.42, 36.95), 0);
  });

  it('is about 111.2 km for one degree of latitude at the equator', () => {
    const km = geo.calculateDistance(0, 0, 1, 0);
    assert.ok(Math.abs(km - 111.19) < 0.3, `got ${km}`);
  });

  it('computes a known Kenya pair (Nairobi to Kisumu) in the expected range', () => {
    // Nairobi -1.286, 36.817  Kisumu -0.0917, 34.768
    const km = geo.calculateDistance(-1.286389, 36.817223, -0.091702, 34.767956);
    assert.ok(km > 250 && km < 280, `got ${km}`);
  });

  it('is symmetric', () => {
    const a = geo.calculateDistance(-0.3, 35.2, 0.5, 36.1);
    const b = geo.calculateDistance(0.5, 36.1, -0.3, 35.2);
    assert.ok(Math.abs(a - b) < 1e-9);
  });
});

describe('validateCoordinates / normalizeFarmLocation', () => {
  it('accepts numeric strings and returns numbers', () => {
    const coords = geo.validateCoordinates(' -0.5 ', '35.28');
    assert.equal(coords.ok, true);
    assert.equal(coords.lat, -0.5);
    assert.equal(coords.lng, 35.28);
  });

  it('rejects latitude outside -90..90', () => {
    const coords = geo.validateCoordinates(91, 35);
    assert.equal(coords.ok, false);
    assert.match(coords.error, /Latitude/);
  });

  it('rejects longitude outside -180..180', () => {
    const coords = geo.validateCoordinates(0, 181);
    assert.equal(coords.ok, false);
    assert.match(coords.error, /Longitude/);
  });

  it('rejects non-numeric values', () => {
    const coords = geo.validateCoordinates('north', 'east');
    assert.equal(coords.ok, false);
  });

  it('builds GeoJSON [lng, lat] from a farm location', () => {
    const result = geo.normalizeFarmLocation({ lat: -0.42, lng: 36.95, address: 'Nyeri' });
    assert.deepEqual(result.value, { lat: -0.42, lng: 36.95, address: 'Nyeri' });
    assert.deepEqual(result.location, { type: 'Point', coordinates: [36.95, -0.42] });
  });

  it('requires both lat and lng when one is present', () => {
    const result = geo.normalizeFarmLocation({ lat: -0.42 });
    assert.match(result.error, /Both latitude and longitude/);
  });

  it('allows address-only payloads', () => {
    const result = geo.normalizeFarmLocation({ address: '  Kericho  ' });
    assert.deepEqual(result.value, { address: 'Kericho' });
    assert.equal(result.location, undefined);
  });
});

describe('appendKenya', () => {
  it('appends Kenya when missing', () => {
    assert.equal(geo.appendKenya('Kericho'), 'Kericho, Kenya');
  });

  it('does not duplicate Kenya', () => {
    assert.equal(geo.appendKenya('Kericho, Kenya'), 'Kericho, Kenya');
  });
});

describe('geocodeNominatim', () => {
  it('calls Nominatim with Kenya in the query and an identifying User-Agent', async () => {
    const calls = [];
    const fetchFn = async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        json: async () => [{ display_name: 'Kericho, Kenya', lat: '-0.367', lon: '35.283', type: 'city' }],
      };
    };

    const result = await geo.geocodeNominatim('Kericho', { fetch: fetchFn, skipThrottle: true, skipCache: true });
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].lat, -0.367);
    assert.equal(result.results[0].lng, 35.283);
    assert.match(calls[0].url, /q=Kericho%2C\+Kenya/);
    assert.match(calls[0].url, /countrycodes=ke/);
    assert.equal(calls[0].options.headers['User-Agent'], geo.USER_AGENT);
  });

  it('returns a not-found-friendly empty list', async () => {
    const fetchFn = async () => ({ ok: true, json: async () => [] });
    const result = await geo.geocodeNominatim('zzzznotaplace', { fetch: fetchFn, skipThrottle: true, skipCache: true });
    assert.deepEqual(result.results, []);
  });
});

describe('getDrivingDistance OSRM with Haversine fallback', () => {
  const from = { lat: -0.42, lng: 36.95 };
  const to = { lat: -0.1, lng: 34.75 };

  it('returns OSRM metres converted to km when the API succeeds', async () => {
    const fetchFn = async () => ({
      ok: true,
      json: async () => ({ routes: [{ distance: 246000, duration: 10800 }] }),
    });
    const result = await geo.getDrivingDistance(from.lat, from.lng, to.lat, to.lng, { fetch: fetchFn });
    assert.equal(result.source, 'osrm');
    assert.equal(result.distance, 246);
    assert.equal(result.durationSeconds, 10800);
    assert.equal(result.unit, 'km');
  });

  it('falls back to Haversine when OSRM fails', async () => {
    const fetchFn = async () => {
      throw new Error('network down');
    };
    const result = await geo.getDrivingDistance(from.lat, from.lng, to.lat, to.lng, { fetch: fetchFn });
    assert.equal(result.source, 'haversine');
    assert.equal(result.fallbackReason, 'osrm_error');
    const expected = geo.calculateDistance(from.lat, from.lng, to.lat, to.lng);
    assert.equal(result.distance, expected);
  });

  it('falls back to Haversine when OSRM returns a non-OK status', async () => {
    const fetchFn = async () => ({ ok: false, status: 503, json: async () => ({}) });
    const result = await geo.getDrivingDistance(from.lat, from.lng, to.lat, to.lng, { fetch: fetchFn });
    assert.equal(result.source, 'haversine');
    assert.equal(result.fallbackReason, 'osrm_http_503');
  });
});
