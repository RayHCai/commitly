import { ShareFab } from "@/components/ShareModal";
import { CanvasView } from "@/components/recruiter/canvas-view";
import { PaperSurface } from "@/components/recruiter/paper-surface";
import { PosterView } from "@/components/recruiter/poster-view";
import { ScrollStoryView } from "@/components/recruiter/scroll-story-view";
import {
  VariantSwitcher,
  type LinkVariant,
} from "@/components/recruiter/variant-switcher";
import { mockJob, mockUser, recruiterTopSkills } from "@/lib/mockData";

const VALID_VARIANTS: LinkVariant[] = ["poster", "scroll", "canvas"];

function resolveVariant(raw: string | string[] | undefined): LinkVariant {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return VALID_VARIANTS.includes(v as LinkVariant)
    ? (v as LinkVariant)
    : "poster";
}

export default function CandidatePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { v?: string | string[] };
}) {
  const variant = resolveVariant(searchParams?.v);

  return (
    <PaperSurface>
      {variant === "poster" && (
        <PosterView
          slug={params.slug}
          user={mockUser}
          job={mockJob}
          skills={recruiterTopSkills}
        />
      )}
      {variant === "scroll" && (
        <ScrollStoryView
          slug={params.slug}
          user={mockUser}
          job={mockJob}
          skills={recruiterTopSkills}
        />
      )}
      {variant === "canvas" && (
        <CanvasView
          slug={params.slug}
          user={mockUser}
          job={mockJob}
          skills={recruiterTopSkills}
        />
      )}

      <VariantSwitcher current={variant} />

      <ShareFab
        linkUrl={`commitly.io/c/${params.slug}`}
        role={mockJob.roleTitle}
        company={mockJob.company}
      />
    </PaperSurface>
  );
}
