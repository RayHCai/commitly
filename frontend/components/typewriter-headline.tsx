"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const PREFIX = "Your ";

/** Rotating text after "Your " — backspace between each phrase */
const SUFFIXES = [
  "Technical Cover Letter.",
  "Git Commits. Matched for your role.",
  "Proof hiring teams can verify.",
] as const;

const TYPE_MS = 46;
const BACKSPACE_MS = 28;
const HOLD_MS = 2400;
const BETWEEN_MS = 500;

const FULL_STATIC_LINE = `${PREFIX}${SUFFIXES[0]}`;

/**
 * Types "Your …", pauses, backspaces to "Your ", types the next phrase, repeats.
 */
export function TypewriterHeadline({
  className,
}: {
  className?: string;
}) {
  const [visible, setVisible] = React.useState("");
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      setVisible(`${PREFIX}${SUFFIXES[0]}`);
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
      let phraseIndex = 0;

      while (!cancelled) {
        const suffix = SUFFIXES[phraseIndex % SUFFIXES.length];
        const full = PREFIX + suffix;

        for (
          let len = PREFIX.length;
          len <= full.length && !cancelled;
          len++
        ) {
          setVisible(full.slice(0, len));
          await sleep(TYPE_MS);
        }

        if (cancelled) break;

        await sleep(HOLD_MS);
        if (cancelled) break;

        for (
          let len = full.length;
          len > PREFIX.length && !cancelled;
          len--
        ) {
          setVisible(full.slice(0, len - 1));
          await sleep(BACKSPACE_MS);
        }

        if (cancelled) break;

        phraseIndex += 1;
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
    <h1
      aria-label={`${FULL_STATIC_LINE}. Headlines alternate with similar messages.`}
      className={cn(
        "relative mx-auto inline-block max-w-none whitespace-nowrap font-serif font-normal tracking-tight text-foreground",
        className
      )}
    >
      <span aria-hidden>{visible}</span>
      <span
        className="ml-[0.06em] inline-block min-h-[1em] w-[3px] translate-y-px animate-caret-blink rounded-sm bg-primary align-middle md:w-1"
        aria-hidden
      />
    </h1>
  );
}
