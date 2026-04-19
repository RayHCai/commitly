"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { type RecruiterTopSkill } from "@/lib/mockData";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Lower rank sorts first: Required before Highly relevant (stable tie-break preserves mock order). */
function requirementSortRank(
  level: RecruiterTopSkill["requiredLevel"]
): number {
  return level === "Required" ? 0 : 1;
}

export function MatchedToRoleSkillsSection({
  skills,
  firstName,
  slug,
}: {
  skills: RecruiterTopSkill[];
  firstName: string;
  slug: string;
}) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const list = React.useMemo(() => {
    const topFive = [...skills.slice(0, 5)];
    return topFive.sort(
      (a, b) =>
        requirementSortRank(a.requiredLevel) - requirementSortRank(b.requiredLevel)
    );
  }, [skills]);

  return (
    <section
      className="flex min-h-0 min-w-0 flex-col"
      aria-labelledby="matched-role-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        MATCHED TO THE ROLE
      </p>
      <h2
        id="matched-role-heading"
        className="mt-2 font-serif text-[40px] font-normal leading-[1.1] tracking-tight text-foreground"
      >
        Top 5 skills for this role.
      </h2>
      <p className="mt-4 max-w-xl text-base font-normal leading-[1.5] text-[color:var(--text-secondary)]">
        Click any skill to see the commits where {firstName} proved it.
      </p>

      <div className="mt-6 flex min-w-0 flex-col gap-2">
        {list.map((skill, index) => {
          const expanded = expandedIndex === index;
          const panelId = `skill-drill-${slug}-${index}`;
          const labelId = `skill-pill-label-${slug}-${index}`;
          return (
            <div key={skill.name} className="flex min-w-0 flex-col">
              <button
                type="button"
                id={labelId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className={cn(
                  "flex h-14 w-full cursor-pointer items-center gap-3 border border-primary bg-card px-6 text-left shadow-none transition-colors",
                  "hover:bg-[rgba(31,58,46,0.03)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  expanded
                    ? "rounded-t-[999px] rounded-b-none border-b-0"
                    : "rounded-full"
                )}
              >
                <span
                  className="size-2 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-base font-semibold leading-none text-foreground">
                    {skill.name}
                  </span>
                  <span className="shrink-0 text-sm font-normal leading-none text-muted-foreground">
                    · {skill.pillMutedText}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out",
                    expanded && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={`skill-drill-title-${slug}-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.28,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="-mt-px max-h-[min(75vh,calc(100vh-8rem))] overflow-y-auto rounded-b-[8px] border border-t-0 border-border bg-[rgba(31,58,46,0.03)] px-6 pb-6 pt-6 sm:max-h-none sm:overflow-visible"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                        <h3
                          id={`skill-drill-title-${slug}-${index}`}
                          className="min-w-0 font-serif text-xl font-normal leading-tight tracking-tight text-foreground md:text-2xl"
                        >
                          {skill.name}
                        </h3>
                        <button
                          type="button"
                          aria-label="Close skill details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedIndex(null);
                          }}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                            "size-9 shrink-0 rounded-[6px] text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <X className="size-5" aria-hidden />
                        </button>
                      </div>

                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        COMMITS THAT PROVE THIS
                      </p>

                      <ul className="mt-4 flex flex-col gap-2">
                        {skill.commits.map((commit) => (
                          <li key={commit.commitSha}>
                            <article
                              className={cn(
                                "rounded-[8px] border border-border bg-background p-4 shadow-card transition-colors",
                                "hover:bg-muted/40"
                              )}
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {commit.projectName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {commit.date}
                                </p>
                              </div>
                              <p className="mt-3 text-base font-semibold leading-snug text-foreground">
                                {commit.description}
                              </p>
                              <div className="mt-4 space-y-1.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                  WHY THIS MATTERS FOR THE ROLE
                                </p>
                                <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                                  {commit.whyThisMatters}
                                </p>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <a
                                  href={commit.commitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    buttonVariants({
                                      variant: "ghost",
                                      size: "sm",
                                    }),
                                    "gap-2 rounded-[6px] text-primary"
                                  )}
                                >
                                  View commit on GitHub
                                  <ExternalLink className="size-4" aria-hidden />
                                </a>
                              </div>
                            </article>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex justify-start border-t border-border pt-4">
                        <Link
                          href={`/c/${slug}/commits?skill=${encodeURIComponent(skill.name)}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "rounded-[6px] text-sm font-normal text-primary hover:bg-transparent hover:underline"
                          )}
                        >
                          Explore all commits for this skill →
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
