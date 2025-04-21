"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserState: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUserState: () => {},
});

export const useAuthEnhanced = () => useContext(AuthContext);

export function AuthProviderEnhanced({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkServerSession = async () => {
    try {
      const response = await fetch("/api/auth/verify-session");
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error("Error checking server session:", error);
      return false;
    }
  };

  const setServerSession = async (user: FirebaseUser) => {
    try {
      const idToken = await getIdToken(user, true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error creating server session");
      }

      if (data.user) {
        setUser(data.user);
      }

      return true;
    } catch (error) {
      console.error("Error setting server session:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setFirebaseUser(authUser);

      if (authUser) {
        const sessionSuccess = await setServerSession(authUser);

        if (!sessionSuccess) {
          await firebaseSignOut(auth);
          setUser(null);
          setError(
            "No se pudo establecer la sesión. Por favor intente nuevamente."
          );
        }
      } else {
        setUser(null);

        const serverSessionValid = await checkServerSession();

        if (serverSessionValid) {
          await fetch("/api/auth/logout", { method: "POST" });
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error("Login error:", error);

      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        const errorMap: Record<string, string> = {
          "auth/user-not-found":
            "No existe una cuenta con este correo electrónico",
          "auth/wrong-password": "Contraseña incorrecta",
          "auth/invalid-credential": "Credenciales incorrectas",
          "auth/too-many-requests":
            "Demasiados intentos fallidos. Intente más tarde",
        };

        setError(errorMap[errorCode || ""] || error.message);
        toast.error(errorMap[errorCode || ""] || error.message);
      } else {
        setError("Error desconocido al iniciar sesión");
        toast.error("Error desconocido al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    _userData: Partial<User>
  ) => {
    setLoading(true);
    setError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error("Registration error:", error);

      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        const errorMap: Record<string, string> = {
          "auth/email-already-in-use":
            "Este correo electrónico ya está registrado",
          "auth/invalid-email": "Correo electrónico no válido",
          "auth/weak-password": "La contraseña es demasiado débil",
        };

        setError(errorMap[errorCode || ""] || error.message);
        toast.error(errorMap[errorCode || ""] || error.message);
      } else {
        setError("Error desconocido al registrarse");
        toast.error("Error desconocido al registrarse");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      await firebaseSignOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });

      router.push("/login");

      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Signout error:", error);
      setError("Error al cerrar sesión");
      toast.error("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  const updateUserState = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
