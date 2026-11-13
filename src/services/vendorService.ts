import { db, isFirebaseConfigured } from './firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import { Vendor, VendorApprovalStatus, VendorLocation } from '../types';
import { isCurrentOnlineVendor, isVendorLocationFresh } from './vendorEligibility';
export { isCurrentOnlineVendor, isVendorLocationFresh } from './vendorEligibility';

const requireDb = () => {
  if (!isFirebaseConfigured() || !db) throw new Error('Vendor records are unavailable because Firebase is not configured.');
  return db;
};

const mapVendor = (id: string, data: Record<string, any>): Vendor => ({ ...data, id } as Vendor);
const isValidCoordinates = (location?: VendorLocation): location is VendorLocation =>
  !!location && Number.isFinite(location.lat) && Number.isFinite(location.lng) &&
  location.lat >= -90 && location.lat <= 90 && location.lng >= -180 && location.lng <= 180;

export const vendorService = {
  subscribeToApprovedVendors: (callback: (vendors: Vendor[]) => void, onError?: (error: Error) => void): Unsubscribe => {
    let firestore;
    try {
      firestore = requireDb();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Firebase is unavailable.'));
      return () => undefined;
    }
    let approved: Vendor[] = [];
    const publish = () => callback(approved
      .filter(isCurrentOnlineVendor)
      .map(vendor => ({ ...vendor, locationFreshness: isVendorLocationFresh(vendor) ? 'fresh' : 'stale' })));
    const unsubscribeSnapshot = onSnapshot(query(
      collection(firestore, 'vendors'),
      where('status', '==', 'approved'),
      where('isOnline', '==', true),
      where('locationAvailable', '==', true)
    ), snapshot => {
      approved = snapshot.docs.map(item => mapVendor(item.id, item.data()));
      publish();
    }, error => {
      console.error('Public vendor subscription failed:', error);
      onError?.(error);
    });
    return () => {
      unsubscribeSnapshot();
    };
  },

  getAllVendorsForAdmin: async (): Promise<Vendor[]> => {
    const snapshot = await getDocs(collection(requireDb(), 'vendors'));
    return snapshot.docs.map(item => mapVendor(item.id, item.data()));
  },

  getVendorById: async (vendorId: string): Promise<Vendor | null> => {
    if (import.meta.env.DEV) {
      const snapshot = await getDoc(doc(requireDb(), 'vendors', vendorId));
      if (!snapshot.exists()) return null;
      const vendor = mapVendor(snapshot.id, snapshot.data());
      return vendor.status === 'approved' ? vendor : null;
    }

    const response = await fetch(`/api/public-vendor/${encodeURIComponent(vendorId)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Unable to load this public vendor page. Please try again later.');
    return await response.json() as Vendor;
  },

  getVendorByOwnerUid: async (ownerUid: string): Promise<Vendor | null> => {
    const snapshot = await getDocs(query(collection(requireDb(), 'vendors'), where('ownerUid', '==', ownerUid)));
    return snapshot.empty ? null : mapVendor(snapshot.docs[0].id, snapshot.docs[0].data());
  },

  registerVendorShop: async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'status'>): Promise<Vendor> => {
    const firestore = requireDb();
    const existing = await getDocs(query(collection(firestore, 'vendors'), where('ownerUid', '==', vendorData.ownerUid)));
    if (!existing.empty) return mapVendor(existing.docs[0].id, existing.docs[0].data());

    const now = new Date().toISOString();
    const record = {
      ...vendorData,
      status: 'pending' as VendorApprovalStatus,
      isOnline: false,
      availabilityStatus: 'offline' as const,
      locationAvailable: false,
      isOpen: false,
      rating: 0,
      reviewCount: 0,
      viewsCount: 0,
      favoritesCount: 0,
      createdAt: now,
      updatedAt: now
    };
    const created = await addDoc(collection(firestore, 'vendors'), record);
    return { ...record, id: created.id };
  },

  updateVendorShop: async (vendorId: string, updates: Partial<Vendor>): Promise<void> => {
    const { id: _id, ownerUid: _ownerUid, status: _status, isOnline: _isOnline,
      locationAvailable: _locationAvailable, location: _location, gpsAccuracy: _accuracy,
      availabilityStatus: _availabilityStatus, locationUpdatedAt: _locationUpdatedAt,
      lastLocationAt: _lastLocationAt, ...permittedUpdates } = updates;
    await updateDoc(doc(requireDb(), 'vendors', vendorId), {
      ...permittedUpdates,
      updatedAt: new Date().toISOString()
    });
  },

  toggleOpenStatus: async (vendorId: string, isOpen: boolean): Promise<void> => {
    await updateDoc(doc(requireDb(), 'vendors', vendorId), {
      isOpen,
      updatedAt: new Date().toISOString()
    });
  },

  setVendorOnlineLocation: async (vendorId: string, ownerUid: string, location: VendorLocation, accuracy: number): Promise<void> => {
    if (!isValidCoordinates(location) || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
      throw new Error('A valid device location with accuracy of 100 metres or better is required to go online.');
    }
    const vendorRef = doc(requireDb(), 'vendors', vendorId);
    const snapshot = await getDoc(vendorRef);
    if (!snapshot.exists()) throw new Error('Vendor application was not found.');
    const vendor = snapshot.data();
    if (vendor.ownerUid !== ownerUid) throw new Error('This vendor record does not belong to the signed-in account.');
    if (vendor.status !== 'approved') throw new Error('Only approved vendors can go online.');

    const now = new Date().toISOString();
    await updateDoc(vendorRef, {
      location: { lat: location.lat, lng: location.lng },
      gpsAccuracy: Math.round(accuracy),
      locationAvailable: true,
      isOnline: true,
      availabilityStatus: 'online',
      lastLocationAt: now,
      locationUpdatedAt: now,
      lastSeenAt: now,
      updatedAt: now
    });
  },

  setVendorOffline: async (vendorId: string, ownerUid: string): Promise<void> => {
    const vendorRef = doc(requireDb(), 'vendors', vendorId);
    const snapshot = await getDoc(vendorRef);
    if (!snapshot.exists()) throw new Error('Vendor application was not found.');
    if (snapshot.data().ownerUid !== ownerUid) throw new Error('This vendor record does not belong to the signed-in account.');
    const now = new Date().toISOString();
    await updateDoc(vendorRef, {
      isOnline: false,
      availabilityStatus: 'offline',
      locationAvailable: false,
      lastSeenAt: now,
      updatedAt: now
    });
  }
};
