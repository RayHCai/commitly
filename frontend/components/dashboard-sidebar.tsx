"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/jobs", label: "Job postings" },
  { href: "/dashboard/showcase", label: "Showcase projects" },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="flex gap-1 overflow-x-auto border-b border-border bg-muted/15 px-4 py-3 md:hidden"
        aria-label="Dashboard sections"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <aside className="hidden w-52 shrink-0 border-r border-border bg-muted/15 px-3 py-8 md:block">
        <p className="px-3 pb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <nav className="space-y-1" aria-label="Dashboard">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
