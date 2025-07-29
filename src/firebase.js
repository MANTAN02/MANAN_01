import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB-111111111111111111111",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "swapin-b4770.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "swapin-b4770",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "swapin-b4770.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "101100000000000000000",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:101100000000000000000:web:101100000000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app; 