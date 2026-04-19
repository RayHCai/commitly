"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LinkItem {
  id: string;
  slug: string;
  title: string | null;
  jobUrl: string | null;
  type: string;
  createdAt: string;
  viewCount: number;
  lastViewedAt: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function displayUrl(slug: string, username: string, type: string): string {
  if (type === "GENERAL") return `commitly.io/${username}`;
  return `commitly.io/${username}/${slug}`;
}

function NewLinkModal({
  link,
  username,
  onClose,
}: {
  link: LinkItem;
  username: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const url = displayUrl(link.slug, username, link.type);
  const fullUrl = `https://${url}`;
  const href = link.type === "GENERAL" ? `/${username}` : `/${username}/${link.slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md px-6">
        <div className="rounded-xl border border-[var(--paper-line)] bg-background p-6 shadow-lg">
          <p className="font-serif text-2xl tracking-tight text-[color:var(--ink)]">
            Link ready.
          </p>
          {link.title && (
            <p className="mt-1 font-mono text-[12px] text-[color:var(--code-comment)]">
              {link.title}
            </p>
          )}

          <div className="relative mt-5 flex items-center">
            <input
              readOnly
              value={url}
              className="h-10 w-full rounded-md border border-[var(--paper-line)] bg-[var(--surface)] px-3 pr-16 font-mono text-[12px] text-[color:var(--ink)] outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "absolute right-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                copied
                  ? "text-[color:var(--code-string)]"
                  : "text-[color:var(--code-comment)] hover:text-[color:var(--ink)]",
              )}
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] text-[color:var(--code-comment)] underline-offset-2 transition-colors hover:text-[color:var(--ink)] hover:underline"
            >
              view ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[12px] text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
            >
              close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newLinkId = searchParams.get("newLinkId");

  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState("");
  const [modalLink, setModalLink] = React.useState<LinkItem | null>(null);
  const [creatingGeneral, setCreatingGeneral] = React.useState(false);

  React.useEffect(() => {
    try {
      const token = localStorage.getItem("commitly_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username ?? "");
      }
    } catch {}

    apiFetch<{ data: LinkItem[] }>("/links")
      .then((res) => {
        setLinks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Once links load, open modal for newly created link and strip the query param
  React.useEffect(() => {
    if (loading || !newLinkId) return;
    const found = links.find((l) => l.id === newLinkId);
    if (found) {
      setModalLink(found);
    }
    // Remove the query param so a refresh doesn't re-open the modal
    router.replace("/dashboard", { scroll: false });
  }, [loading, newLinkId, links, router]);

  const hasGeneralLink = links.some((l) => l.type === "GENERAL");

  async function handleCreateGeneral() {
    setCreatingGeneral(true);
    try {
      const res = await apiFetch<{ data: { id: string; status: string; existed?: boolean } }>(
        "/links/general/create",
        { method: "POST" },
      );
      if (res.data.existed) {
        // Already active, just refresh
        const updated = await apiFetch<{ data: LinkItem[] }>("/links");
        setLinks(updated.data);
      } else {
        // Pending — poll until it becomes active
        const linkId = res.data.id;
        const poll = setInterval(async () => {
          try {
            const updated = await apiFetch<{ data: LinkItem[] }>("/links");
            const general = updated.data.find((l) => l.id === linkId);
            if (general) {
              clearInterval(poll);
              setLinks(updated.data);
              setModalLink(general);
              setCreatingGeneral(false);
            }
          } catch {}
        }, 3000);
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(poll);
          setCreatingGeneral(false);
        }, 120000);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create general link";
      setError(msg);
    }
    setCreatingGeneral(false);
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-[var(--paper-line-soft)] px-2 py-4">
            <div className="h-[18px] w-52 animate-pulse rounded-sm bg-[var(--paper-bg)]" />
            <div className="mt-2.5 h-3 w-36 animate-pulse rounded-sm bg-[var(--paper-bg)]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-[13px] text-[color:var(--code-comment)]">
          {error}
        </p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="font-serif text-2xl tracking-tight text-[color:var(--ink)]">
          No links yet.
        </p>
        <p className="font-mono text-[13px] text-[color:var(--code-comment)]">
          Click + to create one.
        </p>
        <button
          type="button"
          onClick={handleCreateGeneral}
          disabled={creatingGeneral}
          className="mt-4 rounded-md border border-[var(--paper-line)] px-4 py-2 font-mono text-[12px] text-[color:var(--code-comment)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[color:var(--ink)] disabled:opacity-50"
        >
          {creatingGeneral ? "creating…" : "create general link"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col pt-4">
        {!hasGeneralLink && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-dashed border-[var(--paper-line)] px-4 py-3">
            <p className="font-mono text-[12px] text-[color:var(--code-comment)]">
              No general profile link found.
            </p>
            <button
              type="button"
              onClick={handleCreateGeneral}
              disabled={creatingGeneral}
              className="rounded-md border border-[var(--paper-line)] px-3 py-1.5 font-mono text-[12px] text-[color:var(--code-comment)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[color:var(--ink)] disabled:opacity-50"
            >
              {creatingGeneral ? "creating…" : "create general link"}
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {links.map((link) => (
            <div
              key={link.id}
              className="border-b border-[var(--paper-line-soft)] px-2 py-4 transition-colors hover:bg-[var(--surface-subtle)]"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[17px] leading-snug tracking-tight text-[color:var(--ink)]">
                    {link.title ?? link.slug}
                  </p>
                  <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-[color:var(--code-comment)]">
                    {formatDate(link.createdAt)}
                    {"  ·  "}
                    <a
                      href={link.type === "GENERAL" ? `/${username}` : `/${username}/${link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--code-comment)] underline-offset-2 transition-colors hover:text-[color:var(--ink)] hover:underline"
                    >
                      {displayUrl(link.slug, username, link.type)}
                    </a>
                  </p>
                </div>
                <div className="flex shrink-0 items-baseline gap-6 pt-0.5 font-mono text-[12px] text-[color:var(--code-comment)]">
                  <span className="tabular-nums">
                    {link.viewCount} {link.viewCount === 1 ? "view" : "views"}
                  </span>
                  <span className="w-[4.5rem] text-right tabular-nums">
                    {link.lastViewedAt
                      ? formatRelative(link.lastViewedAt)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalLink && (
        <NewLinkModal
          link={modalLink}
          username={username}
          onClose={() => setModalLink(null)}
        />
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense>
      <DashboardContent />
    </React.Suspense>
  );
}
