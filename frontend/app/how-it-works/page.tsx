import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  FilePenLine,
  GitBranch,
  GitCommitHorizontal,
  Layers,
  Link2,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import { RecruiterOnePagerPreview } from "@/components/recruiter-one-pager-preview";
import {
  Scene,
  SceneBody,
  SceneHeadline,
  SceneSubheading,
} from "@/components/scene/scene";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Commitly turns GitHub commits into role-specific signal using six specialized agents that work in parallel and deliberate.",
};

function AgentBlock({
  Icon,
  name,
  children,
}: {
  Icon: LucideIcon;
  name: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-6 md:p-7">
      <div className="flex gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg)] text-[color:var(--code-fn)]"
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-[13px] font-medium tracking-tight text-[color:var(--ink)]">
            {name.toLowerCase().replace(/\s+/g, "_")}
          </h3>
          <div className="mt-3 space-y-3 text-[15px] leading-[1.6] text-[color:var(--ink-soft)]">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Six agents in a ring, center deliberation hub. */
function DeliberationDiagram() {
  const agents = [
    { label: "Skills", angle: -90 },
    { label: "Commit", angle: -30 },
    { label: "Complexity", angle: 30 },
    { label: "Authenticity", angle: 90 },
    { label: "Matching", angle: 150 },
    { label: "Summary", angle: -150 },
  ];
  const r = 68;
  const cx = 100;
  const cy = 100;

  return (
    <figure className="mx-auto max-w-md rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-6 md:p-8">
      <svg
        viewBox="0 0 200 200"
        className="h-auto w-full text-[color:var(--code-fn)]"
        aria-labelledby="deliberation-diagram-title"
        role="img"
      >
        <title id="deliberation-diagram-title">
          Six agents connected to a central deliberation step
        </title>
        {agents.map(({ angle }, i) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          return (
            <line
              key={`line-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.28}
              strokeWidth={1.25}
            />
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={1}
        />
        <circle
          cx={cx}
          cy={cy}
          r={22}
          fill="var(--paper-bg)"
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeWidth={1.25}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[color:var(--ink)] font-mono"
          style={{ fontSize: "8px" }}
        >
          deliberate
        </text>
        {agents.map(({ label, angle }, i) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          return (
            <g key={label}>
              <circle
                cx={x}
                cy={y}
                r={14}
                fill="var(--paper-bg)"
                stroke="currentColor"
                strokeOpacity={0.5}
                strokeWidth={1}
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[color:var(--ink)] font-mono font-medium"
                style={{ fontSize: "6.5px" }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
        outputs converge · conflicts trigger a second pass
      </figcaption>
    </figure>
  );
}

export default function HowItWorksPage() {
  return (
    <PaperSurface>
      {/* Scene 1 — Intro */}
      <Scene eyebrow="how it works">
        <SceneHeadline as="h1" size="xl">
          Commits
          <br />
          <span className="italic text-[color:var(--ink-muted)]">
            into signal.
          </span>
        </SceneHeadline>
        <SceneSubheading>
          A short guide to what happens between paste and share.
        </SceneSubheading>
      </Scene>

      {/* Scene 2 — Two inputs */}
      <Scene eyebrow="inputs · 01">
        <SceneHeadline size="lg">Two inputs.</SceneHeadline>
        <SceneSubheading>
          Commitly needs two things. Everything else is derived.
        </SceneSubheading>
        <SceneBody className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-6 md:p-7">
            <div className="flex size-11 items-center justify-center rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg)] text-[color:var(--code-fn)]">
              <Briefcase className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="mt-5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--ink)]">
              job posting
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-[color:var(--ink-soft)]">
              You paste the role description. We treat it as the contract: what
              skills matter, what tools show up, what seniority sounds like.
            </p>
          </div>
          <div className="rounded-[10px] border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)] p-6 md:p-7">
            <div className="flex size-11 items-center justify-center rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg)] text-[color:var(--code-fn)]">
              <GitBranch className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="mt-5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--ink)]">
              github access
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-[color:var(--ink-soft)]">
              You connect the repos that represent your work. We read commits
              and diffs. We never rewrite your history or ship code on your
              behalf.
            </p>
          </div>
        </SceneBody>
      </Scene>

      {/* Scene 3 — Six agents (not fullViewport; long content) */}
      <Scene eyebrow="agents · 02" fullViewport={false}>
        <SceneHeadline size="lg">Six agents. One decision.</SceneHeadline>
        <SceneSubheading>
          Six specialized models run in parallel. They deliberate and produce a
          single verified output.
        </SceneSubheading>

        <blockquote className="my-12 border-l-[3px] border-[color:var(--code-fn)] py-1 pl-6 font-serif text-[22px] leading-snug text-[color:var(--ink)] md:text-[26px]">
          Parallel specialists, not one generalist, so signal stays tied to
          evidence you can audit.
        </blockquote>

        <SceneBody delay={0.2} className="flex flex-col gap-5">
          <AgentBlock Icon={ClipboardList} name="Skills agent">
            <p>
              Parses the job posting to extract required skills, preferred
              tools, and signals of seniority.
            </p>
            <p>
              <span className="font-medium text-[color:var(--ink)]">
                Output:
              </span>{" "}
              a weighted skill vector representing what this role actually
              needs.
            </p>
          </AgentBlock>
          <AgentBlock Icon={GitCommitHorizontal} name="Commit agent">
            <p>
              Reads every commit and diff across connected repos. Parses code
              changes and categorizes the work: new features, refactors, bug
              fixes, tests, or infrastructure.
            </p>
            <p>
              <span className="font-medium text-[color:var(--ink)]">
                Output:
              </span>{" "}
              a structured record of each commit with metadata.
            </p>
          </AgentBlock>
          <AgentBlock Icon={Layers} name="Complexity agent">
            <p>
              Scores the technical complexity of each contribution using AST
              analysis and change pattern heuristics.
            </p>
            <p>
              <span className="font-medium text-[color:var(--ink)]">
                Output:
              </span>{" "}
              a complexity score per commit and per repo.
            </p>
          </AgentBlock>
          <AgentBlock Icon={ShieldCheck} name="Authenticity agent">
            <p>
              Verifies you actually wrote the code. Checks commit authorship
              patterns, style consistency, and attribution.
            </p>
            <p>
              <span className="font-medium text-[color:var(--ink)]">
                Output:
              </span>{" "}
              an authenticity score that flags anything suspicious.
            </p>
          </AgentBlock>
          <AgentBlock Icon={Link2} name="Matching agent">
            <p>
              Maps your commits to the required skills from the job posting.
              Assigns confidence scores based on evidence strength.
            </p>
            <p>
              <span className="font-medium text-[color:var(--ink)]">
                Output:
              </span>{" "}
              a ranked list of skill matches with supporting commits.
            </p>
          </AgentBlock>
          <AgentBlock Icon={FilePenLine} name="Summary agent">
            <p>
              Writes the final technical cover letter and orchestrates how
              evidence is presented.
            </p>
            <p>
              <span className="font-medium text-[color:var(--ink)]">
                Output:
              </span>{" "}
              the recruiter page content you see when you open a Commitly link.
            </p>
          </AgentBlock>
        </SceneBody>
      </Scene>

      {/* Scene 4 — How agents agree */}
      <Scene eyebrow="deliberation · 03">
        <SceneHeadline size="lg">How agents agree.</SceneHeadline>
        <SceneSubheading>
          No single score gets to override the others without scrutiny.
        </SceneSubheading>
        <SceneBody className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-[15px] leading-[1.7] text-[color:var(--ink-soft)] md:text-[16px]">
            After each agent produces its output, they share findings and reach
            consensus. If the complexity agent says a commit is trivial but the
            matching agent rates it as strong evidence of a senior skill, the
            system pauses and re-evaluates. Only commits that survive
            deliberation make it onto your public page.
          </p>
          <DeliberationDiagram />
        </SceneBody>
      </Scene>

      {/* Scene 5 — What you get */}
      <Scene eyebrow="output · 04" fullViewport={false}>
        <SceneHeadline size="lg">What you get.</SceneHeadline>
        <SceneSubheading>
          A single page tailored to the role. Skills required by the job, the
          commits that prove them, a summary that explains why you fit.
        </SceneSubheading>
        <SceneBody delay={0.25} className="mt-10">
          <div
            role="region"
            aria-label="Example one-page recruiter profile"
          >
            <RecruiterOnePagerPreview />
          </div>
        </SceneBody>
      </Scene>

      {/* Scene 6 — Boundaries */}
      <Scene eyebrow="boundaries · 05">
        <div className="flex items-start gap-3">
          <div className="mt-2 flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg-deep)] text-[color:var(--code-fn)]">
            <Lock className="size-4" strokeWidth={1.75} aria-hidden />
          </div>
          <SceneHeadline size="lg">What Commitly doesn&apos;t do.</SceneHeadline>
        </div>
        <SceneBody className="flex flex-col gap-4 text-[15px] leading-[1.6] text-[color:var(--ink-soft)] md:text-[16px]">
          <div className="flex gap-3">
            <span
              aria-hidden
              className="mt-2 size-[6px] shrink-0 rounded-full bg-[color:var(--code-attr)]"
            />
            <span>We never modify your code.</span>
          </div>
          <div className="flex gap-3">
            <span
              aria-hidden
              className="mt-2 size-[6px] shrink-0 rounded-full bg-[color:var(--code-attr)]"
            />
            <span>
              We don&apos;t publish commits publicly unless you share a link.
            </span>
          </div>
          <div className="flex gap-3">
            <span
              aria-hidden
              className="mt-2 size-[6px] shrink-0 rounded-full bg-[color:var(--code-attr)]"
            />
            <span>
              You control which links you share and can revoke them anytime.
            </span>
          </div>
          <div className="flex gap-3">
            <span
              aria-hidden
              className="mt-2 size-[6px] shrink-0 rounded-full bg-[color:var(--code-attr)]"
            />
            <span>
              We don&apos;t store your GitHub token longer than needed for
              analysis.
            </span>
          </div>
        </SceneBody>
      </Scene>

      <footer className="mx-auto w-full max-w-[1000px] border-t border-[color:var(--paper-line)] px-6 py-10 md:px-10">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
        >
          ← back to home
        </Link>
      </footer>
    </PaperSurface>
  );
}
