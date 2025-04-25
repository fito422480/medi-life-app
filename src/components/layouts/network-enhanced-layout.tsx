"use client";

import React, { useEffect } from "react";
import { AuthProviderWithNetwork } from "@/lib/hooks/use-auth-with-network";
import { Toaster } from "@/components/ui/sonner";
import { initFirebase } from "@/lib/firebase/config";
import { NetworkStatusIndicator } from "@/components/network-status-indicator";
import { PendingOperationsHandler } from "@/components/pending-operations-handler";
import enhancedFirestoreService from "@/lib/firebase/enhanced-service";
import {
  useNetworkStatus,
  NetworkStatus,
} from "@/lib/hooks/use-network-status";
import { toast } from "sonner";

interface NetworkEnhancedLayoutProps {
  children: React.ReactNode;
}

export function NetworkEnhancedLayout({
  children,
}: NetworkEnhancedLayoutProps) {
  const { status, isOnline } = useNetworkStatus();

  // Inicializar Firebase y persistencia offline
  useEffect(() => {
    const initializeApp = async () => {
      // Inicializar Firebase
      initFirebase();

      // Inicializar persistencia offline mejorada
      try {
        const success = await enhancedFirestoreService.initialize();
        if (success) {
          console.log("Persistencia offline configurada correctamente");
        } else {
          console.warn("La persistencia offline podría estar limitada");
        }
      } catch (error) {
        console.error("Error al inicializar persistencia offline:", error);
      }
    };

    initializeApp();
  }, []);

  // Escuchar cambios en el estado de la red
  useEffect(() => {
    // Notificar cuando cambia el estado de la conexión
    if (status === NetworkStatus.ONLINE) {
      // Si anteriormente estábamos offline (y no es la primera carga)
      if (sessionStorage.getItem("wasOffline") === "true") {
        toast.success("Conexión restablecida", {
          description: "La aplicación está nuevamente conectada a Internet.",
          duration: 3000,
        });

        // Procesar operaciones pendientes automáticamente
        enhancedFirestoreService.processPendingOperations(status);
      }
      sessionStorage.setItem("wasOffline", "false");
    } else if (status === NetworkStatus.OFFLINE) {
      toast.warning("Sin conexión a Internet", {
        description: "La aplicación continuará funcionando en modo offline.",
        duration: 5000,
      });
      sessionStorage.setItem("wasOffline", "true");
    }
  }, [status]);

  return (
    <AuthProviderWithNetwork>
      {/* Componentes principales de la aplicación */}
      {children}

      {/* Componentes de utilidad para gestión de red */}
      <NetworkStatusIndicator />
      <PendingOperationsHandler />

      {/* Notificaciones */}
      <Toaster position="top-center" richColors />
    </AuthProviderWithNetwork>
  );
}
