"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { HeroJobField } from "@/components/hero-job-field";
import { PaperSurface } from "@/components/recruiter/paper-surface";
import { RecruiterOnePagerPreview } from "@/components/recruiter-one-pager-preview";

const FULL_TEXT = "Your code, tailored to the job.";
const ITALIC_START = "Your code, ".length;

function TypewriterHeadline() {
  const [count, setCount] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (count >= FULL_TEXT.length) { setDone(true); return; }
    const t = setTimeout(() => setCount((c) => c + 1), 38);
    return () => clearTimeout(t);
  }, [count]);

  const plain = FULL_TEXT.slice(0, Math.min(count, ITALIC_START));
  const italic = count > ITALIC_START ? FULL_TEXT.slice(ITALIC_START, count) : "";

  return (
    <h1 className="font-serif text-[48px] font-normal leading-[1.02] tracking-tight text-[color:var(--ink)] md:text-[72px]">
      {plain}
      {italic && (
        <span className="italic text-[color:var(--ink-muted)]">{italic}</span>
      )}
      {!done && (
        <span className="animate-caret-blink ml-[2px] inline-block w-[3px] bg-[color:var(--ink)] align-middle" style={{ height: "0.85em" }} />
      )}
    </h1>
  );
}

const EASE: [number, number, number, number] = [0.22, 0.8, 0.26, 1];

const steps = [
  { num: "01", title: "Paste a job." },
  { num: "02", title: "Connect GitHub." },
  { num: "03", title: "Share a link." },
] as const;

export default function Home() {
  return (
    <PaperSurface>
      {/* Scene 1 — Hero */}
      <section className="mx-auto flex min-h-screen w-full max-w-[1000px] flex-col px-6 py-14 md:px-10 md:py-16">
        <div className="flex flex-1 flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
          >
            // commitly
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]"
        >
          scroll ↓
        </motion.p>
      </section>

      {/* Scene 2 — How it works */}
      <section className="mx-auto flex min-h-screen w-full max-w-[1000px] flex-col justify-center px-6 py-16 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
        >
          // how it works
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          className="mt-4 font-serif text-[40px] font-normal leading-[1.02] tracking-tight text-[color:var(--ink)] md:text-[60px]"
        >
          Six agents reading your code.
        </motion.h2>

        <div className="mt-16 flex flex-col md:mt-20 md:flex-row md:items-start">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: EASE }}
              className="flex flex-1 flex-col md:flex-row"
            >
              {/* Step content */}
              <div className="flex flex-row md:flex-col md:items-start">
                {/* Node + vertical connector (mobile) / node only (desktop) */}
                <div className="flex flex-col items-center md:flex-row md:items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="size-[10px] rounded-full bg-[color:var(--ink)]" />
                  </div>
                  {/* Vertical line on mobile */}
                  {i < steps.length - 1 && (
                    <div className="w-[1px] flex-1 bg-[color:var(--paper-line)] md:hidden" style={{ minHeight: 48 }} />
                  )}
                </div>

                <div className="ml-5 pb-10 md:ml-0 md:mt-5 md:pb-0">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-[color:var(--code-comment)]">
                    {step.num}
                  </span>
                  <h3 className="mt-2 font-serif text-[28px] leading-tight tracking-tight text-[color:var(--ink)]">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Horizontal connector between steps (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex md:flex-1 md:items-start md:pt-[4px]">
                  <div className="h-[1px] w-full bg-[color:var(--paper-line)]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scene 3 — Recruiter view */}
      <section className="mx-auto flex min-h-screen w-full max-w-[1000px] flex-col justify-center px-6 py-16 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
        >
          // what recruiters see
        </motion.p>

        <div className="mt-4 grid gap-16 md:grid-cols-2 md:items-center md:gap-20">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
            className="font-serif text-[56px] font-normal leading-[1.02] tracking-tight text-[color:var(--ink)] md:text-[72px]"
          >
            One page.
            <br />
            <span className="italic text-[color:var(--ink-muted)]">
              Zero fluff.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            role="region"
            aria-label="Example recruiter profile"
            className="w-full"
          >
            <RecruiterOnePagerPreview />
          </motion.div>
        </div>
      </section>

      {/* Scene 4 — CTA */}
      <section className="mx-auto flex min-h-screen w-full max-w-[1000px] flex-col justify-center px-6 py-16 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
        >
          // start here
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          className="mt-4 font-serif text-[72px] font-normal leading-[1.02] tracking-tight text-[color:var(--ink)] md:text-[108px]"
        >
          Your work,
          <br />
          <span className="italic text-[color:var(--ink-muted)]">
            on one page.
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
          className="mt-10 w-full max-w-xl"
        >
          <HeroJobField />
        </motion.div>
      </section>

      <footer className="mx-auto w-full max-w-[1000px] border-t border-[color:var(--paper-line)] px-6 py-10 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--code-comment)] md:px-10">
        // commitly · hook em hacks 2026
      </footer>
    </PaperSurface>
  );
}
