/** Badge copy shown next to each matched skill drill-down */
export type SkillRequirementLevel =
  | "Required"
  | "Highly relevant to this role";

/** Proof-of-skill commits shown under each skill pill (plain language). */
export type RecruiterSkillProofCommit = {
  projectName: string;
  date: string;
  description: string;
  whyThisMatters: string;
  commitUrl: string;
  commitSha: string;
};

export type RecruiterTopSkill = {
  name: string;
  requiredLevel: SkillRequirementLevel;
  /** Muted text next to the name on the pill, e.g. "8 commits" or "Strong match" */
  pillMutedText: string;
  commits: RecruiterSkillProofCommit[];
};

export type RecruiterUser = {
  fullName: string;
  graduationDate: string;
  school: string;
  resumeUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  /** Short product line for bios and dashboard UI */
  tagline: string;
  /** Single flowing sentence for the public recruiter page header subline */
  subline: string;
};

export type JobContext = {
  roleTitle: string;
  company: string;
  jobUrl: string;
};

export const mockUser: RecruiterUser = {
  fullName: "Jihan Kapur",
  graduationDate: "May 2029",
  school: "UT Austin",
  resumeUrl: "#",
  linkedinUrl: "#",
  githubUrl: "#",
  tagline: "Building Iris, an agentic GTM platform.",
  subline:
    "Graduating May 2029 from UT Austin, building Iris, an agentic GTM platform.",
};

export const mockJob: JobContext = {
  roleTitle: "Software Engineer",
  company: "Acme Inc",
  jobUrl: "#",
};

/**
 * Top role-matched skills for the public recruiter page. Each skill includes
 * three commits with proof written for non-technical readers.
 */
