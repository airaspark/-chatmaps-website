import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { auth, db, getFirebaseConfigurationIssue, isFirebaseConfigured } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string, requiredRole?: UserRole) => Promise<UserProfile>;
  registerWithEmail: (email: string, password: string, displayName: string, role: UserRole, phone?: string) => Promise<UserProfile>;
  loginWithGoogle: (role?: UserRole) => Promise<UserProfile | null>;
  googleAuthError: string | null;
  clearGoogleAuthError: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  switchSimulatedRole?: (role: UserRole) => void; // Development convenience toggle
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'chatmaps_current_user_profile';
const GOOGLE_REDIRECT_ROLE_KEY = 'chatmaps_google_redirect_role';

const formatGoogleAuthError = (error: any): string => {
  switch (error?.code) {
    case 'auth/unauthorized-domain':
      return 'This website domain is not authorized for Firebase Authentication. Add its hostname under Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled for this Firebase project. Enable Google under Firebase Console → Authentication → Sign-in method.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before sign-in finished.';
    case 'auth/popup-blocked':
      return 'The browser blocked the sign-in popup. ChatMaps is switching to a full-page sign-in.';
    case 'auth/network-request-failed':
      return 'Google sign-in could not reach Firebase. Check your connection and try again.';
    case 'auth/invalid-api-key':
      return 'The Firebase web API key is invalid. Check that this site is using the Firebase Web App configuration for the intended project.';
    default:
      return error?.message || `Google sign-in failed${error?.code ? ` (${error.code})` : ''}.`;
  }
};

const getPendingGoogleRole = (): UserRole => {
  try {
    return sessionStorage.getItem(GOOGLE_REDIRECT_ROLE_KEY) === 'vendor' ? 'vendor' : 'customer';
  } catch {
    return 'customer';
  }
};

const consumePendingGoogleRole = () => {
  try { sessionStorage.removeItem(GOOGLE_REDIRECT_ROLE_KEY); } catch { /* storage may be blocked */ }
};

