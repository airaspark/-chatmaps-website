import assert from 'node:assert/strict';
import test from 'node:test';
import { geocoderStatusMessage } from './cityGeocodingService';

test('reports distinct Google geocoder statuses without replacing GPS coordinates', () => {
  const denied = geocoderStatusMessage('REQUEST_DENIED');
  const zeroResults = geocoderStatusMessage('ZERO_RESULTS');
  const quota = geocoderStatusMessage('OVER_QUERY_LIMIT');

  assert.match(denied, /Geocoding API/i);
  assert.match(zeroResults, /no address/i);
  assert.match(quota, /quota/i);
  for (const message of [denied, zeroResults, quota]) {
    assert.match(message, /GPS coordinates are still available/i);
  }
  assert.notEqual(denied, zeroResults);
  assert.notEqual(zeroResults, quota);
});
