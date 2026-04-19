"use client";

import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted-foreground/12 to-muted bg-[length:200%_100%]",
        className
      )}
      aria-hidden
    />
  );
}

/** Subtle loader shown for ~200ms on dashboard mount. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-24" aria-busy="true" aria-label="Loading dashboard">
      <div>
        <Shimmer className="h-4 w-28" />
        <Shimmer className="mt-4 h-10 max-w-md" />
        <Shimmer className="mt-3 h-4 max-w-lg" />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[12px] border border-border bg-card p-6 md:p-7"
            >
              <Shimmer className="h-3 w-24" />
              <Shimmer className="mt-6 h-12 w-16" />
              <Shimmer className="mt-4 h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
      {[1, 2].map((block) => (
        <div key={block}>
          <Shimmer className="h-4 w-36" />
          <Shimmer className="mt-4 h-9 max-w-sm" />
          <Shimmer className="mt-3 h-4 max-w-xl" />
          <Shimmer className="mt-10 h-32 w-full rounded-[12px]" />
        </div>
      ))}
    </div>
  );
}
