import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { Vendor, VendorApprovalStatus } from '../types';
import { INITIAL_VENDORS } from '../data/initialVendors';

// Reactive local storage fallback for immediate out-of-the-box preview and testing
const LOCAL_STORAGE_KEY = 'chatmaps_vendors_store';

const getLocalVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Local vendor read error:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
  return INITIAL_VENDORS;
};

const saveLocalVendors = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vendors));
    // Dispatch custom event for cross-component reactive sync
    window.dispatchEvent(new CustomEvent('chatmaps_vendors_updated', { detail: vendors }));
  } catch (e) {
    console.error('Local vendor save error:', e);
  }
};

export const vendorService = {
  // Subscribe to all approved vendors for public exploration & live map
  subscribeToApprovedVendors: (callback: (vendors: Vendor[]) => void): (() => void) => {
    if (isFirebaseConfigured() && db) {
      try {
        const q = query(collection(db, 'vendors'), where('status', '==', 'approved'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list: Vendor[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Vendor);
          });
          callback(list);
        }, (error) => {
          console.warn('Firestore vendors subscription error, falling back:', error);
          callback(getLocalVendors().filter(v => v.status === 'approved'));
        });
        return unsubscribe;
      } catch (err) {
        console.warn('Firestore subscription failed, using local store:', err);
      }
    }

    // Local reactive fallback
    const updateHandler = () => {
      callback(getLocalVendors().filter(v => v.status === 'approved'));
    };
    window.addEventListener('chatmaps_vendors_updated', updateHandler);
    // Initial call
    callback(getLocalVendors().filter(v => v.status === 'approved'));

    return () => {
      window.removeEventListener('chatmaps_vendors_updated', updateHandler);
    };
  },

  // Get all vendors (including pending/rejected) for Admin dashboard
  getAllVendorsForAdmin: async (): Promise<Vendor[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snapshot = await getDocs(collection(db, 'vendors'));
        const list: Vendor[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Vendor);
        });
        if (list.length > 0) return list;
      } catch (error) {
        console.warn('Error fetching all vendors from Firestore:', error);
      }
    }
    return getLocalVendors();
  },

  // Get vendor by ID
  getVendorById: async (vendorId: string): Promise<Vendor | null> => {
    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'vendors', vendorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Vendor;
        }
      } catch (error) {
        console.warn('Error getting vendor from Firestore:', error);
      }
    }
    const vendors = getLocalVendors();
    return vendors.find((v) => v.id === vendorId) || null;
  },

  // Get vendor by owner UID (for vendor dashboard)
  getVendorByOwnerUid: async (ownerUid: string): Promise<Vendor | null> => {
    if (isFirebaseConfigured() && db) {
      try {
        const q = query(collection(db, 'vendors'), where('ownerUid', '==', ownerUid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          return { id: docSnap.id, ...docSnap.data() } as Vendor;
        }
      } catch (error) {
        console.warn('Error getting vendor by ownerUid:', error);
      }
    }
    const vendors = getLocalVendors();
    return vendors.find((v) => v.ownerUid === ownerUid) || null;
  },

  // Live Open/Closed toggle (Vendor feature: immediately reflected to customer exploration)
  toggleOpenStatus: async (vendorId: string, isOpen: boolean): Promise<boolean> => {
    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'vendors', vendorId);
        await updateDoc(docRef, {
          isOpen,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Error toggling open status in Firestore:', error);
      }
    }

    // Always update local store so preview instantly updates
    const vendors = getLocalVendors();
    const updated = vendors.map(v => v.id === vendorId ? { ...v, isOpen, updatedAt: new Date().toISOString() } : v);
    saveLocalVendors(updated);
    return true;
  },

  // Vendor Registration / Creation (Starts in 'pending' status)
  registerVendorShop: async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'status'>): Promise<Vendor> => {
    const id = 'vendor-' + Date.now();
    const newVendor: Vendor = {
      ...vendorData,
      id,
      status: 'pending', // Unapproved vendors must not appear publicly until admin approved
      rating: 5.0,
      reviewCount: 0,
      isOpen: true,
      viewsCount: 1,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'vendors', id), newVendor);
      } catch (error) {
        console.warn('Error creating vendor in Firestore:', error);
      }
    }

    const vendors = getLocalVendors();
    vendors.push(newVendor);
    saveLocalVendors(vendors);
    return newVendor;
  },

  // Update vendor profile, photos, menu
  updateVendorShop: async (vendorId: string, updates: Partial<Vendor>): Promise<boolean> => {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'vendors', vendorId);
        await updateDoc(docRef, payload);
      } catch (error) {
        console.warn('Error updating vendor shop in Firestore:', error);
      }
    }

    const vendors = getLocalVendors();
    const nextVendors = vendors.map(v => v.id === vendorId ? { ...v, ...payload } : v);
    saveLocalVendors(nextVendors);
    return true;
  },

  // Admin: Update approval status ('approved' | 'rejected' | 'pending')
  updateVendorApprovalStatus: async (vendorId: string, status: VendorApprovalStatus): Promise<boolean> => {
    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'vendors', vendorId);
        await updateDoc(docRef, {
          status,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Error updating approval status in Firestore:', error);
      }
    }

    const vendors = getLocalVendors();
    const nextVendors = vendors.map(v => v.id === vendorId ? { ...v, status, updatedAt: new Date().toISOString() } : v);
    saveLocalVendors(nextVendors);
    return true;
  }
};
