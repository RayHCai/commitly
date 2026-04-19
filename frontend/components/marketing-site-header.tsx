"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

function navLinkClass(active: boolean) {
  return cn(
    "text-[15px] font-medium leading-none transition-colors duration-150",
    active ? "text-primary" : "text-foreground hover:text-primary"
  );
}

export function MarketingSiteHeader({
  leading,
}: {
  /** Optional content before the logo (e.g. \"Back to summary\" on commits view) */
  leading?: React.ReactNode;
}) {
  const pathname = usePathname();

  const dashboardActive = pathname.startsWith("/dashboard");
  const howItWorksActive = pathname.startsWith("/how-it-works");
  const homeActive = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-[0.5px] border-[#e5e5e0] bg-background">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {leading}
          <Link
            href="/"
            className="shrink-0 font-serif text-2xl font-normal leading-none tracking-tight text-foreground"
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
          <Link
            href="/how-it-works"
            className={navLinkClass(howItWorksActive)}
          >
            How it works
          </Link>
          <Link href="/" className={navLinkClass(homeActive)}>
            Built on Commitly
          </Link>
        </nav>
      </div>
    </header>
  );
}
