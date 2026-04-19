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

import { RecruiterOnePagerPreview } from "@/components/recruiter-one-pager-preview";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Commitly turns GitHub commits into role-specific signal using six specialized agents that work in parallel and deliberate.",
};

function SectionDivider() {
  return (
    <div
      className="my-20 border-t border-border md:my-28"
      aria-hidden
    />
  );
}

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
    <article className="rounded-xl border border-border bg-card/80 p-6 shadow-card md:p-8">
      <div className="flex gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary"
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-semibold leading-snug text-foreground">
            {name}
          </h3>
          <div className="mt-4 space-y-3 text-[1.05rem] leading-[1.65] text-[color:var(--text-secondary)] md:text-[1.0625rem] md:leading-[1.7]">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Simple diagram: six nodes in a ring with center deliberation hub */
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
    <figure className="mx-auto max-w-md rounded-xl border border-border bg-muted/30 p-6 md:p-8">
      <svg
        viewBox="0 0 200 200"
        className="h-auto w-full text-primary"
        aria-labelledby="deliberation-diagram-title"
        role="img"
      >
        <title id="deliberation-diagram-title">
          Six agents connected to a central deliberation step
        </title>
        {/* Ring connectors */}
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
              strokeOpacity={0.22}
              strokeWidth={1.25}
            />
          );
        })}
        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={1}
        />
        {/* Center */}
        <circle
          cx={cx}
          cy={cy}
          r={22}
          fill="var(--card)"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1.25}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-sans text-[9px] font-semibold"
          style={{ fontSize: "8.5px" }}
        >
          Deliberate
        </text>
        {/* Agent nodes */}
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
                fill="var(--card)"
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeWidth={1}
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-sans font-medium"
                style={{ fontSize: "6.5px" }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-4 text-center text-xs text-muted-foreground">
        Outputs converge; conflicting signals trigger a second pass before
        anything goes public.
      </figcaption>
    </figure>
  );
}

