"use client";

import { useState } from "react";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ErrorState } from "@/components/ui/ErrorState";
import { getAdminMetrics } from "@/lib/api/admin";
import { formatCurrency } from "@/lib/utils";

import { AdminLayout } from "./AdminLayout";

interface MetricCard {
  title: string;
  value: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  accentClass: string;
  iconWrapClass: string;
  glowClass: string;
  icon: "courses" | "students" | "revenue" | "content" | "alerts";
}

interface RevenueMonth {
  month: string;
  revenue: number;
}

const quickRanges = ["7d", "30d", "90d", "1y"];

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function MetricIcon({ type }: { type: MetricCard["icon"] }) {
  const common = "h-6 w-6 text-white";

  if (type === "courses") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19.5h14" strokeLinecap="round" />
        <path d="M7 19.5V7.5l5-3 5 3v12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 11h.01M14 11h.01M10 15h.01M14 15h.01" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "students") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 18a7 7 0 0 1 14 0" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "revenue") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v18" strokeLinecap="round" />
        <path d="M16.5 7.5c0-1.9-1.8-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9 10.4 12 11s4.5 1.8 4.5 4-1.8 4-4.5 4-4.5-1.6-4.5-3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "alerts") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 8.5v4.5" strokeLinecap="round" />
        <path d="M12 16h.01" strokeLinecap="round" />
        <path d="M10.29 4.86 3.82 16.08A1.5 1.5 0 0 0 5.11 18.3h12.94a1.5 1.5 0 0 0 1.29-2.22L12.87 4.86a1.5 1.5 0 0 0-2.58 0Z" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7.5h12M6 12h12M6 16.5h7" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-sky-300" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3.5v3M17 3.5v3M4.5 8.5h15" strokeLinecap="round" />
      <rect x="4" y="5.5" width="16" height="14" rx="3" />
    </svg>
  );
}

