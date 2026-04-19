import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as repositoryService from "../services/repository.service.js";

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

export const getMyRepositories = asyncHandler(
  async (req: Request, res: Response) => {
    const repos = await repositoryService.getMyRepositories(req.user!.userId);
    res.json({ success: true, data: repos });
  }
);

export const deleteRepositoriesBatch = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "ids must be a non-empty array" });
    }
    await repositoryService.deleteRepositories(req.user!.userId, ids);
    res.json({ success: true });
  }
);

export const triggerIngestion = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await repositoryService.triggerIngestion(req.user!.userId);
    res.json({ success: true, data: result });
  }
);

export const getTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const taskId = req.params.taskId as string;
    if (!taskId || taskId === "null" || taskId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }
    const status = await repositoryService.getTaskStatus(taskId);
    res.json({ success: true, data: status });
  }
);
