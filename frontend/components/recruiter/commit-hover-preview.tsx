"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type CommitPreviewPayload = {
  sha: string;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  dateTime: string;
  url: string;
};

export function CommitHoverPreview({
  open,
  anchorRef,
  payload,
  onPointerEnter,
  onPointerLeave,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  payload: CommitPreviewPayload | null;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [layout, setLayout] = React.useState<{
    left: number;
    top: number;
    transform: string;
  }>({ left: 0, top: 0, transform: "translate(-50%, -100%)" });

  const updateLayout = React.useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!open || !anchor || !panel) return;
    const rect = anchor.getBoundingClientRect();
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight || 168;
    let left = rect.left + rect.width / 2;
    left = Math.max(
      pw / 2 + 12,
      Math.min(left, window.innerWidth - pw / 2 - 12)
    );
    let top = rect.top - 8;
    let transform = "translate(-50%, -100%)";
    if (rect.top - ph < 12) {
      top = rect.bottom + 8;
      transform = "translate(-50%, 0)";
    }
    setLayout({ left, top, transform });
  }, [anchorRef, open]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updateLayout();
    const id = requestAnimationFrame(updateLayout);
    window.addEventListener("scroll", updateLayout, true);
    window.addEventListener("resize", updateLayout);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", updateLayout, true);
      window.removeEventListener("resize", updateLayout);
    };
  }, [open, updateLayout, payload]);

  React.useLayoutEffect(() => {
    if (
      !open ||
      !panelRef.current ||
      typeof ResizeObserver === "undefined"
    )
      return;
    const ro = new ResizeObserver(() => updateLayout());
    ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, [open, updateLayout, payload]);

  if (!open || !payload || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      role="tooltip"
      style={{
        position: "fixed",
        left: layout.left,
        top: layout.top,
        transform: layout.transform,
        zIndex: 100,
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        "w-[min(calc(100vw-24px),20rem)] rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg",
        "pointer-events-auto"
      )}
    >
      <p className="font-mono text-xs text-foreground">{payload.sha}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {payload.filesChanged} files changed
      </p>
      <p className="mt-1 text-xs">
        <span className="font-medium text-emerald-700">
          +{payload.linesAdded}
        </span>
        {" / "}
        <span className="font-medium text-red-600">
          -{payload.linesDeleted}
        </span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{payload.dateTime}</p>
      <a
        href={payload.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block border-t border-border pt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        View on GitHub
      </a>
    </div>,
    document.body
  );
}
