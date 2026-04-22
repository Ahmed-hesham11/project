"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ErrorStateProps {
  title: string;
  description: unknown;
  onRetry?: () => void;
}

function formatErrorDescription(description: unknown): string {
  if (typeof description === "string") {
    return description;
  }

  if (description instanceof Error) {
    return description.message;
  }

  if (description && typeof description === "object") {
    const record = description as Record<string, unknown>;
    const candidates = [
      record.message,
      record.error,
      record.error_description,
      record.details,
      record.hint,
      record.code ? `Error code: ${String(record.code)}` : null,
    ];

    const text = candidates.find((value) => typeof value === "string" && value.trim());
    if (typeof text === "string") {
      return text;
    }
  }

  return "An unexpected error occurred.";
}

export function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const message = formatErrorDescription(description);

  return (
    <Card className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
        Something went wrong
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-[var(--text-main)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-8 text-[var(--text-secondary)]">
        {message}
      </p>
      {onRetry ? (
        <Button onClick={onRetry} className="mt-6">
          Try again
        </Button>
      ) : null}
    </Card>
  );
}
