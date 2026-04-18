import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function getLinkAnalytics(linkId: string, userId: string) {
  const link = await prisma.customLink.findFirst({
    where: { id: linkId, userId },
  });
  if (!link) {
    throw new ApiError(404, "Link not found or does not belong to you");
  }

  const totalViews = await prisma.linkView.count({
    where: { customLinkId: linkId },
  });

  const recentViews = await prisma.linkView.findMany({
    where: { customLinkId: linkId },
    orderBy: { viewedAt: "desc" },
    take: 50,
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const viewsByDay = await prisma.linkView.groupBy({
    by: ["viewedAt"],
    where: {
      customLinkId: linkId,
      viewedAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  });

  return { link, totalViews, recentViews, viewsByDay };
}

export async function getAllLinksAnalytics(userId: string) {
  const links = await prisma.customLink.findMany({
    where: { userId },
    include: {
      _count: { select: { views: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return links.map((link) => ({
    id: link.id,
    slug: link.slug,
    title: link.title,
    targetUrl: link.targetUrl,
    totalViews: link._count.views,
    createdAt: link.createdAt,
  }));
}
