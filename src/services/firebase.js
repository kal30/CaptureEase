// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // Import Firestore
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