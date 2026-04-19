"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Error
      </p>
      <h1 className="mt-4 max-w-md text-center font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-md text-center text-base leading-relaxed text-[color:var(--text-secondary)]">
        Reload the page or go back home. If this keeps happening, try again in
        a moment.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full rounded-lg sm:w-auto"
          )}
        >
          Try again
        </button>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full rounded-lg sm:w-auto"
          )}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
