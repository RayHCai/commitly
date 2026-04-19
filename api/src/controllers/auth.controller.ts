import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import * as authService from "../services/auth.service";
import * as githubService from "../services/github.service";

export const createPendingJob = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, jobUrl } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }
    if (!jobUrl || typeof jobUrl !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "jobUrl is required" });
    }

    try {
      new URL(jobUrl);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "jobUrl must be a valid URL" });
    }

    const pending = await prisma.pendingJobUrl.create({
      data: { sessionId, jobUrl },
    });

    res.status(201).json({ success: true, data: { id: pending.id } });
  }
);

export const githubRedirect = asyncHandler(
  async (req: Request, res: Response) => {
    const githubAuthUrl = new URL(
      "https://github.com/login/oauth/authorize"
    );
    githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.set("redirect_uri", env.GITHUB_CALLBACK_URL);
    githubAuthUrl.searchParams.set("scope", "repo user:email read:user");

    const sessionId = req.query.sessionId as string | undefined;
    if (sessionId) {
      githubAuthUrl.searchParams.set("state", sessionId);
    }

    res.redirect(githubAuthUrl.toString());
  }
);

export const githubCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, state } = req.query;
    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Missing code parameter" });
    }

    const sessionId =
      state && typeof state === "string" ? state : undefined;

    const { jwt, user, isNewUser, onboardingComplete } =
      await authService.handleGithubCallback(code, sessionId);

    const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set("token", jwt);
    if (sessionId) {
      redirectUrl.searchParams.set("jobLinked", "true");
    }
    redirectUrl.searchParams.set("isNewUser", String(isNewUser));
    redirectUrl.searchParams.set(
      "onboardingComplete",
      String(onboardingComplete)
    );
    res.redirect(redirectUrl.toString());

    // Fire-and-forget: fetch user repos and upsert in DB (no ingestion — deferred to onboard)
    githubService
      .getUserRepos(user.id)
      .then(async (repos) => {
        await Promise.all(
          repos.map((r: any) =>
            prisma.repository.upsert({
              where: {
                userId_githubRepoId: {
                  userId: user.id,
                  githubRepoId: r.id,
                },
              },
              update: {
                name: r.name,
                fullName: r.full_name,
                url: r.html_url,
                isPrivate: r.private,
              },
              create: {
                userId: user.id,
                githubRepoId: r.id,
                name: r.name,
                fullName: r.full_name,
                url: r.html_url,
                isPrivate: r.private,
              },
            })
          )
        );
      })
      .catch((err) =>
        console.error("Failed to sync repos:", err)
      );
  }
);
