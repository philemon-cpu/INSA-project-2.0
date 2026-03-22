// Import Firebase core
import { initializeApp } from "firebase/app";

//  Auth
import { getAuth } from "firebase/auth";

//  Realtime Database
import { getDatabase } from "firebase/database";

// Your config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize app
const app = initializeApp(firebaseConfig);

//  EXPORT THESE (VERY IMPORTANT)
export const auth = getAuth(app);
export const db = getDatabase(app);