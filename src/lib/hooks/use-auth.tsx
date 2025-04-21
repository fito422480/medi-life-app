"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import {
  createUserProfile,
  getUserProfile,
  createDoctorProfile,
  getDoctorProfile,
  createPatientProfile,
  getPatientProfile,
} from "@/lib/firebase/db";

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export interface User extends Omit<FirebaseUser, "providerId"> {
  role?: UserRole;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
  phone?: string;
  address?: string;
  bio?: string;
  specialty?: string;
  licenseNumber?: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    userData: Partial<User>
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        return {
          ...firebaseUser,
          role: undefined,
        } as User;
      }

      let additionalProfile = null;
      if (userProfile.role === "DOCTOR") {
        additionalProfile = await getDoctorProfile(firebaseUser.uid);
      } else if (userProfile.role === "PATIENT") {
        additionalProfile = await getPatientProfile(firebaseUser.uid);
      }

      return {
        ...firebaseUser,
        ...userProfile,
        ...additionalProfile,
      } as User;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return firebaseUser as User;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const fullUser = await fetchUserProfile(firebaseUser);
          setUser(fullUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setError("Error al cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        setError(
          errorCode === "auth/invalid-credential"
            ? "Credenciales inválidas. Verifica tu correo y contraseña."
            : "Error al iniciar sesión. Inténtalo de nuevo."
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    userData: Partial<User>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const baseUserData = {
        email,
        role,
        displayName: userData.displayName || email.split("@")[0],
        photoURL: userData.photoURL || null,
        ...userData,
      };

      await createUserProfile(uid, baseUserData);

      if (role === "DOCTOR") {
        await createDoctorProfile(uid, userData);
      } else if (role === "PATIENT") {
        await createPatientProfile(uid, userData);
      }

      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        setError(
          errorCode === "auth/email-already-in-use"
            ? "Este correo ya está en uso. Intenta con otro o recupera tu contraseña."
            : "Error al crear la cuenta. Inténtalo de nuevo."
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      const existingProfile = await getUserProfile(userCredential.user.uid);

      if (!existingProfile) {
        await createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          role: "PATIENT",
        });

        await createPatientProfile(userCredential.user.uid, {});
      }

      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: unknown) {
      console.error("Google sign in error:", error);
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      setError("Error al cerrar sesión");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        setError(
          errorCode === "auth/user-not-found"
            ? "No se encontró ninguna cuenta con este correo"
            : "Error al enviar el correo de restablecimiento"
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
