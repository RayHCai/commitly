"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  COMMITLY_FLOW_KEY,
  defaultCommitlyFlowState,
  parseCommitlyFlow,
  serializeCommitlyFlow,
} from "@/lib/commitly-flow";
import { apiFetch, githubOAuthUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

function isCompleteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function HeroJobField({ className }: { className?: string }) {
  const [jobUrl, setJobUrl] = React.useState("");
  const [redirecting, setRedirecting] = React.useState(false);
  const submittedRef = React.useRef(false);

  async function navigate(url: string) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setRedirecting(true);

    const prev = parseCommitlyFlow(
      typeof window !== "undefined"
        ? localStorage.getItem(COMMITLY_FLOW_KEY)
        : null
    );
    const base = prev ?? defaultCommitlyFlowState();
    const next = {
      ...base,
      jobUrl: url,
      step: 2 as const,
    };

    try {
      localStorage.setItem(COMMITLY_FLOW_KEY, serializeCommitlyFlow(next));
    } catch {
      /* ignore */
    }

    // Persist job URL server-side, then redirect straight to GitHub OAuth
    try {
      await apiFetch("/auth/pending-job", {
        method: "POST",
        body: JSON.stringify({ sessionId: next.sessionId, jobUrl: url }),
      });
    } catch {
      // Best-effort — the job URL is also in localStorage
    }

    window.location.href = githubOAuthUrl(next.sessionId);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = jobUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a job posting URL.");
      return;
    }
    if (!isCompleteUrl(trimmed)) {
      toast.error("Enter a valid URL starting with https://");
      return;
    }
    navigate(trimmed);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setJobUrl(value);
    // Auto-navigate when a complete URL is pasted
    if (isCompleteUrl(value.trim())) {
      navigate(value.trim());
    }
  }

  const canSubmit = Boolean(jobUrl.trim());

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn("w-full max-w-xl", className)}
      >
        <label
          htmlFor="hero-job-url"
          className="sr-only"
        >
          Job posting URL
        </label>
        <div className="relative">
          <input
            id="hero-job-url"
            name="jobUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="Paste job posting URL"
            value={jobUrl}
            onChange={handleChange}
            disabled={redirecting}
            className={cn(
              "h-10 w-full rounded-md border bg-[#f6f8fa] px-3 pr-10 font-mono text-sm text-[#1f2328] placeholder-[#656d76] outline-none transition-colors focus:bg-white md:h-11 md:text-sm",
              redirecting && "cursor-not-allowed bg-[#e8ecf0] text-[#656d76] opacity-60",
              "border-[#d0d7de] focus:border-[#8b949e]"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-opacity",
              redirecting ? "opacity-60" : canSubmit ? "opacity-60" : "opacity-25"
            )}
          >
            {redirecting ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="animate-spin text-[#656d76]"
                aria-hidden
              >
                <circle cx="8" cy="8" r="6" strokeOpacity="0.25" />
                <path d="M14 8a6 6 0 0 0-6-6" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#1f2328]"
                aria-hidden
              >
                <path d="M2 11V5a2 2 0 0 1 2-2h6" />
                <path d="M8 1l3 3-3 3" />
              </svg>
            )}
          </div>
        </div>
      </form>

    </>
  );
}
