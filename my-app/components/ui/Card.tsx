import { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "surface-card surface-card-hover rounded-[28px] p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
