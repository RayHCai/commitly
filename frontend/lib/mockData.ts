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
  /** Optional short representative snippet shown in the hover reveal (Poster variant). */
  codeSample?: string;
  /** Language hint for syntax coloring. Undefined renders as plain monospace. */
  codeLanguage?: "ts" | "tsx" | "py" | "sql";
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

export type SkillCommit = {
  id: string;
  commitMessage: string;
  commitUrl: string;
  sha: string;
  date: string;
  dateLabel: string;
  repoName: string;
  repoType: "personal" | "open-source";
  plainEnglishTitle: string;
  plainEnglishSummary: string;
};

export type SkillAccent = {
  solid: string;
  tint: string;
  text: string;
};

export type RequiredSkill = {
  id: string;
  name: string;
  tagline: string;
  whyItFitsTheRole: string;
  totalCommitCount: number;
  repoCount: number;
  accent: SkillAccent;
  bestCommits: SkillCommit[];
};

export const requiredSkills: RequiredSkill[] = [
  {
    id: "typescript",
    name: "TypeScript",
    tagline: "Production-quality type-safe code across 3 shipped projects.",
    whyItFitsTheRole:
      "The role requires engineers who write TypeScript that holds up under real customer load. Jihan's commits show exactly that: strong typing as a tool for preventing bugs, not bureaucracy.",
    totalCommitCount: 14,
    repoCount: 3,
    accent: {
      solid: "#1d4ed8",
      tint: "rgba(29, 78, 216, 0.14)",
      text: "#1e40af",
    },
    bestCommits: [
      {
        id: "ts-1",
        commitMessage: "refactor(sync): type-safe customer sync pipeline",
        commitUrl: "#",
        sha: "a4f9c2e",
        date: "2024-09-12",
        dateLabel: "SEP 2024",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Rebuilt customer sync so invalid data fails in development with strong typing discipline before production.",
        plainEnglishSummary:
          "Jihan redesigned the customer sync pipeline so new customer types fail during development instead of breaking in production. Prevented an entire category of outage for Iris customers.",
      },
      {
        id: "ts-2",
        commitMessage: "fix(next): handle edge-case hydration mismatch",
        commitUrl: "#",
        sha: "d2afc14",
        date: "2025-11-01",
        dateLabel: "NOV 2025",
        repoName: "vercel/next.js",
        repoType: "open-source",
        plainEnglishTitle:
          "Contributed hydration fix merged into Next.js core; resolved rare async layout mismatch.",
        plainEnglishSummary:
          "Jihan submitted and merged a PR to Next.js core that resolved a rare hydration mismatch in async layouts. The fix is now part of Next.js itself.",
      },
      {
        id: "ts-3",
        commitMessage: "feat(agents): typed interfaces for deliberation pipeline",
        commitUrl: "#",
        sha: "58b9e03",
        date: "2026-03-10",
        dateLabel: "MAR 2026",
        repoName: "gmkapur/commitly",
        repoType: "personal",
        plainEnglishTitle:
          "Defined strict interfaces for every agent handoff for compile-time safety across Commitly.",
        plainEnglishSummary:
          "Jihan modeled every agent input and output as a strict type. Any change breaks at compile time, not in production.",
      },
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    tagline: "Architects production systems that scale independently.",
    whyItFitsTheRole:
      "The role asks for engineers who can design systems, not just implement features. Jihan has shipped multi-component systems where each piece can scale on its own.",
    totalCommitCount: 9,
    repoCount: 2,
    accent: {
      solid: "#7c3aed",
      tint: "rgba(124, 58, 237, 0.14)",
      text: "#5b21b6",
    },
    bestCommits: [
      {
        id: "sd-1",
        commitMessage: "feat(arch): separate agent workers from dashboard",
        commitUrl: "#",
        sha: "4b1dc27",
        date: "2025-06-04",
        dateLabel: "JUN 2025",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Split workers from dashboard into separate deployables for independent scaling and clearer boundaries.",
        plainEnglishSummary:
          "Jihan split Iris into two deployable pieces. The customer-facing dashboard stays fast even when the agent workers are under heavy load.",
      },
      {
        id: "sd-2",
        commitMessage: "feat(agents): deliberation pipeline across specialized agents",
        commitUrl: "#",
        sha: "58b9e03",
        date: "2026-03-10",
        dateLabel: "MAR 2026",
        repoName: "gmkapur/commitly",
        repoType: "personal",
        plainEnglishTitle:
          "Architected six-agent deliberation pipeline with specialized roles converging on one ranked output.",
        plainEnglishSummary:
          "Jihan architected a multi-agent system where six specialized agents each evaluate a different dimension of a candidate's code and deliberate to produce a single output.",
      },
      {
        id: "sd-3",
        commitMessage: "feat(queue): bounded executor with cooperative cancel on deploy",
        commitUrl: "#",
        sha: "f21a880",
        date: "2025-11-18",
        dateLabel: "NOV 2025",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Connected deploy signals to job runner so background work drains cleanly during releases.",
        plainEnglishSummary:
          "Jihan capped concurrent workers and wired deploy signals so background jobs exit cleanly instead of orphaning partial work.",
      },
    ],
  },
  {
    id: "api-integration",
    name: "API Integration",
    tagline: "Connects third-party services cleanly and safely.",
    whyItFitsTheRole:
      "The role lives at the seams between services. Jihan has shipped integrations that made adding the next one trivial instead of painful.",
    totalCommitCount: 7,
    repoCount: 2,
    accent: {
      solid: "#ea580c",
      tint: "rgba(234, 88, 12, 0.14)",
      text: "#9a3412",
    },
    bestCommits: [
      {
        id: "api-1",
        commitMessage: "feat(crm): unified provider integration layer",
        commitUrl: "#",
        sha: "e19b408",
        date: "2025-05-14",
        dateLabel: "MAY 2025",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Unified CRM connectors behind one abstraction so new integrations ship without one-off glue code.",
        plainEnglishSummary:
          "Jihan built a shared integration layer so Iris talks to multiple CRMs through one interface. Adding a fourth CRM now takes less than a day.",
      },
      {
        id: "api-2",
        commitMessage: "feat(chess): chess-api.com move analysis integration",
        commitUrl: "#",
        sha: "af3d801",
        date: "2025-09-20",
        dateLabel: "SEP 2025",
        repoName: "gmkapur/chess-coach",
        repoType: "personal",
        plainEnglishTitle:
          "Integrated remote chess API in MV3 extension with rate limits, retries, and failure UX in the client.",
        plainEnglishSummary:
          "Jihan integrated chess-api.com into a Manifest V3 extension, handling rate limits and network failures gracefully.",
      },
      {
        id: "api-3",
        commitMessage: "feat(webhooks): signed inbound CRM webhooks with idempotent replay",
        commitUrl: "#",
        sha: "c91e204",
        date: "2026-01-22",
        dateLabel: "JAN 2026",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Secured inbound CRM webhooks with signatures and idempotent replay for safe handling of duplicate delivery.",
        plainEnglishSummary:
          "Jihan verified webhook signatures and stored dedupe keys so duplicate deliveries never double-apply integration side effects.",
      },
    ],
  },
  {
    id: "async-patterns",
    name: "Async Patterns",
    tagline: "Handles long-running work without blocking users.",
    whyItFitsTheRole:
      "The role requires engineers comfortable with concurrency. Jihan has shipped background pipelines that keep apps responsive even under heavy load.",
    totalCommitCount: 8,
    repoCount: 2,
    accent: {
      solid: "#0e7490",
      tint: "rgba(14, 116, 144, 0.14)",
      text: "#155e75",
    },
    bestCommits: [
      {
        id: "async-1",
        commitMessage: "feat(pipeline): background processing for long surveys",
        commitUrl: "#",
        sha: "3f71aa8",
        date: "2025-08-07",
        dateLabel: "AUG 2025",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Moved heavy survey processing to background jobs to keep UI responsive on large workloads.",
        plainEnglishSummary:
          "Jihan rebuilt Iris's survey pipeline to run in the background so the app stays responsive even with 10,000+ row surveys.",
      },
      {
        id: "async-2",
        commitMessage: "perf(eval): parallel batch prompt evaluation",
        commitUrl: "#",
        sha: "7c2e91d",
        date: "2025-02-20",
        dateLabel: "FEB 2025",
        repoName: "joinhandshake/prompt-eval",
        repoType: "open-source",
        plainEnglishTitle:
          "Parallelized thousands of model evaluations in batch runs without blowing rate limits.",
        plainEnglishSummary:
          "Jihan contributed an async batch runner to Handshake's model evaluation tool. Ran 5,000 evals in parallel without tripping rate limits.",
      },
      {
        id: "async-3",
        commitMessage: "feat(sync): chunked spreadsheet export streaming for large tenants",
        commitUrl: "#",
        sha: "19aa77d",
        date: "2026-02-04",
        dateLabel: "FEB 2026",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Streamed large exports in bounded chunks for stable memory use on multi-million-row tenants.",
        plainEnglishSummary:
          "Jihan chunked outbound downloads so multi-million-row exports stream safely without blowing the heap.",
      },
    ],
  },
  {
    id: "authentication",
    name: "Authentication",
    tagline: "Owns session and identity layers end to end.",
    whyItFitsTheRole:
      "The role involves user-facing auth. Jihan has shipped a single source of truth for login state across a production codebase.",
    totalCommitCount: 8,
    repoCount: 1,
    accent: {
      solid: "#15803d",
      tint: "rgba(21, 128, 61, 0.14)",
      text: "#14532d",
    },
    bestCommits: [
      {
        id: "auth-1",
        commitMessage: "feat(auth): centralize session verification",
        commitUrl: "#",
        sha: "b83d1a5",
        date: "2024-11-03",
        dateLabel: "NOV 2024",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Centralized session verification into one auth path, replacing scattered checks across Iris.",
        plainEnglishSummary:
          "Jihan built a single source of truth for how the app checks who is logged in. Replaced scattered login logic and made the auth system easy to reason about.",
      },
      {
        id: "auth-2",
        commitMessage: "fix(oauth): refresh rotation with tenant scoped session lookup",
        commitUrl: "#",
        sha: "e96f712",
        date: "2025-04-09",
        dateLabel: "APR 2025",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Implemented OAuth refresh rotation with tenant-scoped session lookup for stronger isolation.",
        plainEnglishSummary:
          "Jihan tightened refresh flows so each tenant resolves session data in isolation without cross-customer leakage.",
      },
      {
        id: "auth-3",
        commitMessage: "feat(sso): match SAML audience rules to customer config",
        commitUrl: "#",
        sha: "4c803d2",
        date: "2025-12-01",
        dateLabel: "DEC 2025",
        repoName: "gmkapur/iris-core",
        repoType: "personal",
        plainEnglishTitle:
          "Configured SAML audience validation per tenant to cut down on opaque enterprise SSO failures.",
        plainEnglishSummary:
          "Jihan wired SAML checks to per-tenant settings so enterprise SSO failures become guided fixes instead of silent rejects.",
      },
    ],
  },
];

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
        codeSample:
          "type CustomerType = \"lead\" | \"customer\" | \"partner\";\n\nfunction assertCustomer(raw: unknown): CustomerType {\n  const t = (raw as { type?: string }).type;\n  if (t === \"lead\" || t === \"customer\" || t === \"partner\") return t;\n  throw new TypeError(`unknown customer type: ${t}`);\n}",
        codeLanguage: "ts",
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
        codeSample:
          "export function hasSession(\n  ctx: RequestCtx,\n): ctx is RequestCtx & { session: Session } {\n  return ctx.session !== null && ctx.session.expiresAt > Date.now();\n}",
        codeLanguage: "ts",
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
        codeSample:
          "const PartnerForm = z.object({\n  companyId: z.string().uuid(),\n  contactEmail: z.string().email(),\n  role: z.enum([\"admin\", \"viewer\"]),\n});",
        codeLanguage: "ts",
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
        codeSample:
          "const jobRunner = createWorker({\n  retry: { limit: 3, backoff: \"exp\" },\n  onFailure: (err, job) => deadLetter.push(job, err),\n  concurrency: 8,\n});",
        codeLanguage: "ts",
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
        codeSample:
          "function bucketKey(tenantId: string, route: string) {\n  return `rl:${tenantId}:${routeFamily(route)}`;\n}\n\nawait limiter.consume(bucketKey(tenantId, req.path), 1);",
        codeLanguage: "ts",
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
        codeSample:
          "let cursor = await checkpoint.get(syncId);\nwhile (true) {\n  const page = await hubspot.listOwners({ after: cursor, limit: 500 });\n  await upsert(page.results);\n  if (!page.paging?.next) break;\n  cursor = page.paging.next.after;\n  await checkpoint.set(syncId, cursor);\n}",
        codeLanguage: "ts",
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
        codeSample:
          "const batch = await sfBulk.fetchNextBatch(jobId);\nif (batch.records.length === 0 && batch.state === \"InProgress\") {\n  return { status: \"idle\", retryAfter: 30_000 };\n}",
        codeLanguage: "ts",
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
        codeSample:
          "async function withBackoff<T>(fn: () => Promise<T>, attempts = 5) {\n  for (let i = 0; i < attempts; i++) {\n    try { return await fn(); } catch (err) {\n      if (!isTransient(err)) throw err;\n      await sleep(250 * 2 ** i);\n    }\n  }\n  throw new Error(\"exhausted retries\");\n}",
        codeLanguage: "ts",
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
        codeSample:
          "async function rotateRefresh(token: string) {\n  const prev = await store.get(token);\n  if (prev.usedAt) {\n    await audit.flag(prev.userId, \"refresh_replay\");\n    await sessions.revokeAll(prev.userId);\n    throw new AuthError(\"token_reuse_detected\");\n  }\n  await store.markUsed(token);\n  return issueRefresh(prev.userId);\n}",
        codeLanguage: "ts",
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
        codeSample:
          "function assertAudience(assertion: SAMLAssertion, tenant: Tenant) {\n  if (assertion.audience !== tenant.samlAudience) {\n    throw new ConfigError(\"saml_audience_mismatch\", {\n      expected: tenant.samlAudience,\n      received: assertion.audience,\n    });\n  }\n}",
        codeLanguage: "ts",
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
        codeSample:
          "const IDLE_LIMIT_MS = 5 * 60 * 1000;\n\nwatchActivity((lastSeen) => {\n  if (Date.now() - lastSeen > IDLE_LIMIT_MS && session.scope === \"admin\") {\n    session.end(\"idle_timeout\");\n  }\n});",
        codeLanguage: "ts",
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
        codeSample:
          "const pool = new BoundedPool({ concurrency: 16 });\n\nprocess.on(\"SIGTERM\", async () => {\n  await pool.drain({ timeout: 30_000 });\n  process.exit(0);\n});",
        codeLanguage: "ts",
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
        codeSample:
          "async function* streamExport(tenantId: string) {\n  for await (const chunk of db.cursor(exportQuery(tenantId), { batchSize: 500 })) {\n    yield toCsv(chunk);\n  }\n}",
        codeLanguage: "ts",
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
        codeSample:
          "useEffect(() => {\n  const ac = new AbortController();\n  track(\"page_view\", { signal: ac.signal });\n  return () => ac.abort();\n}, [pathname]);",
        codeLanguage: "tsx",
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
