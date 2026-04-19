"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCommitIndex((i) => (i - 1 + total) % total);
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

  const renderCard = (
    c: RecruiterTopSkill["commits"][number],
    isCenter: boolean,
  ) => (
    <div
      className="relative h-full rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
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
              <span className="text-[color:var(--code-comment)]">commit</span>
              <span
                className="truncate font-medium font-mono"
                style={{ color: "var(--code-fn)" }}
              >
                {c.commitSha}
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
            {c.projectName}
          </span>
        </div>
        <span className="shrink-0 text-[color:var(--ink-muted)]">{c.date}</span>
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
        {c.description}
      </p>

      {/* Stats — full variant, center only */}
      {isCenter && stats && <div className="mt-3">{stats}</div>}

      {/* Why this matters — reveals on hover, center only */}
      {isCenter && (
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
                      {c.whyThisMatters}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
                      {"// why it matters"}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-[color:var(--ink-soft)]">
                      {c.whyThisMatters}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Footer — center card only */}
      {isCenter && (
        <div className="mt-4 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5"
            role={canCarousel ? "tablist" : undefined}
            aria-label={canCarousel ? `Commits for ${skill.name}` : undefined}
          >
            {skill.commits.map((cc, i) => {
              const active = i === commitIndex;
              if (canCarousel) {
                return (
                  <button
                    key={cc.commitSha}
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
              if (i === 0) return null;
              return (
                <span
                  key={cc.commitSha}
                  className="inline-block size-[6px] rounded-full"
                  style={{ backgroundColor: accent, opacity: 0.35 }}
                  title={`${cc.projectName} · ${cc.date}`}
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
            href={c.commitUrl}
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
      )}
    </div>
  );

  const commit = canCarousel ? (
    <div className="relative">
      {/* Clipped stage — peeks cut off at the column edges */}
      <div className="relative overflow-hidden">
        {/* Height spacer — centered, matches the center card width */}
        <div
          className="invisible pointer-events-none mx-auto"
          style={{ width: "68%" }}
          aria-hidden
        >
          {renderCard(displayed, true)}
        </div>

        {/* Carousel cards — each a fixed-width card, horizontally translated per slot */}
        {skill.commits.map((c, i) => {
          const raw = (i - commitIndex + total) % total;
          const slot = raw > total / 2 ? raw - total : raw;
          const isCenter = slot === 0;
          const absSlot = Math.abs(slot);
          // Each card is 68% of container width, positioned at left:50%.
          // x = -50% centers it; each slot step adds 80% of its own width.
          const translateX = -50 + slot * 80;
          return (
            <motion.div
              key={c.commitSha}
              className="absolute top-0"
              style={{
                left: "50%",
                width: "68%",
                transformOrigin: "center",
                pointerEvents: absSlot <= 1 ? "auto" : "none",
                cursor: "pointer",
              }}
              initial={false}
              animate={{
                x: `${translateX}%`,
                scale: isCenter ? 1 : 0.78,
                opacity: isCenter ? 1 : absSlot === 1 ? 0.5 : 0,
                zIndex: isCenter ? 20 : 10 - absSlot,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 30,
                mass: 0.95,
              }}
              onClick={
                isCenter
                  ? undefined
                  : (e) => {
                      e.stopPropagation();
                      setCommitIndex(i);
                    }
              }
            >
              {renderCard(c, isCenter)}
            </motion.div>
          );
        })}
      </div>

      {/* Arrows — sit outside the clipped stage so their shadow isn't cut */}
      <button
        type="button"
        onClick={prev}
        aria-label={`Previous commit for ${skill.name}`}
        className="absolute left-3 top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)]/95 text-[color:var(--ink-muted)] backdrop-blur transition-all hover:border-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      >
        <ChevronLeft className="size-[18px]" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label={`Next commit for ${skill.name}`}
        className="absolute right-3 top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)]/95 text-[color:var(--ink-muted)] backdrop-blur transition-all hover:border-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      >
        <ChevronRight className="size-[18px]" strokeWidth={1.75} />
      </button>
    </div>
  ) : (
    renderCard(displayed, true)
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
