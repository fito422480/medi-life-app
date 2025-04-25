import { enableNetwork, disableNetwork } from "firebase/firestore";
import { db } from "./config";

export const checkFirestoreConnection = async (maxRetries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await enableNetwork(db);
      return true;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) return false;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  return false;
};

export const resetFirestoreConnection = async (): Promise<void> => {
  try {
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
  } catch (error) {
    console.error("Error resetting connection:", error);
    throw error;
  }
};