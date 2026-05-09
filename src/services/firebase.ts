import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence, 
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';

// ─── Firebase Config — injected from .env via app.config.ts ───────────────
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

// ─── Initialize Core SDK ───────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);

// ─── Auth — with AsyncStorage persistence for React Native ──────────────────
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ─── Firestore — with offline persistence (TRD §1.4) ───────────────────────
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ─── Storage ───────────────────────────────────────────────────────────────
export const storage = getStorage(app);

// ─── Auth Listener ─────────────────────────────────────────────────────────
export function initializeAuthListener() {
  return onAuthStateChanged(auth, async (user) => {
    const { setUser, setLoading } = useAuthStore.getState();
    setLoading(true);

    if (user) {
      try {
        const idTokenResult = await getIdTokenResult(user, true);
        const claims = idTokenResult.claims;
        let role = claims.role as any;
        
        // Development Fallback: Assign roles based on email if claims are missing
        if (!role) {
          if (user.email === 'admin@vetconnect.com') role = 'admin';
          else if (user.email === 'vet@vetconnect.com') role = 'vet';
          else if (user.email === 'farmer@vetconnect.com') role = 'farmer';
        }

        setUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          role: role || null,
          specialty: (claims.speciality as string) || undefined,
          isApproved: !!role, 
        });
      } catch (error) {
        console.error('Failed to decode auth token claims', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  });
}
