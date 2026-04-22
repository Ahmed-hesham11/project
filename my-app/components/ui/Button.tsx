import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

interface SharedButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">,
    SharedButtonProps {
  href?: never;
}

interface ButtonLinkProps extends SharedButtonProps {
  href: string;
}

const baseClassName =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-white shadow-[0_10px_22px_rgba(79,142,247,0.24)] hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]",
  secondary:
    "border border-[var(--primary-light)] bg-white text-[var(--primary)] hover:-translate-y-0.5 hover:bg-[var(--primary-soft)]",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-8 text-base",
  lg: "h-12 px-8 text-lg",
};

function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(baseClassName, variants[variant], sizes[size], className);
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={getButtonClassName(variant, size, className)}>
      {children}
    </Link>
  );
}
