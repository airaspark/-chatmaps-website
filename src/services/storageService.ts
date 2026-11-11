import { storage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Upload an image file to Firebase Storage (or fallback to base64 Data URL)
   * @param file The File object from input
   * @param path The storage path (e.g., 'shops/vendor-1/banner.jpg', 'food/item-1.jpg')
   */
  uploadImage: async (file: File, path: string): Promise<string> => {
    if (isFirebaseConfigured() && storage) {
      try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (error) {
        console.warn('Firebase Storage upload failed, using Data URL fallback:', error);
      }
    }

    // High fidelity fallback: convert to base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }
};
