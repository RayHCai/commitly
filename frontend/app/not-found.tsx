import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 max-w-lg text-center font-serif text-4xl font-normal tracking-tight text-foreground md:text-5xl">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-6 max-w-md text-center text-base leading-relaxed text-[color:var(--text-secondary)]">
        Check the URL or head back home.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "mt-10 rounded-lg px-8"
        )}
      >
        Back to home
      </Link>
    </div>
  );
}
