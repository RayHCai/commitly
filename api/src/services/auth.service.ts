import jwt from "jsonwebtoken";
import { Octokit } from "octokit";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import * as linkService from "./link.service";

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
}

export async function handleGithubCallback(
  code: string,
  sessionId?: string
) {
  // Step 1: Exchange code for access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;

  if (!tokenData.access_token) {
    throw new ApiError(401, "Failed to exchange code for access token");
  }

  // Step 2: Fetch GitHub user profile using Octokit
  const octokit = new Octokit({ auth: tokenData.access_token });
  const { data: githubUser } = await octokit.rest.users.getAuthenticated();

  // Step 3: Upsert user in database
  const user = await prisma.user.upsert({
    where: { githubId: githubUser.id },
    update: {
      githubAccessToken: tokenData.access_token,
      username: githubUser.login,
      email: githubUser.email,
      avatarUrl: githubUser.avatar_url,
    },
    create: {
      githubId: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      avatarUrl: githubUser.avatar_url,
      githubAccessToken: tokenData.access_token,
    },
  });

  // Step 4: Link pending job URLs to user
  if (sessionId) {
    const pendingJobs = await prisma.pendingJobUrl.findMany({
      where: { sessionId },
    });

    for (const pending of pendingJobs) {
      await linkService.createPendingLink({
        userId: user.id,
        jobUrl: pending.jobUrl,
      });
    }

    await prisma.pendingJobUrl.deleteMany({
      where: { sessionId },
    });
  }

  // Step 5: Sign JWT
  const jwtToken = jwt.sign(
    { userId: user.id, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  return { jwt: jwtToken, user };
}
