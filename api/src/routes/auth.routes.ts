import { Router } from "express";
import {
  githubRedirect,
  githubCallback,
  createPendingJob,
} from "../controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/pending-job", createPendingJob);
authRoutes.get("/github", githubRedirect);
authRoutes.get("/github/callback", githubCallback);
