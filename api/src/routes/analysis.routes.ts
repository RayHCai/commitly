import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createAnalysis } from "../controllers/analysis.controller";

export const analysisRoutes = Router();

analysisRoutes.post("/", authenticate, createAnalysis);
