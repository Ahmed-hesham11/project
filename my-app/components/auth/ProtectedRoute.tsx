"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

function normalizeRole(role: string | undefined) {
  if (!role) {
    return "";
  }

  return role.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const normalizedUserRole = normalizeRole(user?.role);
  const normalizedRequiredRoles = useMemo(
    () => requiredRoles?.map((role) => normalizeRole(role)) ?? [],
    [requiredRoles],
  );

  useEffect(() => {
    if (loading) return;
    
    console.log("[ProtectedRoute] Checking access:", {
      isAuthenticated,
      userRole: user?.role,
      requiredRoles,
      hasAccess: user && requiredRoles ? normalizedRequiredRoles.includes(normalizedUserRole) : false,
    });

    if (!isAuthenticated) {
      console.log("[ProtectedRoute] Not authenticated, redirecting to login");
      router.replace("/login");
      return;
    }
    
    if (requiredRoles && user) {
      const hasAccess = normalizedRequiredRoles.includes(normalizedUserRole);
      if (!hasAccess) {
        console.log(`[ProtectedRoute] Access denied. Role "${user.role}" not in [${requiredRoles.join(", ")}]`);
        router.replace("/");
        return;
      }
      console.log("[ProtectedRoute] Access granted");
    }
  }, [loading, isAuthenticated, requiredRoles, user, router, normalizedRequiredRoles, normalizedUserRole]);

  if (loading || !isAuthenticated) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>;
  }

  if (requiredRoles && user && !normalizedRequiredRoles.includes(normalizedUserRole)) {
    return null;
  }

  return <>{children}</>;
}
