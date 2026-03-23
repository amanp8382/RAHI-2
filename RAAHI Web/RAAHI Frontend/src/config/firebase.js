// Firebase v9 modular SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYSKF2wgWaU8h2LEIzYQIU6g9ZsPYe6VM",
  authDomain: "raahi-adf39.firebaseapp.com",
  databaseURL: "https://raahi-adf39-default-rtdb.firebaseio.com",
  projectId: "raahi-adf39",
  storageBucket: "raahi-adf39.appspot.com",
  messagingSenderId: "123412905467",
  appId: "1:123412905467:web:3f8a6c7d5e2b9a1c4d5e6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;