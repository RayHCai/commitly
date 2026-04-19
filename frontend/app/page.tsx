"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  GitCommitHorizontal,
  ContactRound,
} from "lucide-react";

import { HeroJobField } from "@/components/hero-job-field";
import { HomeTopBar } from "@/components/home-top-bar";
import { RecruiterOnePagerPreview } from "@/components/recruiter-one-pager-preview";
import { TypewriterHeadline } from "@/components/typewriter-headline";

const fadeUpTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

function FadeUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px", amount: 0.25 }}
      transition={fadeUpTransition}
    >
      {children}
    </motion.div>
  );
}

function HeroFadeUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}

const steps = [
  {
    num: "01",
    title: "Paste a job.",
    lines: [
      "Drop in any job posting URL",
      "and we extract the skills and signals.",
    ],
  },
  {
    num: "02",
    title: "Connect GitHub.",
    lines: [
      "We scan your commits, diffs, and repos",
      "to find matching work.",
    ],
  },
  {
    num: "03",
    title: "Share the link.",
    lines: [
      "Send one link that shows how your",
      "code maps to the role.",
    ],
  },
] as const;

const recruiterBullets = [
  {
    icon: BadgeCheck,
    text: "Skills matched to the role, with evidence",
  },
  {
    icon: GitCommitHorizontal,
    text: "Real commits, with links to the exact code",
  },
  {
    icon: ContactRound,
    text: "Resume, LinkedIn, and grad date at a glance",
  },
] as const;

export default function Home() {
  return (
    <main className="bg-background">
      <HomeTopBar />
      <div className="mx-auto flex max-w-[960px] flex-col gap-24 px-6 pb-24 pt-8 sm:gap-28 sm:px-8 sm:pb-28 sm:pt-10 md:gap-[120px] md:pb-28 md:pt-12">
        {/* Hero – bold typewriter headline */}
        <HeroFadeUp>
          <div className="flex min-w-0 justify-center overflow-x-auto overflow-y-hidden px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
            <TypewriterHeadline className="leading-[1.05] text-[clamp(1.05rem,min(2.85vw+0.7rem,4.75rem),4.75rem)]" />
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-pretty text-lg font-medium leading-snug text-foreground sm:mt-10 sm:text-xl md:mt-12 md:text-2xl md:leading-snug">
            Paste a job. Connect GitHub. One link that proves how your work
            fits the role.
          </p>
          <HeroJobField />
        </HeroFadeUp>

        {/* How it works */}
        <FadeUp>
          <div className="text-center md:text-left">
            <SectionLabel>How it works</SectionLabel>
            <div className="min-w-0 max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <h2 className="whitespace-nowrap font-serif text-3xl font-normal leading-snug tracking-tight text-foreground sm:text-4xl md:text-[2.25rem] md:leading-tight">
                Three steps to a technical portfolio that{" "}
                <span className="italic">speaks recruiter.</span>
              </h2>
            </div>
          </div>
          <div className="mt-12 grid gap-12 md:mt-14 md:grid-cols-3 md:gap-10 lg:gap-12">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex flex-col text-center md:text-left"
              >
                <span
                  className="font-serif text-4xl font-normal leading-none text-accent md:text-[2.5rem]"
                  aria-hidden
                >
                  {step.num}
                </span>
                <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {step.lines[0]}
                  <br />
                  <span
                    className={
                      step.num === "03"
                        ? "inline-block whitespace-nowrap"
                        : undefined
                    }
                  >
                    {step.lines[1]}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Recruiter view */}
        <FadeUp>
          <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-12 lg:gap-14">
            <div>
              <div className="text-center md:text-left">
                <SectionLabel>The recruiter view</SectionLabel>
                <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
                  One page. Zero fluff.
                </h2>
              </div>
              <ul className="mt-10 flex max-w-xl flex-col gap-5 md:mt-12">
                {recruiterBullets.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex gap-4 text-left text-base leading-snug text-[color:var(--text-secondary)]"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="pt-1.5">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="mx-auto w-full max-w-md md:mx-0 md:max-w-none md:pt-2 lg:sticky lg:top-24"
              role="region"
              aria-label="Example one-page recruiter profile"
            >
              <RecruiterOnePagerPreview />
            </div>
          </div>
        </FadeUp>

        {/* Footer */}
        <footer className="border-t border-border-light pt-10 text-center">
          <p className="text-xs text-muted-foreground">
            Commitly · Hook Em Hacks 2026
          </p>
        </footer>
      </div>
    </main>
  );
}
