"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-screen items-center justify-center bg-[var(--bg-main)] p-4 text-[var(--text-main)]">
        <div className="ds-card w-full max-w-lg rounded-3xl p-8 text-center shadow-[var(--shadow-2xl)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
            Global error
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Something unexpected happened</h1>
          <p className="mt-4 text-sm leading-8 text-[var(--text-secondary)]">
            The app-level error boundary is active. Retry to recover from the failure.
          </p>
          <Button onClick={unstable_retry} className="mt-6">
            Retry
          </Button>
        </div>
      </body>
    </html>
  );
}
