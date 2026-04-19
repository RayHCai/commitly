"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import {
  Scene,
  SceneBody,
  SceneHeadline,
  SceneSubheading,
} from "@/components/scene/scene";
import { Button } from "@/components/ui/button";
import { githubOAuthUrl } from "@/lib/api";
import {
  COMMITLY_FLOW_KEY,
  defaultCommitlyFlowState,
  parseCommitlyFlow,
  serializeCommitlyFlow,
  type CommitlyFlowState,
} from "@/lib/commitly-flow";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const guarantees = [
  "Read your public and private repo metadata",
  "Analyze commits and diffs to detect skills",
  "Never modify anything, ever",
] as const;

export default function ConnectPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);
  const [flow, setFlow] = React.useState<CommitlyFlowState>(
    defaultCommitlyFlowState(),
  );

  React.useEffect(() => {
    const raw = localStorage.getItem(COMMITLY_FLOW_KEY);
    const parsed = parseCommitlyFlow(raw);
    if (parsed) {
      const hasJob =
        Boolean(parsed.jobUrl.trim()) ||
        Boolean(parsed.jobDescription.trim());
      const next: CommitlyFlowState =
        hasJob && parsed.step === 1 ? { ...parsed, step: 2 } : parsed;
      setFlow(next);
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COMMITLY_FLOW_KEY, serializeCommitlyFlow(flow));
  }, [hydrated, flow]);

  React.useEffect(() => {
    if (!hydrated) return;
    const hasJob =
      Boolean(flow.jobUrl.trim()) || Boolean(flow.jobDescription.trim());
    if (!hasJob) {
      router.replace("/");
    }
  }, [hydrated, flow.jobUrl, flow.jobDescription, router]);

  function completeAndRoute() {
    window.location.href = githubOAuthUrl(flow.sessionId);
  }

  function handleBack() {
    router.push("/");
  }

  if (!hydrated) {
    return (
      <PaperSurface>
        <div className="mx-auto w-full max-w-[1000px] px-6 pt-16 md:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
            {"// loading..."}
          </p>
        </div>
      </PaperSurface>
    );
  }

  const hasJob =
    Boolean(flow.jobUrl.trim()) || Boolean(flow.jobDescription.trim());
  if (!hasJob) {
    return (
      <PaperSurface>
        <div className="mx-auto w-full max-w-[1000px] px-6 pt-16 md:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
            {"// redirecting..."}
          </p>
        </div>
      </PaperSurface>
    );
  }

  return (
    <PaperSurface>
      <Scene eyebrow="step 02 · github">
        <SceneHeadline as="h1" size="lg">
          Let&apos;s look
          <br />
          <span className="italic text-[color:var(--ink-muted)]">
            at your code.
          </span>
        </SceneHeadline>
        <SceneSubheading>
          We pull your repos and commits to match them to the role. Your code
          stays yours.
        </SceneSubheading>

        <SceneBody className="mt-10 rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-6 md:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
            <GitHubMark className="size-14 shrink-0 text-[color:var(--ink)] md:size-16" />
            <div className="min-w-0 flex-1 space-y-6">
              <ul className="space-y-3 text-[14px] leading-[1.55] text-[color:var(--ink-soft)]">
                {guarantees.map((g) => (
                  <li key={g} className="flex gap-3">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[color:var(--code-string)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                size="lg"
                className="h-11 w-full rounded-[8px] bg-[color:var(--ink)] px-8 text-[15px] font-medium text-[color:var(--paper-bg)] hover:bg-[color:var(--ink-soft)]"
                onClick={completeAndRoute}
              >
                Connect GitHub
              </Button>
            </div>
          </div>
        </SceneBody>

        <div className="mt-10">
          <button
            type="button"
            onClick={handleBack}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
          >
            ← back
          </button>
        </div>
      </Scene>
    </PaperSurface>
  );
}
