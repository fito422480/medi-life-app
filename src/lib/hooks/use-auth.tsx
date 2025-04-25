"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { checkFirestoreConnection } from "../firebase/network-check";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      errorMessages[errorCode as keyof ErrorMessages] || errorMessages.default
    );
  }, []);

  type ErrorMessages = {
    "auth/network-request-failed": string;
    "auth/user-not-found": string;
    "auth/wrong-password": string;
    default: string;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          const isOnline = await checkFirestoreConnection();
          if (!isOnline) throw new Error("offline");

          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (!userDoc.exists()) throw new Error("user-not-found");

          setUser({ ...firebaseUser, ...userDoc.data() });
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

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
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
