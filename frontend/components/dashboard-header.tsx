"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { clearAllCommitlyLocalStorage } from "@/lib/commitly-storage";
import { links as demoLinks, mockUser } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)
  ).toUpperCase();
}

export function DashboardHeader() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      return () =>
        document.removeEventListener("mousedown", handlePointerDown);
    }
  }, [userMenuOpen]);

  function resetDemo() {
    clearAllCommitlyLocalStorage();
    window.location.href = "/";
  }

  function signOut() {
    clearAllCommitlyLocalStorage();
    router.push("/");
  }

  const previewSlug = demoLinks[0]?.slug ?? "jihan-acme";

  return (
    <header className="sticky top-0 z-40 border-b border-[0.5px] border-[#e5e5e0] bg-background">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/dashboard"
          className="font-serif text-2xl font-normal leading-none tracking-tight text-foreground"
        >
          Commitly
        </Link>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link
            href={`/c/${previewSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View your public page"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "gap-1.5 rounded-lg px-3 sm:px-4"
            )}
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">View your page</span>
          </Link>
          <Link
            href="/connect"
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "rounded-lg px-4"
            )}
          >
            New link
          </Link>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              {initials(mockUser.fullName)}
            </button>
            {userMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card py-1 text-sm shadow-card"
              >
                <Link
                  role="menuitem"
                  href="/dashboard"
                  className="block px-4 py-2.5 text-foreground hover:bg-muted/80"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  role="menuitem"
                  href="/how-it-works"
                  className="block px-4 py-2.5 text-foreground hover:bg-muted/80"
                  onClick={() => setUserMenuOpen(false)}
                >
                  How Commitly works
                </Link>
                <Link
                  role="menuitem"
                  href="/dashboard/profile"
                  className="block px-4 py-2.5 text-foreground hover:bg-muted/80"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-foreground hover:bg-muted/80"
                  onClick={() => {
                    setUserMenuOpen(false);
                    resetDemo();
                  }}
                >
                  Reset demo
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-foreground hover:bg-muted/80"
                  onClick={() => {
                    setUserMenuOpen(false);
                    signOut();
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
