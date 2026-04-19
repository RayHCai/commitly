"use client";

import * as React from "react";

import {
  DASHBOARD_SECTION_LABEL,
  DASHBOARD_SECTION_SUBTEXT,
} from "@/lib/dashboard-section-styles";
import {
  jobPostings,
  links as trackedLinks,
  mockUser,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

function overviewStats() {
  const activeLinksCount = trackedLinks.length;
  const totalViews = trackedLinks.reduce((sum, l) => sum + l.views, 0);
  const uniqueViewersTotal = trackedLinks.reduce(
    (sum, l) => sum + l.uniqueViewers,
    0
  );
  const jobPostingTotal = jobPostings.length;
  const activePostingCount = jobPostings.filter((j) => j.status === "active")
    .length;

  return {
    activeLinksCount,
    totalViews,
    uniqueViewersTotal,
    jobPostingTotal,
    activePostingCount,
  };
}

type StatCardProps = {
  label: string;
  value: number | string;
  trend: React.ReactNode;
  trendTone: "success" | "muted";
};

function StatCard({ label, value, trend, trendTone }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-card p-6 shadow-card transition-all duration-200 md:p-7",
        "hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(26,26,23,0.08)]"
      )}
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-4 font-serif text-[3rem] font-normal leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p
        className={cn(
          "mt-3 text-sm",
          trendTone === "success" ? "text-success" : "text-[color:var(--text-secondary)]"
        )}
      >
        {trend}
      </p>
    </div>
  );
}

export function DashboardOverview() {
  const firstName =
    mockUser.fullName.trim().split(/\s+/)[0] ?? mockUser.fullName;
  const stats = overviewStats();

  return (
    <div>
      <p className={DASHBOARD_SECTION_LABEL}>DASHBOARD</p>
      <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight text-foreground md:text-[2.75rem] md:leading-tight">
        Welcome back, {firstName}.
      </h1>
      <p className={cn(DASHBOARD_SECTION_SUBTEXT, "mt-4")}>
        Manage your saved roles, generated links, and see who&apos;s looking.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
        <StatCard
          label="ACTIVE LINKS"
          value={stats.activeLinksCount}
          trend="+1 this week"
          trendTone="success"
        />
        <StatCard
          label="TOTAL VIEWS"
          value={stats.totalViews}
          trend="+8 this week"
          trendTone="success"
        />
        <StatCard
          label="UNIQUE VIEWERS"
          value={stats.uniqueViewersTotal}
          trend="+5 this week"
          trendTone="success"
        />
        <StatCard
          label="JOB POSTINGS"
          value={stats.jobPostingTotal}
          trend={`${stats.activePostingCount} active`}
          trendTone="muted"
        />
      </div>
    </div>
  );
}
