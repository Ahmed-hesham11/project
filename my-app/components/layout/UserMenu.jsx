"use client";

import Image from "next/image";
import { useState } from "react";

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

export default function UserMenu({
  userData,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  menuRef,
}) {
  const [avatarSrc, setAvatarSrc] = useState(userData.avatar || "/images/avatar-user.svg");

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open user menu"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-white/22 text-[var(--text-secondary)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/38 hover:text-[var(--primary)]"
      >
        <UserIcon />
      </button>

      <div
        className={`fixed inset-x-3 top-[82px] z-[70] rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl transition-all duration-200 md:absolute md:inset-x-auto md:left-auto md:right-0 md:top-[calc(100%+10px)] md:w-80 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-white">
            <Image
              src={avatarSrc}
              alt={userData.name}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setAvatarSrc("/images/avatar-user.svg")}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{userData.name}</p>
            <p className="truncate text-xs text-slate-500">{userData.email}</p>
          </div>
        </div>

        <div className="mt-2 space-y-1" role="menu" aria-label="User menu">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
