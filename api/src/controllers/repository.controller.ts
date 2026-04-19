import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as repositoryService from "../services/repository.service";

export const createRepository = asyncHandler(
  async (req: Request, res: Response) => {
    const { githubRepoId, name, fullName, url, isPrivate } = req.body;
    const repository = await repositoryService.createRepository({
      userId: req.user!.userId,
      githubRepoId,
      name,
      fullName,
      url,
      isPrivate,
    });
    res.status(201).json({ success: true, data: repository });
  }
);

export const getRepository = asyncHandler(
  async (req: Request, res: Response) => {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const repository = await repositoryService.getRepositoryByFullName(
      req.user!.userId,
      fullName
    );
    if (!repository) {
      return res
        .status(404)
        .json({ success: false, message: "Repository not found" });
    }
    res.json({ success: true, data: repository });
  }
);

export const markIngested = asyncHandler(
  async (req: Request, res: Response) => {
    const fullName = `${req.params.owner}/${req.params.repo}`;
    const { lastIngestedAt } = req.body;
    await repositoryService.updateLastIngestedAt(
      req.user!.userId,
      fullName,
      new Date(lastIngestedAt)
    );
    res.json({ success: true });
  }
);
