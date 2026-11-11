import { storage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Upload an image file to Firebase Storage.
   * @param file The File object from input
   * @param path The storage path (e.g., 'shops/vendor-1/banner.jpg', 'food/item-1.jpg')
   */
  uploadImage: async (file: File, path: string): Promise<string> => {
    if (!isFirebaseConfigured() || !storage) throw new Error('Photo uploads are unavailable because Firebase Storage is not configured.');
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }
};
