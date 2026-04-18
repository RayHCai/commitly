import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

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
    },
  });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  return {
    linkId: link.id,
    slug: link.slug,
    title: link.title,
    targetUrl: link.targetUrl,
    user: link.user,
  };
}
