"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Brief skeleton on each route change so loads feel intentional (hackathon polish).
 */
export function PageReadyGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!ready) {
    return (
      <div
        className="min-h-screen bg-background"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Loading page</span>
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:pt-24">
          <div className="h-9 w-48 max-w-[70%] animate-pulse rounded-lg bg-muted md:h-10" />
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted/90" />
            <div className="h-4 w-[92%] animate-pulse rounded bg-muted/90" />
            <div className="h-4 w-[78%] animate-pulse rounded bg-muted/90" />
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="h-32 animate-pulse rounded-xl bg-muted/70" />
            <div className="h-32 animate-pulse rounded-xl bg-muted/70" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
