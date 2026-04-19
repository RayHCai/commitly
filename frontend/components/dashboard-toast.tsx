"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type DashboardToastProps = {
  message: string;
  show: boolean;
  className?: string;
};

/**
 * Bottom-center toast: white card, 1px border, soft shadow, 8px radius, Inter medium.
 */
export function DashboardToast({
  message,
  show,
  className,
}: DashboardToastProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "pointer-events-none fixed bottom-8 left-1/2 z-[100] -translate-x-1/2",
            "rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-md",
            className
          )}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
