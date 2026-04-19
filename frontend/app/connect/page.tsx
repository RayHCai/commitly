"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const stepEnter = { opacity: 0, x: 16 };
const stepCenter = { opacity: 1, x: 0 };
const stepTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

export default function ConnectPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);
  const [flow, setFlow] = React.useState<CommitlyFlowState>(
    defaultCommitlyFlowState()
  );

  React.useEffect(() => {
    const raw = localStorage.getItem(COMMITLY_FLOW_KEY);
    const parsed = parseCommitlyFlow(raw);
    if (parsed) {
      const hasJob =
        Boolean(parsed.jobUrl.trim()) ||
        Boolean(parsed.jobDescription.trim());
      const next: CommitlyFlowState =
        hasJob && parsed.step === 1
          ? { ...parsed, step: 2 }
          : parsed;
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
    const next: CommitlyFlowState = { ...flow, githubConnected: true };
    setFlow(next);
    localStorage.setItem(COMMITLY_FLOW_KEY, serializeCommitlyFlow(next));
    router.push("/generating");
  }

  function handleBack() {
    router.push("/");
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background px-6 py-12 md:py-16">
        <div className="mx-auto max-w-[640px]">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  const hasJob =
    Boolean(flow.jobUrl.trim()) || Boolean(flow.jobDescription.trim());
  if (!hasJob) {
    return (
      <div className="min-h-screen bg-background px-6 py-12 md:py-16">
        <div className="mx-auto max-w-[640px]">
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:py-16">
      <div className="mx-auto max-w-[640px]">
        <motion.div
          initial={stepEnter}
          animate={stepCenter}
          transition={stepTransition}
        >
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Let&apos;s look at your code.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
            We&apos;ll pull your repos and commits to match them to the role you
            shared. Your code stays yours.
          </p>

          <Card className="mt-10 shadow-card hover:shadow-card">
            <CardContent className="px-5 pb-6 pt-6 sm:px-6">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
                <div className="flex justify-center md:block">
                  <GitHubMark className="size-14 shrink-0 text-muted-foreground sm:size-16" />
                </div>
                <div className="min-w-0 flex-1 space-y-6">
                  <ul className="space-y-4 text-sm leading-snug text-[color:var(--text-secondary)]">
                    <li className="flex gap-3">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>Read your public and private repo metadata</span>
                    </li>
                    <li className="flex gap-3">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>Analyze commits and diffs to detect skills</span>
                    </li>
                    <li className="flex gap-3">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>Never modify anything, ever</span>
                    </li>
                  </ul>
                  <Button
                    type="button"
                    size="lg"
                    className="h-11 w-full rounded-lg px-8 text-base font-medium"
                    onClick={completeAndRoute}
                  >
                    Connect GitHub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-0 text-muted-foreground hover:text-foreground"
              onClick={handleBack}
            >
              Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
