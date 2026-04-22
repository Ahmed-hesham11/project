"use client";

import { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";

import { adminLinks } from "./adminConfig";

interface AdminLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminLayout({
  title,
  description,
  children,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <section className="dashboard-shell py-10 sm:py-12">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 sm:px-6 xl:flex-row xl:px-8">
          <Sidebar links={adminLinks} />

          <div className="flex-1 space-y-10">
            <div className="dashboard-panel rounded-2xl bg-gradient-to-r from-blue-500 to-blue-300 px-6 py-7 shadow-md sm:px-8 sm:py-8">
              <span className="inline-flex rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                لوحة التحكم
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
