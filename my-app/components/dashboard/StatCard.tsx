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
    <div className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
