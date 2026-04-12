"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<"USER" | "ADMIN" | "SUPER_ADMIN">;
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, requiredRoles, user, router]);

  if (loading || !isAuthenticated) {
    return <div className="p-8 text-center text-slate-300">Loading...</div>;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
