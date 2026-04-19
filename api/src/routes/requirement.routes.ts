import { Router } from "express";
import { authenticate, serviceOnly } from "../middleware/auth";
import {
  createRequirements,
  replaceRequirements,
  getLinkRequirements,
  getMyRequirements,
} from "../controllers/requirement.controller";

export const requirementRoutes = Router();

// Service-only: worker creates requirements + matched commits
requirementRoutes.post("/", serviceOnly, createRequirements);
requirementRoutes.put("/", serviceOnly, replaceRequirements);

// Authenticated: user fetches their requirements
requirementRoutes.get("/me", authenticate, getMyRequirements);
requirementRoutes.get("/link/:linkId", authenticate, getLinkRequirements);
