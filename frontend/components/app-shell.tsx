"use client";

import { PageReadyGate } from "@/components/page-ready-gate";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageReadyGate>{children}</PageReadyGate>
    </>
  );
}
