"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ClipboardList,
  FilePenLine,
  GitCommitHorizontal,
  Layers,
  Link2,
  ShieldCheck,
} from "lucide-react";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import {
  Scene,
  SceneHeadline,
  SceneSubheading,
} from "@/components/scene/scene";
import { ShareModal } from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { COMMITLY_GENERATED_SLUG_KEY } from "@/lib/commitly-flow";
import { cn } from "@/lib/utils";
import { mockJob } from "@/lib/mockData";

const SLUG = "jihan-acme";
const DISPLAY_URL = `commitly.io/c/${SLUG}`;
const FULL_URL = `https://${DISPLAY_URL}`;

/** Total processing timeline including deliberation (≈11s). */
const STAGGER_MS = 1000;
const WORK_DURATION_MS = 2200;
const DELIBERATION_MS = 2500;
const ALMOST_READY_MS = 1300;

const AGENT_COUNT = 6;
const LAST_AGENT_DONE_MS =
  (AGENT_COUNT - 1) * STAGGER_MS + WORK_DURATION_MS;
const TOTAL_PROCESSING_MS =
  LAST_AGENT_DONE_MS + DELIBERATION_MS + ALMOST_READY_MS;

const STATUS_MESSAGES = [
  "reading the job posting...",
  "scanning your commits...",
  "measuring technical complexity...",
  "verifying authenticity...",
  "matching your code to the role...",
  "writing your summary...",
] as const;

type AgentStatus = "idle" | "working" | "done";

const AGENTS = [
  {
    key: "skills",
    name: "skills_agent",
    description: "extracting signals from the job posting",
    Icon: ClipboardList,
  },
  {
    key: "commit",
    name: "commit_agent",
    description: "scanning your commits and diffs",
    Icon: GitCommitHorizontal,
  },
  {
    key: "complexity",
    name: "complexity_agent",
    description: "measuring technical complexity",
    Icon: Layers,
  },
  {
    key: "authenticity",
    name: "authenticity_agent",
    description: "verifying you wrote the code",
    Icon: ShieldCheck,
  },
  {
    key: "matching",
    name: "matching_agent",
    description: "mapping code to required skills",
    Icon: Link2,
  },
  {
    key: "summary",
    name: "summary_agent",
    description: "writing your technical summary",
    Icon: FilePenLine,
  },
] as const;

function agentPhase(elapsed: number, index: number): AgentStatus {
  const start = index * STAGGER_MS;
  const end = start + WORK_DURATION_MS;
  if (elapsed < start) return "idle";
  if (elapsed < end) return "working";
  return "done";
}

function statusMessage(elapsed: number): string {
  if (elapsed < LAST_AGENT_DONE_MS) {
    const idx = Math.min(
      STATUS_MESSAGES.length - 1,
      Math.floor(elapsed / STAGGER_MS),
    );
    return STATUS_MESSAGES[idx]!;
  }
  if (elapsed < LAST_AGENT_DONE_MS + DELIBERATION_MS) {
    return "agents are deliberating...";
  }
  return "almost ready...";
}

