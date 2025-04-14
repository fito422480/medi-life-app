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

  // Verificar si la sesión en el servidor es válida
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

  // Establecer la sesión en el servidor
  const setServerSession = async (user: FirebaseUser) => {
    try {
      // Obtener token ID fresco
      const idToken = await getIdToken(user, true);

      // Enviar token a la API para crear sesión
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

      // Actualizar el estado del usuario con los datos de la API
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

  // Observador de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setFirebaseUser(authUser);

      if (authUser) {
        // Usuario autenticado en Firebase, establecer sesión en servidor
        const sessionSuccess = await setServerSession(authUser);

        if (!sessionSuccess) {
          // Si no se pudo establecer la sesión, cerrar sesión
          await firebaseSignOut(auth);
          setUser(null);
          setError(
            "No se pudo establecer la sesión. Por favor intente nuevamente."
          );
        }
      } else {
        // No hay usuario autenticado en Firebase
        setUser(null);

        // Verificar si hay una sesión en el servidor que debería limpiarse
        const serverSessionValid = await checkServerSession();

        if (serverSessionValid) {
          // Limpiar sesión en servidor
          await fetch("/api/auth/logout", { method: "POST" });
        }
      }

      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Establecer sesión en el servidor (se maneja en el useEffect)
      return;
    } catch (error) {
      console.error("Login error:", error);

      // Manejar errores específicos
      if (error instanceof Error) {
        // Mapear códigos de error de Firebase a mensajes amigables
        const errorCode = (error as any).code;
        const errorMap: Record<string, string> = {
          "auth/user-not-found":
            "No existe una cuenta con este correo electrónico",
          "auth/wrong-password": "Contraseña incorrecta",
          "auth/invalid-credential": "Credenciales incorrectas",
          "auth/too-many-requests":
            "Demasiados intentos fallidos. Intente más tarde",
        };

        setError(errorMap[errorCode] || error.message);
        toast.error(errorMap[errorCode] || error.message);
      } else {
        setError("Error desconocido al iniciar sesión");
        toast.error("Error desconocido al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // El resto del proceso (crear perfil en Firestore) se maneja en la página de registro
      return;
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof Error) {
        // Mapear códigos de error de Firebase a mensajes amigables
        const errorCode = (error as any).code;
        const errorMap: Record<string, string> = {
          "auth/email-already-in-use":
            "Este correo electrónico ya está registrado",
          "auth/invalid-email": "Correo electrónico no válido",
          "auth/weak-password": "La contraseña es demasiado débil",
        };

        setError(errorMap[errorCode] || error.message);
        toast.error(errorMap[errorCode] || error.message);
      } else {
        setError("Error desconocido al registrarse");
        toast.error("Error desconocido al registrarse");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);

      // Cerrar sesión en Firebase
      await firebaseSignOut(auth);

      // Cerrar sesión en el servidor
      await fetch("/api/auth/logout", { method: "POST" });

      // Redirigir al login
      router.push("/login");

      // Limpiar estado
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

  // Actualizar estado del usuario (usado después de actualizaciones de perfil)
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
