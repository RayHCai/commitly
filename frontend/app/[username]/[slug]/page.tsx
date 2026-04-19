"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { GitCommitHorizontal, ExternalLink, ChevronLeft, ChevronRight, Download } from "lucide-react";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import { Scene, SceneHeadline, SceneSubheading } from "@/components/scene/scene";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const EASE: [number, number, number, number] = [0.22, 0.8, 0.26, 1];

const DOT_COLORS = [
  "#FF6B6B", // coral
  "#4ECDC4", // teal
  "#A78BFA", // violet
  "#F59E0B", // amber
  "#34D399", // emerald
  "#60A5FA", // sky blue
  "#F472B6", // pink
  "#FB923C", // orange
];

interface MatchedCommit {
  id: string;
  commitSha: string;
  repoName: string;
  url: string;
  message: string;
  diff: string;
  tags: string[];
  score: number;
  summary: string;
  createdAt: string;
}

interface Requirement {
  id: string;
  name: string;
  description: string;
  matchedCommits: MatchedCommit[];
}

interface LinkData {
  linkId: string;
  slug: string;
  title: string | null;
  targetUrl: string | null;
  jobUrl: string | null;
  type: "JOB" | "GENERAL";
  user: {
    username: string;
    avatarUrl: string | null;
    linkedinUrl: string | null;
    resumeUrl: string | null;
  };
  requirements: Requirement[];
}

