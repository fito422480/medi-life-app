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

// Configuración de emuladores desde variables de entorno
const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "localhost";
const emulatorPorts = {
  auth: parseInt(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9099", 10),
  firestore: parseInt(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080", 10),
};

// Inicialización única de Auth
export const auth = (() => {
  const authInstance = getAuth(firebaseApp);
  if (process.env.NODE_ENV === "development") {
    try {
      connectAuthEmulator(authInstance, `http://${emulatorHost}:${emulatorPorts.auth}`);
      console.log("Auth emulator connected");
    } catch (error) {
      console.warn("Error connecting auth emulator:", error);
    }
  }
  return authInstance;
})();

// Inicialización única de Firestore
export const db = (() => {
  try {
    const firestoreInstance = getFirestore(firebaseApp);
    if (process.env.NODE_ENV === "development") {
      try {
        connectFirestoreEmulator(firestoreInstance, emulatorHost, emulatorPorts.firestore);
        console.log("Firestore emulator connected");
      } catch (error) {
        console.warn("Error connecting firestore emulator:", error);
      }
    }
    return firestoreInstance;
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    throw error;
  }
})();

export const initFirebase = () => {
  // Función vacía solo para forzar la carga del módulo
};
