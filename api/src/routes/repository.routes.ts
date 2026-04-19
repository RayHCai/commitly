import { Router } from "express";
import { authenticate, serviceOnly } from "../middleware/auth.js";
import {
  createRepository,
  getRepository,
  markIngested,
  getMyRepositories,
  deleteRepositoriesBatch,
  triggerIngestion,
  getTaskStatus,
} from "../controllers/repository.controller.js";

export const repositoryRoutes = Router();

// Authenticated (frontend) routes
repositoryRoutes.get("/me", authenticate, getMyRepositories);
repositoryRoutes.delete("/me/batch", authenticate, deleteRepositoriesBatch);
repositoryRoutes.post("/me/ingest", authenticate, triggerIngestion);
repositoryRoutes.get("/me/task/:taskId", authenticate, getTaskStatus);

// Service-only routes
repositoryRoutes.post("/", serviceOnly, createRepository);
repositoryRoutes.get("/:owner/:repo", serviceOnly, getRepository);
repositoryRoutes.patch("/:owner/:repo/ingested", serviceOnly, markIngested);
