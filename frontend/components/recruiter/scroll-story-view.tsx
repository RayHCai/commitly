"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import type {
  JobContext,
  RecruiterTopSkill,
  RecruiterUser,
} from "@/lib/mockData";
import {
  EXPLORER_TOTAL_COMMITS,
  EXPLORER_TOTAL_REPOS,
} from "@/lib/commit-explorer-data";

import { SkillCommitPair } from "./skill-commit-pair";
import { skillColorVar } from "./code-color";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

export function ScrollStoryView({
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
  return (
    <main className="mx-auto w-full max-w-[1000px] px-6 md:px-10">
      {/* Scene 1 — Who */}
      <section className="flex min-h-[90vh] flex-col justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="flex flex-col gap-3"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]">
            {"// candidate"}
          </p>
          <h1 className="font-serif text-[64px] leading-[0.98] tracking-tight text-[color:var(--ink)] md:text-[96px]">
            {user.fullName}.
          </h1>
          <p className="mt-2 font-mono text-[13px] text-[color:var(--ink-muted)]">
            {user.school}
            <span className="mx-2 text-[color:var(--paper-line)]">·</span>
            {user.graduationDate}
          </p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-16 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]"
        >
          scroll ↓
        </motion.p>
      </section>

      {/* Scene 2 — What the role needs */}
      <section className="flex min-h-[90vh] flex-col justify-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]">
            {"// applying for"}
          </p>
          <h2 className="mt-2 font-serif text-[40px] leading-[1.05] tracking-tight text-[color:var(--ink)] md:text-[56px]">
            {job.roleTitle}{" "}
            <span className="text-[color:var(--ink-muted)]">at</span>{" "}
            {job.company}.
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]"
        >
          {"// the role asks for:"}
        </motion.p>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <motion.span
              key={skill.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                delay: 0.8 + i * 0.12,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              }}
              className="rounded-full border border-[color:var(--paper-line)] bg-[color:var(--paper-bg-deep)]/50 px-3 py-1 font-mono text-[12px]"
              style={{ color: skillColorVar(skill.name) }}
            >
              {skill.name.toLowerCase().replace(/\s+/g, "_")}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Scenes 3–7 — one skill per scene, proof commit lands */}
      {skills.map((skill, i) => (
        <section
          key={skill.name}
          className="flex min-h-[90vh] flex-col justify-center py-20"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(200px,34%)_1fr] md:gap-12"
          >
            <motion.div variants={reveal} custom={0} className="md:sticky md:top-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--code-comment)]">
                {"// proof "}
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(skills.length).padStart(2, "0")}
              </p>
              <h3
                className="mt-2 font-serif text-[40px] leading-[1.05] tracking-tight md:text-[52px]"
                style={{ color: skillColorVar(skill.name) }}
              >
                {skill.name}.
              </h3>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
                {skill.pillMutedText}
                <span className="mx-2 text-[color:var(--paper-line)]">·</span>
                {skill.requiredLevel === "Required" ? "required" : "relevant"}
              </p>
            </motion.div>

            <motion.div variants={reveal} custom={1}>
              <SkillCommitPair
                skill={skill}
                layout="floating"
                defaultExpanded
              />
            </motion.div>
          </motion.div>
        </section>
      ))}

      {/* Scene 8 — Explorer entry */}
      <section className="flex min-h-[60vh] flex-col items-start justify-center border-t border-[color:var(--paper-line)] pt-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]"
        >
          {"// there's more"}
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-2 font-serif text-[36px] leading-[1.1] tracking-tight text-[color:var(--ink)] md:text-[44px]"
        >
          <span style={{ color: "var(--code-number)" }}>
            {EXPLORER_TOTAL_COMMITS}
          </span>{" "}
          commits ·{" "}
          <span style={{ color: "var(--code-number)" }}>
            {EXPLORER_TOTAL_REPOS}
          </span>{" "}
          repos.
        </motion.h3>
        <Link
          href={`/c/${slug}/commits`}
          className="mt-8 inline-flex items-center gap-2 font-mono text-[13px] text-[color:var(--ink)] underline-offset-4 transition-colors hover:text-[color:var(--code-fn)] hover:underline"
        >
          explore them all <span aria-hidden>→</span>
        </Link>

        <footer className="mt-24 flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]">
          <span>{"// built on commitly"}</span>
          <span>© 2026</span>
        </footer>
      </section>
    </main>
  );
}
