"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Copy,
  Eye,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";

import { DashboardToast } from "@/components/dashboard-toast";
import { ShareModal } from "@/components/ShareModal";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DASHBOARD_SECTION_TITLE,
  DASHBOARD_SECTION_LABEL,
} from "@/lib/dashboard-section-styles";
import {
  linkViews as allLinkViews,
  links as seedLinks,
  type DemoLinkView,
  type DemoSharedLink,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const REF_CATS = ["LinkedIn", "Direct", "Email", "Greenhouse", "Other"] as const;

function publicUrl(slug: string): string {
  if (typeof window === "undefined") return `/c/${slug}`;
  return `${window.location.origin}/c/${slug}`;
}

function displayUrl(slug: string): string {
  return `commitly.io/c/${slug}`;
}

function bucketReferrer(r: string): (typeof REF_CATS)[number] {
  const known = ["LinkedIn", "Direct", "Email", "Greenhouse"] as const;
  return known.includes(r as (typeof known)[number])
    ? (r as (typeof known)[number])
    : "Other";
}

function referrerBreakdown(views: DemoLinkView[]) {
  const counts: Record<(typeof REF_CATS)[number], number> = {
    LinkedIn: 0,
    Direct: 0,
    Email: 0,
    Greenhouse: 0,
    Other: 0,
  };
  for (const v of views) {
    counts[bucketReferrer(v.referrer)] += 1;
  }
  const total = views.length || 1;
  const segments = REF_CATS.filter((k) => counts[k] > 0).map((key) => ({
    key,
    pct: Math.round((counts[key] / total) * 100),
    count: counts[key],
  }));
  const sum = segments.reduce((s, x) => s + x.pct, 0);
  if (segments.length > 0 && sum !== 100) {
    segments[0]!.pct += 100 - sum;
  }
  return { segments, total: views.length };
}

function viewsForLink(linkId: string): DemoLinkView[] {
  return allLinkViews.filter((v) => v.linkId === linkId);
}

function toggleInSet(ids: Set<string>, id: string): Set<string> {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function DashboardLinksSection() {
  const [rows, setRows] = React.useState<DemoSharedLink[]>(() => [...seedLinks]);
  const [toast, setToast] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DemoSharedLink | null>(
    null
  );
  const [sharePayload, setSharePayload] = React.useState<{
    linkUrl: string;
    role: string;
    company: string;
  } | null>(null);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [showAllViewsIds, setShowAllViewsIds] = React.useState<Set<string>>(
    () => new Set()
  );

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => toggleInSet(prev, id));
    setShowAllViewsIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function openShare(row: DemoSharedLink) {
    setSharePayload({
      linkUrl: displayUrl(row.slug),
      role: row.roleTitle,
      company: row.company,
    });
  }

  async function copyLink(slug: string) {
    try {
      await navigator.clipboard.writeText(publicUrl(slug));
      setToast(true);
      window.setTimeout(() => setToast(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteTarget.id);
      return next;
    });
    setShowAllViewsIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteTarget.id);
      return next;
    });
    setDeleteTarget(null);
  }

  function handleRowSurfaceClick(
    e: React.MouseEvent,
    rowId: string
  ): void {
    if ((e.target as HTMLElement).closest("button, a")) return;
    toggleExpanded(rowId);
  }

  function handleChevronClick(e: React.MouseEvent, rowId: string) {
    e.stopPropagation();
    toggleExpanded(rowId);
  }

  const barToneClass = [
    "bg-primary",
    "bg-primary/85",
    "bg-primary/70",
    "bg-primary/55",
    "bg-primary/40",
  ];

  return (
    <>
      <section>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={DASHBOARD_SECTION_LABEL}>YOUR LINKS</p>
            <h2 className={DASHBOARD_SECTION_TITLE}>
              Shared with recruiters.
            </h2>
          </div>
          <Link
            href="/connect"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "shrink-0 gap-2 self-start sm:self-auto"
            )}
          >
            <Plus className="size-4" aria-hidden />
            New link
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-[12px] border border-border bg-card p-12 text-center shadow-card">
            <p className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
              No links yet.
            </p>
            <p className="mt-3 text-[color:var(--text-secondary)]">
              Paste a job posting to generate your first one.
            </p>
            <Link
              href="/connect"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "mt-8 inline-flex rounded-lg px-8"
              )}
            >
              New link
            </Link>
          </div>
        ) : null}

        {rows.length === 0 ? null : (
          <div className="mt-10 flex flex-col gap-4">
            {rows.map((row) => {
              const expanded = expandedIds.has(row.id);
              const views = viewsForLink(row.id);
              const previewCount =
                showAllViewsIds.has(row.id) ? views.length : 5;
              const shownViews = views.slice(0, previewCount);
              const { segments } = referrerBreakdown(views);
              const hasViews = views.length > 0;

              return (
                <div
                  key={row.id}
                  className={cn(
                    "overflow-hidden rounded-[12px] border border-border bg-card transition-colors",
                    "hover:bg-[color-mix(in_oklab,var(--surface-subtle)_55%,transparent)]"
                  )}
                >
                  {/* Desktop row */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRowSurfaceClick(e, row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpanded(row.id);
                      }
                    }}
                    className="hidden cursor-pointer md:flex md:flex-row md:items-center md:gap-6 md:px-6 md:py-5 lg:gap-8"
                  >
                    <div className="min-w-0 flex-[1.05]">
                      <p className="font-semibold text-foreground">
                        {row.roleTitle}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                        {row.company}
                      </p>
                    </div>
                    <div className="min-w-0 flex-[1.25]">
                      <a
                        href={publicUrl(row.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-mono text-sm text-primary underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {displayUrl(row.slug)}
                      </a>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Created {row.createdAt}
                      </p>
                    </div>
                    <div className="shrink-0 basis-[5.25rem]">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Views
                      </p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                        {row.views}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.uniqueViewers} unique
                      </p>
                    </div>
                    <div className="shrink-0 basis-[7rem]">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Last viewed
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {row.lastViewedAt ?? "Never"}
                      </p>
                    </div>
                    <div
                      className="flex min-w-[14rem] shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-2 md:flex-1 md:justify-end lg:min-w-[17rem]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => copyLink(row.slug)}
                      >
                        <Copy className="size-3.5" aria-hidden />
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-8 gap-1 rounded-lg text-xs"
                        onClick={() => openShare(row)}
                      >
                        <Share2 className="size-3.5" aria-hidden />
                        Share
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete link for ${row.roleTitle}`}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={
                          expanded
                            ? "Collapse analytics"
                            : "Expand analytics"
                        }
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        onClick={(e) => handleChevronClick(e, row.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-150 ease-out",
                            expanded && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div
                    className="cursor-pointer space-y-4 p-5 md:hidden"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRowSurfaceClick(e, row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpanded(row.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {row.roleTitle}
                        </p>
                        <p className="mt-0.5 text-sm text-[color:var(--text-secondary)]">
                          {row.company}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={
                          expanded
                            ? "Collapse analytics"
                            : "Expand analytics"
                        }
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60"
                        onClick={(e) => handleChevronClick(e, row.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-150 ease-out",
                            expanded && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <a
                        href={publicUrl(row.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-mono text-xs text-primary underline-offset-2 hover:underline"
                      >
                        {displayUrl(row.slug)}
                      </a>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Created {row.createdAt}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-6 border-t border-border pt-4">
                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Views
                        </p>
                        <p className="mt-1 text-xl font-semibold tabular-nums">
                          {row.views}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.uniqueViewers} unique
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Last viewed
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {row.lastViewedAt ?? "Never"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex flex-wrap gap-2 border-t border-border pt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-9"
                        aria-label="Copy link"
                        onClick={() => copyLink(row.slug)}
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="icon-sm"
                        className="size-9 rounded-lg"
                        aria-label="Share"
                        onClick={() => openShare(row)}
                      >
                        <Share2 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-9 text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.div
                        key={`analytics-${row.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.28,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="overflow-hidden border-t border-border bg-muted/20"
                      >
                        <div className="space-y-6 px-5 py-6 md:px-6 md:py-7">
                          {!hasViews ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
                              <p className="max-w-sm text-sm text-muted-foreground">
                                No views yet. Share your link to start tracking.
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                                onClick={() => openShare(row)}
                              >
                                Share
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Recent views
                              </p>
                              <ul className="space-y-0">
                                {shownViews.map((v, i) => (
                                  <li
                                    key={`${row.id}-${i}-${v.viewedAt}-${v.location}`}
                                    className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                  >
                                    <div className="flex min-w-0 gap-2">
                                      <Eye
                                        className="mt-0.5 size-4 shrink-0 text-primary"
                                        aria-hidden
                                      />
                                      <span className="text-sm text-foreground">
                                        Someone in {v.location} via{" "}
                                        {v.referrer}
                                      </span>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground sm:text-right">
                                      {v.device} · {v.viewedAt}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              {views.length > 5 &&
                              !showAllViewsIds.has(row.id) ? (
                                <button
                                  type="button"
                                  className={cn(
                                    buttonVariants({
                                      variant: "ghost",
                                      size: "sm",
                                    }),
                                    "-mt-1 h-auto px-2 py-1 text-xs text-muted-foreground"
                                  )}
                                  onClick={() =>
                                    setShowAllViewsIds((prev) => {
                                      const next = new Set(prev);
                                      next.add(row.id);
                                      return next;
                                    })
                                  }
                                >
                                  See all {views.length} views
                                </button>
                              ) : null}

                              <div className="space-y-3 pt-2">
                                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Referrers
                                </p>
                                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                                  {segments.length === 0 ? (
                                    <div className="h-full w-full bg-muted-foreground/15" />
                                  ) : (
                                    segments.map((seg, idx) => (
                                      <div
                                        key={seg.key}
                                        className={cn(
                                          barToneClass[
                                            idx % barToneClass.length
                                          ],
                                          "h-full min-w-[6px]"
                                        )}
                                        style={{ flex: `${seg.pct} 1 0%` }}
                                        title={`${seg.key}: ${seg.pct}%`}
                                      />
                                    ))
                                  )}
                                </div>
                                {segments.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">
                                    No referrer data for this link yet.
                                  </p>
                                ) : null}
                                {segments.length > 0 ? (
                                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                                    {segments.map((seg, idx) => (
                                      <li
                                        key={seg.key}
                                        className="flex items-center gap-2"
                                      >
                                        <span
                                          className={cn(
                                            "size-2 shrink-0 rounded-full",
                                            barToneClass[
                                              idx % barToneClass.length
                                            ]
                                          )}
                                        />
                                        <span className="text-foreground">
                                          {seg.key}
                                        </span>
                                        <span>{seg.pct}%</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setExpandedIds((prev) => {
                                const next = new Set(prev);
                                next.delete(row.id);
                                return next;
                              });
                              setShowAllViewsIds((prev) => {
                                const next = new Set(prev);
                                next.delete(row.id);
                                return next;
                              });
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this link?</DialogTitle>
            <DialogDescription>
              It will no longer be viewable by recruiters.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={false} className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareModal
        isOpen={sharePayload !== null}
        onClose={() => setSharePayload(null)}
        linkUrl={sharePayload?.linkUrl ?? ""}
        role={sharePayload?.role ?? ""}
        company={sharePayload?.company ?? ""}
      />

      <DashboardToast show={toast} message="Link copied." />
    </>
  );
}
