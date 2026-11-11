import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  arrayUnion,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import { Vendor, UserProfile, VendorApprovalStatus } from '../types';
import { auth } from './firebase';

const requireDb = () => {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Admin data is unavailable because Firebase is not configured. No local demo records are shown.');
  }
  return db;
};

const mapVendor = (id: string, data: Record<string, any>): Vendor => ({ ...data, id } as Vendor);
const mapUser = (id: string, data: Record<string, any>): UserProfile => ({ ...data, uid: data.uid || id } as UserProfile);

export const LIVE_LOCATION_MAX_ACCURACY_METERS = 100;

export const isVendorLocationCurrent = (vendor: Vendor): boolean => {
  return vendor.status === 'approved' && vendor.isOnline === true &&
    (vendor.availabilityStatus === undefined || vendor.availabilityStatus === 'online') &&
    vendor.locationAvailable === true &&
    Number.isFinite(vendor.location?.lat) && vendor.location!.lat >= -90 && vendor.location!.lat <= 90 &&
    Number.isFinite(vendor.location?.lng) && vendor.location!.lng >= -180 && vendor.location!.lng <= 180 &&
    Number.isFinite(vendor.gpsAccuracy) &&
    (vendor.gpsAccuracy as number) <= LIVE_LOCATION_MAX_ACCURACY_METERS;
};

export interface AdminStats {
  totalCustomers: number;
  totalVendors: number;
  pendingApprovals: number;
  approvedVendors: number;
  rejectedVendors: number;
  suspendedVendors: number;
  activeStalls: number;
  closedStalls: number;
}

export interface CustomerActivity {
  reviewCount: number;
  recentReviews: Array<{ id: string; vendorId?: string; rating?: number; comment?: string; createdAt?: string }>;
}

