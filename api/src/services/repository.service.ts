import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { fetchWithRetry } from "../utils/fetchWithRetry";

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

export async function getMyRepositories(userId: string) {
  return prisma.repository.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      fullName: true,
      url: true,
      isPrivate: true,
      lastIngestedAt: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function deleteRepositories(userId: string, ids: string[]) {
  return prisma.repository.deleteMany({
    where: { userId, id: { in: ids } },
  });
}

export async function triggerIngestion(userId: string) {
  const repos = await prisma.repository.findMany({
    where: { userId },
    select: { fullName: true },
  });

  const repoNames = repos.map((r) => r.fullName);
  if (repoNames.length === 0) return { queued: 0, taskId: null };

  const response = await fetchWithRetry(`${env.WORKER_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      repo_names: repoNames,
    }),
  });

  const data = (await response.json()) as { task_id?: string };
  return { queued: repoNames.length, taskId: data.task_id ?? null };
}

export async function getTaskStatus(taskId: string) {
  const response = await fetchWithRetry(
    `${env.WORKER_URL}/tasks/${encodeURIComponent(taskId)}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Worker returned ${response.status}: ${text}`);
  }

  return response.json();
}
