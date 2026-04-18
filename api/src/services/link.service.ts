import { prisma } from "../config/prisma";
import { generateSlug } from "../utils/slug";
import { ApiError } from "../utils/ApiError";

interface CreateLinkInput {
  userId: string;
  username: string;
  slug?: string;
  title?: string;
  targetUrl?: string;
}

export async function createLink(data: CreateLinkInput) {
  const slug = data.slug
    ? generateSlug(data.slug)
    : generateSlug(data.title || "link");

  const existing = await prisma.customLink.findUnique({
    where: { userId_slug: { userId: data.userId, slug } },
  });
  if (existing) {
    throw new ApiError(
      409,
      `A link with slug "${slug}" already exists for this user`
    );
  }

  return prisma.customLink.create({
    data: {
      userId: data.userId,
      slug,
      title: data.title,
      targetUrl: data.targetUrl,
    },
  });
}
