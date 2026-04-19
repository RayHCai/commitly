"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { GitCommitHorizontal, ExternalLink, Download } from "lucide-react";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import { Scene, SceneHeadline } from "@/components/scene/scene";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const EASE: [number, number, number, number] = [0.22, 0.8, 0.26, 1];

const DOT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#A78BFA",
  "#F59E0B",
  "#34D399",
  "#60A5FA",
  "#F472B6",
  "#FB923C",
];

interface MatchedCommit {
  id: string;
  commitSha: string;
  repoName: string;
  url: string;
  message: string;
  tags: string[];
  score: number;
  summary?: string;
  createdAt?: string;
}

interface Requirement {
  id: string;
  name: string;
  description: string;
  matchedCommits: MatchedCommit[];
}

interface ProfileData {
  linkId: string;
  title: string;
  type: string;
  user: {
    username: string;
    avatarUrl: string | null;
    linkedinUrl: string | null;
    resumeUrl: string | null;
  };
  requirements: Requirement[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function CommitCard({
  commit,
  skillName,
  color,
  index,
}: {
  commit: MatchedCommit;
  skillName: string;
  color: string;
  index: number;
}) {
  const title = commit.message.split("\n")[0] || "";
  const summary = commit.summary || "";

  return (
    <motion.a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.04, ease: EASE }}
      className="group relative block overflow-hidden rounded-[10px] border border-[color:var(--paper-line)] p-4 transition-all duration-200 hover:border-[color:var(--ink-muted)]/30 hover:bg-[color:var(--paper-bg-deep)]"
    >
      {/* Colored accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-[10px]"
        style={{ backgroundColor: color }}
      />

      <div className="pl-3">
        {/* Skill tag */}
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-widest"
          style={{ color: `${color}99` }}
        >
          {skillName}
        </p>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="text-[13px] font-medium leading-snug"
              style={{ color: "var(--ink)" }}
            >
              {title.length > 72 ? title.slice(0, 72) + "…" : title}
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
            {commit.repoName} · {commit.commitSha.slice(0, 7)}
            {commit.createdAt && ` · ${formatDate(commit.createdAt)}`}
          </p>
        </div>
      </div>
    </motion.a>
  );
}

export default function GeneralProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [data, setData] = React.useState<ProfileData | null>(null);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API_BASE}/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((json) => setData(json.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

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
            {"// 404 — profile not found"}
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

  // Flatten all commits across requirements, attaching skill name + color
  const allCommits = data.requirements.flatMap((req, reqIdx) =>
    req.matchedCommits.map((commit) => ({
      commit,
      skillName: req.name,
      color: DOT_COLORS[reqIdx % DOT_COLORS.length]!,
    })),
  );

  return (
    <PaperSurface>
      <Scene eyebrow="general profile" fullViewport={false}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {data.user.avatarUrl && (
              <img
                src={data.user.avatarUrl}
                alt={data.user.username}
                className="size-14 rounded-full border border-[color:var(--paper-line)]"
              />
            )}
            <SceneHeadline as="h1" size="md">
              {data.user.username}
            </SceneHeadline>
          </div>

          <div className="flex items-center gap-1.5">
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
        </div>

        {/* Commit grid */}
        {allCommits.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allCommits.map(({ commit, skillName, color }, i) => (
              <CommitCard
                key={commit.id}
                commit={commit}
                skillName={skillName}
                color={color}
                index={i}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 font-mono text-[12px] text-[color:var(--code-comment)]">
            {"// no commits analyzed yet — check back soon"}
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
