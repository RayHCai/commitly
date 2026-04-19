/** Full commit record for explorer, tooltips, and filters */
export type CommitComplexity = "Low" | "Medium" | "High";

export type ExplorerCommit = {
  sha: string;
  repoName: string;
  message: string;
  /** Short display date */
  date: string;
  /** Tooltip / detail line */
  dateTime: string;
  /** ISO date for sorting and range filter */
  sortDate: string;
  skills: string[];
  complexity: CommitComplexity;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  url: string;
  repoUrl: string;
};

const GH = "https://github.com/demo-user";

/** Public GitHub repo URL for a repo name like `iris/web-app`. */
export function explorerRepoUrl(repoName: string): string {
  return `${GH}/${repoName.replace("/", "-")}`;
}

function repoUrl(repo: string): string {
  return explorerRepoUrl(repo);
}

function commitUrl(repo: string, sha: string): string {
  return `${repoUrl(repo)}/commit/${sha}`;
}

/**
 * 26 commits across Iris repos; skills align with matched-skill names.
 * sortDate ISO for filtering.
 */
export const mockExplorerCommits: ExplorerCommit[] = [
  {
    sha: "a4f9c2e",
    repoName: "iris/web-app",
    message: "feat(types): narrow webhook payload variants for CRM sync",
    date: "Mar 12, 2026",
    dateTime: "Mar 12, 2026 · 2:14 p.m. UTC",
    sortDate: "2026-03-12T14:14:00.000Z",
    skills: ["TypeScript", "React"],
    complexity: "High",
    filesChanged: 8,
    linesAdded: 142,
    linesDeleted: 38,
    url: commitUrl("iris/web-app", "a4f9c2e"),
    repoUrl: repoUrl("iris/web-app"),
  },
  {
    sha: "91be203",
    repoName: "iris/api",
    message: "refactor(auth): extract session claims typeguard shared by routes",
    date: "Feb 28, 2026",
    dateTime: "Feb 28, 2026 · 9:41 a.m. UTC",
    sortDate: "2026-02-28T09:41:00.000Z",
    skills: ["TypeScript", "Authentication"],
    complexity: "Medium",
    filesChanged: 5,
    linesAdded: 96,
    linesDeleted: 21,
    url: commitUrl("iris/api", "91be203"),
    repoUrl: repoUrl("iris/api"),
  },
  {
    sha: "c81d441",
    repoName: "iris/sdk",
    message: "chore(ts): enable exactOptionalPropertyTypes on public client",
    date: "Jan 19, 2026",
    dateTime: "Jan 19, 2026 · 4:03 p.m. UTC",
    sortDate: "2026-01-19T16:03:00.000Z",
    skills: ["TypeScript"],
    complexity: "High",
    filesChanged: 12,
    linesAdded: 203,
    linesDeleted: 67,
    url: commitUrl("iris/sdk", "c81d441"),
    repoUrl: repoUrl("iris/sdk"),
  },
  {
    sha: "7e2ba91",
    repoName: "iris/workers",
    message: "feat(outbox): add retry budget and poison queue for CRM jobs",
    date: "Mar 4, 2026",
    dateTime: "Mar 4, 2026 · 11:22 a.m. UTC",
    sortDate: "2026-03-04T11:22:00.000Z",
    skills: ["System Design", "Async Patterns"],
    complexity: "High",
    filesChanged: 11,
    linesAdded: 178,
    linesDeleted: 44,
    url: commitUrl("iris/workers", "7e2ba91"),
    repoUrl: repoUrl("iris/workers"),
  },
  {
    sha: "33ac10f",
    repoName: "iris/docs",
    message: "docs(architecture): sequence diagram for webhook ingestion path",
    date: "Feb 9, 2026",
    dateTime: "Feb 9, 2026 · 3:55 p.m. UTC",
    sortDate: "2026-02-09T15:55:00.000Z",
    skills: ["System Design"],
    complexity: "Low",
    filesChanged: 3,
    linesAdded: 112,
    linesDeleted: 8,
    url: commitUrl("iris/docs", "33ac10f"),
    repoUrl: repoUrl("iris/docs"),
  },
  {
    sha: "55d8118",
    repoName: "iris/api",
    message: "perf(cache): shard rate limit keys by tenant + route family",
    date: "Jan 27, 2026",
    dateTime: "Jan 27, 2026 · 8:09 a.m. UTC",
    sortDate: "2026-01-27T08:09:00.000Z",
    skills: ["System Design", "API Integration"],
    complexity: "Medium",
    filesChanged: 6,
    linesAdded: 89,
    linesDeleted: 31,
    url: commitUrl("iris/api", "55d8118"),
    repoUrl: repoUrl("iris/api"),
  },
  {
    sha: "d902eef",
    repoName: "iris/connectors",
    message: "feat(hubspot): paginated owner sync with cursor persistence",
    date: "Mar 8, 2026",
    dateTime: "Mar 8, 2026 · 6:18 p.m. UTC",
    sortDate: "2026-03-08T18:18:00.000Z",
    skills: ["API Integration", "Python"],
    complexity: "High",
    filesChanged: 9,
    linesAdded: 214,
    linesDeleted: 52,
    url: commitUrl("iris/connectors", "d902eef"),
    repoUrl: repoUrl("iris/connectors"),
  },
  {
    sha: "b2109aa",
    repoName: "iris/connectors",
    message: "fix(salesforce): tolerate bulk API empty pages during sandbox refresh",
    date: "Feb 21, 2026",
    dateTime: "Feb 21, 2026 · 1:47 p.m. UTC",
    sortDate: "2026-02-21T13:47:00.000Z",
    skills: ["API Integration"],
    complexity: "Medium",
    filesChanged: 4,
    linesAdded: 63,
    linesDeleted: 18,
    url: commitUrl("iris/connectors", "b2109aa"),
    repoUrl: repoUrl("iris/connectors"),
  },
  {
    sha: "4c803d2",
    repoName: "iris/api",
    message: "feat(oauth): rotate refresh tokens with reuse detection window",
    date: "Mar 1, 2026",
    dateTime: "Mar 1, 2026 · 10:30 a.m. UTC",
    sortDate: "2026-03-01T10:30:00.000Z",
    skills: ["Authentication", "API Integration"],
    complexity: "High",
    filesChanged: 7,
    linesAdded: 151,
    linesDeleted: 29,
    url: commitUrl("iris/api", "4c803d2"),
    repoUrl: repoUrl("iris/api"),
  },
  {
    sha: "e96f712",
    repoName: "iris/web-app",
    message: "fix(sso): enforce SAML audience mapping per tenant configuration",
    date: "Feb 3, 2026",
    dateTime: "Feb 3, 2026 · 5:12 p.m. UTC",
    sortDate: "2026-02-03T17:12:00.000Z",
    skills: ["Authentication", "React"],
    complexity: "Medium",
    filesChanged: 5,
    linesAdded: 74,
    linesDeleted: 22,
    url: commitUrl("iris/web-app", "e96f712"),
    repoUrl: repoUrl("iris/web-app"),
  },
  {
    sha: "f21a880",
    repoName: "iris/workers",
    message: "feat(async): bounded worker pool with cooperative cancellation",
    date: "Mar 15, 2026",
    dateTime: "Mar 15, 2026 · 7:05 p.m. UTC",
    sortDate: "2026-03-15T19:05:00.000Z",
    skills: ["Async Patterns", "System Design"],
    complexity: "High",
    filesChanged: 10,
    linesAdded: 188,
    linesDeleted: 41,
    url: commitUrl("iris/workers", "f21a880"),
    repoUrl: repoUrl("iris/workers"),
  },
  {
    sha: "19aa77d",
    repoName: "iris/api",
    message: "refactor(streams): async iterators for export jobs with backpressure",
    date: "Feb 17, 2026",
    dateTime: "Feb 17, 2026 · 2:40 p.m. UTC",
    sortDate: "2026-02-17T14:40:00.000Z",
    skills: ["Async Patterns", "TypeScript"],
    complexity: "High",
    filesChanged: 6,
    linesAdded: 121,
    linesDeleted: 36,
    url: commitUrl("iris/api", "19aa77d"),
    repoUrl: repoUrl("iris/api"),
  },
  {
    sha: "aa90233",
    repoName: "iris/web-app",
    message: "fix(ui): cancel in-flight analytics batch on route change",
    date: "Jan 8, 2026",
    dateTime: "Jan 8, 2026 · 4:22 p.m. UTC",
    sortDate: "2026-01-08T16:22:00.000Z",
    skills: ["Async Patterns", "React"],
    complexity: "Low",
    filesChanged: 4,
    linesAdded: 52,
    linesDeleted: 14,
    url: commitUrl("iris/web-app", "aa90233"),
    repoUrl: repoUrl("iris/web-app"),
  },
  {
    sha: "bb11ee4",
    repoName: "iris/web-app",
    message: "feat(editor): lazy load monaco bundling for tenant rule DSL",
    date: "Mar 18, 2026",
    dateTime: "Mar 18, 2026 · 1:11 p.m. UTC",
    sortDate: "2026-03-18T13:11:00.000Z",
    skills: ["TypeScript", "React"],
    complexity: "Medium",
    filesChanged: 14,
    linesAdded: 267,
    linesDeleted: 91,
    url: commitUrl("iris/web-app", "bb11ee4"),
    repoUrl: repoUrl("iris/web-app"),
  },
  {
    sha: "cc22ff5",
    repoName: "iris/api",
    message: "feat(graphql): stitch connector schema with persisted query allowlist",
    date: "Mar 11, 2026",
    dateTime: "Mar 11, 2026 · 8:50 a.m. UTC",
    sortDate: "2026-03-11T08:50:00.000Z",
    skills: ["API Integration", "TypeScript"],
    complexity: "Medium",
    filesChanged: 18,
    linesAdded: 312,
    linesDeleted: 54,
    url: commitUrl("iris/api", "cc22ff5"),
    repoUrl: repoUrl("iris/api"),
  },
  {
    sha: "dd33aa6",
    repoName: "iris/ml",
    message: "feat(scoring): calibration layer for skill confidence blends",
    date: "Feb 25, 2026",
    dateTime: "Feb 25, 2026 · 3:33 p.m. UTC",
    sortDate: "2026-02-25T15:33:00.000Z",
    skills: ["Python", "System Design"],
    complexity: "Medium",
    filesChanged: 7,
    linesAdded: 134,
    linesDeleted: 28,
    url: commitUrl("iris/ml", "dd33aa6"),
    repoUrl: repoUrl("iris/ml"),
  },
  {
    sha: "ee44bb7",
    repoName: "iris/ml",
    message: "chore(sql): migrate feature store reads to windowed CTEs",
    date: "Jan 30, 2026",
    dateTime: "Jan 30, 2026 · 9:17 a.m. UTC",
    sortDate: "2026-01-30T09:17:00.000Z",
    skills: ["SQL", "Python"],
    complexity: "Low",
    filesChanged: 5,
    linesAdded: 88,
    linesDeleted: 41,
    url: commitUrl("iris/ml", "ee44bb7"),
    repoUrl: repoUrl("iris/ml"),
  },
  {
    sha: "ff55cc8",
    repoName: "iris/connectors",
    message: "feat(stripe): map invoice webhooks to tenant billing state machine",
    date: "Mar 6, 2026",
    dateTime: "Mar 6, 2026 · 12:08 p.m. UTC",
    sortDate: "2026-03-06T12:08:00.000Z",
    skills: ["API Integration", "Async Patterns"],
    complexity: "High",
    filesChanged: 13,
    linesAdded: 221,
    linesDeleted: 47,
    url: commitUrl("iris/connectors", "ff55cc8"),
    repoUrl: repoUrl("iris/connectors"),
  },
  {
    sha: "aa66dd9",
    repoName: "iris/web-app",
    message: "fix(a11y): focus trap and escape handler on share modal",
    date: "Feb 14, 2026",
    dateTime: "Feb 14, 2026 · 6:44 p.m. UTC",
    sortDate: "2026-02-14T18:44:00.000Z",
    skills: ["React", "TypeScript"],
    complexity: "Low",
    filesChanged: 3,
    linesAdded: 41,
    linesDeleted: 12,
    url: commitUrl("iris/web-app", "aa66dd9"),
    repoUrl: repoUrl("iris/web-app"),
  },
  {
    sha: "bb77ee0",
    repoName: "iris/workers",
    message: "fix(scheduler): jitter lease renewals to prevent thundering herd",
    date: "Jan 22, 2026",
    dateTime: "Jan 22, 2026 · 5:29 a.m. UTC",
    sortDate: "2026-01-22T05:29:00.000Z",
    skills: ["Async Patterns", "System Design"],
    complexity: "Medium",
    filesChanged: 4,
    linesAdded: 59,
    linesDeleted: 17,
    url: commitUrl("iris/workers", "bb77ee0"),
    repoUrl: repoUrl("iris/workers"),
  },
  {
    sha: "cc88ff1",
    repoName: "iris/api",
    message: "feat(rbac): scope tokens to tenant + route policy bundles",
    date: "Mar 19, 2026",
    dateTime: "Mar 19, 2026 · 4:04 p.m. UTC",
    sortDate: "2026-03-19T16:04:00.000Z",
    skills: ["Authentication", "API Integration"],
    complexity: "High",
    filesChanged: 22,
    linesAdded: 401,
    linesDeleted: 112,
    url: commitUrl("iris/api", "cc88ff1"),
    repoUrl: repoUrl("iris/api"),
  },
  {
    sha: "dd99aa2",
    repoName: "iris/sdk",
    message: "docs(readme): codegen workflow for typed SDK consumers",
    date: "Feb 11, 2026",
    dateTime: "Feb 11, 2026 · 11:11 a.m. UTC",
    sortDate: "2026-02-11T11:11:00.000Z",
    skills: ["TypeScript"],
    complexity: "Low",
    filesChanged: 2,
    linesAdded: 44,
    linesDeleted: 6,
    url: commitUrl("iris/sdk", "dd99aa2"),
    repoUrl: repoUrl("iris/sdk"),
  },
  {
    sha: "ee00bb3",
    repoName: "iris/web-app",
    message: "perf(bundle): route-level code splitting for CRM dashboard",
    date: "Jan 14, 2026",
    dateTime: "Jan 14, 2026 · 3:48 p.m. UTC",
    sortDate: "2026-01-14T15:48:00.000Z",
    skills: ["React", "TypeScript"],
    complexity: "Medium",
    filesChanged: 21,
    linesAdded: 188,
    linesDeleted: 103,
    url: commitUrl("iris/web-app", "ee00bb3"),
    repoUrl: repoUrl("iris/web-app"),
  },
  {
    sha: "ff11cc4",
    repoName: "iris/connectors",
    message: "fix(webhooks): signature replay guard with bounded clock skew",
    date: "Mar 16, 2026",
    dateTime: "Mar 16, 2026 · 9:09 p.m. UTC",
    sortDate: "2026-03-16T21:09:00.000Z",
    skills: ["Authentication", "API Integration"],
    complexity: "High",
    filesChanged: 8,
    linesAdded: 176,
    linesDeleted: 33,
    url: commitUrl("iris/connectors", "ff11cc4"),
    repoUrl: repoUrl("iris/connectors"),
  },
  {
    sha: "aa12dd5",
    repoName: "iris/workers",
    message: "feat(metrics): histogram for queue dwell time per tenant tier",
    date: "Feb 6, 2026",
    dateTime: "Feb 6, 2026 · 7:58 p.m. UTC",
    sortDate: "2026-02-06T19:58:00.000Z",
    skills: ["System Design", "Async Patterns"],
    complexity: "Medium",
    filesChanged: 6,
    linesAdded: 97,
    linesDeleted: 24,
    url: commitUrl("iris/workers", "aa12dd5"),
    repoUrl: repoUrl("iris/workers"),
  },
  {
    sha: "bb23ee6",
    repoName: "iris/ml",
    message: "feat(embeddings): batch inference with GPU queue fairness",
    date: "Jan 11, 2026",
    dateTime: "Jan 11, 2026 · 10:21 a.m. UTC",
    sortDate: "2026-01-11T10:21:00.000Z",
    skills: ["Python", "Async Patterns"],
    complexity: "High",
    filesChanged: 15,
    linesAdded: 255,
    linesDeleted: 72,
    url: commitUrl("iris/ml", "bb23ee6"),
    repoUrl: repoUrl("iris/ml"),
  },
];

export const EXPLORER_TOTAL_COMMITS = 147;
export const EXPLORER_TOTAL_REPOS = 12;

export function explorerCommitsForSkill(skillName: string): ExplorerCommit[] {
  return mockExplorerCommits.filter((c) => c.skills.includes(skillName));
}

export function uniqueReposFromCommits(commits: ExplorerCommit[]): string[] {
  return Array.from(new Set(commits.map((c) => c.repoName))).sort();
}

export function uniqueSkillsDetected(): string[] {
  return Array.from(
    new Set(mockExplorerCommits.flatMap((c) => c.skills))
  ).sort();
}

export function repoCountForCommits(commits: ExplorerCommit[]): number {
  return new Set(commits.map((c) => c.repoName)).size;
}

export function lookupExplorerBySha(sha: string): ExplorerCommit | undefined {
  return mockExplorerCommits.find((c) => c.sha === sha);
}
