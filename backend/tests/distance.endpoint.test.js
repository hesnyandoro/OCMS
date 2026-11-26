const { describe, it, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-geocoding';

const app = require('../app');
const request = require('supertest');

function authHeader() {
  const token = jwt.sign(
    { user: { id: '000000000000000000000001', role: 'admin', assignedRegion: null } },
    process.env.JWT_SECRET
  );
  return `Bearer ${token}`;
}

describe('GET /api/geolocation/distance', () => {
  let originalFetch;

  before(() => {
    originalFetch = globalThis.fetch;
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  it('requires from/to coordinates', async () => {
    const res = await request(app)
      .get('/api/geolocation/distance')
      .set('Authorization', authHeader());
    assert.equal(res.status, 400);
    assert.match(res.body.msg, /valid numbers|required/i);
  });

  it('rejects out-of-range latitude', async () => {
    const res = await request(app)
      .get('/api/geolocation/distance')
      .query({ fromLat: 95, fromLng: 36, toLat: -0.1, toLng: 34.7 })
      .set('Authorization', authHeader());
    assert.equal(res.status, 400);
    assert.match(res.body.msg, /Latitude/);
  });

  it('returns OSRM driving distance when the routing API succeeds', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({ routes: [{ distance: 15000, duration: 1200 }] }),
    }));

    const res = await request(app)
      .get('/api/geolocation/distance')
      .query({ fromLat: -0.42, fromLng: 36.95, toLat: -0.4, toLng: 36.9 })
      .set('Authorization', authHeader());

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.source, 'osrm');
    assert.equal(res.body.data.distance, 15);
    assert.equal(res.body.data.unit, 'km');
  });

  it('falls back to Haversine when OSRM is mocked as down', async () => {
    globalThis.fetch = mock.fn(async () => {
      throw new Error('OSRM unreachable');
    });

    const res = await request(app)
      .get('/api/geolocation/distance')
      .query({ fromLat: 0, fromLng: 0, toLat: 0, toLng: 1 })
      .set('Authorization', authHeader());

    assert.equal(res.status, 200);
    assert.equal(res.body.data.source, 'haversine');
    assert.ok(Math.abs(res.body.data.distance - 111.19) < 0.5);
  });
});

describe('POST /api/farmers coordinate validation', () => {
  it('rejects an out-of-range latitude before hitting the database', async () => {
    const res = await request(app)
      .post('/api/farmers')
      .set('Authorization', authHeader())
      .send({
        name: 'Test Farmer',
        cellNumber: '0712345678',
        nationalId: '12345678',
        season: 'Long',
        weighStation: 'Kericho',
        farmLocation: { lat: 120, lng: 35.2, address: 'Kericho' },
      });

    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errors));
    const messages = res.body.errors.map((e) => e.msg).join(' ');
    assert.match(messages, /Latitude/);
  });
});
