/** Which repo paths to emphasize on shared pages (`owner/repo`). */
export const SHOWCASE_REPOS_KEY = "commitly_showcase_repos" as const;

export function readShowcaseRepos(allRepos: readonly string[]): Set<string> {
  if (typeof window === "undefined") return new Set(allRepos);
  try {
    const raw = localStorage.getItem(SHOWCASE_REPOS_KEY);
    if (raw === null) return new Set(allRepos);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(allRepos);
    return new Set(
      parsed.filter((x): x is string => typeof x === "string")
    );
  } catch {
    return new Set(allRepos);
  }
}

export function writeShowcaseRepos(enabled: Iterable<string>): void {
  try {
    localStorage.setItem(
      SHOWCASE_REPOS_KEY,
      JSON.stringify(Array.from(enabled))
    );
  } catch {
    /* ignore */
  }
}
