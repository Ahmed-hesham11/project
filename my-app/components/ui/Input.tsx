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
            "h-12 rounded-2xl border border-white/10 bg-white/6 px-4 text-[var(--text-primary)] shadow-[0_14px_30px_-24px_rgba(2,8,23,0.45)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:bg-white/8 focus:shadow-[0_0_0_3px_rgb(79_70_229_/_0.16),0_18px_32px_-24px_rgba(79,70,229,0.28)]",
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
