"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus, NetworkStatus } from "@/lib/hooks/use-network-status";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export function NetworkStatusIndicator() {
  const { status, isOnline, retryConnection } = useNetworkStatus();
  const [visible, setVisible] = useState(false);

  // Show indicator when offline or reconnecting
  useEffect(() => {
    if (status !== NetworkStatus.ONLINE) {
      setVisible(true);
    } else {
      // Hide after a delay when back online
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // No need to show if we're online and the indicator is hidden
  if (status === NetworkStatus.ONLINE && !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={status === NetworkStatus.ONLINE ? "outline" : "destructive"} 
              size="sm"
              className="gap-2 px-3"
              onClick={status !== NetworkStatus.ONLINE ? retryConnection : undefined}
            >
              {status === NetworkStatus.ONLINE ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Conectado</span>
                </>
              ) : status === NetworkStatus.RECONNECTING ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Reconectando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Sin conexión</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {status === NetworkStatus.ONLINE 
              ? "Conectado a Internet" 
              : status === NetworkStatus.RECONNECTING 
                ? "Intentando reconectar..." 
                : "Sin conexión a Internet. Operando en modo offline."}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}