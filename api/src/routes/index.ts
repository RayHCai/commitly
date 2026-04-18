import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { repositoryRoutes } from "./repository.routes";
import { commitRoutes } from "./commit.routes";
import { analysisRoutes } from "./analysis.routes";
import { linkRoutes } from "./link.routes";
import { linkViewRoutes } from "./linkView.routes";
import { analyticsRoutes } from "./analytics.routes";
import { userRoutes } from "./user.routes";
import { githubRoutes } from "./github.routes";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/commits", commitRoutes);
router.use("/analysis", analysisRoutes);
router.use("/links", linkRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);
router.use("/github", githubRoutes);

// MUST be last — /:username/:slug is a catch-all pattern
router.use("/", linkViewRoutes);
