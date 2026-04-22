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
      <Card className="dashboard-card relative sticky top-24 overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] p-5 text-[var(--text-main)] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-[var(--primary)]/35 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_55%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_48%)]" />
        <div className="flex items-center">
          <div className="relative z-10">
            <p className="font-semibold text-[var(--text-main)]">
              {displayUser.name}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {displayUser.role}
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-6 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--primary)]/25 hover:bg-[var(--hover-soft)] hover:text-[var(--text-main)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Card>
    </aside>
  );
}
