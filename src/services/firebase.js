// src/firebase.js
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { isE2EMockEnabled, subscribeE2EAuth } from "./e2eMock";

const REQUIRED_FIREBASE_FIELDS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const productionFirebaseConfig = {
  apiKey: "AIzaSyCdBC2PK-Mj24a-evKdDcujA0A2arySjec",
  authDomain: "lifelog-tracker.firebaseapp.com",
  projectId: "lifelog-tracker",
  storageBucket: "lifelog-tracker.firebasestorage.app",
  messagingSenderId: "268540727297",
  appId: "1:268540727297:web:aea31f933006c0279a7000",
  measurementId: "G-TQF8E426RG",
};

const testFirebaseConfig = {
  apiKey: "AIzaSyAU-HOueBWtQckWyl9sidsPtc6OdFM5XOQ",
  authDomain: "lifelog-test-aa7d6.firebaseapp.com",
  projectId: "lifelog-test-aa7d6",
  storageBucket: "lifelog-test-aa7d6.firebasestorage.app",
  messagingSenderId: "295687554521",
  appId: "1:295687554521:web:ebfde9a575ee048fee85c8",
  measurementId: "",
};

const getFirebaseConfigFromEnv = () => {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  };

  const hasAnyEnvOverride = REQUIRED_FIREBASE_FIELDS.some(
    (field) => Boolean(firebaseConfig[field]),
  );

  if (!hasAnyEnvOverride) {
    return null;
  }

  const missingFields = REQUIRED_FIREBASE_FIELDS.filter(
    (field) => !firebaseConfig[field],
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing Firebase env config fields: ${missingFields.join(", ")}`,
    );
  }

  return firebaseConfig;
};

const appEnv = process.env.REACT_APP_APP_ENV || "prod";
const envFirebaseConfig = getFirebaseConfigFromEnv();

const firebaseConfig =
  envFirebaseConfig ||
  (appEnv === "test" ? testFirebaseConfig : productionFirebaseConfig);

if (typeof window !== "undefined") {
  window.__LIFELOG_APP_ENV__ = appEnv;
}

const shouldLogFirebaseProject =
  typeof window !== "undefined" &&
  process.env.NODE_ENV !== "production";

if (shouldLogFirebaseProject) {
  // Helpful while the repo is transitioning from the old CaptureEz layout.
  // We want it to be obvious which Firebase project the app is using.
  console.info(
    `[firebase] appEnv=${appEnv} projectId=${firebaseConfig.projectId}`,
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

if (isE2EMockEnabled()) {
  auth.onAuthStateChanged = (callback) => subscribeE2EAuth(callback);
}

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const useFirebaseEmulators =
  typeof process !== "undefined" &&
  process.env.REACT_APP_USE_FIREBASE_EMULATORS === "true";

if (
  isLocalhost &&
  useFirebaseEmulators &&
  !window.__captureezFirebaseEmulatorsConnected
) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
  window.__captureezFirebaseEmulatorsConnected = true;
}

export { app };
