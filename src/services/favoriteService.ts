import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { Favorite, Vendor } from '../types';
import { vendorService } from './vendorService';

const LOCAL_STORAGE_FAVORITES_KEY = 'chatmaps_favorites_store';

const getLocalFavorites = (): Favorite[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Local favorites read error:', e);
  }
  return [];
};

const saveLocalFavorites = (favorites: Favorite[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent('chatmaps_favorites_updated', { detail: favorites }));
  } catch (e) {
    console.error('Local favorites save error:', e);
  }
};

export const favoriteService = {
  // Get all favorites for a user (with vendor details populated)
  getUserFavorites: async (userId: string): Promise<Vendor[]> => {
    let vendorIds: string[] = [];

    if (isFirebaseConfigured() && db) {
      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        snapshot.forEach((docSnap) => {
          vendorIds.push(docSnap.data().vendorId);
        });
      } catch (error) {
        console.warn('Error fetching favorites from Firestore:', error);
      }
    }

    if (vendorIds.length === 0) {
      const local = getLocalFavorites().filter(f => f.userId === userId);
      vendorIds = local.map(f => f.vendorId);
    }

    const vendors: Vendor[] = [];
    for (const vid of vendorIds) {
      const v = await vendorService.getVendorById(vid);
      if (v) vendors.push(v);
    }
    return vendors;
  },

  // Check if a vendor is favorited by user
  isVendorFavorited: async (userId: string, vendorId: string): Promise<boolean> => {
    if (!userId) return false;
    const local = getLocalFavorites();
    return local.some(f => f.userId === userId && f.vendorId === vendorId);
  },

  // Toggle favorite
  toggleFavorite: async (userId: string, vendorId: string): Promise<boolean> => {
    if (!userId || !vendorId) return false;

    const favoriteId = `${userId}_${vendorId}`;
    const local = getLocalFavorites();
    const existingIndex = local.findIndex(f => f.userId === userId && f.vendorId === vendorId);
    const isCurrentlyFavorited = existingIndex >= 0;

    if (isCurrentlyFavorited) {
      // Remove
      if (isFirebaseConfigured() && db) {
        try {
          await deleteDoc(doc(db, 'favorites', favoriteId));
        } catch (e) {
          console.warn('Error deleting favorite from Firestore:', e);
        }
      }
      local.splice(existingIndex, 1);
      saveLocalFavorites(local);
      return false;
    } else {
      // Add
      const newFav: Favorite = {
        id: favoriteId,
        userId,
        vendorId,
        createdAt: new Date().toISOString()
      };
      if (isFirebaseConfigured() && db) {
        try {
          await setDoc(doc(db, 'favorites', favoriteId), newFav);
        } catch (e) {
          console.warn('Error adding favorite to Firestore:', e);
        }
      }
      local.push(newFav);
      saveLocalFavorites(local);
      return true;
    }
  }
};
