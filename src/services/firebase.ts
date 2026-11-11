import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const getFirebaseConfigurationIssue = (): string | null => {
  const required: Array<keyof typeof firebaseConfig> = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
  ];
  const missing = required.filter((key) => !firebaseConfig[key]);
  if (missing.length > 0) return `Missing Firebase web configuration: ${missing.join(', ')}.`;
  if (firebaseConfig.apiKey === 'YOUR_FIREBASE_API_KEY' || firebaseConfig.apiKey.includes('MY_')) {
    return 'Firebase is still using a placeholder API key.';
  }
  return null;
};

export const isFirebaseConfigured = (): boolean => getFirebaseConfigurationIssue() === null;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    const existingApp = getApps().find((candidate) => candidate.name === '[DEFAULT]');
    if (existingApp && (
      existingApp.options.projectId !== firebaseConfig.projectId ||
      existingApp.options.appId !== firebaseConfig.appId ||
      existingApp.options.apiKey !== firebaseConfig.apiKey
    )) {
      throw new Error('The default Firebase app was initialized with a different web configuration.');
    }
    app = existingApp || initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, auth, db, storage };
export default firebaseConfig;
