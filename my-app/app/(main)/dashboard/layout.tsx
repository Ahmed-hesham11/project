import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["admin", "super_admin"]}>
      <div className="ds-shell app-fade-in min-h-screen">{children}</div>
    </ProtectedRoute>
  );
}
