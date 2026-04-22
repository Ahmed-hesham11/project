"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import UserMenu from "@/components/layout/UserMenu";
import { MOCK_USER_PROFILE } from "@/data/userProfile";
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

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 18);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (!userMenuRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const userDisplayData = useMemo(() => {
    const fullName = [user?.profile?.firstName, user?.profile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      name: fullName || MOCK_USER_PROFILE.name,
      email: user?.email || MOCK_USER_PROFILE.email,
      avatar: MOCK_USER_PROFILE.avatar,
    };
  }, [user]);

  const centerLinks = isAuthenticated
    ? NAV_LINKS.filter((item) => item.href !== "/login" && item.href !== "/register")
    : [];
  const canSeeDashboard = isAuthenticated && (user?.role === "admin" || user?.role === "super_admin");
  const displayCenterLinks = [...centerLinks];

  if (canSeeDashboard && !displayCenterLinks.some((item) => item.href === "/dashboard")) {
    const contactIndex = displayCenterLinks.findIndex((item) => item.href === "/contact");
    const dashboardLink = { href: "/dashboard", label: "Dashboard" };

    if (contactIndex >= 0) {
      displayCenterLinks.splice(contactIndex + 1, 0, dashboardLink);
    } else {
      displayCenterLinks.push(dashboardLink);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/20 backdrop-blur-xl" : "bg-white/10 backdrop-blur-lg"
      }`}
    >
      <div className={`${CONTAINER_CLASS} py-2`}>
        <div
          dir="ltr"
          className={`flex min-h-[68px] items-center gap-5 rounded-2xl border px-4 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 sm:px-5 lg:px-6 ${
            isScrolled ? "border-white/35 bg-white/22" : "border-white/30 bg-white/10"
          }`}
        >
          <div className="order-first flex shrink-0 items-center gap-3 sm:gap-4">
            <Link href="/" dir="ltr" className="flex items-center gap-3 rounded-full pl-1">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[var(--border)] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <Image
                  src="/images/logo.jpg"
                  alt="Waleed Zbady"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="min-w-[115px] text-left leading-tight">
                <p className="text-[1.08rem] font-black text-[var(--primary)]">
                  Waleed Zbady
                </p>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            {displayCenterLinks.length ? (
              <nav dir="rtl" className="hidden items-center gap-1 rounded-full border border-white/40 bg-white/25 p-1.5 shadow-[0_8px_20px_rgba(79,142,247,0.12)] backdrop-blur-md lg:flex">
                {displayCenterLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-300 hover:bg-white/70 hover:text-[var(--primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>

          <div dir="rtl" className="order-last flex min-w-[220px] items-center justify-end gap-2">
            {isAuthenticated ? (
              <>
                <UserMenu
                  userData={userDisplayData}
                  isOpen={isUserMenuOpen}
                  onToggle={() => setIsUserMenuOpen((current) => !current)}
                  onClose={() => setIsUserMenuOpen(false)}
                  onLogout={logout}
                  menuRef={userMenuRef}
                />
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-white/22 text-[var(--text-secondary)] backdrop-blur-md transition-all duration-300 hover:bg-white/38 hover:text-[var(--primary)]">
                  <BellIcon />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="rounded-full border border-white/45 bg-white/22 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] backdrop-blur-md transition-all duration-300 hover:bg-white/38 hover:text-[var(--primary)] md:px-4 md:py-2.5 md:text-sm"
                >
                  انشاء حساب
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-[var(--primary-hover)] md:px-4 md:py-2.5 md:text-sm"
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
