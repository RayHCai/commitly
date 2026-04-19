"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export type LinkVariant = "poster" | "scroll" | "canvas";

const VARIANTS: { id: LinkVariant; label: string }[] = [
  { id: "poster", label: "Poster" },
  { id: "scroll", label: "Scroll" },
  { id: "canvas", label: "Canvas" },
];

export function VariantSwitcher({ current }: { current: LinkVariant }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const go = (id: LinkVariant) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    next.set("v", id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div
      className="fixed bottom-5 left-5 z-40 flex items-center gap-1 rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)]/85 p-1 font-mono text-[11px] shadow-[0_4px_12px_rgba(26,26,23,0.06)] backdrop-blur"
      aria-label="Design variant switcher (dev)"
    >
      <span className="pl-2 pr-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
        variant
      </span>
      {VARIANTS.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => go(v.id)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            current === v.id
              ? "bg-[color:var(--ink)] text-[color:var(--paper-bg)]"
              : "text-[color:var(--ink-soft)] hover:bg-[color:var(--paper-bg-deep)]",
          )}
          aria-pressed={current === v.id}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
