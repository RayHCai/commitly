import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { createAnalysis } from "../controllers/analysis.controller.js";

export const analysisRoutes = Router();

analysisRoutes.post("/", authenticate, createAnalysis);
