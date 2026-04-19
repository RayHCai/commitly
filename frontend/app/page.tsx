"use client";

import { motion } from "framer-motion";

import { HeroJobField } from "@/components/hero-job-field";
import { PaperSurface } from "@/components/recruiter/paper-surface";
import { RecruiterOnePagerPreview } from "@/components/recruiter-one-pager-preview";
import {
  Scene,
  SceneBody,
  SceneHeadline,
  SceneScrollHint,
  SceneSubheading,
} from "@/components/scene/scene";

const EASE: [number, number, number, number] = [0.22, 0.8, 0.26, 1];

const steps = [
  {
    num: "01",
    title: "Paste a job.",
    body: "Drop in any job posting. We extract the skills and signals that matter.",
  },
  {
    num: "02",
    title: "Connect GitHub.",
    body: "We read your commits and diffs to find the work that proves each skill.",
  },
  {
    num: "03",
    title: "Share a link.",
    body: "One page a recruiter can scan in a minute, backed by real commits.",
  },
] as const;

const recruiterBullets = [
  "Skills matched to the role, each backed by actual commits.",
  "Click through to the exact code on GitHub.",
  "Resume, LinkedIn, and grad date at a glance.",
] as const;

export default function Home() {
  return (
    <PaperSurface>
      {/* Scene 1 — Hero */}
      <Scene eyebrow="commitly" align="center">
        <SceneHeadline as="h1" size="xl" className="text-center">
          Your code,
          <br />
          <span className="italic text-[color:var(--ink-soft)]">
            tailored to the job.
          </span>
        </SceneHeadline>
        <SceneSubheading className="mx-auto text-center">
          Paste a job. Connect GitHub. Share one link that proves your fit.
        </SceneSubheading>
        <SceneBody className="mx-auto w-full max-w-xl">
          <HeroJobField />
        </SceneBody>
        <div className="mx-auto">
          <SceneScrollHint />
        </div>
      </Scene>

      {/* Scene 2 — The problem */}
      <Scene eyebrow="the problem">
        <SceneHeadline size="2xl">
          Resumes tell.
          <br />
          <span className="text-[color:var(--ink-muted)]">Commits prove.</span>
        </SceneHeadline>
        <SceneSubheading>
          Bullets can&apos;t show how someone thinks. A commit can.
        </SceneSubheading>
      </Scene>

      {/* Scene 3 — How it works */}
      <Scene eyebrow="how it works">
        <SceneHeadline size="lg">Three steps.</SceneHeadline>
        <SceneSubheading>
          From pasted job to shareable link in about a minute.
        </SceneSubheading>
        <SceneBody className="grid gap-10 md:mt-14 md:grid-cols-3 md:gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.1,
                ease: EASE,
              }}
              className="flex flex-col"
            >
              <span
                className="font-mono text-[13px] font-medium tracking-[0.14em] text-[color:var(--code-number)]"
                aria-hidden
              >
                {step.num}
              </span>
              <h3 className="mt-3 font-serif text-[28px] leading-tight tracking-tight text-[color:var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--ink-soft)]">
                {step.body}
              </p>
            </motion.div>
          ))}
        </SceneBody>
      </Scene>

      {/* Scene 4 — Recruiter view */}
      <Scene eyebrow="what recruiters see">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
          <div>
            <SceneHeadline size="lg">One page. Zero fluff.</SceneHeadline>
            <SceneSubheading>
              The evidence sits where they look, nothing more.
            </SceneSubheading>
            <SceneBody delay={0.3} className="mt-8 flex flex-col gap-4">
              {recruiterBullets.map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.4 + i * 0.08,
                    ease: EASE,
                  }}
                  className="flex gap-3 text-[15px] leading-[1.55] text-[color:var(--ink-soft)]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-[6px] shrink-0 rounded-full bg-[color:var(--code-fn)]"
                  />
                  <span>{text}</span>
                </motion.div>
              ))}
            </SceneBody>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            role="region"
            aria-label="Example one-page recruiter profile"
            className="w-full"
          >
            <RecruiterOnePagerPreview />
          </motion.div>
        </div>
      </Scene>

      {/* Scene 5 — Final CTA */}
      <Scene eyebrow="start" align="center">
        <SceneHeadline size="xl" className="text-center">
          Your work,
          <br />
          <span className="italic">on one page.</span>
        </SceneHeadline>
        <SceneSubheading className="mx-auto text-center">
          Drop in a job. Get your link.
        </SceneSubheading>
        <SceneBody className="mx-auto w-full max-w-xl">
          <HeroJobField />
        </SceneBody>
      </Scene>

      <footer className="mx-auto w-full max-w-[1000px] border-t border-[color:var(--paper-line)] px-6 py-10 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)] md:px-10">
        {"// commitly · hook em hacks 2026"}
      </footer>
    </PaperSurface>
  );
}
