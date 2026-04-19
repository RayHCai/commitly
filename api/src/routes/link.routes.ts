import { Router } from "express";
import { authenticate, serviceOnly } from "../middleware/auth.js";
import { createLink, completeLink, getShellLinks, getUserLinks, createGeneralLink, completeGeneralLink } from "../controllers/link.controller.js";

export const linkRoutes = Router();

linkRoutes.get("/", authenticate, getUserLinks);
linkRoutes.get("/shell", serviceOnly, getShellLinks);
linkRoutes.post("/general", serviceOnly, createGeneralLink);
linkRoutes.patch("/general/:id/complete", serviceOnly, completeGeneralLink);
linkRoutes.post("/", authenticate, createLink);
linkRoutes.patch("/:id/complete", serviceOnly, completeLink);
