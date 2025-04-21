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
  signInWithRedirect,
  getRedirectResult,
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
import {
  checkFirestoreConnection,
  resetFirestoreConnection,
} from "@/lib/firebase/network-check";

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
  signInWithGoogleRedirect: () => Promise<void>;
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
  signInWithGoogleRedirect: async () => {},
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
      // Verificar conexión antes de intentar obtener el perfil
      const isConnected = await checkFirestoreConnection();
      if (!isConnected) {
        console.log("Firestore offline, retrying...");
        await resetFirestoreConnection();
      }

      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        // Si no existe el perfil, usar datos básicos del usuario de Firebase
        return {
          ...firebaseUser,
          role: "PATIENT" as UserRole, // Rol por defecto
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
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
    } catch (error: any) {
      console.error("Error fetching user profile:", error);

      // Si el error es de conexión, intentar usar datos offline
      if (error?.message?.includes("client is offline")) {
        return {
          ...firebaseUser,
          role: "PATIENT" as UserRole, // Rol por defecto
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        } as User;
      }

      return firebaseUser as User;
    }
  };

  useEffect(() => {
    // Comprobar si hay un resultado de redirección pendiente
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setLoading(true);

          // Verificar si el usuario ya existe en Firestore
          const userProfile = await getUserProfile(result.user.uid);

          if (!userProfile) {
            // Si no existe, crear un perfil nuevo
            await createUserProfile(result.user.uid, {
              email: result.user.email ?? "",
              displayName: result.user.displayName ?? "",
              photoURL: result.user.photoURL ?? "",
              role: "PATIENT",
            });

            await createPatientProfile(result.user.uid, {});
          }

          const fullUser = await fetchUserProfile(result.user);
          setUser(fullUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting redirect result:", error);
        setError(
          "Error al procesar el inicio de sesión. Por favor, intenta de nuevo."
        );
        setLoading(false);
      }
    };

    checkRedirectResult();

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
      // Asegurarse de que los valores sean strings válidos
      const cleanEmail = email.trim();
      const cleanPassword = password;

      if (!cleanEmail || !cleanPassword) {
        throw new Error("Email y contraseña son requeridos");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: any) {
      console.error("Sign in error:", error);

      // Manejo más específico de errores
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Correo o contraseña incorrectos.");
          break;
        case "auth/invalid-email":
          setError("El formato del correo electrónico no es válido.");
          break;
        case "auth/too-many-requests":
          setError(
            "Demasiados intentos fallidos. Por favor, intenta más tarde."
          );
          break;
        default:
          setError(
            "Error al iniciar sesión. Por favor, verifica tus credenciales."
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
        ...userData,
        email,
        role,
        displayName: userData.displayName || email.split("@")[0],
        photoURL: userData.photoURL || null,
      };

      await createUserProfile(uid, {
        ...baseUserData,
        email: baseUserData.email || undefined,
        displayName: baseUserData.displayName || undefined,
        photoURL: baseUserData.photoURL || undefined,
      });

      if (role === "DOCTOR") {
        const {
          email,
          displayName,
          photoURL,
          role: ignoredRole,
          ...doctorData
        } = userData;

        const sanitizedDoctorData = Object.fromEntries(
          Object.entries(doctorData).map(([key, val]) => [
            key,
            val !== null ? val : undefined,
          ])
        );

        await createDoctorProfile(uid, sanitizedDoctorData);
      } else if (role === "PATIENT") {
        const { email, ...patientData } = userData;

        const sanitizedPatientData = Object.fromEntries(
          Object.entries(patientData).map(([key, val]) => [
            key,
            val !== null ? val : undefined,
          ])
        );

        await createPatientProfile(uid, {
          ...sanitizedPatientData,
          email: email || "",
        });
      }

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

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      // Esperar un momento para asegurar que Firebase se sincronice
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let existingProfile = null;
      let retries = 3;

      while (retries > 0 && !existingProfile) {
        try {
          existingProfile = await getUserProfile(userCredential.user.uid);
          break;
        } catch (error: any) {
          console.error(`Retry ${4 - retries} failed:`, error);

          // Si el error es porque el cliente está offline, esperar más tiempo
          if (error?.message?.includes("client is offline")) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          retries--;
        }
      }

      if (!existingProfile) {
        // Crear perfil de usuario si no existe
        try {
          await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email ?? "",
            displayName: userCredential.user.displayName ?? "",
            photoURL: userCredential.user.photoURL ?? "",
            role: "PATIENT",
          });

          await createPatientProfile(userCredential.user.uid, {});

          // Esperar a que se guarde el perfil
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
          console.error("Error creating user profile:", err);
        }
      }

      // Obtener el perfil completo del usuario
      const fullUser = await fetchUserProfile(userCredential.user);
      setUser(fullUser);
    } catch (error: any) {
      console.error("Google sign in error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setError(
          "La ventana de inicio de sesión fue cerrada. Intenta de nuevo."
        );
      } else if (error.code === "auth/cancelled-popup-request") {
        setError(
          "Hubo un error al abrir la ventana de Google. Intenta de nuevo."
        );
      } else if (error.code === "auth/popup-blocked") {
        setError(
          "Tu navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio."
        );
      } else if (error.code === "auth/network-request-failed") {
        setError(
          "Error de conexión. Por favor, verifica tu conexión a internet."
        );
      } else if (error?.message?.includes("client is offline")) {
        setError(
          "Error de conexión con la base de datos. Por favor, verifica tu conexión a internet."
        );
      } else {
        setError("Error al iniciar sesión con Google. Intenta de nuevo.");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleRedirect = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
      // El resultado se manejará en el useEffect cuando se complete la redirección
    } catch (error: any) {
      console.error("Google sign in redirect error:", error);
      setError("Error al iniciar sesión con Google. Intenta de nuevo.");
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError("Error al cerrar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError("Error al enviar el correo de recuperación.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
