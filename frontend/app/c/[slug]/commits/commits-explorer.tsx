"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommitComplexity, ExplorerCommit } from "@/lib/commit-explorer-data";
import {
  mockExplorerCommits,
  uniqueReposFromCommits,
  uniqueSkillsDetected,
} from "@/lib/commit-explorer-data";

function complexityClasses(c: CommitComplexity): string {
  switch (c) {
    case "High":
      return "border-emerald-800/30 bg-emerald-800/15 text-emerald-900";
    case "Medium":
      return "border-border bg-muted text-foreground";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}

export function CommitsExplorer() {
  const skills = React.useMemo(() => uniqueSkillsDetected(), []);
  const repos = React.useMemo(
    () => uniqueReposFromCommits(mockExplorerCommits),
    []
  );

  const [sheetOpen, setSheetOpen] = React.useState(false);

  const [skillSel, setSkillSel] = React.useState<Set<string>>(new Set());
  const [repoSel, setRepoSel] = React.useState<Set<string>>(new Set());
  const [complexitySel, setComplexitySel] = React.useState<
    Set<CommitComplexity>
  >(new Set());
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const toggle = <T extends string>(
    set: React.Dispatch<React.SetStateAction<Set<T>>>,
    v: T
  ) => {
    set((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  };

  const clearFilters = () => {
    setSkillSel(new Set());
    setRepoSel(new Set());
    setComplexitySel(new Set());
    setFrom("");
    setTo("");
  };

  const filtered = React.useMemo(() => {
    let list = [...mockExplorerCommits];
    if (skillSel.size > 0) {
      list = list.filter((c) =>
        c.skills.some((s) => skillSel.has(s))
      );
    }
    if (repoSel.size > 0) {
      list = list.filter((c) => repoSel.has(c.repoName));
    }
    if (complexitySel.size > 0) {
      list = list.filter((c) => complexitySel.has(c.complexity));
    }
    if (from) {
      const d = new Date(from);
      list = list.filter((c) => new Date(c.sortDate) >= d);
    }
    if (to) {
      const d = new Date(to);
      d.setHours(23, 59, 59, 999);
      list = list.filter((c) => new Date(c.sortDate) <= d);
    }
    return list.sort(
      (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    );
  }, [skillSel, repoSel, complexitySel, from, to]);

  const total = mockExplorerCommits.length;

  const FilterFields = ({ idPrefix = "" }: { idPrefix?: string }) => (
    <>
      <fieldset className="min-w-0 flex-1">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">
          Skills
        </legend>
        <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-card p-2">
          {skills.map((s) => (
            <label
              key={idPrefix + s}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/80"
            >
              <input
                type="checkbox"
                checked={skillSel.has(s)}
                onChange={() => toggle(setSkillSel, s)}
                className="size-3.5 rounded border-border text-primary accent-primary"
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="min-w-0 flex-1">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">
          Repos
        </legend>
        <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-card p-2">
          {repos.map((r) => (
            <label
              key={idPrefix + r}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 font-mono text-xs hover:bg-muted/80"
            >
              <input
                type="checkbox"
                checked={repoSel.has(r)}
                onChange={() => toggle(setRepoSel, r)}
                className="size-3.5 rounded border-border text-primary accent-primary"
              />
              {r}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted-foreground">
            Complexity
          </legend>
          <div className="flex flex-wrap gap-2">
            {(["Low", "Medium", "High"] as const).map((c) => (
              <button
                key={idPrefix + c}
                type="button"
                onClick={() => toggle(setComplexitySel, c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  complexitySel.has(c)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring focus-visible:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-ring focus-visible:ring-2"
          />
        </label>
      </div>
    </>
  );

  return (
    <>
      <div className="mb-8 md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full border-primary/25"
          )}
        >
          Filters
        </button>
      </div>

      <div className="hidden rounded-xl border border-border bg-card p-5 shadow-card md:block">
        <div className="flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:items-start">
          <FilterFields />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-auto px-0 text-muted-foreground hover:text-primary"
            )}
          >
            Clear filters
          </button>
        </div>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/25"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium text-foreground">Filters</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground"
                )}
              >
                Done
              </button>
            </div>
            <div className="flex flex-col gap-5">
              <FilterFields idPrefix="sheet-" />
            </div>
            <button
              type="button"
              onClick={() => {
                clearFilters();
              }}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mt-4 h-auto w-full px-0 text-muted-foreground hover:text-primary"
              )}
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-sm text-muted-foreground">
        Showing {filtered.length} of {total} commits
      </p>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-border bg-card shadow-card md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Repo</th>
              <th className="px-4 py-3 font-medium">Commit</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Skills</th>
              <th className="px-4 py-3 font-medium">Complexity</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: ExplorerCommit) => (
              <tr
                key={`${row.sha}-${row.repoName}`}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {row.repoName}
                </td>
                <td className="max-w-[280px] px-4 py-4">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground underline decoration-transparent underline-offset-2 transition-colors hover:decoration-primary"
                  >
                    {row.message}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                  {row.date}
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {row.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                      complexityClasses(row.complexity)
                    )}
                  >
                    {row.complexity}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "xs" }),
                      "h-7 gap-1 rounded-full border-primary/20 text-xs text-primary hover:bg-primary/5"
                    )}
                  >
                    View
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="mt-6 flex flex-col gap-4 md:hidden">
        {filtered.map((row: ExplorerCommit) => (
          <li
            key={`${row.sha}-${row.repoName}-m`}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <p className="font-mono text-xs text-muted-foreground">
              {row.repoName}
            </p>
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block font-semibold leading-snug text-foreground underline decoration-transparent underline-offset-2 transition-colors hover:decoration-primary"
            >
              {row.message}
            </a>
            <p className="mt-2 text-xs text-muted-foreground">{row.date}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {row.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                  complexityClasses(row.complexity)
                )}
              >
                {row.complexity}
              </span>
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xs" }),
                  "h-7 gap-1 rounded-full border-primary/20 text-xs text-primary"
                )}
              >
                View
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
