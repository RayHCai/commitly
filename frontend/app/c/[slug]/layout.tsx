import type { Metadata } from "next";

import { mockJob, mockUser } from "@/lib/mockData";

/** Shared candidate page — public; no auth gate (anyone with the URL can view). */

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = `${mockUser.fullName} for ${mockJob.roleTitle} at ${mockJob.company}`;
  const description = `See how ${mockUser.fullName}'s commits match the role.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/c/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/c/${params.slug}`,
      siteName: "Commitly",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CandidatePublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
