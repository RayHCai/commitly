import { prisma } from "../config/prisma.js";
import { cacheGet, cacheSet } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";

export async function getLinkAnalytics(linkId: string, userId: string) {
  const link = await prisma.customLink.findFirst({
    where: { id: linkId, userId },
    include: { user: { select: { username: true } } },
  });
  if (!link) {
    throw new ApiError(404, "Link not found or does not belong to you");
  }

  const username = link.user.username;
  const publicUrl =
    link.type === "GENERAL" ? `/${username}` : `/${username}/${link.slug}`;

  const cacheKey = `analytics:link:${linkId}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { link, publicUrl, ...cached };

  const [totalViews, recentViews] = await Promise.all([
    prisma.linkView.count({ where: { customLinkId: linkId } }),
    prisma.linkView.findMany({
      where: { customLinkId: linkId },
      orderBy: { viewedAt: "desc" },
      take: 50,
    }),
  ]);

  // Unique viewers by distinct IP
  const uniqueRows = await prisma.linkView.findMany({
    where: { customLinkId: linkId, ipAddress: { not: null } },
    distinct: ["ipAddress"],
    select: { ipAddress: true },
  });
  const uniqueViewers = uniqueRows.length;

  // Views grouped by calendar date (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const viewsByDay: { date: string; count: number }[] = await prisma.$queryRaw`
    SELECT DATE("viewedAt") as date, COUNT(*)::int as count
    FROM link_views
    WHERE "customLinkId" = ${linkId}
      AND "viewedAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("viewedAt")
    ORDER BY date ASC
  `;

  // Referrer breakdown
  const referrerRows = await prisma.linkView.groupBy({
    by: ["referrer"],
    where: { customLinkId: linkId },
    _count: true,
  });
  const referrerBreakdown = referrerRows.map((r) => ({
    referrer: r.referrer ?? "Direct",
    count: r._count,
  }));

  const result = {
    totalViews,
    uniqueViewers,
    recentViews,
    viewsByDay,
    referrerBreakdown,
  };
  await cacheSet(cacheKey, result, 60);
  return { link, publicUrl, ...result };
}

export async function getAllLinksAnalytics(userId: string) {
  const cacheKey = `analytics:all:${userId}`;
  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  const username = user?.username ?? "";

  const links = await prisma.customLink.findMany({
    where: { userId },
    include: {
      _count: { select: { views: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Batch-fetch unique viewer counts per link
  const linkIds = links.map((l) => l.id);
  const uniqueRows: { customLinkId: string; count: number }[] =
    linkIds.length > 0
      ? await prisma.$queryRaw`
          SELECT "customLinkId", COUNT(DISTINCT "ipAddress")::int as count
          FROM link_views
          WHERE "customLinkId" = ANY(${linkIds})
            AND "ipAddress" IS NOT NULL
          GROUP BY "customLinkId"
        `
      : [];
  const uniqueMap = new Map(uniqueRows.map((r) => [r.customLinkId, r.count]));

  const result = links.map((link) => ({
    id: link.id,
    slug: link.slug,
    title: link.title,
    targetUrl: link.targetUrl,
    type: link.type,
    totalViews: link._count.views,
    uniqueViewers: uniqueMap.get(link.id) ?? 0,
    publicUrl:
      link.type === "GENERAL"
        ? `/${username}`
        : `/${username}/${link.slug}`,
    createdAt: link.createdAt,
  }));

  await cacheSet(cacheKey, result, 60);
  return result;
}
