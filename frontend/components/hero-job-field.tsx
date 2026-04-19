"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COMMITLY_FLOW_KEY,
  defaultCommitlyFlowState,
  parseCommitlyFlow,
  serializeCommitlyFlow,
} from "@/lib/commitly-flow";
import { cn } from "@/lib/utils";

export function HeroJobField({ className }: { className?: string }) {
  const router = useRouter();
  const [jobUrl, setJobUrl] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = jobUrl.trim();
    if (!trimmed) return;

    const prev = parseCommitlyFlow(
      typeof window !== "undefined"
        ? localStorage.getItem(COMMITLY_FLOW_KEY)
        : null
    );
    const base = prev ?? defaultCommitlyFlowState();
    const next = {
      ...base,
      jobUrl: trimmed,
      step: 2 as const,
    };

    try {
      localStorage.setItem(COMMITLY_FLOW_KEY, serializeCommitlyFlow(next));
    } catch {
      /* ignore */
    }
    router.push("/connect");
  }

  const canSubmit = Boolean(jobUrl.trim());

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-xl flex-col gap-3 md:flex-row md:items-center md:gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1 text-left">
        <label
          htmlFor="hero-job-url"
          className="sr-only"
        >
          Job posting URL
        </label>
        <Input
          id="hero-job-url"
          name="jobUrl"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="Paste job posting URL"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          className="box-border h-11 rounded-lg px-3 py-0 leading-none md:h-12 md:text-base"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className="box-border h-11 shrink-0 self-center rounded-lg px-8 text-base font-medium md:h-12 md:min-w-[10rem]"
      >
        Continue
      </Button>
    </form>
  );
}
