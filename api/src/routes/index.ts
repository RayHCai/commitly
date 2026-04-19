import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { repositoryRoutes } from "./repository.routes.js";
import { analysisRoutes } from "./analysis.routes.js";
import { linkRoutes } from "./link.routes.js";
import { linkViewRoutes } from "./linkView.routes.js";
import { analyticsRoutes } from "./analytics.routes.js";
import { userRoutes } from "./user.routes.js";
import { githubRoutes } from "./github.routes.js";
import { requirementRoutes } from "./requirement.routes.js";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/analysis", analysisRoutes);
router.use("/links", linkRoutes);
router.use("/requirements", requirementRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);
router.use("/github", githubRoutes);

// MUST be last — /:username/:slug is a catch-all pattern
router.use("/", linkViewRoutes);
