import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getLinkAnalytics,
  getAllLinksAnalytics,
} from "../controllers/analytics.controller";

export const analyticsRoutes = Router();

analyticsRoutes.get("/links", authenticate, getAllLinksAnalytics);
analyticsRoutes.get("/links/:linkId", authenticate, getLinkAnalytics);