export const adminService = {
  verifyAdminStatus: async (uid: string): Promise<{ isAdmin: boolean; reason?: string }> => {
    const firestore = requireDb();
    try {
      const adminDoc = await getDoc(doc(firestore, 'admins', uid));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        if (data.status === 'suspended') return { isAdmin: false, reason: 'Administrator account is suspended.' };
        if (data.role === 'admin' && data.status === 'active') return { isAdmin: true };
      }

      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === 'admin' && data.status === 'active') return { isAdmin: true };
      }
    } catch (error) {
      console.error('Unable to verify administrator status from Firestore:', error);
      return { isAdmin: false, reason: 'Administrator access could not be verified. Check Firestore access and try again.' };
    }
    return { isAdmin: false, reason: 'Access denied: no active administrator record was found.' };
  },

  getAllVendors: async (): Promise<Vendor[]> => {
    const snapshot = await getDocs(collection(requireDb(), 'vendors'));
    return snapshot.docs.map(item => mapVendor(item.id, item.data()));
  },

  getAllCustomers: async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(query(collection(requireDb(), 'users'), where('role', '==', 'customer')));
    return snapshot.docs.map(item => mapUser(item.id, item.data()));
  },

  getVendorOwnerProfiles: async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(query(collection(requireDb(), 'users'), where('role', '==', 'vendor')));
    return snapshot.docs.map(item => mapUser(item.id, item.data()));
  },

  subscribeToData: (onData: (vendors: Vendor[], customers: UserProfile[], vendorOwners: UserProfile[]) => void, onError: (error: Error) => void): Unsubscribe => {
    const firestore = requireDb();
    let vendors: Vendor[] | null = null;
    let users: UserProfile[] | null = null;
    const emit = () => {
      if (vendors && users) onData(vendors, users.filter(user => user.role === 'customer'), users.filter(user => user.role === 'vendor'));
    };
    const unsubscribeVendors = onSnapshot(collection(firestore, 'vendors'), snapshot => {
      vendors = snapshot.docs.map(item => mapVendor(item.id, item.data()));
      emit();
    }, error => onError(error));
    const unsubscribeCustomers = onSnapshot(collection(firestore, 'users'), snapshot => {
      users = snapshot.docs.map(item => mapUser(item.id, item.data()));
      emit();
    }, error => onError(error));
    return () => {
      unsubscribeVendors();
      unsubscribeCustomers();
    };
  },

  getStats: (vendors: Vendor[], customers: UserProfile[]): AdminStats => {
    const approved = vendors.filter(v => v.status === 'approved');
    const online = approved.filter(v => isVendorLocationCurrent(v));
    return {
      totalCustomers: customers.length,
      totalVendors: vendors.length,
      pendingApprovals: vendors.filter(v => v.status === 'pending').length,
      approvedVendors: approved.length,
      rejectedVendors: vendors.filter(v => v.status === 'rejected').length,
      suspendedVendors: vendors.filter(v => v.status === 'suspended').length,
      activeStalls: online.length,
      closedStalls: Math.max(0, approved.length - online.length)
    };
  },

  approveVendor: async (vendorId: string): Promise<void> => {
    const vendorRef = doc(requireDb(), 'vendors', vendorId);
    const current = await getDoc(vendorRef);
    if (!current.exists()) throw new Error('Vendor application was not found.');
    if (current.data().status !== 'pending') throw new Error('Only pending applications can be approved. Refresh the list and try again.');
    const at = new Date().toISOString();
    await updateDoc(vendorRef, {
      status: 'approved',
      statusHistory: arrayUnion({ from: 'pending', to: 'approved', at, actorUid: auth?.currentUser?.uid || '' }),
      rejectionReason: deleteField(),
      updatedAt: new Date().toISOString()
    });
  },

  rejectVendor: async (vendorId: string, reason: string): Promise<void> => {
    if (!reason.trim()) throw new Error('A rejection reason is required.');
    const vendorRef = doc(requireDb(), 'vendors', vendorId);
    const current = await getDoc(vendorRef);
    if (!current.exists()) throw new Error('Vendor application was not found.');
    if (current.data().status !== 'pending') throw new Error('Only pending applications can be rejected. Refresh the list and try again.');
    const at = new Date().toISOString();
    await updateDoc(vendorRef, {
      status: 'rejected',
      statusHistory: arrayUnion({ from: 'pending', to: 'rejected', at, actorUid: auth?.currentUser?.uid || '' }),
      rejectionReason: reason.trim(),
      updatedAt: new Date().toISOString()
    });
  },

  setVendorStatus: async (vendorId: string, status: VendorApprovalStatus): Promise<void> => {
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) throw new Error('Invalid vendor status.');
    const vendorRef = doc(requireDb(), 'vendors', vendorId);
    const current = await getDoc(vendorRef);
    if (!current.exists()) throw new Error('Vendor record was not found.');
    const previousStatus = String(current.data().status || 'unknown');
    const at = new Date().toISOString();
    await updateDoc(vendorRef, {
      status,
      statusHistory: arrayUnion({ from: previousStatus, to: status, at, actorUid: auth?.currentUser?.uid || '' }),
      updatedAt: new Date().toISOString()
    });
  },

  toggleVendorSuspension: async (vendorId: string, currentStatus: string): Promise<void> => {
    const vendorSnap = await getDoc(doc(requireDb(), 'vendors', vendorId));
    if (!vendorSnap.exists()) throw new Error('Vendor record no longer exists.');
    const vendor = vendorSnap.data();
    if (currentStatus === 'suspended') {
      if (vendor.status !== 'suspended') throw new Error('Vendor status changed. Refresh the list and retry.');
      const previousStatus = ['pending', 'approved', 'rejected'].includes(vendor.preSuspensionStatus)
        ? vendor.preSuspensionStatus as VendorApprovalStatus
        : 'approved';
      await adminService.setVendorStatus(vendorId, previousStatus);
    } else {
      const at = new Date().toISOString();
      await updateDoc(doc(requireDb(), 'vendors', vendorId), {
        status: 'suspended',
        statusHistory: arrayUnion({ from: String(vendor.status), to: 'suspended', at, actorUid: auth?.currentUser?.uid || '' }),
        preSuspensionStatus: vendor.status,
        updatedAt: new Date().toISOString()
      });
    }
  },

  editStallDetails: async (vendorId: string, updates: Partial<Pick<Vendor, 'shopName' | 'ownerName' | 'phone' | 'category' | 'address' | 'city' | 'description' | 'priceRange' | 'openingHours'>>): Promise<void> => {
    const payload = Object.fromEntries(Object.entries(updates).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
    if (Object.values(payload).some(value => !value)) throw new Error('Complete all required vendor details before saving.');
    await updateDoc(doc(requireDb(), 'vendors', vendorId), { ...payload, updatedAt: new Date().toISOString() });
  },

  updateStallAvailability: async (vendorId: string, isOpen: boolean): Promise<void> => {
    await updateDoc(doc(requireDb(), 'vendors', vendorId), { isOpen, updatedAt: new Date().toISOString() });
  },

  updateCustomerStatus: async (uid: string, status: 'active' | 'suspended'): Promise<void> => {
    const userRef = doc(requireDb(), 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== 'customer') throw new Error('Customer record no longer exists.');
    await updateDoc(userRef, { status, updatedAt: new Date().toISOString() });
  },

  updateCustomerProfile: async (uid: string, updates: Pick<UserProfile, 'displayName' | 'phone' | 'city'>): Promise<void> => {
    const displayName = updates.displayName.trim();
    if (!displayName) throw new Error('Customer name is required.');
    const userRef = doc(requireDb(), 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().role !== 'customer') throw new Error('Customer record no longer exists.');
    await updateDoc(userRef, {
      displayName,
      phone: updates.phone?.trim() || deleteField(),
      city: updates.city?.trim() || deleteField(),
      updatedAt: new Date().toISOString()
    });
  },

  getCustomerActivity: async (uid: string): Promise<CustomerActivity> => {
    const snapshot = await getDocs(query(collection(requireDb(), 'reviews'), where('userId', '==', uid)));
    const reviews = snapshot.docs.map(item => ({
      id: item.id,
      vendorId: item.data().vendorId as string | undefined,
      rating: item.data().rating as number | undefined,
      comment: item.data().comment as string | undefined,
      createdAt: item.data().createdAt as string | undefined
    }))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return { reviewCount: reviews.length, recentReviews: reviews.slice(0, 5) };
  }
};
