import { Octokit } from "octokit";
import { prisma } from "../config/prisma";
import { cacheGet, cacheSet } from "../config/redis";
import { ApiError } from "../utils/ApiError";

async function getOctokitForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return new Octokit({ auth: user.githubAccessToken });
}

export async function getUserRepos(userId: string) {
  const cacheKey = `github:repos:${userId}`;
  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const octokit = await getOctokitForUser(userId);

  const repos = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
    type: "all",
  });

  await cacheSet(cacheKey, repos.data, 600); // 10 min TTL
  return repos.data;
}

export async function getRepoCommits(
  userId: string,
  owner: string,
  repo: string,
  page = 1,
  perPage = 30,
  since?: string
) {
  const octokit = await getOctokitForUser(userId);

  const commits = await octokit.rest.repos.listCommits({
    owner,
    repo,
    page,
    per_page: perPage,
    ...(since ? { since } : {}),
  });

  return commits.data;
}

export async function getCommitDetail(
  userId: string,
  owner: string,
  repo: string,
  sha: string
) {
  const octokit = await getOctokitForUser(userId);

  const commit = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return commit.data;
}
