// src/lib/debug.ts
import { getAuth } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

export const logAuth = (enabled = process.env.NODE_ENV === "development") => {
  if (!enabled) return;

  // Monitor auth state
  const auth = getAuth();
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Auth: Usuario logueado", {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        providerId: user.providerId,
        providerData: user.providerData,
      });
    } else {
      console.log("👤 Auth: No hay usuario logueado");
    }
  });

  // Original methods
  const originalSignIn = signInWithEmailAndPassword;
  const originalSignOut = firebaseSignOut;

  // Override methods to add logging
  (signInWithEmailAndPassword as any) = (
    auth: any,
    email: string,
    password: string
  ) => {
    console.log("🔑 Auth: Intentando iniciar sesión con email:", email);
    return originalSignIn(auth, email, password);
  };

  (firebaseSignOut as any) = (auth: any) => {
    console.log("🚪 Auth: Cerrando sesión");
    return originalSignOut(auth);
  };

  console.log("🔍 Debug: Auth logging enabled");
};

// Para iniciar el logging, importa esta función en _app.tsx o layout.tsx
// e invócala al inicio
