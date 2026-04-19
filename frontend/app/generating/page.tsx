"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PaperSurface } from "@/components/recruiter/paper-surface";
import { AgentAnimation } from "@/components/agent-animation";

function GeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId") ?? "";
  const linkId = searchParams.get("linkId") ?? "";

  const handleAnimationComplete = React.useCallback(() => {
    const dest = linkId ? `/dashboard?newLinkId=${encodeURIComponent(linkId)}` : "/dashboard";
    router.push(dest);
  }, [router, linkId]);

  return (
    <PaperSurface>
      <AgentAnimation taskId={taskId} onComplete={handleAnimationComplete} />
    </PaperSurface>
  );
}

export default function GeneratingPage() {
  return (
    <React.Suspense>
      <GeneratingContent />
    </React.Suspense>
  );
}