export default function HowItWorksPage() {
  return (
    <article className="mx-auto max-w-[720px] px-6 pb-28 pt-10 md:pb-36 md:pt-16">
        <header className="text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
            How it works
          </p>
          <h1 className="mt-6 font-serif text-[2.75rem] font-normal leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[4.75rem] lg:leading-[1.05]">
            How Commitly turns commits into signal.
          </h1>
          <p className="mx-auto mt-8 max-w-[38rem] text-[1.125rem] leading-[1.65] text-[color:var(--text-secondary)] md:mx-0 md:text-xl md:leading-[1.7]">
            A short guide to what happens between paste and share.
          </p>
        </header>

        <SectionDivider />

        {/* Section 1 */}
        <section>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-[2.25rem] md:leading-tight">
            Two inputs.
          </h2>
          <p className="mt-8 text-[1.0625rem] leading-[1.7] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.68]">
            Commitly needs two things: a job posting and access to your GitHub.
            Everything else is derived.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card md:p-7">
              <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/60 text-primary">
                <Briefcase className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-5 font-sans text-sm font-semibold uppercase tracking-wide text-foreground">
                Job posting
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                You paste the role description. We treat it as the contract:
                what skills matter, what tools show up, what seniority sounds
                like.
              </p>
            </div>
            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card md:p-7">
              <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/60 text-primary">
                <GitBranch className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-5 font-sans text-sm font-semibold uppercase tracking-wide text-foreground">
                GitHub access
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                You connect the repos that represent your work. We read commits
                and diffs. We never rewrite your history or ship code on your
                behalf.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Section 2 */}
        <section>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-[2.25rem] md:leading-tight">
            Six agents. One decision.
          </h2>
          <p className="mt-8 text-[1.0625rem] leading-[1.7] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.68]">
            Most AI products use a single model to answer everything. Commitly is
            different. We run six specialized agents in parallel, each one
            evaluating a different dimension. They deliberate and produce a
            single verified output.
          </p>

          <blockquote className="my-14 border-l-[3px] border-primary py-1 pl-6 font-serif text-xl leading-snug text-foreground md:text-2xl md:leading-snug">
            Parallel specialists, not one generalist, so signal stays tied to
            evidence you can audit.
          </blockquote>

          <div className="flex flex-col gap-6">
            <AgentBlock Icon={ClipboardList} name="Skills agent">
              <p>
                Parses the job posting to extract required skills, preferred
                tools, and signals of seniority.
              </p>
              <p>
                <span className="font-medium text-foreground">Output:</span> a
                weighted skill vector representing what this role actually needs.
              </p>
            </AgentBlock>

            <AgentBlock Icon={GitCommitHorizontal} name="Commit agent">
              <p>
                Reads every commit and diff across connected repos. Parses code
                changes and categorizes the work: new features, refactors, bug
                fixes, tests, or infrastructure.
              </p>
              <p>
                <span className="font-medium text-foreground">Output:</span> a
                structured record of each commit with metadata.
              </p>
            </AgentBlock>

            <AgentBlock Icon={Layers} name="Complexity agent">
              <p>
                Scores the technical complexity of each contribution using AST
                analysis and change pattern heuristics.
              </p>
              <p>
                <span className="font-medium text-foreground">Output:</span> a
                complexity score per commit and per repo.
              </p>
            </AgentBlock>

            <AgentBlock Icon={ShieldCheck} name="Authenticity agent">
              <p>
                Verifies you actually wrote the code. Checks commit authorship
                patterns, style consistency, and attribution.
              </p>
              <p>
                <span className="font-medium text-foreground">Output:</span> an
                authenticity score that flags anything suspicious.
              </p>
            </AgentBlock>

            <AgentBlock Icon={Link2} name="Matching agent">
              <p>
                Maps your commits to the required skills from the job posting.
                Assigns confidence scores based on evidence strength.
              </p>
              <p>
                <span className="font-medium text-foreground">Output:</span> a
                ranked list of skill matches with supporting commits.
              </p>
            </AgentBlock>

            <AgentBlock Icon={FilePenLine} name="Summary agent">
              <p>
                Writes the final technical cover letter and orchestrates how
                evidence is presented.
              </p>
              <p>
                <span className="font-medium text-foreground">Output:</span> the
                recruiter page content you see when you open a Commitly link.
              </p>
            </AgentBlock>
          </div>
        </section>

        <SectionDivider />

        {/* Section 3 */}
        <section>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-[2.25rem] md:leading-tight">
            How agents agree.
          </h2>
          <p className="mt-8 text-[1.0625rem] leading-[1.7] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.68]">
            After each agent produces its output, they share findings and reach
            consensus. If the complexity agent says a commit is trivial but the
            matching agent rates it as strong evidence of a senior skill, the
            system pauses and re-evaluates. Only commits that survive
            deliberation make it onto your public page.
          </p>

          <DeliberationDiagram />

          <p className="mt-12 text-[1.0625rem] leading-[1.7] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.68]">
            That decentralized loop is what keeps the narrative honest: no
            single score gets to override the others without scrutiny.
          </p>
        </section>

        <SectionDivider />

        {/* Section 4 */}
        <section>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-[2.25rem] md:leading-tight">
            What you get.
          </h2>
          <p className="mt-8 text-[1.0625rem] leading-[1.7] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.68]">
            The result is a single page tailored to the role you pasted. It shows
            the skills required by the job, the commits that prove you have them,
            and a technical summary explaining why you fit.
          </p>

          <figure className="mt-12 space-y-6">
            <div
              role="region"
              aria-label="Example one-page recruiter profile"
            >
              <RecruiterOnePagerPreview />
            </div>
            <figcaption className="text-[1.0625rem] leading-[1.65] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.68]">
              Below is a realistic sample of that page: your identity and role,
              quick facts for recruiters, skills mapped to the posting with plain
              English proof, and a tight summary line they can quote.
            </figcaption>
          </figure>

          <ul className="mt-10 grid gap-5 sm:grid-cols-3">
            <li className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Identity
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Name, role you&apos;re targeting, tagline, and resume / LinkedIn /
                school so context is one glance away.
              </p>
            </li>
            <li className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Matched skills
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Chips for each skill the job cares about, plus short narrative
                explaining how your work backs them up—not buzzwords alone.
              </p>
            </li>
            <li className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bottom line
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                A pull-quote style takeaway so busy recruiters get the thesis in
                one sentence before they dive into commits.
              </p>
            </li>
          </ul>
        </section>

        <SectionDivider />

        {/* Section 5 */}
        <section>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
              <Lock className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-[2.25rem] md:leading-tight">
                What Commitly doesn&apos;t do.
              </h2>
            </div>
          </div>
          <ul
            className={cn(
              "mt-10 space-y-5 text-[1.0625rem] leading-[1.65] text-[color:var(--text-secondary)] md:text-lg md:leading-[1.65]"
            )}
          >
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/80" />
              <span>We never modify your code.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/80" />
              <span>
                We don&apos;t publish commits publicly unless you share a link.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/80" />
              <span>
                You control which links you share and can revoke them anytime.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/80" />
              <span>
                We don&apos;t store your GitHub token longer than needed for
                analysis.
              </span>
            </li>
          </ul>
        </section>

        <footer className="mt-24 border-t border-border pt-12 md:mt-32">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
        </footer>
    </article>
  );
}
