import assert from 'node:assert/strict';
import test from 'node:test';
import type { Vendor } from '../types';
import { isCurrentOnlineVendor, isVendorLocationFresh } from './vendorEligibility';

const eligibleVendor = (updates: Partial<Vendor> = {}): Vendor => ({
  id: 'eligibility-fixture',
  ownerUid: 'owner-fixture',
  shopName: 'Eligibility fixture',
  ownerName: 'Owner',
  description: '',
  category: 'Chaat',
  phone: '',
  address: 'Mysuru',
  city: 'Mysuru',
  location: { lat: 12.3, lng: 76.6 },
  isOnline: true,
  availabilityStatus: 'online',
  locationAvailable: true,
  gpsAccuracy: 25,
  lastLocationAt: new Date().toISOString(),
  bannerImage: '',
  photos: [],
  menu: [],
  isOpen: true,
  openingHours: '',
  status: 'approved',
  rating: 0,
  reviewCount: 0,
  createdAt: '',
  updatedAt: '',
  ...updates
});

test('includes approved online vendors with valid coordinates', () => {
  assert.equal(isCurrentOnlineVendor(eligibleVendor()), true);
});

test('excludes offline, unapproved, suspended, and coordinate-less vendors', () => {
  assert.equal(isCurrentOnlineVendor(eligibleVendor({ isOnline: false, availabilityStatus: 'offline' })), false);
  assert.equal(isCurrentOnlineVendor(eligibleVendor({ status: 'pending' })), false);
  assert.equal(isCurrentOnlineVendor(eligibleVendor({ status: 'rejected' })), false);
  assert.equal(isCurrentOnlineVendor(eligibleVendor({ status: 'suspended' })), false);
  assert.equal(isCurrentOnlineVendor(eligibleVendor({ location: undefined })), false);
  assert.equal(isCurrentOnlineVendor(eligibleVendor({ location: { lat: 100, lng: 76.6 } })), false);
});

test('stale GPS does not silently change online eligibility', () => {
  const stale = eligibleVendor({ lastLocationAt: new Date(Date.now() - 10 * 60_000).toISOString() });
  assert.equal(isVendorLocationFresh(stale), false);
  assert.equal(isCurrentOnlineVendor(stale), true);
});
