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
      <section className="dashboard-shell py-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 px-4 sm:px-6 xl:flex-row xl:px-8">
          <Sidebar links={adminLinks} />

          <div className="flex-1 space-y-8">
            <div className="dashboard-panel space-y-3 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.72))] px-6 py-6 shadow-[0_26px_50px_-30px_rgba(2,8,23,0.72)] backdrop-blur-xl sm:px-8">
              <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200 shadow-sm">
                لوحة التحكم
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                {title}
              </h1>
              <p className="text-lg text-slate-300">
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
