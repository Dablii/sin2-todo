import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyANzRGxgiLNCAM4YnFImOaVRhrzmNVzDnc",
  authDomain: "to-do-list-7cbe3.firebaseapp.com",
  projectId: "to-do-list-7cbe3",
  storageBucket: "to-do-list-7cbe3.firebasestorage.app",
  messagingSenderId: "960842975742",
  appId: "1:960842975742:web:17ab762e93049c03b3d8af"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
