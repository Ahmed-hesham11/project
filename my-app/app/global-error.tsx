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
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
            Global error
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Something unexpected happened</h1>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
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
