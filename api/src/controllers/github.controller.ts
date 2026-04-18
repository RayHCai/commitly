import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as githubService from "../services/github.service";

export const getRepos = asyncHandler(
  async (req: Request, res: Response) => {
    const repos = await githubService.getUserRepos(req.user!.userId);
    res.json({ success: true, data: repos });
  }
);

export const getRepoCommits = asyncHandler(
  async (req: Request, res: Response) => {
    const owner = req.params.owner as string;
    const repo = req.params.repo as string;
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 30;

    const commits = await githubService.getRepoCommits(
      req.user!.userId,
      owner,
      repo,
      page,
      perPage
    );
    res.json({ success: true, data: commits });
  }
);

export const getCommitDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const owner = req.params.owner as string;
    const repo = req.params.repo as string;
    const sha = req.params.sha as string;
    const commit = await githubService.getCommitDetail(
      req.user!.userId,
      owner,
      repo,
      sha
    );
    res.json({ success: true, data: commit });
  }
);
