"use client";

import * as React from "react";

import { DashboardLinksSection } from "@/components/dashboard-links-section";
import { DashboardOverview } from "@/components/dashboard-overview";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import {
  DASHBOARD_SECTION_LABEL,
  DASHBOARD_SECTION_SUBTEXT,
  DASHBOARD_SECTION_TITLE,
} from "@/lib/dashboard-section-styles";
import { mockSkillScores, reposSupportingSkill } from "@/lib/mockData";

export default function DashboardPage() {
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    const id = window.setTimeout(() => setShowContent(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  if (!showContent) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <DashboardOverview />

      <div className="mt-24 space-y-24">
        <DashboardLinksSection />

        {/* Skills ↔ repos */}
        <section>
          <p className={DASHBOARD_SECTION_LABEL}>SKILLS &amp; PROJECTS</p>
          <h2 className={DASHBOARD_SECTION_TITLE}>Where each skill shows up.</h2>
          <p className={DASHBOARD_SECTION_SUBTEXT}>
            Repos with the strongest signal for skills your postings asked for—no
            numeric scores, just the work that maps to the role.
          </p>

          <div className="mt-10 rounded-[12px] border border-border bg-card px-5 py-2 shadow-card md:px-8">
            {mockSkillScores.map((skill) => {
              const repos = reposSupportingSkill(skill.name);
              return (
                <div
                  key={skill.name}
                  className="border-b border-border py-6 last:border-0"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <div className="min-w-[10rem]">
                      <p className="text-sm font-semibold text-foreground">
                        {skill.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {skill.supportingCommits} commits analyzed
                      </p>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                      {repos.length > 0 ? (
                        repos.map((repo) => (
                          <span
                            key={repo}
                            className="inline-flex rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs text-foreground"
                          >
                            {repo}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No indexed commits for this skill yet.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
