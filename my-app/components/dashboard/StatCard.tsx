"use client";

import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-main)] transition group-hover:scale-105">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-main)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
