import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { Vendor, UserProfile, VendorApprovalStatus } from '../types';
import { INITIAL_VENDORS } from '../data/initialVendors';

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

const LOCAL_VENDORS_KEY = 'chatmaps_vendors_store';
const LOCAL_USERS_KEY = 'chatmaps_mock_users_store';
const LOCAL_ADMINS_KEY = 'chatmaps_authorized_admins_store';

// Helper to get local mock users if running in local preview mode
const getLocalUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultMockUsers: UserProfile[] = [
    {
      uid: 'cust-1',
      email: 'suri@chatmaps.in',
      displayName: 'Suri Gowda',
      role: 'customer',
      phone: '+91 98450 11223',
      city: 'Mysuru',
      dietaryPreference: 'all',
      createdAt: '2026-03-01T10:00:00.000Z'
    },
    {
      uid: 'cust-2',
      email: 'ananya.rao@gmail.com',
      displayName: 'Ananya Rao',
      role: 'customer',
      phone: '+91 99001 22334',
      city: 'Bengaluru',
      dietaryPreference: 'veg',
      createdAt: '2026-03-05T14:30:00.000Z'
    },
    {
      uid: 'cust-3',
      email: 'karthik.bhat@outlook.com',
      displayName: 'Karthik Bhat',
      role: 'customer',
      phone: '+91 98860 33445',
      city: 'Bangalore',
      dietaryPreference: 'jain',
      createdAt: '2026-03-08T09:15:00.000Z'
    },
    {
      uid: 'cust-4',
      email: 'priya.sharma@yahoo.co.in',
      displayName: 'Priya Sharma',
      role: 'customer',
      phone: '+91 97400 44556',
      city: 'Mumbai',
      dietaryPreference: 'all',
      createdAt: '2026-03-12T16:45:00.000Z'
    }
  ];

  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultMockUsers));
  } catch {}
  return defaultMockUsers;
};

const saveLocalUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
};

const getLocalVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(LOCAL_VENDORS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_VENDORS;
};

const saveLocalVendors = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(LOCAL_VENDORS_KEY, JSON.stringify(vendors));
    window.dispatchEvent(new CustomEvent('chatmaps_vendors_updated', { detail: vendors }));
  } catch {}
};

