import { Router } from "express";
import { serviceOnly } from "../middleware/auth";
import {
  createRepository,
  getRepository,
  markIngested,
} from "../controllers/repository.controller";

export const repositoryRoutes = Router();

repositoryRoutes.post("/", serviceOnly, createRepository);
repositoryRoutes.get("/:owner/:repo", serviceOnly, getRepository);
repositoryRoutes.patch("/:owner/:repo/ingested", serviceOnly, markIngested);
