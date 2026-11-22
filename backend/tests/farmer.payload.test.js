const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildFarmerPayload } = require('../controllers/farmerController');

describe('buildFarmerPayload', () => {
  it('keeps allowed fields and numeric coordinates', () => {
    const { payload, error } = buildFarmerPayload({
      name: 'Jane Farmer',
      cellNumber: '0712345678',
      nationalId: '12345678',
      season: 'Long',
      weighStation: 'Kericho',
      farmLocation: { lat: '-0.367', lng: '35.283', address: 'Kericho, Kenya' },
      extraHackerField: 'nope',
      createdBy: 'should-not-copy',
    });

    assert.equal(error, undefined);
    assert.equal(payload.name, 'Jane Farmer');
    assert.equal(payload.weighStation, 'Kericho');
    assert.equal(payload.farmLocation.lat, -0.367);
    assert.equal(payload.farmLocation.lng, 35.283);
    assert.deepEqual(payload.location, { type: 'Point', coordinates: [35.283, -0.367] });
    assert.equal(payload.extraHackerField, undefined);
    assert.equal(payload.createdBy, undefined);
  });

  it('rejects invalid latitude', () => {
    const { error } = buildFarmerPayload({
      name: 'Jane',
      farmLocation: { lat: 99, lng: 35 },
    });
    assert.match(error, /Latitude/);
  });

  it('rejects a lone longitude', () => {
    const { error } = buildFarmerPayload({
      farmLocation: { lng: 35.2 },
    });
    assert.match(error, /Both latitude and longitude/);
  });
});
