import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as commitService from "../services/commit.service";

export const createCommit = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      repositoryId,
      sha,
      message,
      authorName,
      authorEmail,
      committedAt,
      diffSummary,
    } = req.body;

    const commit = await commitService.createCommit(
      {
        repositoryId,
        sha,
        message,
        authorName,
        authorEmail,
        committedAt: new Date(committedAt),
        diffSummary,
      },
      req.user!.userId
    );
    res.status(201).json({ success: true, data: commit });
  }
);
