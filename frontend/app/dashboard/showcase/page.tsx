"use client";

import * as React from "react";

import { dashboardRepoCatalog } from "@/lib/mockData";
import { readShowcaseRepos, writeShowcaseRepos } from "@/lib/showcase-storage";
import { cn } from "@/lib/utils";

export default function DashboardShowcasePage() {
  const [enabled, setEnabled] = React.useState<Set<string>>(
    () => new Set<string>()
  );

  React.useEffect(() => {
    setEnabled(readShowcaseRepos(dashboardRepoCatalog));
  }, []);

  function toggle(repo: string, next: boolean) {
    setEnabled((prev) => {
      const n = new Set(prev);
      if (next) n.add(repo);
      else n.delete(repo);
      writeShowcaseRepos(n);
      return n;
    });
  }

  function selectAll() {
    const all = new Set(dashboardRepoCatalog);
    writeShowcaseRepos(all);
    setEnabled(all);
  }

  function clearAll() {
    const empty = new Set<string>();
    writeShowcaseRepos(empty);
    setEnabled(empty);
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Showcase
      </p>
      <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
        Projects on your recruiter page.
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--text-secondary)]">
        Choose which repositories appear when we surface “where this skill
        shows up.” Checked projects are prioritized in summaries; unchecked
        ones stay in your GitHub history but aren&apos;t highlighted for this
        demo.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={selectAll}
        >
          Select all
        </button>
        <button
          type="button"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={clearAll}
        >
          Clear all
        </button>
      </div>

      <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-card shadow-card">
        {dashboardRepoCatalog.map((repo) => {
          const on = enabled.has(repo);
          return (
            <li key={repo}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/25 md:px-6",
                  on && "bg-muted/10"
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => toggle(repo, e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-foreground">{repo}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {on
                      ? "Shown as showcase signal on shared pages"
                      : "Hidden from showcase highlights"}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
