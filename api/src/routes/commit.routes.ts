import { Router } from "express";
import { serviceOnly } from "../middleware/auth";
import { createCommit } from "../controllers/commit.controller";

export const commitRoutes = Router();

commitRoutes.post("/", serviceOnly, createCommit);
