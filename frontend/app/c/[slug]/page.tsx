import Link from "next/link";
import { Download } from "lucide-react";

import { CandidateSkillsTimeline } from "@/components/recruiter/candidate-skills-timeline";
import { ShareFab } from "@/components/ShareModal";
import { cn } from "@/lib/utils";
import { mockJob, mockUser, requiredSkills } from "@/lib/mockData";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)
  ).toUpperCase();
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconGithub({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.398.1 2.651.64.699 1.028 1.59 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}

const receiptBtn =
  "inline-flex flex-1 min-w-0 items-center justify-center gap-1.5 rounded-[6px] border-[0.5px] border-[#d4d4cf] bg-transparent px-3 py-1.5 text-[12px] font-normal leading-none text-black transition-colors hover:bg-[#f4f4ef] min-[900px]:flex-initial";

const receiptIcon = "size-3.5 shrink-0 text-black";

export default function CandidatePage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-screen bg-background text-black">
      <main className="mx-auto max-w-[1320px] px-6 pb-24 pt-8 md:pb-32">
        {/* Receipt-style header (layout unchanged) */}
        <header
          className={cn(
            "rounded-[8px] border-[0.5px] border-[#e5e5e0] bg-background px-5 py-5",
            "shadow-none"
          )}
        >
          <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eae8dd] font-serif text-[18px] font-normal leading-none text-black"
                aria-hidden
              >
                {initials(mockUser.fullName)}
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-[26px] font-normal leading-[1.1] tracking-tight text-black">
                  {mockUser.fullName}
                </h1>
                <p className="mt-[3px] text-xs font-normal leading-snug text-black">
                  {mockUser.school} · {mockUser.graduationDate}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-end min-[900px]:gap-3">
              <div className="text-left min-[900px]:text-right">
                <p className="font-mono text-[10px] font-normal uppercase leading-none tracking-[0.12em] text-black">
                  Applying for
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-black">
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
                  <Download className={receiptIcon} aria-hidden />
                  Resume
                </a>
                <a
                  href={mockUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={receiptBtn}
                >
                  <IconLinkedIn className={receiptIcon} />
                  LinkedIn
                </a>
                <a
                  href={mockUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={receiptBtn}
                >
                  <IconGithub className={receiptIcon} />
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>

        <CandidateSkillsTimeline skills={requiredSkills} slug={params.slug} />

        <footer className="mt-24 border-t border-border pt-12 text-center md:mt-24">
          <Link
            href="/"
            className="text-sm text-black underline-offset-4 hover:underline"
          >
            Built on Commitly
          </Link>
          <p className="mt-3 text-xs text-black">© 2026</p>
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
