import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-111111111111111111111",
  authDomain: "swapin-b4770.firebaseapp.com",
  projectId: "swapin-b4770",
  storageBucket: "swapin-b4770.appspot.com",
  messagingSenderId: "101100000000000000000",
  appId: "1:101100000000000000000:web:101100000000000000000"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 