export default function GeneratingPage() {
  const router = useRouter();
  const [elapsed, setElapsed] = React.useState(0);
  const [success, setSuccess] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const navigateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    const start = performance.now();
    let rafId = 0;

    const tick = () => {
      const now = performance.now();
      const next = Math.min(TOTAL_PROCESSING_MS, now - start);
      setElapsed(next);
      if (next >= TOTAL_PROCESSING_MS) {
        setSuccess(true);
        try {
          localStorage.setItem(COMMITLY_GENERATED_SLUG_KEY, SLUG);
        } catch {
          /* ignore */
        }
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  React.useEffect(() => {
    if (!success) return;
    navigateTimerRef.current = setTimeout(() => {
      router.push(`/c/${SLUG}`);
    }, 5000);
    return () => {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = null;
      }
    };
  }, [success, router]);

  function clearNavigateTimer() {
    if (navigateTimerRef.current) {
      clearTimeout(navigateTimerRef.current);
      navigateTimerRef.current = null;
    }
  }

  function handleViewPage() {
    clearNavigateTimer();
    router.push(`/c/${SLUG}`);
  }

  function handleGoToDashboard() {
    clearNavigateTimer();
    router.push("/dashboard");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(FULL_URL);
    } catch {
      return;
    }
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  }

  const progressPct = success
    ? 100
    : Math.min(100, (elapsed / TOTAL_PROCESSING_MS) * 100);

  return (
    <PaperSurface>
      <AnimatePresence mode="wait">
        {!success ? (
          <Scene eyebrow="step 03 · agents at work" key="processing">
            <SceneHeadline as="h1" size="lg">
              Six agents
              <br />
              <span className="italic text-[color:var(--ink-muted)]">
                reading your code.
              </span>
            </SceneHeadline>
            <SceneSubheading>
              Each one evaluates a different dimension. They deliberate and
              produce your technical summary.
            </SceneSubheading>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 0.8, 0.26, 1] }}
              className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {AGENTS.map((agent, index) => {
                const phase = agentPhase(elapsed, index);
                const Icon = agent.Icon;
                return (
                  <motion.div
                    key={agent.key}
                    layout
                    className={cn(
                      "rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-5 transition-all duration-300",
                      phase === "working" &&
                        "border-[color:var(--code-fn)]/40 shadow-[0_2px_10px_rgba(37,99,235,0.08)]",
                      phase === "idle" && "opacity-60",
                    )}
                    transition={{ duration: 0.28, ease: [0.22, 0.8, 0.26, 1] }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg)] text-[color:var(--code-fn)]",
                          phase === "idle" && "opacity-60",
                        )}
                      >
                        <Icon className="size-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2
                            className="font-mono text-[12px] font-medium tracking-tight"
                            style={{ color: "var(--code-fn)" }}
                          >
                            {agent.name}
                          </h2>
                          <StatusIndicator phase={phase} />
                        </div>
                        <p className="mt-2 text-[12px] leading-[1.55] text-[color:var(--ink-muted)]">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="mt-12 flex flex-col items-center gap-5">
              <p
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]"
                aria-live="polite"
              >
                {"// "}
                {statusMessage(elapsed)}
              </p>
              <div className="h-[3px] w-full max-w-[320px] overflow-hidden rounded-full bg-[color:var(--paper-line)]">
                <div
                  className="h-full rounded-full bg-[color:var(--ink)] transition-[width] duration-100 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <Link
                href="/how-it-works"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)] underline-offset-4 transition-colors hover:text-[color:var(--ink)] hover:underline"
              >
                how our agents work →
              </Link>
            </div>
          </Scene>
        ) : (
          <Scene eyebrow="ready" align="center" key="success">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 0.8, 0.26, 1] }}
              className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] text-[color:var(--code-string)]"
            >
              <Check className="size-7" strokeWidth={2} aria-hidden />
            </motion.div>
            <SceneHeadline as="h1" size="lg" className="text-center">
              Your link
              <br />
              <span className="italic">is ready.</span>
            </SceneHeadline>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 0.8, 0.26, 1] }}
              className="mt-8 break-all font-mono text-[18px] text-[color:var(--ink)] md:text-[22px]"
            >
              {DISPLAY_URL}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 0.8, 0.26, 1] }}
              className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full rounded-[8px] bg-[color:var(--ink)] px-8 text-[15px] font-medium text-[color:var(--paper-bg)] hover:bg-[color:var(--ink-soft)] sm:w-auto sm:min-w-[10rem]"
                  onClick={handleCopy}
                >
                  Copy link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-[8px] border-[color:var(--paper-line)] bg-transparent px-8 text-[15px] font-medium text-[color:var(--ink)] hover:bg-[color:var(--paper-bg-deep)] sm:w-auto sm:min-w-[10rem]"
                  onClick={() => setShareOpen(true)}
                >
                  Share
                </Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-[8px] border-[color:var(--paper-line)] bg-transparent px-8 text-[15px] font-medium text-[color:var(--ink)] hover:bg-[color:var(--paper-bg-deep)] sm:w-auto sm:min-w-[12rem]"
                  onClick={handleViewPage}
                >
                  View your page
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-[8px] border-[color:var(--paper-line)] bg-transparent px-8 text-[15px] font-medium text-[color:var(--ink)] hover:bg-[color:var(--paper-bg-deep)] sm:w-auto sm:min-w-[12rem]"
                  onClick={handleGoToDashboard}
                >
                  Go to dashboard
                </Button>
              </div>
            </motion.div>
          </Scene>
        )}
      </AnimatePresence>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        linkUrl={DISPLAY_URL}
        role={mockJob.roleTitle}
        company={mockJob.company}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-[8px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg)] px-4 py-2.5 font-mono text-[12px] text-[color:var(--ink)] shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            {"// link copied"}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PaperSurface>
  );
}

function StatusIndicator({ phase }: { phase: AgentStatus }) {
  if (phase === "idle") {
    return (
      <span
        className="mt-0.5 inline-flex size-2 shrink-0 rounded-full bg-[color:var(--paper-line)]"
        aria-hidden
      />
    );
  }
  if (phase === "working") {
    return (
      <span className="relative mt-0.5 inline-flex size-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--code-fn)]/40" />
        <span
          className="relative inline-flex size-2 rounded-full"
          style={{ backgroundColor: "var(--code-fn)" }}
        />
      </span>
    );
  }
  return (
    <Check
      className="mt-0.5 size-4 shrink-0"
      style={{ color: "var(--code-string)" }}
      strokeWidth={2.5}
      aria-hidden
    />
  );
}
