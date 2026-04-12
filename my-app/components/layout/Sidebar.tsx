"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";

interface SidebarLink {
  href: string;
  label: string;
}

interface SidebarProps {
  links?: SidebarLink[];
  user?: {
    name: string;
    role: string;
  };
}

const defaultDashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/my-courses", label: "My Courses" },
  { href: "/register", label: "Upgrade Plan" },
];

export function Sidebar({
  links = defaultDashboardLinks,
  user,
}: SidebarProps) {
  const { user: authUser } = useAuth();
  const displayUser = user ?? {
    name: authUser?.profile?.firstName ?? "Student",
    role: authUser?.role ?? "Guest",
  };

  return (
    <aside className="w-full lg:w-72">
      <Card className="dashboard-card relative sticky top-24 overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-5 text-white shadow-[0_24px_46px_-28px_rgba(15,23,42,0.7)] hover:border-sky-300/25 hover:shadow-[0_28px_54px_-28px_rgba(14,165,233,0.28)]">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.3),transparent_55%),radial-gradient(circle_at_top_left,rgba(79,70,229,0.26),transparent_48%)]" />
        <div className="flex items-center">
          <div className="relative z-10">
            <p className="font-semibold text-white">
              {displayUser.name}
            </p>
            <p className="text-sm text-slate-300">
              {displayUser.role}
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-6 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-sky-300/20 hover:bg-white/8 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Card>
    </aside>
  );
}
