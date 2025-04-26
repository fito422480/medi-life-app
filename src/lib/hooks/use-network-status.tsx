// src/lib/hooks/use-network-status.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/config";
import {
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getDatabase, onValue, ref } from "firebase/database";
export enum NetworkStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  RECONNECTING = "reconnecting",
  UNKNOWN = "unknown",
}

interface UseNetworkStatusReturn {
  status: NetworkStatus;
  isOnline: boolean;
  lastOnline: Date | null;
  retryConnection: () => Promise<boolean>;
  forceOffline: () => Promise<void>;
  forceOnline: () => Promise<void>;
}

/**
 * Hook para monitorear el estado de la conexión a Firestore y proporcionar
 * métodos para gestionar la conectividad offline/online.
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>(NetworkStatus.UNKNOWN);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  // Actualizar estado cuando cambia la conexión
  useEffect(() => {
    // Escuchar eventos de conectividad globales
    const handleOnline = () => {
      setStatus(NetworkStatus.ONLINE);
      setLastOnline(new Date());
    };

    const handleOffline = () => {
      setStatus(NetworkStatus.OFFLINE);
    };

    // Escuchar eventos de conectividad de Firestore
    // Escuchar eventos de conectividad de Firebase
    const database = getDatabase();
    const connectedRef = ref(database, '.info/connected');
    const unsubscribeConnection = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log("Firebase: Conectado");
        setStatus(NetworkStatus.ONLINE);
        setLastOnline(new Date());
      } else {
        console.log("Firebase: Desconectado");
        setStatus(NetworkStatus.OFFLINE);
      }
    });
    // Escuchar eventos del navegador
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Establecer el estado inicial
    if (navigator.onLine) {
      setStatus(NetworkStatus.ONLINE);
      setLastOnline(new Date());
    } else {
      setStatus(NetworkStatus.OFFLINE);
    }

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("online", handleOnline);
      unsubscribeConnection();
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Intenta restablecer la conexión a Firestore
   */
  const retryConnection = useCallback(async (): Promise<boolean> => {
    if (status === NetworkStatus.RECONNECTING) return false;

    try {
      setStatus(NetworkStatus.RECONNECTING);

      // Intentar conectar nuevamente
      await disableNetwork(db);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await enableNetwork(db);

      setStatus(NetworkStatus.ONLINE);
      setLastOnline(new Date());
      return true;
    } catch (error) {
      console.error("Error al intentar reconectar con Firestore:", error);
      setStatus(NetworkStatus.OFFLINE);
      return false;
    }
  }, [status]);

  /**
   * Fuerza el modo offline
   */
  const forceOffline = useCallback(async (): Promise<void> => {
    try {
      await disableNetwork(db);
      setStatus(NetworkStatus.OFFLINE);
    } catch (error) {
      console.error("Error al forzar modo offline:", error);
    }
  }, []);

  /**
   * Fuerza el modo online
   */
  const forceOnline = useCallback(async (): Promise<void> => {
    try {
      await enableNetwork(db);
      setStatus(NetworkStatus.ONLINE);
      setLastOnline(new Date());
    } catch (error) {
      console.error("Error al forzar modo online:", error);
    }
  }, []);

  return {
    status,
    isOnline: status === NetworkStatus.ONLINE,
    lastOnline,
    retryConnection,
    forceOffline,
    forceOnline,
  };
}
