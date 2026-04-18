import { Router } from "express";
import { serviceOnly } from "../middleware/auth";
import { createRepository } from "../controllers/repository.controller";

export const repositoryRoutes = Router();

repositoryRoutes.post("/", serviceOnly, createRepository);
