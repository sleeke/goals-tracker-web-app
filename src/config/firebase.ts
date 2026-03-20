import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Exported so callers can show a friendly error instead of a blank page
export let firebaseInitError: string | null = null;

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase configuration incomplete. ' +
      'Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables.'
    );
  }

  console.log('Initializing Firebase with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    useEmulator: import.meta.env.VITE_USE_EMULATOR,
  });

  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);

  // Connect to Firebase Local Emulators when VITE_USE_EMULATOR=true
  // This is used in CI so tests run against a local emulator instead of production
  if (import.meta.env.VITE_USE_EMULATOR === 'true') {
    try {
      connectAuthEmulator(authInstance, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(dbInstance, 'localhost', 8080);
      console.log('[Firebase] Connected to local emulators (auth:9099, firestore:8080)');
    } catch (_e) {
      // Already connected (e.g., HMR re-evaluation in dev mode)
      console.log('[Firebase] Emulators already connected');
    }
  }
} catch (e) {
  firebaseInitError = e instanceof Error ? e.message : 'Firebase initialization failed';
  console.error('[Firebase] Initialization error:', firebaseInitError);
  // Provide stub values so imports don't fail; callers must check firebaseInitError
  app = null as unknown as FirebaseApp;
  authInstance = null as unknown as Auth;
  dbInstance = null as unknown as Firestore;
}

export const auth = authInstance!;
export const db = dbInstance!;
export default app;
