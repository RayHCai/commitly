"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import {
  COMMITLY_FLOW_KEY,
  parseCommitlyFlow,
  serializeCommitlyFlow,
} from "@/lib/commitly-flow";

const TOKEN_KEY = "commitly_token";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Authentication failed — no token received.");
      setFailed(true);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);

    const raw = localStorage.getItem(COMMITLY_FLOW_KEY);
    const flow = parseCommitlyFlow(raw);
    if (flow) {
      const next = { ...flow, githubConnected: true };
      localStorage.setItem(COMMITLY_FLOW_KEY, serializeCommitlyFlow(next));
    }

    const onboardingComplete =
      searchParams.get("onboardingComplete") === "true";
    router.replace(onboardingComplete ? "/dashboard" : "/onboard");
  }, [searchParams, router]);

  if (failed) {
    return (
      <PaperSurface>
        <div className="mx-auto w-full max-w-[1000px] px-6 pt-16 md:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
            {"// "}authentication failed
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
          >
            &larr; start over
          </button>
        </div>
      </PaperSurface>
    );
  }

  return (
    <PaperSurface>
      <div className="mx-auto w-full max-w-[1000px] px-6 pt-16 md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
          {"// authenticating..."}
        </p>
      </div>
    </PaperSurface>
  );
}
