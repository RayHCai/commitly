import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createLink } from "../controllers/link.controller";

export const linkRoutes = Router();

linkRoutes.post("/", authenticate, createLink);
