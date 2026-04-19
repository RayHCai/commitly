import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PaperSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "paper-bg relative min-h-screen text-[color:var(--ink)]",
        className,
      )}
      style={{ color: "var(--ink)" }}
    >
      {children}
    </div>
  );
}
