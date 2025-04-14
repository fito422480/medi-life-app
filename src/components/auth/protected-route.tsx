// src/components/auth/protected-route.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { UserRole } from "@/lib/types";

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
      else if (allowedRoles && !allowedRoles.includes(user.role)) {
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

  // For any other case, return null (redirect will happen through the useEffect)
  return null;
}