export const adminService = {
  /**
   * Verify if a user UID is an authorized active administrator
   * Checks both `admins/{uid}` and `users/{uid}` collections in Firestore.
   */
  verifyAdminStatus: async (uid: string, email?: string): Promise<{ isAdmin: boolean; reason?: string }> => {
    if (isFirebaseConfigured() && db) {
      try {
        // 1. Check `admins/{uid}`
        const adminDoc = await getDoc(doc(db, 'admins', uid));
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          if (data.status === 'suspended') {
            return { isAdmin: false, reason: 'Administrator account is suspended.' };
          }
          if (data.role === 'admin' || data.status === 'active') {
            return { isAdmin: true };
          }
        }

        // 2. Check `users/{uid}`
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'admin') {
            if (userData.status === 'suspended') {
              return { isAdmin: false, reason: 'Administrator account is suspended.' };
            }
            return { isAdmin: true };
          }
        }
      } catch (err: any) {
        console.warn('Error verifying admin status in Firestore:', err);
      }
    }

    // Local / Offline fallback verification
    if (email && (email.toLowerCase().includes('admin') || email === 'admin@chatmaps.in')) {
      return { isAdmin: true };
    }

    return { isAdmin: false, reason: 'Access Denied: You do not have active administrator privileges on ChatMaps.' };
  },

  /**
   * Fetch all real-time stats for the Admin Overview cards
   */
  getStats: async (): Promise<AdminStats> => {
    let vendors: Vendor[] = [];
    let customersCount = 0;

    if (isFirebaseConfigured() && db) {
      try {
        const vSnap = await getDocs(collection(db, 'vendors'));
        vendors = vSnap.docs.map(d => ({ id: d.id, ...d.data() } as Vendor));

        const uSnap = await getDocs(collection(db, 'users'));
        customersCount = uSnap.docs.filter(d => {
          const data = d.data();
          return data.role === 'customer' || !data.role;
        }).length;
      } catch (err) {
        console.warn('Error getting stats from Firestore, using local store:', err);
        vendors = getLocalVendors();
        customersCount = getLocalUsers().length;
      }
    } else {
      vendors = getLocalVendors();
      customersCount = getLocalUsers().length;
    }

    const pendingApprovals = vendors.filter(v => v.status === 'pending').length;
    const approvedVendors = vendors.filter(v => v.status === 'approved').length;
    const rejectedVendors = vendors.filter(v => v.status === 'rejected').length;
    const suspendedVendors = vendors.filter(v => v.status === 'suspended').length;
    const activeStalls = vendors.filter(v => v.status === 'approved' && v.isOpen).length;
    const closedStalls = vendors.filter(v => v.status === 'approved' && !v.isOpen).length;

    return {
      totalCustomers: customersCount,
      totalVendors: vendors.length,
      pendingApprovals,
      approvedVendors,
      rejectedVendors,
      suspendedVendors,
      activeStalls,
      closedStalls
    };
  },

  /**
   * Get all vendors across all statuses (pending, approved, rejected, suspended)
   */
  getAllVendors: async (): Promise<Vendor[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snapshot = await getDocs(collection(db, 'vendors'));
        const list: Vendor[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Vendor);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('Error fetching all vendors from Firestore:', err);
      }
    }
    return getLocalVendors();
  },

  /**
   * Approve a vendor application
   */
  approveVendor: async (vendorId: string): Promise<boolean> => {
    const updatedAt = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'vendors', vendorId), {
          status: 'approved',
          rejectionReason: deleteField(),
          updatedAt
        });
      } catch (err) {
        console.warn('Firestore vendor approve error:', err);
      }
    }

    const vendors = getLocalVendors();
    const next = vendors.map(v => v.id === vendorId ? { ...v, status: 'approved' as VendorApprovalStatus, rejectionReason: undefined, updatedAt } : v);
    saveLocalVendors(next);
    return true;
  },

  /**
   * Reject a vendor application with a specific reason
   */
  rejectVendor: async (vendorId: string, reason: string): Promise<boolean> => {
    const updatedAt = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'vendors', vendorId), {
          status: 'rejected',
          rejectionReason: reason,
          updatedAt
        });
      } catch (err) {
        console.warn('Firestore vendor reject error:', err);
      }
    }

    const vendors = getLocalVendors();
    const next = vendors.map(v => v.id === vendorId ? { ...v, status: 'rejected' as VendorApprovalStatus, rejectionReason: reason, updatedAt } : v);
    saveLocalVendors(next);
    return true;
  },

  /**
   * Suspend or reactivate a vendor
   */
  toggleVendorSuspension: async (vendorId: string, currentStatus: string): Promise<boolean> => {
    const nextStatus: VendorApprovalStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
    const updatedAt = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'vendors', vendorId), {
          status: nextStatus,
          updatedAt
        });
      } catch (err) {
        console.warn('Firestore vendor suspension toggle error:', err);
      }
    }

    const vendors = getLocalVendors();
    const next = vendors.map(v => v.id === vendorId ? { ...v, status: nextStatus, updatedAt } : v);
    saveLocalVendors(next);
    return true;
  },

  /**
   * Change stall live availability (Open / Closed toggle)
   */
  updateStallAvailability: async (vendorId: string, isOpen: boolean): Promise<boolean> => {
    const updatedAt = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'vendors', vendorId), {
          isOpen,
          updatedAt
        });
      } catch (err) {
        console.warn('Firestore stall availability update error:', err);
      }
    }

    const vendors = getLocalVendors();
    const next = vendors.map(v => v.id === vendorId ? { ...v, isOpen, updatedAt } : v);
    saveLocalVendors(next);
    return true;
  },

  /**
   * Edit stall details (Admin modification)
   */
  editStallDetails: async (vendorId: string, updates: Partial<Vendor>): Promise<boolean> => {
    const updatedAt = new Date().toISOString();
    const payload = {
      ...updates,
      updatedAt
    };

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'vendors', vendorId), payload);
      } catch (err) {
        console.warn('Firestore edit stall details error:', err);
      }
    }

    const vendors = getLocalVendors();
    const next = vendors.map(v => v.id === vendorId ? { ...v, ...payload } : v);
    saveLocalVendors(next);
    return true;
  },

  /**
   * Remove inappropriate or duplicate stall listing
   */
  deleteStall: async (vendorId: string): Promise<boolean> => {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'vendors', vendorId));
      } catch (err) {
        console.warn('Firestore delete stall error:', err);
      }
    }

    const vendors = getLocalVendors();
    const next = vendors.filter(v => v.id !== vendorId);
    saveLocalVendors(next);
    return true;
  },

  /**
   * Get all registered customers
   */
  getAllCustomers: async (): Promise<UserProfile[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserProfile;
          if (data.role === 'customer' || !data.role) {
            list.push({ ...data, uid: data.uid || docSnap.id });
          }
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('Firestore fetch customers error:', err);
      }
    }
    return getLocalUsers();
  },

  /**
   * Suspend or reactivate a customer account
   */
  toggleCustomerSuspension: async (uid: string, currentStatus?: string): Promise<boolean> => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const updatedAt = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          status: nextStatus,
          updatedAt
        });
      } catch (err) {
        console.warn('Firestore customer suspension toggle error:', err);
      }
    }

    const users = getLocalUsers();
    const next = users.map(u => u.uid === uid ? { ...u, status: nextStatus as any, updatedAt } : u);
    saveLocalUsers(next);
    return true;
  },

  /**
   * Delete a customer account (Admin action)
   */
  deleteCustomer: async (uid: string): Promise<boolean> => {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn('Firestore delete customer error:', err);
      }
    }

    const users = getLocalUsers();
    const next = users.filter(u => u.uid !== uid);
    saveLocalUsers(next);
    return true;
  }
};
