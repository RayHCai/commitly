"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RecruiterTopSkill } from "@/lib/mockData";
import { lookupExplorerBySha } from "@/lib/commit-explorer-data";
import { skillColorVar } from "./code-color";

type Layout = "row" | "stack" | "floating";
type Variant = "full" | "clean";

export function SkillCommitPair({
  skill,
  layout = "row",
  variant = "full",
  index = 0,
  defaultExpanded = false,
  className,
}: {
  skill: RecruiterTopSkill;
  layout?: Layout;
  variant?: Variant;
  index?: number;
  defaultExpanded?: boolean;
  className?: string;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [hovered, setHovered] = React.useState(false);
  const [commitIndex, setCommitIndex] = React.useState(0);
  const accent = skillColorVar(skill.name);
  const total = skill.commits.length;

  if (total === 0) return null;

  const isClean = variant === "clean";
  const canCarousel = isClean && total > 1;
  const displayed = skill.commits[commitIndex] ?? skill.commits[0]!;
  const explorer = !isClean ? lookupExplorerBySha(displayed.commitSha) : null;

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCommitIndex((i) => (i + 1) % total);
  };
  const goTo = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommitIndex(i);
  };

  const header = (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span
          aria-hidden
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span
          className="font-mono text-[13px] font-medium tracking-tight"
          style={{ color: accent }}
        >
          {skill.name.toLowerCase().replace(/\s+/g, "_")}
        </span>
        {!isClean && (
          <span className="font-mono text-[11px] text-[color:var(--code-comment)]">
            {"// "}
            {skill.requiredLevel === "Required" ? "required" : "relevant"}
          </span>
        )}
      </div>
      {!isClean && (
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
          {skill.pillMutedText}
        </p>
      )}
    </div>
  );

  const stats =
    explorer && !isClean ? (
      <div className="flex items-center gap-3 font-mono text-[11px]">
        <span style={{ color: "var(--code-added)" }}>
          +{explorer.linesAdded}
        </span>
        <span style={{ color: "var(--code-removed)" }}>
          −{explorer.linesDeleted}
        </span>
        <span className="text-[color:var(--code-comment)]">
          {explorer.filesChanged} files
        </span>
        <span
          className="inline-flex items-center gap-1 text-[color:var(--ink-muted)]"
          title={`Complexity: ${explorer.complexity}`}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block size-[6px] rounded-full",
              explorer.complexity === "High" && "bg-[color:var(--code-attr)]",
              explorer.complexity === "Medium" && "bg-[color:var(--code-number)]",
              explorer.complexity === "Low" && "bg-[color:var(--code-comment)]",
            )}
          />
          {explorer.complexity.toLowerCase()}
        </span>
      </div>
    ) : null;

  const cardInner = (
    <div
      className="relative rounded-[6px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)]/60 backdrop-blur-[1px] p-5"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.02)" }}
    >
      {/* Project + date strip */}
          <div
            className={cn(
              "mb-3 flex items-center justify-between border-b border-[color:var(--paper-line-soft)] pb-2.5",
              isClean ? "text-[12px]" : "font-mono text-[11px]",
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {!isClean && (
                <>
                  <span className="text-[color:var(--code-comment)]">
                    commit
                  </span>
                  <span
                    className="truncate font-medium font-mono"
                    style={{ color: "var(--code-fn)" }}
                  >
                    {displayed.commitSha}
                  </span>
                  <span className="text-[color:var(--code-comment)]">·</span>
                </>
              )}
              <span
                className={cn(
                  "truncate",
                  isClean
                    ? "font-medium text-[color:var(--ink)]"
                    : "text-[color:var(--ink-soft)]",
                )}
              >
                {displayed.projectName}
              </span>
            </div>
            <span className="shrink-0 text-[color:var(--ink-muted)]">
              {displayed.date}
            </span>
          </div>

          {/* Description */}
          <p
            className={cn(
              isClean
                ? "font-sans text-[15px] leading-[1.55] text-[color:var(--ink)]"
                : "font-mono text-[12.5px] leading-[1.55] text-[color:var(--ink)]",
            )}
          >
            {!isClean && (
              <span style={{ color: "var(--code-comment)" }}>{">"} </span>
            )}
            {displayed.description}
          </p>

          {/* Stats row — full mode only */}
          {stats && <div className="mt-3">{stats}</div>}

          {/* Why this matters — reveals on hover */}
          <AnimatePresence initial={false}>
            {(hovered || expanded) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t border-dashed border-[color:var(--paper-line-soft)] pt-3">
                  {isClean ? (
                    <>
                      <p className="font-serif text-[12px] italic text-[color:var(--ink-muted)]">
                        Why this matters
                      </p>
                      <p className="mt-1.5 font-sans text-[14px] leading-[1.55] text-[color:var(--ink-soft)]">
                        {displayed.whyThisMatters}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
                        {"// why it matters"}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-[1.55] text-[color:var(--ink-soft)]">
                        {displayed.whyThisMatters}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      {/* Footer: position indicators + github link */}
      <div className="mt-4 flex items-center justify-between">
        <div
          className="flex items-center gap-1.5"
          role={canCarousel ? "tablist" : undefined}
          aria-label={canCarousel ? `Commits for ${skill.name}` : undefined}
        >
          {skill.commits.map((c, i) => {
            const active = i === commitIndex;
            if (canCarousel) {
              return (
                <button
                  key={c.commitSha}
                  type="button"
                  onClick={(e) => goTo(i, e)}
                  aria-label={`Commit ${i + 1} of ${total}`}
                  aria-selected={active}
                  role="tab"
                  className="group flex size-4 items-center justify-center rounded-full"
                >
                  <span
                    className="inline-block rounded-full transition-all"
                    style={{
                      backgroundColor: accent,
                      opacity: active ? 1 : 0.3,
                      width: active ? 18 : 6,
                      height: 6,
                    }}
                  />
                </button>
              );
            }
            // non-carousel: keep static dots (skip first; it's the anchor)
            if (i === 0) return null;
            return (
              <span
                key={c.commitSha}
                className="inline-block size-[6px] rounded-full"
                style={{ backgroundColor: accent, opacity: 0.35 }}
                title={`${c.projectName} · ${c.date}`}
                aria-hidden
              />
            );
          })}
          {!isClean && total > 1 && (
            <span className="ml-1 font-mono text-[10px] text-[color:var(--code-comment)]">
              +{total - 1} more
            </span>
          )}
        </div>

        <a
          href={displayed.commitUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "transition-colors",
            isClean
              ? "text-[12px] text-[color:var(--ink-muted)] underline-offset-4 hover:text-[color:var(--ink)] hover:underline"
              : "font-mono text-[11px] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]",
          )}
        >
          {isClean ? "View on GitHub →" : "view on github →"}
        </a>
      </div>
    </div>
  );

  const commit = canCarousel ? (
    <div className="flex items-stretch gap-4">
      <div className="relative flex-1">
        {/* Back card — deepest layer of the stack */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 translate-x-[10px] translate-y-[10px] rounded-[6px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)]/55"
        />
        {/* Middle card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-[6px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)]/80"
        />
        {/* Front card — smooth right-slide shuffle on change */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={displayed.commitSha}
            initial={{ x: 10, y: 10, opacity: 0, scale: 0.97 }}
            animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            exit={{ x: 180, opacity: 0 }}
            transition={{
              duration: 0.38,
              ease: [0.22, 0.8, 0.26, 1],
            }}
            className="relative"
          >
            {cardInner}
          </motion.div>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={next}
        aria-label={`Next commit for ${skill.name}`}
        className="flex size-11 shrink-0 self-center items-center justify-center rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)] text-[color:var(--ink-muted)] transition-all hover:-translate-y-px hover:border-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
      >
        <ChevronRight className="size-[18px]" strokeWidth={1.75} />
      </button>
    </div>
  ) : (
    cardInner
  );

  if (layout === "stack") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.06,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded((v) => !v)}
        className={cn("flex flex-col gap-3 cursor-pointer", className)}
      >
        {header}
        {commit}
      </motion.div>
    );
  }

  if (layout === "floating") {
    return (
      <div
        className={cn("flex flex-col gap-3", className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {header}
        {commit}
      </div>
    );
  }

  // row layout (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      className={cn(
        "group grid cursor-pointer grid-cols-1 gap-5 md:grid-cols-[minmax(180px,38%)_1fr] md:gap-8",
        className,
      )}
    >
      <div className="md:pt-1">{header}</div>
      {commit}
    </motion.div>
  );
}
