"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type {
  JobContext,
  RecruiterTopSkill,
  RecruiterUser,
} from "@/lib/mockData";
import {
  EXPLORER_TOTAL_COMMITS,
  EXPLORER_TOTAL_REPOS,
  lookupExplorerBySha,
  type CommitComplexity,
} from "@/lib/commit-explorer-data";

import { skillColorVar } from "./code-color";
import { SkillCommitPair } from "./skill-commit-pair";

const ORB_SIZE: Record<CommitComplexity, number> = {
  Low: 14,
  Medium: 22,
  High: 32,
};

export function CanvasView({
  slug,
  user,
  job,
  skills,
}: {
  slug: string;
  user: RecruiterUser;
  job: JobContext;
  skills: RecruiterTopSkill[];
}) {
  const [focused, setFocused] = React.useState<string>(skills[0]?.name ?? "");

  const focusedSkill = skills.find((s) => s.name === focused) ?? skills[0];

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-8 md:px-10 md:pt-12">
      {/* Minimal one-line header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--paper-line)] pb-5">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[22px] leading-none tracking-tight text-[color:var(--ink)]">
            {user.fullName}
          </span>
          <span className="font-mono text-[12px] text-[color:var(--code-comment)]">
            →
          </span>
          <span className="font-mono text-[13px] text-[color:var(--ink-soft)]">
            {job.roleTitle}{" "}
            <span className="text-[color:var(--ink-muted)]">@</span>{" "}
            {job.company}
          </span>
        </div>
        <nav className="flex gap-4 font-mono text-[11px]" aria-label="Profile links">
          <a
            href={user.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--ink-soft)] underline-offset-4 hover:text-[color:var(--code-fn)] hover:underline"
          >
            resume
          </a>
          <a
            href={user.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--ink-soft)] underline-offset-4 hover:text-[color:var(--code-fn)] hover:underline"
          >
            linkedin
          </a>
          <a
            href={user.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--ink-soft)] underline-offset-4 hover:text-[color:var(--code-fn)] hover:underline"
          >
            github
          </a>
        </nav>
      </header>

      <p className="mt-6 font-mono text-[11px] text-[color:var(--code-comment)]">
        {"// each orb is a commit · size = complexity · hover to inspect · click a label to focus"}
      </p>

      {/* Canvas */}
      <div className="relative mt-6 rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)]/30 p-6 md:p-10">
        <div
          className="relative grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${skills.length}, minmax(0, 1fr))`,
          }}
        >
          {/* Time-axis label */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-1 top-16 flex h-[340px] flex-col justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
            style={{ writingMode: "vertical-rl" }}
          >
            <span>newest</span>
            <span>oldest</span>
          </div>

          {skills.map((skill) => {
            const isFocused = skill.name === focused;
            const dimmed = focused && !isFocused;
            return (
              <div
                key={skill.name}
                className={cn(
                  "flex flex-col items-center gap-2 transition-opacity duration-300",
                  dimmed && "opacity-35",
                )}
              >
                <button
                  type="button"
                  onClick={() => setFocused(skill.name)}
                  className={cn(
                    "font-mono text-[12px] font-medium transition-all",
                    isFocused && "scale-110",
                  )}
                  style={{ color: skillColorVar(skill.name) }}
                >
                  {skill.name.toLowerCase().replace(/\s+/g, "_")}
                </button>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
                  {skill.requiredLevel === "Required" ? "required" : "relevant"}
                </span>

                {/* Vertical track with orbs */}
                <div className="relative mt-2 flex h-[340px] w-full flex-col items-center justify-start">
                  {/* connecting line */}
                  <div
                    className="absolute top-0 h-full w-px"
                    style={{
                      background: `linear-gradient(to bottom, ${skillColorVar(skill.name)}, transparent)`,
                      opacity: isFocused ? 0.6 : 0.25,
                    }}
                    aria-hidden
                  />
                  {skill.commits.map((c, idx) => {
                    const ex = lookupExplorerBySha(c.commitSha);
                    const size = ex ? ORB_SIZE[ex.complexity] : 18;
                    const top = 16 + idx * 110;
                    return (
                      <Orb
                        key={c.commitSha}
                        top={top}
                        size={size}
                        color={skillColorVar(skill.name)}
                        commit={c}
                        stats={ex}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focused skill detail card */}
      <AnimatePresence mode="wait">
        {focusedSkill && (
          <motion.div
            key={focusedSkill.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            className="mt-8"
          >
            <SkillCommitPair
              skill={focusedSkill}
              layout="floating"
              defaultExpanded
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between border-t border-[color:var(--paper-line)] pt-5">
        <Link
          href={`/c/${slug}/commits`}
          className="inline-flex items-center gap-2 font-mono text-[12px] text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--code-fn)]"
        >
          <span className="text-[color:var(--code-comment)]">{"//"}</span>
          explore all {EXPLORER_TOTAL_COMMITS} commits across{" "}
          {EXPLORER_TOTAL_REPOS} repos
          <span aria-hidden>→</span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
          © 2026
        </span>
      </div>
    </main>
  );
}

function Orb({
  top,
  size,
  color,
  commit,
  stats,
}: {
  top: number;
  size: number;
  color: string;
  commit: RecruiterTopSkill["commits"][number];
  stats: ReturnType<typeof lookupExplorerBySha>;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <a
        href={commit.commitUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${commit.projectName} — ${commit.date}`}
        className="block rounded-full transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: hover
            ? `0 0 0 6px ${color}22, 0 4px 10px rgba(0,0,0,0.08)`
            : `0 0 0 2px ${color}18`,
        }}
      />
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-[calc(100%+10px)] z-20 w-[240px] -translate-x-1/2 rounded-[6px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)] p-3 font-mono text-[11px] shadow-[0_8px_24px_rgba(26,26,23,0.12)]"
          >
            <p className="truncate text-[color:var(--ink-soft)]">
              <span style={{ color }}>{commit.commitSha}</span>
              <span className="mx-1 text-[color:var(--code-comment)]">·</span>
              <span>{commit.projectName}</span>
            </p>
            <p className="mt-1 text-[color:var(--ink-muted)]">{commit.date}</p>
            {stats && (
              <p className="mt-2 flex gap-2">
                <span style={{ color: "var(--code-added)" }}>
                  +{stats.linesAdded}
                </span>
                <span style={{ color: "var(--code-removed)" }}>
                  −{stats.linesDeleted}
                </span>
                <span className="text-[color:var(--code-comment)]">
                  {stats.filesChanged}f
                </span>
              </p>
            )}
            <p className="mt-2 text-[10.5px] leading-[1.5] text-[color:var(--ink)]">
              {commit.description.length > 120
                ? `${commit.description.slice(0, 117)}…`
                : commit.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
