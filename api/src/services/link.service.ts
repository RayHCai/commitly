import { prisma } from "../config/prisma";
import { generateSlug } from "../utils/slug";
import { ApiError } from "../utils/ApiError";


interface CreatePendingLinkInput {
  userId: string;
  jobUrl: string;
}

interface CompleteLinkInput {
  company: string;
  jobTitle: string;
  positionId: string | null;
}

export async function getShellLinks(userId: string) {
  return prisma.customLink.findMany({
    where: { userId, status: "PENDING" },
    select: { id: true, jobUrl: true },
  });
}

export async function createPendingLink(data: CreatePendingLinkInput) {
  const tempSlug = `pending-${crypto.randomUUID()}`;

  return prisma.customLink.create({
    data: {
      userId: data.userId,
      slug: tempSlug,
      jobUrl: data.jobUrl,
      status: "PENDING",
      isActive: false,
    },
  });
}

export async function completeLink(linkId: string, data: CompleteLinkInput) {
  const link = await prisma.customLink.findUnique({
    where: { id: linkId },
  });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }
  if (link.status !== "PENDING") {
    throw new ApiError(409, "Link is not in PENDING status");
  }

  const baseSlug = generateSlug(`${data.company} ${data.jobTitle}`);

  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const existing = await prisma.customLink.findUnique({
      where: { userId_slug: { userId: link.userId, slug } },
    });
    if (!existing || existing.id === linkId) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const title = `${data.jobTitle} at ${data.company}`;

  return prisma.customLink.update({
    where: { id: linkId },
    data: {
      slug,
      title,
      status: "ACTIVE",
      isActive: true,
    },
  });
}

export async function failLink(linkId: string, error: string) {
  return prisma.customLink.update({
    where: { id: linkId },
    data: {
      status: "FAILED",
      isActive: false,
      title: `Failed: ${error}`,
    },
  });
}