export const recruiterTopSkills: RecruiterTopSkill[] = [
  {
    name: "TypeScript",
    requiredLevel: "Required",
    pillMutedText: "8 commits",
    commits: [
      {
        projectName: "Iris web app",
        date: "March 2026",
        description:
          "Rewrote a fragile customer sync so new customer types get caught during development instead of breaking in production.",
        whyThisMatters:
          "The role needs engineers who catch problems before they affect users. This commit shows Jihan improving safety checks so mistakes surface early.",
        commitUrl: "#",
        commitSha: "a4f9c2e",
      },
      {
        projectName: "Iris backend",
        date: "February 2026",
        description:
          "Unified how the product checks who is logged in so security rules stay consistent everywhere users touch the app.",
        whyThisMatters:
          "Enterprise roles expect predictable login behavior. This change shows Jihan removing gaps that could confuse auditors or leave holes between screens.",
        commitUrl: "#",
        commitSha: "91be203",
      },
      {
        projectName: "Iris partner toolkit",
        date: "January 2026",
        description:
          "Tightened partner-facing forms so incomplete or misleading data gets rejected before it reaches Iris.",
        whyThisMatters:
          "Partners send data at scale. This commit shows Jihan protecting downstream teams from bad inputs that would otherwise create noisy support tickets.",
        commitUrl: "#",
        commitSha: "c81d441",
      },
    ],
  },
  {
    name: "System Design",
    requiredLevel: "Highly relevant to this role",
    pillMutedText: "Strong match",
    commits: [
      {
        projectName: "Iris background jobs",
        date: "March 2026",
        description:
          "Added limits on retries and a place to park broken jobs so one bad sync cannot jam the whole queue.",
        whyThisMatters:
          "This role involves integrations that must stay reliable. The commit shows Jihan designing for failure instead of hoping vendors behave perfectly.",
        commitUrl: "#",
        commitSha: "7e2ba91",
      },
      {
        projectName: "Iris documentation",
        date: "February 2026",
        description:
          "Published a simple diagram of how inbound webhooks travel through Iris so anyone can spot weak spots quickly.",
        whyThisMatters:
          "Senior engineers communicate design clearly. This work helps onboarding and incident response, which matters as Acme scales the team.",
        commitUrl: "#",
        commitSha: "33ac10f",
      },
      {
        projectName: "Iris backend",
        date: "January 2026",
        description:
          "Spread traffic-heavy requests across smaller buckets so a spike from one customer does not starve everyone else.",
        whyThisMatters:
          "Shared SaaS products need fairness at scale. This commit shows Jihan thinking about noisy neighbors before they become outages.",
        commitUrl: "#",
        commitSha: "55d8118",
      },
    ],
  },
  {
    name: "API Integration",
    requiredLevel: "Required",
    pillMutedText: "6 commits",
    commits: [
      {
        projectName: "Iris connectors",
        date: "March 2026",
        description:
          "Synced large marketing lists in chunks and remembered where it left off so reconnecting never duplicates or skips rows.",
        whyThisMatters:
          "Marketing data volumes are huge. This commit proves Jihan can ship integrations that survive real-world interruptions.",
        commitUrl: "#",
        commitSha: "d902eef",
      },
      {
        projectName: "Iris connectors",
        date: "February 2026",
        description:
          "Handled empty responses during sandbox refreshes so background jobs pause cleanly instead of spinning forever.",
        whyThisMatters:
          "Vendor quirks break naive scripts. This change shows Jihan validating assumptions and avoiding runaway jobs.",
        commitUrl: "#",
        commitSha: "b2109aa",
      },
      {
        projectName: "Iris connectors",
        date: "January 2026",
        description:
          "Added polite retries when an outside API times out so customer data still arrives without someone clicking rerun.",
        whyThisMatters:
          "Acme likely depends on uptime from partners it does not control. This commit highlights resilient habits for flaky networks.",
        commitUrl: "#",
        commitSha: "6fd9a41",
      },
    ],
  },
  {
    name: "Authentication",
    requiredLevel: "Highly relevant to this role",
    pillMutedText: "Good match",
    commits: [
      {
        projectName: "Iris backend",
        date: "March 2026",
        description:
          "Refreshed long-lived login tokens and detected when the same token is reused in two places at once.",
        whyThisMatters:
          "Stolen credentials are a top risk for B2B products. This work shows Jihan tightening session hygiene beyond a basic password form.",
        commitUrl: "#",
        commitSha: "4c803d2",
      },
      {
        projectName: "Iris web app",
        date: "February 2026",
        description:
          "Matched single sign-on audience rules to each customer so a wrong setting becomes a guided fix instead of a silent failure.",
        whyThisMatters:
          "Enterprise buyers expect SSO to behave predictably. This commit reflects careful tenant-by-tenant configuration.",
        commitUrl: "#",
        commitSha: "e96f712",
      },
      {
        projectName: "Iris web app",
        date: "January 2026",
        description:
          "Shortened how long privileged sessions stay open after someone stops typing so shared laptops carry less risk.",
        whyThisMatters:
          "Compliance-minded customers care about idle access. This change shows Jihan balancing usability with sensible session limits.",
        commitUrl: "#",
        commitSha: "3ac7e90",
      },
    ],
  },
  {
    name: "Async Patterns",
    requiredLevel: "Required",
    pillMutedText: "7 commits",
    commits: [
      {
        projectName: "Iris background jobs",
        date: "March 2026",
        description:
          "Limited how many background tasks run at once and allowed clean shutdown so deploys never orphan half-done work.",
        whyThisMatters:
          "The role touches long-running backend work. This commit shows disciplined concurrency and safe releases.",
        commitUrl: "#",
        commitSha: "f21a880",
      },
      {
        projectName: "Iris backend",
        date: "February 2026",
        description:
          "Streamed large spreadsheet downloads in small pieces so giant customer lists never exhaust server memory.",
        whyThisMatters:
          "Data-heavy features are common in growth tools. This change proves Jihan can deliver exports that scale.",
        commitUrl: "#",
        commitSha: "19aa77d",
      },
      {
        projectName: "Iris web app",
        date: "January 2026",
        description:
          "Stopped duplicate tracking events when users hop between screens quickly.",
        whyThisMatters:
          "Reliable analytics matter for product decisions. This fix shows attention to race conditions that skew reporting.",
        commitUrl: "#",
        commitSha: "aa90233",
      },
    ],
  },
];

/** Used for OG image until a real asset ships */
export const ogImagePlaceholder =
  "https://placehold.co/1200x630/fafaf7/1f3a2e/png?text=Commitly";

/* ─── Rich demo datasets (job postings, links, view log) ─────────────── */

export type JobPostingStatus = "active" | "draft" | "archived";

export type JobPosting = {
  id: string;
  roleTitle: string;
  company: string;
  url: string;
  savedAt: string;
  status: JobPostingStatus;
};

export const jobPostings: JobPosting[] = [
  {
    id: "1",
    roleTitle: "Software Engineer",
    company: "Acme Inc",
    url: "https://acme.com/jobs/swe",
    savedAt: "2 days ago",
    status: "active",
  },
  {
    id: "2",
    roleTitle: "Product Manager",
    company: "Stripe",
    url: "https://stripe.com/jobs/pm",
    savedAt: "5 days ago",
    status: "active",
  },
  {
    id: "3",
    roleTitle: "ML Engineer",
    company: "Anthropic",
    url: "https://anthropic.com/jobs/ml",
    savedAt: "today",
    status: "draft",
  },
  {
    id: "4",
    roleTitle: "Full Stack Engineer",
    company: "Linear",
    url: "https://linear.app/jobs/fs",
    savedAt: "1 week ago",
    status: "archived",
  },
];

