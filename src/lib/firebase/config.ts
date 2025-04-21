// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Si ya hay apps inicializadas, usa esa. Si no, inicializa una nueva.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configurar el proveedor de Google
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Configurar persistencia
if (typeof window !== "undefined") {
  auth.setPersistence(browserLocalPersistence).catch((error) => {
    console.error("Error setting persistence:", error);
  });

  // Habilitar persistencia offline para Firestore
  enableIndexedDbPersistence(db).catch((error) => {
    if (error.code === "failed-precondition") {
      console.warn(
        "Multiple tabs open, persistence can only be enabled in one tab at a time."
      );
    } else if (error.code === "unimplemented") {
      console.warn("Browser doesn't support IndexedDB.");
    }
  });
}

export type FirebaseServices = {
  auth: Auth;
  db: Firestore;
};
