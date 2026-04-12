"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
        Something went wrong
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {onRetry ? (
        <Button onClick={onRetry} className="mt-6">
          Try again
        </Button>
      ) : null}
    </Card>
  );
}
