import { Router } from "express";
import { viewLink, viewGeneralProfile } from "../controllers/linkView.controller.js";

export const linkViewRoutes = Router();

linkViewRoutes.get("/:username/:slug", viewLink);
linkViewRoutes.get("/:username", viewGeneralProfile);
