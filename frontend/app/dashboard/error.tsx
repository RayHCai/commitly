"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[min(420px,70vh)] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-serif text-xl text-foreground md:text-2xl">
        Something went wrong. Try reloading.
      </p>
      <Button type="button" className="mt-8 rounded-lg px-8" onClick={() => reset()}>
        Reload
      </Button>
    </div>
  );
}
