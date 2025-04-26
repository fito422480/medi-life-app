"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { checkFirestoreConnection } from "../firebase/network-check";
import { User } from "@/lib/types/user";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type FirebaseError = {
    code: string;
    message: string;
    name: string;
  };

  type CustomError = {
    code: string;
    message: string;
  };

  type ErrorType = FirebaseError | CustomError | Error;

  const handleAuthError = useCallback((error: ErrorType) => {
    const errorMessages = {
      "auth/network-request-failed": "Error de conexión a Internet",
      "auth/user-not-found": "Usuario no encontrado",
      "auth/wrong-password": "Contraseña incorrecta",
      default: "Error de autenticación",
    };
    const errorCode = 'code' in error ? error.code : 'default';
    setError(
      errorMessages[errorCode as keyof typeof errorMessages] || errorMessages.default
    );
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          const isOnline = await checkFirestoreConnection();
          if (!isOnline) throw new Error("offline");

          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (!userDoc.exists()) throw new Error("user-not-found");

          const userData = userDoc.data() as User;
          setUser({ ...userData, uid: firebaseUser.uid });
        } else {
          setUser(null);
        }
      } catch (error) {
        handleAuthError(error as ErrorType);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [handleAuthError]);

  const login = async (email: string, password: string) => {
    try {
      await checkFirestoreConnection();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error as ErrorType);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      handleAuthError(error as ErrorType);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await checkFirestoreConnection();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error as ErrorType);
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      await checkFirestoreConnection();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error as ErrorType);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        signIn, 
        signInWithGoogleRedirect 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
