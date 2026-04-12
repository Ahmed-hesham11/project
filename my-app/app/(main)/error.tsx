"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function MainError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <ErrorState
          title="We couldn’t load this part of the platform."
          description="Please retry the request. The route-level error boundary is ready for production recovery flows."
          onRetry={unstable_retry}
        />
      </div>
    </section>
  );
}
