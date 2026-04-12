import { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {icon ?? "∅"}
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </Card>
  );
}
