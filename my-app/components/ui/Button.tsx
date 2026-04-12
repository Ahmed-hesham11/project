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
  "inline-flex items-center justify-center rounded-xl font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(to_right,_var(--primary),_var(--secondary))] text-white shadow-[var(--shadow-lg)] hover:-translate-y-0.5 hover:bg-[linear-gradient(to_right,_var(--primary-hover),_var(--secondary-hover))] hover:shadow-[var(--shadow-xl)]",
  secondary:
    "border border-[var(--border)] bg-transparent text-[var(--primary)] hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
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
