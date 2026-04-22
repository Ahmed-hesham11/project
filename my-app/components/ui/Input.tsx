import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    return (
      <label className="grid gap-2 text-sm text-[var(--text-secondary)]">
        {label ? <span className="font-medium text-[var(--text-primary)]">{label}</span> : null}
        <input
          ref={ref}
          id={id}
          className={cn(
            "ds-field h-12 rounded-xl px-4 shadow-[var(--shadow-md)] placeholder:text-[var(--text-tertiary)]",
            className,
          )}
          {...props}
        />
        {hint ? <span className="text-xs text-[var(--text-tertiary)]">{hint}</span> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
