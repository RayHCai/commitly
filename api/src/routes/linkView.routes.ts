import { Router } from "express";
import { viewLink } from "../controllers/linkView.controller";

export const linkViewRoutes = Router();

linkViewRoutes.get("/:username/:slug", viewLink);
