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
  "Reading the job posting...",
  "Scanning your commits...",
  "Measuring technical complexity...",
  "Verifying authenticity...",
  "Matching your code to the role...",
  "Writing your summary...",
] as const;

type AgentStatus = "idle" | "working" | "done";

const AGENTS = [
  {
    key: "skills",
    name: "Skills agent",
    description: "Extracting signals from the job posting",
    Icon: ClipboardList,
  },
  {
    key: "commit",
    name: "Commit agent",
    description: "Scanning your commits and diffs",
    Icon: GitCommitHorizontal,
  },
  {
    key: "complexity",
    name: "Complexity agent",
    description: "Measuring technical complexity",
    Icon: Layers,
  },
  {
    key: "authenticity",
    name: "Authenticity agent",
    description: "Verifying you wrote the code",
    Icon: ShieldCheck,
  },
  {
    key: "matching",
    name: "Matching agent",
    description: "Mapping code to required skills",
    Icon: Link2,
  },
  {
    key: "summary",
    name: "Summary agent",
    description: "Writing your technical summary",
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
      Math.floor(elapsed / STAGGER_MS)
    );
    return STATUS_MESSAGES[idx]!;
  }
  if (elapsed < LAST_AGENT_DONE_MS + DELIBERATION_MS) {
    return "Agents are deliberating...";
  }
  return "Almost ready...";
}

export default function GeneratingPage() {
  const router = useRouter();
  const [elapsed, setElapsed] = React.useState(0);
  const [success, setSuccess] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const navigateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
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
    <div className="relative min-h-screen bg-background px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <header className="mb-14 max-w-xl text-center md:mb-20">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Agents at work
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-tight">
            Six agents are reading your code.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--text-secondary)] md:text-[1.05rem]">
            Each one evaluates a different dimension. They&apos;ll deliberate
            and produce your technical summary.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="processing"
              className="w-full"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {AGENTS.map((agent, index) => {
                  const phase = agentPhase(elapsed, index);
                  const Icon = agent.Icon;
                  return (
                    <motion.div
                      key={agent.key}
                      layout
                      className={cn(
                        "rounded-xl border border-border bg-card p-5 shadow-card transition-shadow duration-300",
                        phase === "working" && "border-primary/25 shadow-md"
                      )}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary",
                            phase === "idle" && "opacity-50"
                          )}
                        >
                          <Icon className="size-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="font-sans text-sm font-semibold leading-snug text-foreground">
                              {agent.name}
                            </h2>
                            <StatusIndicator phase={phase} />
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="mt-12 text-center">
                <Link
                  href="/how-it-works"
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  How our agents work →
                </Link>
              </p>

              <div className="mt-14 flex flex-col items-center md:mt-16">
                <p
                  className="text-center text-sm text-[color:var(--text-secondary)]"
                  aria-live="polite"
                >
                  {statusMessage(elapsed)}
                </p>
                <div className="mt-5 h-1 w-full max-w-[320px] overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="flex w-full max-w-lg flex-col items-center text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                <Check className="size-6" strokeWidth={2} aria-hidden />
              </div>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
                Your link is ready.
              </h2>
              <p className="mt-8 break-all font-mono text-lg text-foreground md:text-xl">
                {DISPLAY_URL}
              </p>
              <div className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-4">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                  <Button
                    type="button"
                    size="lg"
                    className="h-11 w-full rounded-lg px-8 text-base font-medium sm:w-auto sm:min-w-[10rem]"
                    onClick={handleCopy}
                  >
                    Copy link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full rounded-lg px-8 text-base font-medium sm:w-auto sm:min-w-[10rem]"
                    onClick={() => setShareOpen(true)}
                  >
                    Share
                  </Button>
                </div>
                <div className="flex w-full flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full rounded-lg px-8 text-base font-medium text-foreground sm:min-w-[12rem]"
                    onClick={handleViewPage}
                  >
                    View your page
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full rounded-lg px-8 text-base font-medium text-foreground sm:min-w-[12rem]"
                    onClick={handleGoToDashboard}
                  >
                    Go to dashboard
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
            className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-card"
          >
            Link copied.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StatusIndicator({ phase }: { phase: AgentStatus }) {
  if (phase === "idle") {
    return (
      <span
        className="mt-0.5 inline-flex size-2.5 shrink-0 rounded-full bg-muted-foreground/35"
        aria-hidden
      />
    );
  }
  if (phase === "working") {
    return (
      <span className="relative mt-0.5 inline-flex size-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/35" />
        <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <Check
      className="mt-0.5 size-4 shrink-0 text-primary"
      strokeWidth={2.5}
      aria-hidden
    />
  );
}
