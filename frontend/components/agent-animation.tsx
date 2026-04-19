"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, FilePenLine, Layers, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  Scene,
  SceneHeadline,
} from "@/components/scene/scene";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ── Typewriter constants ── */
const HEADLINE_PREFIX = "Three agents ";
const HEADLINE_SUFFIXES = [
  "reading your code.",
  "evaluating your work.",
  "writing your summary.",
] as const;

const TYPE_MS = 42;
const BACKSPACE_MS = 26;
const HOLD_MS = 2200;
const BETWEEN_MS = 400;

function TypewriterHeadline() {
  const [suffix, setSuffix] = React.useState("");
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      setSuffix(HEADLINE_SUFFIXES[0]);
      return;
    }

    let cancelled = false;

    function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          resolve();
        }, ms);
      });
    }

    async function run() {
      let idx = 0;
      while (!cancelled) {
        const s = HEADLINE_SUFFIXES[idx % HEADLINE_SUFFIXES.length];
        for (let len = 0; len <= s.length && !cancelled; len++) {
          setSuffix(s.slice(0, len));
          await sleep(TYPE_MS);
        }
        if (cancelled) break;
        await sleep(HOLD_MS);
        if (cancelled) break;
        for (let len = s.length; len > 0 && !cancelled; len--) {
          setSuffix(s.slice(0, len - 1));
          await sleep(BACKSPACE_MS);
        }
        if (cancelled) break;
        idx += 1;
        await sleep(BETWEEN_MS);
      }
    }

    run();
    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <SceneHeadline as="h1" size="lg">
      {HEADLINE_PREFIX}
      <span className="italic text-[color:var(--ink-muted)]">{suffix}</span>
      <span
        className="animate-caret-blink ml-[2px] inline-block w-[3px] bg-[color:var(--ink)] align-middle"
        style={{ height: "0.85em" }}
      />
    </SceneHeadline>
  );
}

type AgentStatus = "idle" | "working" | "done";

const AGENTS = [
  {
    key: "complexity",
    name: "complexity_agent",
    description: "measuring technical complexity",
    Icon: Layers,
  },
  {
    key: "quality",
    name: "quality_agent",
    description: "evaluating code quality",
    Icon: ShieldCheck,
  },
  {
    key: "summary",
    name: "summary_agent",
    description: "writing your technical summary",
    Icon: FilePenLine,
  },
] as const;

type PipelineStep =
  | "pending"
  | "fetching"
  | "deliberating"
  | "finalizing"
  | "done"
  | "error";

const STEP_ORDER: PipelineStep[] = [
  "pending",
  "fetching",
  "deliberating",
  "finalizing",
  "done",
];

function stepToAgentStates(step: PipelineStep): AgentStatus[] {
  switch (step) {
    case "pending":
      return ["idle", "idle", "idle"];
    case "fetching":
      return ["working", "idle", "idle"];
    case "deliberating":
      return ["done", "working", "idle"];
    case "finalizing":
      return ["done", "done", "working"];
    case "done":
    case "error":
      return ["done", "done", "done"];
  }
}

function stepToMessage(step: PipelineStep): string {
  switch (step) {
    case "pending":
      return "queuing...";
    case "fetching":
      return "scanning your commits...";
    case "deliberating":
      return "evaluating code quality...";
    case "finalizing":
      return "writing your summary...";
    case "done":
      return "all done.";
    case "error":
      return "something went wrong.";
  }
}

function stepToProgress(step: PipelineStep): number {
  const idx = STEP_ORDER.indexOf(step);
  if (idx < 0) return 100;
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
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
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--ink)]/40" />
        <span
          className="relative inline-flex size-2 rounded-full"
          style={{ backgroundColor: "var(--ink)" }}
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

interface AgentAnimationProps {
  taskId: string;
  onComplete: () => void;
}

interface TaskStatusResponse {
  task_id: string;
  status: string;
  result?: {
    step?: string;
    error?: string;
    [key: string]: unknown;
  };
}

export function AgentAnimation({ taskId, onComplete }: AgentAnimationProps) {
  const [step, setStep] = React.useState<PipelineStep>("pending");
  const [error, setError] = React.useState(false);
  const completeCalled = React.useRef(false);

  React.useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      if (!active) return;
      try {
        const res = await apiFetch<{ data: TaskStatusResponse }>(
          `/repositories/me/task/${encodeURIComponent(taskId)}`
        );
        const task = res.data;

        if (!active) return;

        if (task.status === "SUCCESS") {
          setStep("done");
          if (!completeCalled.current) {
            completeCalled.current = true;
            // Brief pause to show the "done" state before redirecting
            setTimeout(() => {
              if (active) onComplete();
            }, 1200);
          }
          return;
        }

        if (task.status === "FAILURE") {
          setStep("error");
          setError(true);
          toast.error(task.result?.error ?? "Pipeline failed");
          return;
        }

        // Map PROGRESS meta to step
        if (task.status === "PROGRESS" && task.result?.step) {
          const s = task.result.step as PipelineStep;
          if (STEP_ORDER.includes(s)) {
            setStep(s);
          }
        } else if (task.status === "STARTED") {
          setStep("fetching");
        }

        // Continue polling
        timeoutId = setTimeout(poll, 2000);
      } catch {
        // Network error — retry
        if (active) {
          timeoutId = setTimeout(poll, 3000);
        }
      }
    }

    poll();
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [taskId, onComplete]);

  const agentStates = stepToAgentStates(step);
  const progressPct = stepToProgress(step);
  const message = stepToMessage(step);

  return (
    <Scene eyebrow="ingesting · agents at work">
      <TypewriterHeadline />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.25,
          ease: [0.22, 0.8, 0.26, 1],
        }}
        className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {AGENTS.map((agent, index) => {
          const phase = agentStates[index];
          const Icon = agent.Icon;
          return (
            <motion.div
              key={agent.key}
              layout
              className={cn(
                "rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-5 transition-all duration-300",
                phase === "working" &&
                  "border-[color:var(--ink)]/20 shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
                phase === "idle" && "opacity-60"
              )}
              transition={{ duration: 0.28, ease: [0.22, 0.8, 0.26, 1] }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg)] text-[color:var(--ink)]",
                    phase === "idle" && "opacity-60"
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="font-mono text-[12px] font-medium tracking-tight"
                      style={{ color: "var(--ink)" }}
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
          {error ? "Something went wrong" : message}
        </p>
        <div className="h-[3px] w-full max-w-[320px] overflow-hidden rounded-full bg-[color:var(--paper-line)]">
          <div
            className="h-full rounded-full bg-[color:var(--ink)] transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </Scene>
  );
}
