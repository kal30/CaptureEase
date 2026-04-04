// src/firebase.js
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";  // Import Firestore
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";  // Import Firebase Storage


const firebaseConfig = {
  apiKey: "AIzaSyD5FrTMDOREdk288_Y9ledjU73kBPpG1fk",
  authDomain: "captureease-ef82f.firebaseapp.com",
  projectId: "captureease-ef82f",
  storageBucket: "captureease-ef82f.appspot.com",
  messagingSenderId: "527928340509",
  appId: "1:527928340509:web:5b23265f2399f1ab7056f4",
  measurementId: "G-LG6RDFXCDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);  // Export Firestore instance
export const storage = getStorage(app);  // Export Storage instance
export const functions = getFunctions(app, "us-central1");

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const useFirebaseEmulators =
  typeof process !== "undefined" &&
  process.env.REACT_APP_USE_FIREBASE_EMULATORS === "true";

if (isLocalhost && useFirebaseEmulators && !window.__captureezFirebaseEmulatorsConnected) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
  window.__captureezFirebaseEmulatorsConnected = true;
}

// Export the app instance for use with Cloud Functions
export { app };
