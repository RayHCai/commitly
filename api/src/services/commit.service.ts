import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

interface CreateCommitInput {
  repositoryId: string;
  sha: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  committedAt: Date;
  diffSummary?: string;
}

export async function createCommit(data: CreateCommitInput, userId: string) {
  const repository = await prisma.repository.findFirst({
    where: { id: data.repositoryId, userId },
  });

  if (!repository) {
    throw new ApiError(404, "Repository not found or does not belong to you");
  }

  return prisma.commit.create({ data });
}