const getOrCreateGoogleProfile = async (
  user: FirebaseUser,
  requestedRole: UserRole,
  firestore: NonNullable<typeof db>
): Promise<UserProfile> => runTransaction(firestore, async (transaction) => {
  const userDocRef = doc(firestore, 'users', user.uid);
  const adminDocRef = doc(firestore, 'admins', user.uid);
  const userDoc = await transaction.get(userDocRef);
  const adminDoc = await transaction.get(adminDocRef);

  if (adminDoc.exists() && adminDoc.data().role === 'admin') {
    if (adminDoc.data().status !== 'active') throw new Error('This administrator account is not active.');
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: adminDoc.data().displayName || user.displayName || 'Administrator',
      photoURL: user.photoURL || '',
      role: 'admin',
      status: 'active',
      createdAt: String(adminDoc.data().createdAt || new Date().toISOString())
    };
  }

  if (userDoc.exists()) {
    const profile = userDoc.data() as UserProfile;
    if (profile.status === 'suspended') {
      throw new Error('This account is suspended. Contact ChatMaps support.');
    }
    if (profile.role !== requestedRole && profile.role !== 'admin') {
      throw new Error(`This Google account is already registered as a ${profile.role}. Use the ${profile.role} sign-in page.`);
    }
    return profile;
  }

  if (requestedRole === 'admin') {
    throw new Error('Administrator accounts cannot be created with Google sign-up.');
  }

  const consentTimestamp = new Date().toISOString();
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Foodie',
    role: requestedRole,
    status: 'active',
    photoURL: user.photoURL || '',
    termsAccepted: true,
    privacyPolicyAccepted: true,
    termsAcceptedAt: consentTimestamp,
    termsVersion: '2025-02-15',
    privacyPolicyVersion: '2025-02-15',
    createdAt: consentTimestamp,
    updatedAt: consentTimestamp
  };
  transaction.set(userDocRef, profile);
  return profile;
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const googleLoginPromiseRef = useRef<Promise<UserProfile | null> | null>(null);

  // Sync profile to local storage for persistence across reloads
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isFirebaseConfigured() && auth && db) {
      const firebaseAuth = auth;
      const firestore = db;
      let isActive = true;
      let redirectUserUid: string | null = null;
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        setCurrentUser(fbUser);
        if (fbUser && firestore) {
          try {
            const adminSnap = await getDoc(doc(firestore, 'admins', fbUser.uid));
            if (!isActive || firebaseAuth.currentUser?.uid !== fbUser.uid) return;
            if (adminSnap.exists() && adminSnap.data().role === 'admin') {
              if (adminSnap.data().status !== 'active') {
                setUserProfile(null);
                await signOut(firebaseAuth);
                return;
              }
              setUserProfile({
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: adminSnap.data().displayName || fbUser.displayName || 'Administrator',
                photoURL: fbUser.photoURL || undefined,
                role: 'admin',
                status: 'active',
                createdAt: String(adminSnap.data().createdAt || new Date().toISOString())
              });
            } else {
              const userDocSnap = await getDoc(doc(firestore, 'users', fbUser.uid));
              if (!isActive || firebaseAuth.currentUser?.uid !== fbUser.uid) return;
              if (!userDocSnap.exists()) {
                setUserProfile(null);
                if (isActive) setLoading(false);
                return;
              }
              const profile = userDocSnap.data() as UserProfile;
              if (profile.status === 'suspended') {
                setUserProfile(null);
                await signOut(firebaseAuth);
                return;
              }
              setUserProfile(profile);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
          }
        } else {
          setUserProfile(null);
        }
        if (isActive) setLoading(false);
      });

      getRedirectResult(firebaseAuth).then(async (result) => {
        if (!result || !isActive) {
          consumePendingGoogleRole();
          return;
        }
        const redirectRole = getPendingGoogleRole();
        redirectUserUid = result.user.uid;
        const profile = await getOrCreateGoogleProfile(result.user, redirectRole, firestore);
        if (!isActive) return;
        setCurrentUser(result.user);
        setUserProfile(profile);
        consumePendingGoogleRole();
        const dashboard = profile.role === 'vendor'
          ? '/vendor/dashboard'
          : profile.role === 'admin'
            ? '/admin/dashboard'
            : '/';
        window.location.replace(dashboard);
      }).catch(async (error) => {
        consumePendingGoogleRole();
        if (redirectUserUid && firebaseAuth.currentUser?.uid === redirectUserUid) {
          try { await signOut(firebaseAuth); } catch { /* retain the original sign-in error */ }
        }
        if (isActive) setGoogleAuthError(formatGoogleAuthError(error));
      });

      return () => {
        isActive = false;
        unsubscribe();
      };
    } else {
      // Local fallback mode initialized
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password: string, requiredRole?: UserRole): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth && db) {
        const cred = await signInWithEmailAndPassword(auth, email, password);

        // Dedicated strict verification for admin access
        if (requiredRole === 'admin') {
          let isAdminValid = false;
          let adminProfile: UserProfile | null = null;

          // 1. Check `admins/{uid}` collection
          const adminDocSnap = await getDoc(doc(db!, 'admins', cred.user.uid));
          if (adminDocSnap.exists()) {
            const aData = adminDocSnap.data();
            if (aData.status === 'suspended') {
              await signOut(auth);
              throw new Error('This administrator account has been suspended.');
            }
            if (aData.role === 'admin' && aData.status === 'active') {
              isAdminValid = true;
              adminProfile = {
                uid: cred.user.uid,
                email: cred.user.email || email,
                displayName: aData.displayName || cred.user.displayName || 'Administrator',
                role: 'admin',
                status: 'active',
                createdAt: aData.createdAt || new Date().toISOString()
              };
            }
          }

          // 2. Also check `users/{uid}` collection for role == 'admin'
          if (!isAdminValid) {
            const userDocSnap = await getDoc(doc(db!, 'users', cred.user.uid));
            if (userDocSnap.exists()) {
              const uData = userDocSnap.data() as UserProfile;
              if (uData.role === 'admin') {
                if (uData.status !== 'active') {
                  await signOut(auth);
                  throw new Error('This administrator account is not active.');
                }
                isAdminValid = true;
                adminProfile = uData;
              }
            }
          }

          if (!isAdminValid || !adminProfile) {
            await signOut(auth);
            throw new Error('Access Denied: You do not have active administrator privileges on ChatMaps.');
          }

          setUserProfile(adminProfile);
          return adminProfile;
        }

        // Standard user / vendor login
        const userDocSnap = await getDoc(doc(db!, 'users', cred.user.uid));
        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          if (profile.status === 'suspended') {
            await signOut(auth);
            throw new Error('This account is currently suspended. Please contact ChatMaps support.');
          }
          if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
            await signOut(auth);
            throw new Error(`This account is registered as a ${profile.role}. Please log in via the ${profile.role} portal.`);
          }
          setUserProfile(profile);
          return profile;
        }
      }

      // Administrator access must always be backed by Firebase Auth and a verified Firestore role.
      if (requiredRole === 'admin') {
        throw new Error('Administrator login requires a configured Firebase project. Demo or offline accounts cannot access the admin portal.');
      }

      // Local / Offline Simulated Auth

      const demoRole: UserRole = requiredRole || (email.includes('vendor') ? 'vendor' : 'customer');
      const profile: UserProfile = {
        uid: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
        role: demoRole,
        status: 'active',
        phone: '+91 98765 43210',
        city: 'Bangalore',
        dietaryPreference: 'all',
        createdAt: new Date().toISOString()
      };
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    phone?: string
  ): Promise<UserProfile> => {
    // CRITICAL: Prevent public self-assignment of admin role
    if (role === 'admin') {
      throw new Error('Administrator privileges cannot be obtained through public registration.');
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth && db) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const consentTimestamp = new Date().toISOString();
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email,
          displayName,
          role,
          status: 'active',
          ...(phone ? { phone } : {}),
          termsAccepted: true,
          privacyPolicyAccepted: true,
          termsAcceptedAt: consentTimestamp,
          termsVersion: '2025-02-15',
          privacyPolicyVersion: '2025-02-15',
          createdAt: consentTimestamp
        };
        await setDoc(doc(db!, 'users', cred.user.uid), newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }

      // Local registration
      const consentTimestamp = new Date().toISOString();
      const localProfile: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        displayName,
        role,
        status: 'active',
        ...(phone ? { phone } : {}),
        city: 'Bangalore',
        dietaryPreference: 'all',
        termsAccepted: true,
        privacyPolicyAccepted: true,
        termsAcceptedAt: consentTimestamp,
        termsVersion: '2025-02-15',
        privacyPolicyVersion: '2025-02-15',
        createdAt: consentTimestamp
      };
      setUserProfile(localProfile);
      return localProfile;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = (role: UserRole = 'customer'): Promise<UserProfile | null> => {
    if (googleLoginPromiseRef.current) return googleLoginPromiseRef.current;

    const loginPromise = (async (): Promise<UserProfile | null> => {
      setLoading(true);
      setGoogleAuthError(null);
      let signedInGoogleUid: string | null = null;
      try {
        if (!isFirebaseConfigured() || !auth || !db) {
          throw new Error(getFirebaseConfigurationIssue() || 'Google sign-in is unavailable because Firebase failed to initialize.');
        }
        const firebaseAuth = auth;
        const firestore = db;

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const beginRedirectSignIn = async () => {
          try {
            sessionStorage.setItem(GOOGLE_REDIRECT_ROLE_KEY, role);
          } catch {
            throw new Error('This browser blocks session storage needed to resume Google sign-in. Allow site storage in Safari settings and try again.');
          }
          await signInWithRedirect(firebaseAuth, provider);
        };

        // Firebase recommends redirect authentication on mobile browsers.
        if (isMobileBrowser) {
          await beginRedirectSignIn();
          return null;
        }

        let credential;
        try {
          credential = await signInWithPopup(firebaseAuth, provider);
          signedInGoogleUid = credential.user.uid;
        } catch (error: any) {
          const redirectFallbackCodes = new Set([
            'auth/popup-blocked',
            'auth/operation-not-supported-in-this-environment',
            'auth/web-storage-unsupported'
          ]);
          if (!redirectFallbackCodes.has(error?.code)) throw error;

          await beginRedirectSignIn();
          return null;
        }

        const profile = await getOrCreateGoogleProfile(credential.user, role, firestore);
        setCurrentUser(credential.user);
        setUserProfile(profile);
        return profile;
      } catch (error: any) {
        if (signedInGoogleUid && auth?.currentUser?.uid === signedInGoogleUid) {
          try { await signOut(auth); } catch { /* preserve the profile/auth error */ }
        }
        const message = error?.code ? formatGoogleAuthError(error) : error?.message || 'Google sign-in failed.';
        setGoogleAuthError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    })().finally(() => {
      googleLoginPromiseRef.current = null;
    });

    googleLoginPromiseRef.current = loginPromise;
    return loginPromise;
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth) {
        await signOut(auth);
      }
      setCurrentUser(null);
      setUserProfile(null);
      localStorage.removeItem(LOCAL_USER_KEY);
    } finally {
      setLoading(false);
    }
  };

  const clearGoogleAuthError = () => setGoogleAuthError(null);

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured() && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Simulated response
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db && currentUser) {
      try {
        await updateDoc(doc(db!, 'users', currentUser.uid), updated);
      } catch (err) {
        console.warn('Error updating profile in Firestore:', err);
      }
    }

    setUserProfile(updated);
  };

  const deleteAccount = async () => {
    setLoading(true);
    try {
      const uid = userProfile?.uid;
      if (isFirebaseConfigured() && db && uid) {
        try {
          await deleteDoc(doc(db!, 'users', uid));
        } catch (e) {
          console.warn('Error deleting user doc:', e);
        }
      }

      if (isFirebaseConfigured() && currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (e) {
          console.warn('Error deleting firebase user:', e);
        }
      }

      setCurrentUser(null);
      setUserProfile(null);
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem('chatmaps_favorites_store');
    } finally {
      setLoading(false);
    }
  };

  const switchSimulatedRole = (role: UserRole) => {
    if (!userProfile) {
      setUserProfile({
        uid: 'user-' + role,
        email: `${role}@chatmaps.in`,
        displayName: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        role,
        phone: '+91 98765 43210',
        city: 'Bangalore',
        createdAt: new Date().toISOString()
      });
    } else {
      setUserProfile({ ...userProfile, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: userProfile?.role || null,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        googleAuthError,
        clearGoogleAuthError,
        logout,
        resetPassword,
        updateProfileData,
        deleteAccount,
        switchSimulatedRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
