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
