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
