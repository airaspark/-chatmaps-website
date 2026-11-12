import assert from 'node:assert/strict';
import test from 'node:test';
import { vendorMatchesCity } from './cities';

test('matches city aliases and city-plus-state vendor fields', () => {
  assert.equal(vendorMatchesCity('Mysore, Karnataka', 'Devaraja Market', 'Mysuru'), true);
  assert.equal(vendorMatchesCity('Mysuru Karnataka', '', 'Mysore'), true);
  assert.equal(vendorMatchesCity('Bengaluru, Karnataka', '', 'Bangalore'), true);
});

test('uses the address city when the city field is missing without matching a street name', () => {
  assert.equal(vendorMatchesCity('', 'Devaraja Market, Mysuru, Karnataka 570001', 'Mysuru'), true);
  assert.equal(vendorMatchesCity('Bengaluru', 'Mysore Road', 'Mysuru'), false);
  assert.equal(vendorMatchesCity('Jaipur', '', 'Mysuru'), false);
});