function parseTitle(title: string | null): { roleTitle: string; company: string } {
  if (!title) return { roleTitle: "Role", company: "" };
  const match = title.match(/^(.+?)\s+at\s+(.+)$/i);
  if (match) return { roleTitle: match[1]!, company: match[2]! };
  return { roleTitle: title, company: "" };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function CommitCarousel({
  commits,
  color,
}: {
  commits: MatchedCommit[];
  color: string;
}) {
  const [idx, setIdx] = React.useState(0);

  if (commits.length === 0) return null;

  const commit = commits[idx]!;
  const title = commit.message.split("\n")[0] || "";
  const summary = commit.summary || "";

  function prev() {
    setIdx((i) => (i - 1 + commits.length) % commits.length);
  }

  function next() {
    setIdx((i) => (i + 1) % commits.length);
  }

  return (
    <div className="relative">
      {/* Prev arrow — sits on the left edge of the card */}
      {commits.length > 1 && (
        <button
          type="button"
          onClick={prev}
          className="absolute -left-4 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)] shadow-sm transition-colors hover:bg-[color:var(--paper-bg-deep)]"
          aria-label="Previous commit"
        >
          <ChevronLeft className="size-3.5 text-[color:var(--code-comment)]" strokeWidth={1.75} />
        </button>
      )}

      <a
        href={commit.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-[10px] border border-[color:var(--paper-line)] p-4 transition-all duration-200 hover:border-[color:var(--ink-muted)]/30 hover:bg-[color:var(--paper-bg-deep)]"
      >
        {/* Colored accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-[3px] rounded-l-[10px]"
          style={{ backgroundColor: color }}
        />

        <div className="pl-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-[13px] font-medium leading-snug"
                style={{ color: "var(--ink)" }}
              >
                {title.length > 80 ? title.slice(0, 80) + "…" : title}
              </p>
              {summary && (
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[color:var(--ink-muted)]">
                  {summary}
                </p>
              )}
            </div>
            <ExternalLink
              className="mt-0.5 size-3.5 shrink-0 text-[color:var(--code-comment)] opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={1.75}
            />
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <GitCommitHorizontal
              className="size-3.5 shrink-0"
              strokeWidth={1.75}
              style={{ color }}
            />
            <p className="font-mono text-[11px] text-[color:var(--code-comment)]">
              {commit.repoName} · {commit.commitSha.slice(0, 7)} · {formatDate(commit.createdAt)}
            </p>
          </div>
        </div>
      </a>

      {/* Next arrow — sits on the right edge of the card */}
      {commits.length > 1 && (
        <button
          type="button"
          onClick={next}
          className="absolute -right-4 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)] shadow-sm transition-colors hover:bg-[color:var(--paper-bg-deep)]"
          aria-label="Next commit"
        >
          <ChevronRight className="size-3.5 text-[color:var(--code-comment)]" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

function RequirementRow({
  requirement,
  index,
}: {
  requirement: Requirement;
  index: number;
}) {
  const color = DOT_COLORS[index % DOT_COLORS.length]!;
  const commits = requirement.matchedCommits;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + index * 0.08, ease: EASE }}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8"
    >
      {/* Left: dot + requirement info */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Colorful dot */}
        <div
          className="mt-[6px] size-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 0 3px ${color}25`,
          }}
        />
        <div className="min-w-0">
          <h3
            className="font-serif text-[18px] leading-tight tracking-tight md:text-[20px]"
            style={{ color: "var(--ink)" }}
          >
            {requirement.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--ink-muted)]">
            {requirement.description}
          </p>
        </div>
      </div>

      {/* Right: commit carousel */}
      <div className="w-full shrink-0 sm:w-[300px] md:w-[340px]" style={{ paddingInline: "18px" }}>
        {commits.length > 0 ? (
          <CommitCarousel commits={commits} color={color} />
        ) : (
          <p className="font-mono text-[11px] text-[color:var(--code-comment)]">
            {"// no commits matched yet"}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function LinkPage() {
  const params = useParams<{ username: string; slug: string }>();
  const { username, slug } = params;

  const [data, setData] = React.useState<LinkData | null>(null);
  const [error, setError] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API_BASE}/${username}/${slug}`)
      .then((res) => {
        if (!res.ok) {
          setError(res.status);
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => setData(json.data))
      .catch(() => {
        if (!error) setError(404);
      })
      .finally(() => setLoading(false));
  }, [username, slug]);

  if (loading) {
    return (
      <PaperSurface>
        <div className="flex min-h-screen items-center justify-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
            {"// loading..."}
          </p>
        </div>
      </PaperSurface>
    );
  }

  if (error || !data) {
    return (
      <PaperSurface>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="font-mono text-[14px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
            {"// 404 — link not found"}
          </p>
          <Link
            href="/"
            className="font-mono text-[12px] text-[color:var(--code-fn)] underline-offset-4 hover:underline"
          >
            go home
          </Link>
        </div>
      </PaperSurface>
    );
  }

  const { roleTitle, company } = parseTitle(data.title);
  const visibleRequirements = data.requirements.filter(
    (r) => r.matchedCommits.length > 0,
  );
  const totalCommits = visibleRequirements.reduce(
    (sum, r) => sum + r.matchedCommits.length,
    0,
  );

  return (
    <PaperSurface>
      <Scene eyebrow="skill match" fullViewport={false}>
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            {data.user.avatarUrl && (
              <img
                src={data.user.avatarUrl}
                alt={data.user.username}
                className="size-14 rounded-full border border-[color:var(--paper-line)]"
              />
            )}
            <div>
              <SceneHeadline as="h1" size="md">
                {data.user.username}
              </SceneHeadline>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 md:items-end md:text-right">
            <div className="mb-2 flex items-center gap-1.5 md:justify-end">
              {data.user.linkedinUrl && (
                <a
                  href={data.user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-7 items-center justify-center rounded-md border border-[color:var(--paper-line)] text-[color:var(--ink-muted)] transition-colors hover:border-[color:var(--code-fn)]/40 hover:text-[color:var(--code-fn)]"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
              <a
                href={`https://github.com/${data.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-7 items-center justify-center rounded-md border border-[color:var(--paper-line)] text-[color:var(--ink-muted)] transition-colors hover:border-[color:var(--code-fn)]/40 hover:text-[color:var(--code-fn)]"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              {data.user.resumeUrl && (
                <a
                  href={data.user.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-7 items-center justify-center rounded-md border border-[color:var(--paper-line)] text-[color:var(--ink-muted)] transition-colors hover:border-[color:var(--code-fn)]/40 hover:text-[color:var(--code-fn)]"
                  aria-label="Download resume"
                >
                  <Download className="size-3.5" strokeWidth={1.75} />
                </a>
              )}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
              {"// applying for"}
            </p>
            <p
              className="font-serif text-[22px] leading-tight tracking-tight md:text-[26px]"
              style={{ color: "var(--ink)" }}
            >
              {roleTitle}
              {company && (
                <>
                  {" "}
                  <span className="text-[color:var(--ink-muted)]">at</span>{" "}
                  {company}
                </>
              )}
            </p>
          </div>
        </div>

        <SceneSubheading>
          {visibleRequirements.length} skills matched across {totalCommits} commits.
        </SceneSubheading>

        {/* Requirements */}
        <div className="mt-10 flex flex-col divide-y divide-[color:var(--paper-line-soft)]">
          {visibleRequirements.map((req, i) => (
            <div key={req.id} className={i === 0 ? "pb-8" : i === visibleRequirements.length - 1 ? "pt-8" : "py-8"}>
              <RequirementRow requirement={req} index={i} />
            </div>
          ))}
        </div>

        {visibleRequirements.length === 0 && (
          <p className="mt-10 font-mono text-[12px] text-[color:var(--code-comment)]">
            {"// no skills matched yet — check back soon"}
          </p>
        )}

        {/* Footer */}
        <footer className="mt-20 flex items-center justify-between border-t border-[color:var(--paper-line)] pt-6 font-mono text-[11px] text-[color:var(--code-comment)]">
          <Link
            href="/"
            className="underline-offset-4 hover:text-[color:var(--ink)] hover:underline"
          >
            built on commitly
          </Link>
          <span>&copy; {new Date().getFullYear()}</span>
        </footer>
      </Scene>
    </PaperSurface>
  );
}
