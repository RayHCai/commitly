"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { HeroJobField } from "@/components/hero-job-field";
import { PaperSurface } from "@/components/recruiter/paper-surface";
import { githubOAuthUrl } from "@/lib/api";

const PREFIX = "Your ";
const SUFFIXES = [
  "code, tailored to the job.",
  "commits, matched to the role.",
  "work, proven by your code.",
] as const;

const TYPE_MS = 42;
const BACKSPACE_MS = 26;
const HOLD_MS = 2200;
const BETWEEN_MS = 400;

function TypewriterHeadline() {
  const [suffix, setSuffix] = React.useState("");
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { setSuffix(SUFFIXES[0]); return; }

    let cancelled = false;

    function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => { timerRef.current = null; resolve(); }, ms);
      });
    }

    async function run() {
      let idx = 0;
      while (!cancelled) {
        const s = SUFFIXES[idx % SUFFIXES.length];
        // Type forward
        for (let len = 0; len <= s.length && !cancelled; len++) {
          setSuffix(s.slice(0, len));
          await sleep(TYPE_MS);
        }
        if (cancelled) break;
        await sleep(HOLD_MS);
        if (cancelled) break;
        // Backspace (only the suffix, "Your " stays)
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
    return () => { cancelled = true; if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; } };
  }, []);

  // Split suffix at comma for italic styling
  const commaIdx = suffix.indexOf(",");
  const beforeComma = commaIdx >= 0 ? suffix.slice(0, commaIdx + 2) : suffix;
  const afterComma = commaIdx >= 0 ? suffix.slice(commaIdx + 2) : "";

  return (
    <h1 className="font-serif text-[48px] font-normal leading-[1.02] tracking-tight text-[color:var(--ink)] md:text-[72px]">
      {PREFIX}{beforeComma}
      {afterComma && (
        <span className="italic text-[color:var(--ink-muted)]">{afterComma}</span>
      )}
      <span
        className="animate-caret-blink ml-[2px] inline-block w-[3px] bg-[color:var(--ink)] align-middle"
        style={{ height: "0.85em" }}
      />
    </h1>
  );
}

const EASE: [number, number, number, number] = [0.22, 0.8, 0.26, 1];

export default function Home() {
  return (
    <PaperSurface>
      <div className="absolute right-6 top-5 z-10 md:right-10">
        <button
          type="button"
          onClick={() => {
            window.location.href = githubOAuthUrl(crypto.randomUUID());
          }}
          className="text-[color:var(--ink-muted)] transition-colors duration-200 hover:text-[color:var(--ink)]"
          aria-label="Sign in with GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-hidden
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </button>
      </div>
      <section className="mx-auto flex h-screen w-full max-w-[1000px] flex-col overflow-hidden px-6 py-14 md:px-10 md:py-16">
        <div className="flex flex-1 flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-3 font-mono text-[13px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
          >
            {"// commitly"}
          </motion.p>

          <TypewriterHeadline />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="mt-10 w-full max-w-xl"
          >
            <HeroJobField />
          </motion.div>
        </div>
      </section>
    </PaperSurface>
  );
}
