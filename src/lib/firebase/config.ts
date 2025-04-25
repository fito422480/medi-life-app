import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern para la app de Firebase
const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización única de Firestore
export const db = (() => {
  try {
    return getFirestore(firebaseApp);
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    throw error;
  }
})();

// Inicialización única de Auth
export const auth = (() => {
  const authInstance = getAuth(firebaseApp);
  if (process.env.NODE_ENV === "development") {
    connectAuthEmulator(authInstance, "http://localhost:9099");
  }
  return authInstance;
})();

// Configuración de emuladores solo en desarrollo
if (process.env.NODE_ENV === "development") {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Firestore emulator connected");
  } catch (error) {
    console.log("Firestore emulator already connected");
  }
}

export const initFirebase = () => {
  // Función vacía solo para forzar la carga del módulo
};
