import Link from "next/link";

import { CommitsExplorer } from "./commits-explorer";
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
    <div className="min-h-screen bg-background text-black">
      <main className="mx-auto max-w-[1080px] px-6 pb-24 pt-10 md:pb-32 md:pt-12">
        <Link
          href={`/c/${params.slug}`}
          className="inline-block shrink-0 text-[15px] font-medium leading-none text-black underline-offset-4 hover:underline"
        >
          ← Back to summary
        </Link>
        <h1 className="mt-8 font-serif text-4xl font-normal tracking-tight text-black md:text-[2.75rem] md:leading-tight">
          All commits for {mockUser.fullName}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-black">
          {EXPLORER_TOTAL_COMMITS} commits analyzed across {EXPLORER_TOTAL_REPOS}{" "}
          repos.
        </p>
        <CommitsExplorer />
      </main>
    </div>
  );
}
