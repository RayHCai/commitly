"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Align = "left" | "center";
type HeadlineSize = "md" | "lg" | "xl" | "2xl";

const EASE: [number, number, number, number] = [0.22, 0.8, 0.26, 1];

/**
 * A single viewport-height scene in the scroll-story aesthetic:
 * paper background behind, mono `// eyebrow`, serif-huge headline, fades on
 * whileInView.
 */
export function Scene({
  eyebrow,
  counter,
  children,
  className,
  fullViewport = true,
  align = "left",
  id,
}: {
  eyebrow?: string;
  counter?: string;
  children: React.ReactNode;
  className?: string;
  fullViewport?: boolean;
  align?: Align;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto flex w-full max-w-[1000px] flex-col px-6 md:px-10",
        fullViewport ? "min-h-[90vh] justify-center py-16" : "py-16 md:py-20",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {(eyebrow || counter) && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--code-comment)]"
        >
          {eyebrow && <span>{`// ${eyebrow}`}</span>}
          {eyebrow && counter && (
            <span className="mx-2 text-[color:var(--paper-line)]">·</span>
          )}
          {counter && <span>{counter}</span>}
        </motion.p>
      )}
      {children}
    </section>
  );
}

export function SceneHeadline({
  children,
  className,
  size = "xl",
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  size?: HeadlineSize;
  as?: "h1" | "h2" | "h3";
}) {
  const sizes: Record<HeadlineSize, string> = {
    md: "text-[32px] md:text-[44px]",
    lg: "text-[40px] md:text-[60px]",
    xl: "text-[56px] md:text-[84px]",
    "2xl": "text-[72px] md:text-[108px]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
    >
      <Tag
        className={cn(
          "font-serif font-normal leading-[1.02] tracking-tight text-[color:var(--ink)]",
          sizes[size],
          className,
        )}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

export function SceneSubheading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
      className={cn(
        "mt-5 max-w-[42rem] font-serif text-[18px] italic leading-snug text-[color:var(--ink-muted)] md:text-[22px]",
        className,
      )}
    >
      {children}
    </motion.p>
  );
}

export function SceneBody({
  children,
  className,
  delay = 0.28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={cn("mt-8", className)}
    >
      {children}
    </motion.div>
  );
}

/** Small anchor label below a scene, suggesting scroll. */
export function SceneScrollHint({ label = "scroll" }: { label?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="mt-16 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--code-comment)]"
    >
      {label} ↓
    </motion.p>
  );
}
