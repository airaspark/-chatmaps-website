import type { Vendor, VendorLocation } from '../types';

const isValidCoordinates = (location?: VendorLocation): location is VendorLocation =>
  !!location && Number.isFinite(location.lat) && Number.isFinite(location.lng) &&
  location.lat >= -90 && location.lat <= 90 && location.lng >= -180 && location.lng <= 180;

/** Canonical client eligibility check shared by every public vendor listing. */
export const isCurrentOnlineVendor = (vendor: Vendor): boolean =>
  vendor.status === 'approved' &&
  vendor.isOnline === true &&
  (vendor.availabilityStatus === undefined || vendor.availabilityStatus === 'online') &&
  vendor.locationAvailable === true &&
  isValidCoordinates(vendor.location) &&
  Number.isFinite(vendor.gpsAccuracy) && (vendor.gpsAccuracy as number) <= 100;

/** GPS freshness describes the last fix; it does not change online availability. */
export const isVendorLocationFresh = (vendor: Vendor, now = Date.now(), maxAgeMs = 120_000): boolean => {
  const updatedAt = Date.parse(vendor.locationUpdatedAt || vendor.lastLocationAt || '');
  return Number.isFinite(updatedAt) && now - updatedAt >= 0 && now - updatedAt <= maxAgeMs;
};
