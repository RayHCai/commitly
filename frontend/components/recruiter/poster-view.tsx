"use client";

import * as React from "react";
import Link from "next/link";
import { Download } from "lucide-react";

import type { RecruiterTopSkill, RecruiterUser, JobContext } from "@/lib/mockData";

import { SkillCommitPair } from "./skill-commit-pair";
import { IconGitHub, IconLinkedIn } from "./social-icons";

export function PosterView({
  slug,
  user,
  job,
  skills,
}: {
  slug: string;
  user: RecruiterUser;
  job: JobContext;
  skills: RecruiterTopSkill[];
}) {
  const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;

  return (
    <main className="mx-auto w-full max-w-[1000px] px-6 pb-28 pt-10 md:px-10 md:pt-14">
      {/* Identity strip */}
      <header className="border-b border-[color:var(--paper-line)] pb-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-serif text-[13px] italic text-[color:var(--ink-muted)]">
              Candidate
            </p>
            <h1 className="font-serif text-[44px] leading-[1.02] tracking-tight text-[color:var(--ink)] md:text-[56px]">
              {user.fullName}
            </h1>
            <p className="mt-0.5 text-[13px] text-[color:var(--ink-muted)]">
              {user.school}
              <span className="mx-2 text-[color:var(--paper-line)]">·</span>
              {user.graduationDate}
            </p>
          </div>

          <div className="flex flex-col gap-1 md:items-end">
            <p className="font-serif text-[13px] italic text-[color:var(--ink-muted)]">
              Applying for
            </p>
            <p className="font-serif text-[22px] leading-tight text-[color:var(--ink)] md:text-[26px]">
              {job.roleTitle}{" "}
              <span className="text-[color:var(--ink-muted)]">at</span>{" "}
              {job.company}
            </p>
            <nav
              className="mt-2 flex items-center gap-4 text-[13px]"
              aria-label="Profile links"
            >
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[color:var(--ink-soft)] underline-offset-4 transition-colors hover:text-[color:var(--code-fn)] hover:underline"
              >
                <Download
                  className="size-[14px]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Resume
              </a>
              <span
                aria-hidden
                className="h-3 w-px bg-[color:var(--paper-line)]"
              />
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--code-fn)]"
              >
                <IconLinkedIn className="size-[17px]" />
              </a>
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex items-center justify-center text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--code-fn)]"
              >
                <IconGitHub className="size-[17px]" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero sub-heading — recruiter-friendly, not a code comment */}
      <div className="mt-12 md:mt-14">
        <h2 className="font-serif text-[30px] leading-[1.15] tracking-tight text-[color:var(--ink)] md:text-[38px]">
          {skills.length} skills this role asks for.
        </h2>
        <p className="mt-2 font-serif text-[18px] italic leading-snug text-[color:var(--ink-muted)] md:text-[20px]">
          Each backed by work {firstName} has actually shipped.
        </p>
      </div>

      {/* Main stage */}
      <section className="mt-10 flex flex-col gap-10 md:gap-12">
        {skills.map((skill, i) => (
          <SkillCommitPair
            key={skill.name}
            skill={skill}
            layout="row"
            variant="clean"
            index={i}
          />
        ))}
      </section>

      {/* Explorer CTA */}
      <div className="mt-20 border-t border-[color:var(--paper-line)] pt-8">
        <Link
          href={`/c/${slug}/commits`}
          className="group inline-flex items-baseline gap-2 text-[color:var(--ink)]"
        >
          <span className="font-serif text-[22px] tracking-tight underline-offset-[6px] group-hover:underline md:text-[24px]">
            See every commit {firstName} has shipped
          </span>
          <span
            className="text-[18px] text-[color:var(--ink-muted)] transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </Link>
      </div>

      <footer className="mt-20 flex items-center justify-between text-[12px] text-[color:var(--ink-muted)]">
        <Link
          href="/"
          className="underline-offset-4 hover:text-[color:var(--ink)] hover:underline"
        >
          Built on Commitly
        </Link>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