export type DemoSharedLink = {
  id: string;
  jobPostingId: string;
  slug: string;
  url: string;
  roleTitle: string;
  company: string;
  createdAt: string;
  views: number;
  uniqueViewers: number;
  lastViewedAt: string | null;
};

export const links: DemoSharedLink[] = [
  {
    id: "l1",
    jobPostingId: "1",
    slug: "jihan-acme",
    url: "commitly.io/c/jihan-acme",
    roleTitle: "Software Engineer",
    company: "Acme Inc",
    createdAt: "2 days ago",
    views: 12,
    uniqueViewers: 8,
    lastViewedAt: "3 hours ago",
  },
  {
    id: "l2",
    jobPostingId: "2",
    slug: "jihan-stripe",
    url: "commitly.io/c/jihan-stripe",
    roleTitle: "Product Manager",
    company: "Stripe",
    createdAt: "5 days ago",
    views: 5,
    uniqueViewers: 4,
    lastViewedAt: "2 days ago",
  },
  {
    id: "l3",
    jobPostingId: "3",
    slug: "jihan-anthropic",
    url: "commitly.io/c/jihan-anthropic",
    roleTitle: "ML Engineer",
    company: "Anthropic",
    createdAt: "today",
    views: 0,
    uniqueViewers: 0,
    lastViewedAt: null,
  },
];

export type DemoLinkView = {
  linkId: string;
  viewedAt: string;
  location: string;
  device: string;
  referrer: string;
};

export const linkViews: DemoLinkView[] = [
  {
    linkId: "l1",
    viewedAt: "3 hours ago",
    location: "San Francisco, CA",
    device: "Desktop",
    referrer: "LinkedIn",
  },
  {
    linkId: "l1",
    viewedAt: "5 hours ago",
    location: "New York, NY",
    device: "Mobile",
    referrer: "Direct",
  },
  {
    linkId: "l1",
    viewedAt: "1 day ago",
    location: "Austin, TX",
    device: "Desktop",
    referrer: "Email",
  },
  {
    linkId: "l1",
    viewedAt: "1 day ago",
    location: "London, UK",
    device: "Desktop",
    referrer: "LinkedIn",
  },
  {
    linkId: "l1",
    viewedAt: "2 days ago",
    location: "Remote",
    device: "Mobile",
    referrer: "Direct",
  },
  {
    linkId: "l1",
    viewedAt: "3 days ago",
    location: "Seattle, WA",
    device: "Desktop",
    referrer: "Greenhouse",
  },
  {
    linkId: "l1",
    viewedAt: "3 days ago",
    location: "Boston, MA",
    device: "Mobile",
    referrer: "LinkedIn",
  },
  {
    linkId: "l1",
    viewedAt: "4 days ago",
    location: "Remote",
    device: "Desktop",
    referrer: "Direct",
  },
  {
    linkId: "l2",
    viewedAt: "2 days ago",
    location: "New York, NY",
    device: "Desktop",
    referrer: "Greenhouse",
  },
  {
    linkId: "l2",
    viewedAt: "3 days ago",
    location: "San Francisco, CA",
    device: "Desktop",
    referrer: "Direct",
  },
  {
    linkId: "l2",
    viewedAt: "4 days ago",
    location: "Remote",
    device: "Mobile",
    referrer: "LinkedIn",
  },
  {
    linkId: "l2",
    viewedAt: "5 days ago",
    location: "Austin, TX",
    device: "Desktop",
    referrer: "LinkedIn",
  },
  {
    linkId: "l2",
    viewedAt: "5 days ago",
    location: "Boston, MA",
    device: "Mobile",
    referrer: "Direct",
  },
];

/* ─── Dashboard mocks ───────────────────────────────────────────────── */

export type DashboardGeneratedLink = {
  id: string;
  role: string;
  company: string;
  createdAt: string;
  views: number;
  slug: string;
};

