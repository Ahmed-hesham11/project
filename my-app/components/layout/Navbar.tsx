"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { CONTAINER_CLASS, NAV_LINKS } from "@/lib/constants";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 4.5A5.5 5.5 0 0 0 6.5 10v2.2c0 .7-.22 1.39-.64 1.95L4.75 15.7A1 1 0 0 0 5.55 17.3h12.9a1 1 0 0 0 .8-1.6l-1.11-1.55a3.33 3.33 0 0 1-.64-1.95V10A5.5 5.5 0 0 0 12 4.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const centerLinks = NAV_LINKS.filter(
    (item) => item.href !== "/login" && item.href !== "/register",
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgb(15_23_42_/_0.84)] backdrop-blur-md">
      <div className={`${CONTAINER_CLASS} py-3`}>
        <div className="flex min-h-[68px] items-center gap-4 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(30,41,59,0.96),rgba(15,23,42,0.92))] px-4 shadow-[0_18px_40px_-28px_rgba(2,8,23,0.95)] sm:px-5 lg:px-6">
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-3 rounded-full pr-1">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15 shadow-[0_12px_28px_-18px_rgba(2,8,23,0.9)]">
                <Image
                  src="/images/logo.jpg"
                  alt="Waleed Zbady"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="min-w-[92px] text-right leading-tight">
                <p className="text-[1.08rem] font-black text-sky-400">
                  وليد زبادي
                </p>
              </div>
            </Link>

            <Link href="/dashboard" className="hidden lg:inline-flex">
              <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:border-sky-300/50 hover:bg-sky-400/15 hover:text-white">
                Dashboard
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1.5 lg:flex">
              {centerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden min-w-[220px] items-center justify-end gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] hover:bg-white/[0.08] hover:text-white">
                  <BellIcon />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] hover:bg-white/[0.08] hover:text-white">
                  <UserIcon />
                </button>
                <button
                  onClick={logout}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.08] hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                >
                  انشاء حساب
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-300 transition hover:border-sky-300/50 hover:bg-sky-400/15 hover:text-white"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
