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

// Tipos de roles para usuarios
export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

// Interfaz extendida de User para incluir propiedades personalizadas
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

// Interfaz para el contexto de autenticación
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

// Valor por defecto para el contexto
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

// Creación del contexto
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Hook personalizado para acceder al contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el perfil completo del usuario
  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      // Obtener perfil básico
      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        // Si no hay perfil, devolver solo la información básica
        return {
          ...firebaseUser,
          role: undefined,
        } as User;
      }

      // Determine which additional profile to fetch based on role
      let additionalProfile = null;
      if (userProfile.role === "DOCTOR") {
        additionalProfile = await getDoctorProfile(firebaseUser.uid);
      } else if (userProfile.role === "PATIENT") {
        additionalProfile = await getPatientProfile(firebaseUser.uid);
      }

      // Combine Firebase user with profiles
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

  // Escucha de cambios en el estado de autenticación
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

    // Limpiar la suscripción
    return () => unsubscribe();
  }, []);

  // Iniciar sesión con correo y contraseña
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
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(
        error.code === "auth/invalid-credential"
          ? "Credenciales inválidas. Verifica tu correo y contraseña."
          : "Error al iniciar sesión. Inténtalo de nuevo."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario
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

      // Crear perfil básico
      const baseUserData = {
        email,
        role,
        displayName: userData.displayName || email.split("@")[0],
        photoURL: userData.photoURL || null,
        ...userData,
      };

      // Guardar perfil de usuario
      await createUserProfile(uid, baseUserData);

      // Crear perfil adicional según el rol
      if (role === "DOCTOR") {
        await createDoctorProfile(uid, userData);
      } else if (role === "PATIENT") {
        await createPatientProfile(uid, userData);
      }

      // Obtener perfil completo
      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(
        error.code === "auth/email-already-in-use"
          ? "Este correo ya está en uso. Intenta con otro o recupera tu contraseña."
          : "Error al crear la cuenta. Inténtalo de nuevo."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      // Verificar si el usuario ya existe
      const existingProfile = await getUserProfile(userCredential.user.uid);

      if (!existingProfile) {
        // Si es nuevo, crear perfil básico
        await createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          role: "PATIENT", // Por defecto, los usuarios de Google son pacientes
        });

        // Crear perfil de paciente
        await createPatientProfile(userCredential.user.uid, {});
      }

      // Obtener perfil completo
      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
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

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        error.code === "auth/user-not-found"
          ? "No se encontró ninguna cuenta con este correo"
          : "Error al enviar el correo de restablecimiento"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valor del contexto
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
