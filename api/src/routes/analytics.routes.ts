import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getLinkAnalytics,
  getAllLinksAnalytics,
} from "../controllers/analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/links", authenticate, getAllLinksAnalytics);
analyticsRoutes.get("/links/:linkId", authenticate, getLinkAnalytics);
