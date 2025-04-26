"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus, NetworkStatus } from "@/lib/hooks/use-network-status";
import enhancedFirestoreService from "@/lib/firebase/enhanced-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { CloudSun } from "lucide-react";

export function PendingOperationsHandler() {
  const { status } = useNetworkStatus();
  const [hasPendingOps, setHasPendingOps] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Check for pending operations
  useEffect(() => {
    const checkPendingOperations = () => {
      const hasPending = enhancedFirestoreService.hasPendingOperations();
      const count = enhancedFirestoreService.getPendingOperationsCount();
      
      setHasPendingOps(hasPending);
      setPendingCount(count);
    };

    // Initial check
    checkPendingOperations();

    // Setup interval to check periodically
    const intervalId = setInterval(checkPendingOperations, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // When we go online, show dialog if we have pending operations
  useEffect(() => {
    if (status === NetworkStatus.ONLINE && hasPendingOps && pendingCount > 0) {
      setShowDialog(true);
    }
  }, [status, hasPendingOps, pendingCount]);

  // Process pending operations
  const processPendingOperations = async () => {
    if (status !== NetworkStatus.ONLINE) {
      toast.error("No hay conexión a Internet. Intenta nuevamente cuando estés conectado.");
      return;
    }

    setProcessing(true);
    try {
      const success = await enhancedFirestoreService.processPendingOperations(status);
      
      if (success) {
        toast.success(`Operaciones sincronizadas correctamente.`);
        setHasPendingOps(false);
        setPendingCount(0);
        setShowDialog(false);
      } else {
        toast.error("No se pudieron procesar algunas operaciones pendientes.");
      }
    } catch (error) {
      console.error("Error al procesar operaciones pendientes:", error);
      toast.error("Error al sincronizar los datos.");
    } finally {
      setProcessing(false);
    }
  };

  if (pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Floating indicator button */}
      <Button 
        variant="outline" 
        size="sm"
        className="fixed bottom-4 left-4 z-50 gap-2"
        onClick={() => setShowDialog(true)}
      >
        <CloudSun className="h-4 w-4" />
        <span>Sincronizar ({pendingCount})</span>
      </Button>

      {/* Confirmation dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Operaciones pendientes de sincronización</DialogTitle>
            <DialogDescription>
              Tienes {pendingCount} operaciones realizadas en modo offline que necesitan ser sincronizadas con el servidor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Estas operaciones fueron guardadas localmente mientras estabas sin conexión. 
              Ahora que estás conectado nuevamente, puedes sincronizarlas con el servidor.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              disabled={processing}
            >
              Más tarde
            </Button>
            <Button 
              onClick={processPendingOperations}
              disabled={processing || status !== NetworkStatus.ONLINE}
            >
              {processing ? (
                <>
                  <CloudSun className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                "Sincronizar ahora"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}