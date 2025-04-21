// src/lib/firebase/network-check.ts
import {
  enableNetwork,
  disableNetwork,
  getFirestore,
} from "firebase/firestore";
import { db } from "./config";

// Verificar conexión de Firestore
export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    await enableNetwork(db);
    console.log("Firestore network enabled");
    return true;
  } catch (error) {
    console.error("Error enabling Firestore network:", error);
    return false;
  }
}

// Reiniciar conexión de Firestore
export async function resetFirestoreConnection(): Promise<boolean> {
  try {
    await disableNetwork(db);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await enableNetwork(db);
    console.log("Firestore connection reset");
    return true;
  } catch (error) {
    console.error("Error resetting Firestore connection:", error);
    return false;
  }
}
