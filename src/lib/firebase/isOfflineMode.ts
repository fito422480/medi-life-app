// src/lib/firebase/isOfflineMode.ts
import { enableNetwork } from "firebase/firestore";
import { db } from "./config";

/**
 * Detecta si Firestore está en modo offline (por ejemplo: sin red, modo persistencia sin conexión, etc).
 * Intenta activar la red; si falla, se asume modo offline.
 */
export async function isOfflineMode(): Promise<boolean> {
  try {
    await enableNetwork(db);
    return false;
  } catch (error) {
    console.warn("Firestore parece estar en modo offline:", error);
    return true;
  }
}
