import { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "ds-card ds-card-hover surface-card surface-card-hover rounded-[20px] p-[var(--card-padding)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
