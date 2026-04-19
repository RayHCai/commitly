import { CandidateProfileBio } from "@/components/candidate-profile-bio";
import { mockJob, mockUser, recruiterTopSkills } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Compact mock of the shared recruiter link page — identity, skills, summary. */
export function RecruiterOnePagerPreview({
  className,
}: {
  className?: string;
}) {
  const ts = recruiterTopSkills[0];
  const sd = recruiterTopSkills[1];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-card",
        className
      )}
    >
      <div className="border-b border-border bg-muted/40 px-4 py-2.5 sm:px-5 sm:py-3">
        <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-[11px]">
          commitly.io/c/your-name-company-role
        </p>
      </div>
      <div className="space-y-4 px-4 py-5 text-[color:var(--text-secondary)] sm:space-y-5 sm:px-5 sm:py-6 md:px-6 md:py-7">
        <div className="flex gap-3 sm:gap-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-[11px] font-medium tracking-tight text-foreground sm:size-12 sm:text-xs"
            aria-hidden
          >
            {initials(mockUser.fullName)}
          </div>
          <div className="min-w-0 flex-1 space-y-1 pt-0.5">
            <p className="font-serif text-base font-normal leading-tight tracking-tight text-foreground sm:text-lg">
              {mockUser.fullName}
            </p>
            <p className="text-[11px] leading-snug sm:text-xs">
              {mockJob.roleTitle} · {mockJob.company}
            </p>
            <CandidateProfileBio
              defaultBio={mockUser.tagline}
              className="text-[11px] leading-snug text-muted-foreground sm:text-xs"
            />
          </div>
        </div>

        <p className="text-[10px] leading-relaxed sm:text-[11px]">
          <span className="font-medium text-foreground">At a glance:</span>{" "}
          Resume &amp; LinkedIn linked · {mockUser.school} · Grad{" "}
          {mockUser.graduationDate}
        </p>

        <div className="rounded-lg border border-border-light bg-surface/80 p-3 sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
            Matched skills
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:px-2.5 sm:text-xs">
              {ts.name}
            </span>
            <span className="rounded-full border border-border bg-muted/80 px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs">
              {sd.name}
            </span>
          </div>
          <p className="mt-3 line-clamp-4 text-[10px] leading-relaxed sm:mt-4 sm:text-[11px]">
            {ts.commits[0]?.description ?? ""}
          </p>
        </div>

        <blockquote className="border-l-[3px] border-primary py-1 pl-3 font-serif text-xs leading-relaxed text-foreground sm:pl-4 sm:text-sm md:text-[0.9375rem]">
          “A concise read for recruiters, grounded in commits, not claims.”
        </blockquote>
      </div>
    </div>
  );
}
