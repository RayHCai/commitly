import { CommitsExplorer } from "./commits-explorer";
import { RecruiterPageHeader } from "@/components/recruiter/recruiter-page-header";
import {
  EXPLORER_TOTAL_COMMITS,
  EXPLORER_TOTAL_REPOS,
  mockUser,
} from "@/lib/mockData";

export default function CandidateCommitsPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <RecruiterPageHeader slug={params.slug} variant="commits" />
      <main className="mx-auto max-w-[1080px] px-6 pb-24 pt-12 md:pb-32 md:pt-16">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-foreground md:text-[2.75rem] md:leading-tight">
          All commits for {mockUser.fullName}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--text-secondary)]">
          {EXPLORER_TOTAL_COMMITS} commits analyzed across {EXPLORER_TOTAL_REPOS}{" "}
          repos.
        </p>
        <CommitsExplorer />
      </main>
    </div>
  );
}
