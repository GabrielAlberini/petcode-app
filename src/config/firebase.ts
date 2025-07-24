import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if all required Firebase config values are present
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.appId;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: Firestore | null = null;

// Only initialize Firebase if configuration is valid
if (isFirebaseConfigValid()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    // Reset to null if initialization fails
    app = null;
    auth = null;
    googleProvider = null;
    db = null;
  }
} else {
  console.warn('Firebase configuration is incomplete. Some environment variables may be missing.');
}

export { auth, googleProvider, db };
export default app;