export const mockDashboardLinks: DashboardGeneratedLink[] = [
  {
    id: "1",
    role: "Software Engineer",
    company: "Acme Inc",
    createdAt: "2 days ago",
    views: 12,
    slug: "jihan-acme",
  },
  {
    id: "2",
    role: "Product Manager",
    company: "Stripe",
    createdAt: "5 days ago",
    views: 5,
    slug: "jihan-stripe",
  },
  {
    id: "3",
    role: "ML Engineer",
    company: "Anthropic",
    createdAt: "today",
    views: 0,
    slug: "jihan-anthropic",
  },
];

export type ContributionComplexity = "Low" | "Medium" | "High";

export type DashboardContribution = {
  repoName: string;
  commitMessage: string;
  skills: string[];
  complexity: ContributionComplexity;
  date: string;
};

export const mockDashboardContributions: DashboardContribution[] = [
  {
    repoName: "iris/web-app",
    commitMessage:
      "feat(dashboard): add recruiter drilldown routes and suspense boundaries",
    skills: ["TypeScript", "React"],
    complexity: "Medium",
    date: "Mar 10, 2026",
  },
  {
    repoName: "iris/api",
    commitMessage:
      "fix(oauth): tighten refresh rotation and tenant scoped session lookup",
    skills: ["Authentication", "API Integration"],
    complexity: "High",
    date: "Mar 8, 2026",
  },
  {
    repoName: "iris/workers",
    commitMessage:
      "feat(queue): bounded executor with cooperative cancel on deploy signals",
    skills: ["Async Patterns", "System Design"],
    complexity: "High",
    date: "Mar 5, 2026",
  },
  {
    repoName: "iris/connectors",
    commitMessage:
      "feat(salesforce): bulk sync with checkpointed cursors and backoff",
    skills: ["API Integration", "Python"],
    complexity: "Medium",
    date: "Feb 28, 2026",
  },
  {
    repoName: "iris/ml",
    commitMessage:
      "chore(models): migrate scoring job to parameterized SQL batches",
    skills: ["Python", "SQL"],
    complexity: "Low",
    date: "Feb 20, 2026",
  },
  {
    repoName: "iris/sdk",
    commitMessage:
      "refactor(client): strict optional props on generated OpenAPI surface",
    skills: ["TypeScript", "React"],
    complexity: "Medium",
    date: "Feb 14, 2026",
  },
];

export type DashboardJobPostingRow = {
  id: string;
  jobUrl: string;
  role: string;
  company: string;
  createdAt: string;
  slug: string;
  views: number;
};

/** Saved targets you’ve analyzed — mirrors generated links with posting URL for management UI. */
export const mockJobPostings: DashboardJobPostingRow[] = [
  {
    id: "1",
    jobUrl:
      "https://jobs.acme.inc/careers/software-engineer?utm_source=linkedin",
    role: "Software Engineer",
    company: "Acme Inc",
    createdAt: "Mar 16, 2026",
    slug: "jihan-acme",
    views: 12,
  },
  {
    id: "2",
    jobUrl: "https://stripe.com/jobs/listing/product-manager",
    role: "Product Manager",
    company: "Stripe",
    createdAt: "Mar 11, 2026",
    slug: "jihan-stripe",
    views: 5,
  },
  {
    id: "3",
    jobUrl: "https://anthropic.com/jobs/ml-engineer",
    role: "ML Engineer",
    company: "Anthropic",
    createdAt: "Mar 18, 2026",
    slug: "jihan-anthropic",
    views: 0,
  },
];

export type DashboardSkillScore = {
  name: string;
  score: number;
  supportingCommits: number;
};

export const mockSkillScores: DashboardSkillScore[] = [
  { name: "TypeScript", score: 92, supportingCommits: 34 },
  { name: "Python", score: 78, supportingCommits: 22 },
  { name: "System Design", score: 71, supportingCommits: 14 },
  { name: "API Integration", score: 85, supportingCommits: 28 },
  { name: "Authentication", score: 68, supportingCommits: 11 },
  { name: "Async Patterns", score: 74, supportingCommits: 19 },
  { name: "SQL", score: 61, supportingCommits: 9 },
  { name: "React", score: 80, supportingCommits: 25 },
];

/** Distinct repos from dashboard contribution samples — used for showcase toggles. */
export const dashboardRepoCatalog: string[] = Array.from(
  new Set(mockDashboardContributions.map((c) => c.repoName))
).sort();

/** Repos where a skill appears in analyzed commits (for skills ↔ projects UI). */
export function reposSupportingSkill(skillName: string): string[] {
  const repos = mockDashboardContributions
    .filter((c) => c.skills.includes(skillName))
    .map((c) => c.repoName);
  return Array.from(new Set(repos));
}

export * from "./commit-explorer-data";
