import type { ReactNode } from "react";

import { MarketingSiteHeader } from "@/components/marketing-site-header";

export default function HowItWorksLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader />
      {children}
    </div>
  );
}
