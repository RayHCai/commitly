import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

interface MatchedCommitInput {
  commitSha: string;
  repoName: string;
  url: string;
  message: string;
  diff: string;
  tags: string[];
  score: number;
  summary?: string;
}

interface RequirementInput {
  name: string;
  description: string;
  matchedCommits: MatchedCommitInput[];
}

export async function createRequirementsForLink(
  linkId: string,
  requirements: RequirementInput[]
) {
  const link = await prisma.customLink.findUnique({ where: { id: linkId } });
  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  const created = await prisma.$transaction(
    requirements.map((req) =>
      prisma.requirement.create({
        data: {
          customLinkId: linkId,
          name: req.name,
          description: req.description,
          matchedCommits: {
            create: req.matchedCommits.map((c) => ({
              commitSha: c.commitSha,
              repoName: c.repoName,
              url: c.url,
              message: c.message,
              diff: c.diff,
              tags: c.tags,
              score: c.score,
              summary: c.summary ?? "",
            })),
          },
        },
        include: { matchedCommits: true },
      })
    )
  );

  return created;
}

export async function replaceRequirementsForLink(
  linkId: string,
  requirements: RequirementInput[]
) {
  const link = await prisma.customLink.findUnique({ where: { id: linkId } });
  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  await prisma.requirement.deleteMany({ where: { customLinkId: linkId } });

  const created = await prisma.$transaction(
    requirements.map((req) =>
      prisma.requirement.create({
        data: {
          customLinkId: linkId,
          name: req.name,
          description: req.description,
          matchedCommits: {
            create: req.matchedCommits.map((c) => ({
              commitSha: c.commitSha,
              repoName: c.repoName,
              url: c.url,
              message: c.message,
              diff: c.diff,
              tags: c.tags,
              score: c.score,
              summary: c.summary ?? "",
            })),
          },
        },
        include: { matchedCommits: true },
      })
    )
  );

  return created;
}

export async function getRequirementsByLink(linkId: string, userId: string) {
  const link = await prisma.customLink.findUnique({ where: { id: linkId } });
  if (!link) {
    throw new ApiError(404, "Link not found");
  }
  if (link.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return prisma.requirement.findMany({
    where: { customLinkId: linkId },
    include: { matchedCommits: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRequirementsByUserLinks(userId: string) {
  return prisma.customLink.findMany({
    where: { userId },
    select: {
      id: true,
      slug: true,
      title: true,
      jobUrl: true,
      status: true,
      requirements: {
        include: { matchedCommits: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