export function AdminDashboardClient() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<{
    courseCount: number;
    studentsCount: number;
    enrollmentsCount: number;
    averageRating: string;
    totalRevenue: number;
    revenueByMonth: RevenueMonth[];
  } | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState("30d");
  const [fromDate, setFromDate] = useState("2026-03-06");
  const [toDate, setToDate] = useState("2026-04-05");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const response = await getAdminMetrics(token);
        setMetrics(response);
      } catch (error) {
        setMetricsError(error instanceof Error ? error.message : "Failed to load metrics");
      }
    })();
  }, [token]);

  const metricCards: MetricCard[] = [
    {
      title: "Total Courses",
      value: String(metrics?.courseCount ?? 0),
      delta: "+100%",
      deltaTone: "positive",
      accentClass: "text-indigo-300",
      iconWrapClass: "border-indigo-400/20 bg-indigo-400/14",
      glowClass: "from-indigo-500/20 via-sky-400/10 to-transparent",
      icon: "courses",
    },
    {
      title: "Active Students",
      value: String(metrics?.studentsCount ?? 0),
      delta: "+12.4%",
      deltaTone: "positive",
      accentClass: "text-sky-300",
      iconWrapClass: "border-sky-400/20 bg-sky-400/14",
      glowClass: "from-sky-500/20 via-cyan-400/10 to-transparent",
      icon: "students",
    },
    {
      title: "Needs Follow-up",
      value: "0",
      deltaTone: "neutral",
      accentClass: "text-rose-300",
      iconWrapClass: "border-rose-400/20 bg-rose-400/14",
      glowClass: "from-rose-500/20 via-orange-300/10 to-transparent",
      icon: "alerts",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.totalRevenue ?? 0),
      delta: "+18.6%",
      deltaTone: "positive",
      accentClass: "text-emerald-300",
      iconWrapClass: "border-emerald-400/20 bg-emerald-400/14",
      glowClass: "from-emerald-500/20 via-cyan-400/10 to-transparent",
      icon: "revenue",
    },
    {
      title: "Learning Modules",
      value: "-",
      delta: `${metrics?.enrollmentsCount ?? 0} enrollments`,
      deltaTone: "neutral",
      accentClass: "text-violet-300",
      iconWrapClass: "border-violet-400/20 bg-violet-400/14",
      glowClass: "from-violet-500/20 via-indigo-400/10 to-transparent",
      icon: "content",
    },
  ];

  const revenueByMonth = metrics?.revenueByMonth ?? [];
  const maxRevenue = Math.max(1, ...revenueByMonth.map((item) => item.revenue));
  const firstRevenue = revenueByMonth[0]?.revenue ?? 0;
  const latestRevenue = revenueByMonth[revenueByMonth.length - 1]?.revenue ?? 0;
  const revenueGrowth = firstRevenue ? Math.round(((latestRevenue - firstRevenue) / firstRevenue) * 100) : 0;

  function applyQuickRange(range: string) {
    const endDate = new Date(toDate);

    if (Number.isNaN(endDate.getTime())) {
      return;
    }

    const startDate = new Date(endDate);

    if (range === "7d") {
      startDate.setDate(endDate.getDate() - 6);
    } else if (range === "30d") {
      startDate.setDate(endDate.getDate() - 29);
    } else if (range === "90d") {
      startDate.setDate(endDate.getDate() - 89);
    } else if (range === "1y") {
      startDate.setFullYear(endDate.getFullYear() - 1);
      startDate.setDate(endDate.getDate() + 1);
    }

    setActiveRange(range);
    setFromDate(formatDateInput(startDate));
  }

  return (
    <AdminLayout
      title="Dashboard"
      description="Welcome to your admin dashboard"
    >
      {metricsError ? (
        <ErrorState title="Dashboard metrics unavailable" description={metricsError} />
      ) : null}
      <div className="dashboard-panel flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,41,59,0.8),rgba(15,23,42,0.88))] p-5 shadow-[0_24px_50px_-30px_rgba(2,8,23,0.8)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Date Range
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[160px] items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 shadow-[0_12px_24px_-18px_rgba(14,165,233,0.2)]">
              <CalendarIcon />
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  From
                </p>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="mt-1 w-full bg-transparent text-lg font-semibold text-white outline-none"
                />
              </div>
            </div>

            <span className="px-1 text-xl text-sky-300">←</span>

            <div className="flex min-w-[160px] items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 shadow-[0_12px_24px_-18px_rgba(79,70,229,0.22)]">
              <CalendarIcon />
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  To
                </p>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="mt-1 w-full bg-transparent text-lg font-semibold text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => applyQuickRange(range)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeRange === range
                  ? "border-transparent bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-white shadow-[0_18px_32px_-18px_rgba(79,70,229,0.45)]"
                  : "border-white/10 bg-white/6 text-slate-300 hover:-translate-y-0.5 hover:border-sky-300/30 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-5">
        {metricCards.map((metric, index) => (
          <div
            key={metric.title}
            className="dashboard-card group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.82))] p-7 shadow-[0_24px_50px_-32px_rgba(2,8,23,0.82)]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${metric.glowClass}`} />
            <div className="relative flex items-start justify-between gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${metric.iconWrapClass} shadow-sm transition duration-300 group-hover:scale-105`}>
                <MetricIcon type={metric.icon} />
              </div>
              {metric.delta ? (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    metric.deltaTone === "positive"
                      ? "bg-emerald-400/12 text-emerald-300"
                      : metric.deltaTone === "negative"
                        ? "bg-rose-400/12 text-rose-300"
                        : "bg-white/8 text-slate-300"
                  }`}
                >
                  {metric.delta}
                </span>
              ) : null}
            </div>

            <p className="relative mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              {metric.title}
            </p>
            <p className={`relative mt-4 text-5xl font-black tracking-tight ${metric.accentClass}`}>
              {metric.value}
            </p>

            <div className="relative mt-8 flex items-center gap-2 text-sky-300/50">
              <span className="h-px flex-1 bg-current opacity-60" />
              <span className="h-2 w-8 rounded-full border border-current opacity-60" />
              <span className="h-px flex-1 bg-current opacity-60" />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-panel rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.84))] p-7 shadow-[0_24px_48px_-30px_rgba(2,8,23,0.82)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Monthly Revenue Comparison
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Track how revenue changes across the latest months and compare momentum over time.
            </p>
          </div>
        </div>

        <div className="dashboard-card mt-10 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.74))] p-6 shadow-[0_18px_34px_-28px_rgba(2,8,23,0.5)]">
          <div className="mb-6 flex items-center justify-between text-sm text-slate-300">
            <span>Revenue by month</span>
            <span>Last {revenueByMonth.length || 6} months</span>
          </div>

          <div className="grid h-[360px] grid-cols-[64px_1fr] gap-4">
            <div className="flex h-full flex-col justify-between pb-12 text-xs text-slate-500">
              <span>{formatCurrency(maxRevenue)}</span>
              <span>{formatCurrency(Math.round(maxRevenue * 0.75))}</span>
              <span>{formatCurrency(Math.round(maxRevenue * 0.5))}</span>
              <span>{formatCurrency(Math.round(maxRevenue * 0.25))}</span>
              <span>{formatCurrency(0)}</span>
            </div>

            <div className="relative rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 pt-5 pb-12">
              <div className="absolute inset-x-4 top-5 bottom-12 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <span
                    key={line}
                    className="block border-t border-dashed border-white/8"
                  />
                ))}
              </div>

              <div className="absolute inset-x-4 bottom-12 border-t border-white/10" />

              <div className="relative flex h-full items-end justify-between gap-4">
                {revenueByMonth.map((item, index) => {
                  const barHeight = `${Math.max((item.revenue / maxRevenue) * 100, 14)}%`;

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                      style={{ animationDelay: `${200 + index * 80}ms` }}
                    >
                      <div className="group flex h-full w-full flex-col items-center justify-end">
                        <div className="mb-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-center text-xs font-medium text-slate-200 opacity-0 transition group-hover:opacity-100">
                          {formatCurrency(item.revenue)}
                        </div>
                        <div className="relative flex h-full w-full items-end justify-center">
                          <div
                            className="w-full max-w-[64px] rounded-t-[20px] rounded-b-[6px] bg-[linear-gradient(180deg,rgba(34,211,238,0.98),rgba(79,70,229,0.94))] shadow-[0_20px_40px_-20px_rgba(34,211,238,0.55)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_26px_46px_-18px_rgba(79,70,229,0.55)]"
                            style={{ height: barHeight }}
                          />
                        </div>
                        <div className="pt-4 text-center text-sm font-semibold text-slate-300">
                          {item.month}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
