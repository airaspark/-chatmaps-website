import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { Review } from '../types';
import { INITIAL_REVIEWS } from '../data/initialVendors';
import { vendorService } from './vendorService';

const LOCAL_STORAGE_REVIEWS_KEY = 'chatmaps_reviews_store';

const getLocalReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Local review read error:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

const saveLocalReviews = (reviews: Review[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('chatmaps_reviews_updated', { detail: reviews }));
  } catch (e) {
    console.error('Local review save error:', e);
  }
};

export const reviewService = {
  // Get reviews for a vendor
  getReviewsByVendorId: async (vendorId: string): Promise<Review[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('vendorId', '==', vendorId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const list: Review[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Review);
        });
        if (list.length > 0) return list;
      } catch (error) {
        console.warn('Error fetching reviews from Firestore:', error);
      }
    }

    const reviews = getLocalReviews();
    return reviews
      .filter((r) => r.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Add a review
  addReview: async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const id = 'rev-' + Date.now();
    const newReview: Review = {
      ...reviewData,
      id,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'reviews', id), newReview);
      } catch (error) {
        console.warn('Error saving review to Firestore:', error);
      }
    }

    const reviews = getLocalReviews();
    reviews.push(newReview);
    saveLocalReviews(reviews);

    // Recalculate vendor rating and count
    const vendorReviews = reviews.filter((r) => r.vendorId === reviewData.vendorId);
    const totalScore = vendorReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAvg = Number((totalScore / vendorReviews.length).toFixed(1));

    await vendorService.updateVendorShop(reviewData.vendorId, {
      rating: newAvg,
      reviewCount: vendorReviews.length
    });

    return newReview;
  },

  // Get all reviews for admin moderation
  getAllReviewsForAdmin: async (): Promise<Review[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snapshot = await getDocs(collection(db, 'reviews'));
        const list: Review[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Review);
        });
        if (list.length > 0) return list;
      } catch (error) {
        console.warn('Error getting all reviews:', error);
      }
    }
    return getLocalReviews();
  }
};
