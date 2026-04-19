"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { githubOAuthUrl } from "@/lib/api";

function navLinkClass(active: boolean) {
  return cn(
    "text-[15px] font-medium leading-none transition-colors duration-150",
    active ? "text-primary" : "text-foreground hover:text-primary"
  );
}

export function MarketingSiteHeader({
  leading,
  className,
}: {
  /** Optional content before the logo (e.g. \"Back to summary\" on commits view) */
  leading?: React.ReactNode;
  /** Merged onto the header element (e.g. landing background) */
  className?: string;
}) {
  const pathname = usePathname();

  const dashboardActive = pathname.startsWith("/dashboard");
  const homeActive = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-[0.5px] border-[#d0d7de] bg-background",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {leading}
          <Link
            href="/"
            className="shrink-0 font-serif text-3xl font-normal leading-none tracking-tight text-foreground"
          >
            Commitly
          </Link>
        </div>
        <nav
          className="flex shrink-0 flex-wrap items-center justify-end gap-6 sm:gap-10"
          aria-label="Primary navigation"
        >
          <Link
            href="/dashboard"
            className={navLinkClass(dashboardActive)}
          >
            Dashboard
          </Link>
          <Link href="/" className={navLinkClass(homeActive)}>
            Built on Commitly
          </Link>
          <button
            type="button"
            onClick={() => {
              window.location.href = githubOAuthUrl(crypto.randomUUID());
            }}
            className="inline-flex items-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[#f6f8fa]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4"
              aria-hidden
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}
