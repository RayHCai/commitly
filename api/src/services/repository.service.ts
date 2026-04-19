import { prisma } from "../config/prisma";

interface CreateRepositoryInput {
  userId: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  url: string;
  isPrivate?: boolean;
}

export async function createRepository(data: CreateRepositoryInput) {
  return prisma.repository.create({ data });
}

export async function getRepositoryByFullName(
  userId: string,
  fullName: string
) {
  return prisma.repository.findFirst({
    where: { userId, fullName },
    select: { id: true, lastIngestedAt: true, fullName: true },
  });
}

export async function updateLastIngestedAt(
  userId: string,
  fullName: string,
  lastIngestedAt: Date
) {
  return prisma.repository.updateMany({
    where: { userId, fullName },
    data: { lastIngestedAt },
  });
}
