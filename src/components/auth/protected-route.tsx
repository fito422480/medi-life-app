// src/components/auth/protected-route.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { User } from "@/lib/types/user";

type UserRole = User["role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push("/login");
      }
      // If authenticated but role is not allowed
      else if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        router.push("/dashboard"); // Redirect to dashboard
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is authenticated and role is allowed, show children
  if (!loading && user && (!allowedRoles || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }

  // If user is authenticated but role is not allowed, show error message
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Acceso no autorizado</h2>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    </div>
  );
}
