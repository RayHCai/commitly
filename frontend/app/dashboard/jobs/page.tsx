"use client";

import Link from "next/link";

import { mockJobPostings } from "@/lib/mockData";

export default function DashboardJobsPage() {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Job postings
      </p>
      <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
        Roles you&apos;ve targeted.
      </h1>
      <p className="mt-4 max-w-2xl text-[color:var(--text-secondary)]">
        Every row is a posting you pasted (or mirrored from a generated link).
        Use this list to revisit roles and compare outreach.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium md:px-5">Posting URL</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell lg:px-5">
                Role
              </th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell sm:px-5">
                Company
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell md:px-5">
                Created
              </th>
              <th className="px-4 py-3 text-right font-medium md:px-5">
                Shared page
              </th>
            </tr>
          </thead>
          <tbody>
            {mockJobPostings.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-muted/15"
              >
                <td className="max-w-[min(100vw-3rem,28rem)] px-4 py-4 md:px-5">
                  <p className="truncate font-mono text-xs text-foreground lg:hidden">
                    {row.jobUrl}
                  </p>
                  <a
                    href={row.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden truncate font-mono text-xs text-primary underline-offset-2 hover:underline lg:inline"
                  >
                    {row.jobUrl}
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground lg:hidden">
                    {row.role} · {row.company}
                  </p>
                </td>
                <td className="hidden px-5 py-4 font-medium text-foreground lg:table-cell">
                  {row.role}
                </td>
                <td className="hidden px-5 py-4 text-foreground sm:table-cell">
                  {row.company}
                </td>
                <td className="hidden whitespace-nowrap px-5 py-4 text-muted-foreground md:table-cell">
                  {row.createdAt}
                </td>
                <td className="px-4 py-4 text-right md:px-5">
                  <Link
                    href={`/c/${row.slug}`}
                    className="inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View /c/{row.slug}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
