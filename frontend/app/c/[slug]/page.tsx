import Link from "next/link";

import { ShareFab } from "@/components/ShareModal";
import { MatchedToRoleSkillsSection } from "@/components/recruiter/matched-to-role-skills-section";
import { RecruiterPageHeader } from "@/components/recruiter/recruiter-page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockJob, mockUser, recruiterTopSkills } from "@/lib/mockData";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)
  ).toUpperCase();
}

const receiptBtn =
  "inline-flex flex-1 min-w-0 items-center justify-center rounded-[6px] border-[0.5px] border-[#d4d4cf] bg-transparent px-[10px] py-[6px] text-xs font-normal text-[color:var(--text-secondary)] transition-colors hover:bg-[#f4f4ef] min-[900px]:flex-initial";

/** Candidate public page: 6px radius on primary CTA */
const btn6 = "rounded-[6px]";

export default function CandidatePage({
  params,
}: {
  params: { slug: string };
}) {
  const firstName = mockUser.fullName.split(/\s+/)[0] ?? mockUser.fullName;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RecruiterPageHeader slug={params.slug} variant="summary" />

      <main className="mx-auto max-w-[960px] px-6 pb-24 pt-8 md:pb-32">
        {/* Receipt-style header */}
        <header
          className={cn(
            "rounded-[8px] border-[0.5px] border-[#e5e5e0] bg-background px-5 py-5",
            "shadow-none"
          )}
        >
          <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eae8dd] font-serif text-[18px] font-normal leading-none text-foreground"
                aria-hidden
              >
                {initials(mockUser.fullName)}
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-[26px] font-normal leading-[1.1] tracking-tight text-foreground">
                  {mockUser.fullName}
                </h1>
                <p className="mt-[3px] text-xs font-normal leading-snug text-muted-foreground">
                  {mockUser.school} · {mockUser.graduationDate}
                </p>
              </div>
            </div>

            {/* Role + divider + actions */}
            <div className="flex min-w-0 flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-end min-[900px]:gap-3">
              <div className="text-left min-[900px]:text-right">
                <p className="font-mono text-[10px] font-normal uppercase leading-none tracking-[0.12em] text-muted-foreground">
                  Applying for
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-foreground">
                  {mockJob.roleTitle} · {mockJob.company}
                </p>
              </div>

              <div
                className="hidden min-[900px]:block h-8 w-[0.5px] shrink-0 bg-[#e5e5e0]"
                aria-hidden
              />

              <nav
                className="flex w-full justify-between gap-1 min-[900px]:w-auto min-[900px]:justify-end"
                aria-label="Profile links"
              >
                <a
                  href={mockUser.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={receiptBtn}
                >
                  Resume
                </a>
                <a
                  href={mockUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={receiptBtn}
                >
                  LinkedIn
                </a>
                <a
                  href={mockUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={receiptBtn}
                >
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Skills: 48px below receipt header */}
        <div className="mt-12">
          <MatchedToRoleSkillsSection
            skills={recruiterTopSkills}
            firstName={firstName}
            slug={params.slug}
          />
        </div>

        {/* Deep dive */}
        <section className="mt-16">
          <div className="rounded-[8px] border border-border bg-card p-8 shadow-card md:p-10">
            <h2 className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
              Want to dig deeper?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
              See every analyzed commit in {firstName}&apos;s GitHub.
            </p>
            <Link
              href={`/c/${params.slug}/commits`}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                btn6,
                "mt-8 inline-flex"
              )}
            >
              Open commit explorer
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 border-t border-border pt-12 text-center md:mt-24">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Built on Commitly
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">© 2026</p>
        </footer>
      </main>

      <ShareFab
        linkUrl={`commitly.io/c/${params.slug}`}
        role={mockJob.roleTitle}
        company={mockJob.company}
      />
    </div>
  );
}
