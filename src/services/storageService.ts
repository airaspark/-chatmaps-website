import { storage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_VENDOR_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export const storageService = {
  /**
   * Upload an image file to Firebase Storage.
   * @param file The File object from input
   * @param path The storage path (e.g., 'shops/vendor-1/banner.jpg', 'food/item-1.jpg')
   */
  uploadImage: async (file: File, path: string): Promise<string> => {
    if (!isFirebaseConfigured() || !storage) throw new Error('Photo uploads are unavailable because Firebase Storage is not configured.');
    if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
      throw new Error('Choose a JPEG, PNG, WebP, GIF, or AVIF image.');
    }
    if (file.size > MAX_VENDOR_IMAGE_SIZE) {
      throw new Error('Images must be 5 MB or smaller.');
    }
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }
};
