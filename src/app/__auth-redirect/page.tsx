// src/app/__auth-redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Este componente solo se carga después de que Firebase complete la redirección
    // El hook de auth manejará el resultado de la redirección
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-600">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}
