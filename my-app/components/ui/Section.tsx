import { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section className={cn("ds-section page-shell", className)} {...props}>
      {children}
    </section>
  );
}
