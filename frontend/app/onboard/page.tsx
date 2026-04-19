"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, GitFork, Lock } from "lucide-react";

import { toast } from "sonner";

import { AuthGuard } from "@/components/auth-guard";
import { AgentAnimation } from "@/components/agent-animation";
import { PaperSurface } from "@/components/recruiter/paper-surface";
import {
  Scene,
  SceneHeadline,
  SceneSubheading,
} from "@/components/scene/scene";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Repo {
  id: string;
  name: string;
  fullName: string;
  url: string;
  isPrivate: boolean;
}

type Phase = "repos" | "ingesting";

const slideVariants = {
  enter: { x: 80, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
};

export default function OnboardPage() {
  return (
    <AuthGuard>
      <OnboardContent />
    </AuthGuard>
  );
}

function OnboardContent() {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>("repos");
  const [repos, setRepos] = React.useState<Repo[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(false);
  const [taskId, setTaskId] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<{ data: Repo[] }>("/repositories/me")
      .then((res) => {
        setRepos(res.data);
        setSelected(new Set(res.data.map((r) => r.id)));
      })
      .catch((err) => {
        setFetchError(true);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const MAX_REPOS = 5;

  function toggleRepo(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_REPOS) return prev;
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(repos.slice(0, MAX_REPOS).map((r) => r.id)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleNext() {
    if (selected.size === 0) return;
    setSubmitting(true);

    try {
      // Delete deselected repos
      const deselected = repos
        .filter((r) => !selected.has(r.id))
        .map((r) => r.id);

      if (deselected.length > 0) {
        await apiFetch("/repositories/me/batch", {
          method: "DELETE",
          body: JSON.stringify({ ids: deselected }),
        });
      }

      // Trigger ingestion
      const ingestRes = await apiFetch<{
        data: { queued: number; taskId: string | null };
      }>("/repositories/me/ingest", {
        method: "POST",
      });

      if (!ingestRes.data.taskId) {
        toast.error("Failed to start ingestion. Please try again.");
        setSubmitting(false);
        return;
      }
      setTaskId(ingestRes.data.taskId);
      setPhase("ingesting");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const handleIngestionComplete = React.useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <PaperSurface className="overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "repos" && (
          <motion.div
            key="repos"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 0.8, 0.26, 1] }}
          >
          <Scene
            eyebrow="onboarding"
            fullViewport={false}
            className="!py-10 md:!py-12 h-screen justify-center overflow-hidden"
          >
            <SceneHeadline as="h1" size="lg">
              Select your{" "}
              <span className="italic text-[color:var(--ink-muted)]">
                repositories.
              </span>
            </SceneHeadline>
            <SceneSubheading className="!text-[13px]">
              Choose which repos our agents should analyze.
              You can change this later.
            </SceneSubheading>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.25,
                ease: [0.22, 0.8, 0.26, 1],
              }}
              className="mt-8 w-full"
            >
              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[60px] animate-pulse rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)]"
                    />
                  ))}
                </div>
              ) : fetchError && repos.length === 0 ? (
                <p className="font-mono text-[12px] text-[color:var(--code-comment)]">
                  {"// "}Failed to load repositories.
                </p>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
                      {"// "}
                      {selected.size} of {MAX_REPOS} selected
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="rounded-md border border-[color:var(--paper-line)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
                      >
                        select all
                      </button>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="rounded-md border border-[color:var(--paper-line)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
                      >
                        deselect all
                      </button>
                    </div>
                  </div>

                  <div className="onboard-repo-list flex max-h-[240px] flex-col gap-1.5 overflow-y-auto pr-1">
                    {repos.map((repo) => {
                      const isSelected = selected.has(repo.id);
                      const isDisabled = !isSelected && selected.size >= MAX_REPOS;
                      return (
                        <button
                          key={repo.id}
                          type="button"
                          onClick={() => toggleRepo(repo.id)}
                          disabled={isDisabled}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200",
                            isSelected
                              ? "border-[color:var(--ink)]/25 bg-[color:var(--paper-bg-deep)] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                              : "border-[color:var(--paper-line)] bg-[color:var(--paper-bg)] opacity-60",
                            isDisabled && "cursor-not-allowed",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                              isSelected
                                ? "border-[color:var(--ink)] bg-[color:var(--ink)]"
                                : "border-[color:var(--paper-line)]",
                            )}
                          >
                            {isSelected && (
                              <Check
                                className="size-3 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>

                          <GitFork
                            className="size-4 shrink-0 text-[color:var(--code-comment)]"
                            strokeWidth={1.75}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono text-[13px] font-medium text-[color:var(--ink)]">
                              {repo.fullName}
                            </p>
                          </div>

                          {repo.isPrivate && (
                            <span className="flex items-center gap-1 rounded-full border border-[color:var(--paper-line)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--code-comment)]">
                              <Lock className="size-3" strokeWidth={1.75} />
                              private
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      type="button"
                      size="lg"
                      disabled={selected.size === 0 || submitting}
                      onClick={handleNext}
                      className="h-10 w-full max-w-[320px] rounded-md border border-[color:var(--ink)] bg-[color:var(--ink)] px-8 text-[14px] font-semibold text-[color:var(--paper-bg)] hover:bg-[color:var(--ink-soft)] disabled:opacity-40"
                    >
                      {submitting ? "Starting..." : "Next"}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </Scene>
          </motion.div>
        )}

        {phase === "ingesting" && (
          <motion.div
            key="ingesting"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 0.8, 0.26, 1] }}
          >
            <AgentAnimation taskId={taskId!} onComplete={handleIngestionComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </PaperSurface>
  );
}
