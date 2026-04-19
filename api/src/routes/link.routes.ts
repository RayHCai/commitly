import { Router } from "express";
import { authenticate, serviceOnly } from "../middleware/auth";
import { createLink, completeLink, getShellLinks } from "../controllers/link.controller";

export const linkRoutes = Router();

linkRoutes.get("/shell", serviceOnly, getShellLinks);
linkRoutes.post("/", authenticate, createLink);
linkRoutes.patch("/:id/complete", serviceOnly, completeLink);
