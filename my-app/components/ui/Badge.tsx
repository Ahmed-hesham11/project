import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(238,242,255,0.92))] px-3.5 py-1.5 text-xs font-semibold text-sky-700 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.35)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
