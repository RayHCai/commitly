import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export async function getLinkPageData(username: string, slug: string) {
  const link = await prisma.customLink.findFirst({
    where: {
      slug,
      user: { username },
      isActive: true,
    },
    include: {
      user: {
        select: {
          username: true,
          avatarUrl: true,
          linkedinUrl: true,
          resumeS3Key: true,
        },
      },
      requirements: {
        orderBy: { createdAt: "asc" },
        include: {
          matchedCommits: {
            select: {
              id: true,
              commitSha: true,
              repoName: true,
              url: true,
              message: true,
              tags: true,
              score: true,
              summary: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  const requirements = link.requirements.map((req: (typeof link.requirements)[number]) => {
    const hasHighConfidence = req.matchedCommits.some((c: (typeof req.matchedCommits)[number]) => c.score >= 0.6);
    return {
      ...req,
      matchedCommits: hasHighConfidence
        ? req.matchedCommits.filter((c: (typeof req.matchedCommits)[number]) => c.score >= 0.6)
        : [],
    };
  });

  const resumeUrl = link.user.resumeS3Key
    ? `${env.BASE_URL}/users/${link.user.username}/resume`
    : null;

  return {
    linkId: link.id,
    slug: link.slug,
    title: link.title,
    targetUrl: link.targetUrl,
    jobUrl: link.jobUrl,
    type: link.type,
    user: {
      username: link.user.username,
      avatarUrl: link.user.avatarUrl,
      linkedinUrl: link.user.linkedinUrl,
      resumeUrl,
    },
    requirements,
  };
}

export async function getGeneralProfileData(username: string) {
  const link = await prisma.customLink.findFirst({
    where: {
      slug: "general",
      type: "GENERAL",
      user: { username },
      isActive: true,
    },
    include: {
      user: {
        select: {
          username: true,
          avatarUrl: true,
          linkedinUrl: true,
          resumeS3Key: true,
        },
      },
      requirements: {
        orderBy: { createdAt: "asc" },
        include: {
          matchedCommits: {
            select: {
              id: true,
              commitSha: true,
              repoName: true,
              url: true,
              message: true,
              tags: true,
              score: true,
              summary: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!link) {
    throw new ApiError(404, "Profile not found");
  }

  const requirements = link.requirements.map((req: (typeof link.requirements)[number]) => {
    const hasHighConfidence = req.matchedCommits.some((c: (typeof req.matchedCommits)[number]) => c.score >= 0.6);
    return {
      ...req,
      matchedCommits: hasHighConfidence
        ? req.matchedCommits.filter((c: (typeof req.matchedCommits)[number]) => c.score >= 0.6)
        : [],
    };
  });

  const resumeUrl = link.user.resumeS3Key
    ? `${env.BASE_URL}/users/${link.user.username}/resume`
    : null;

  return {
    linkId: link.id,
    slug: link.slug,
    title: link.title,
    type: link.type,
    user: {
      username: link.user.username,
      avatarUrl: link.user.avatarUrl,
      linkedinUrl: link.user.linkedinUrl,
      resumeUrl,
    },
    requirements,
  };
}
