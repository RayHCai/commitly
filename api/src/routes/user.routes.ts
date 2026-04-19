import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getMe,
  updateProfile,
  getPresignedUploadUrl,
  downloadResume,
} from "../controllers/user.controller";

export const userRoutes = Router();

userRoutes.get("/me", authenticate, getMe);
userRoutes.patch("/me", authenticate, updateProfile);
userRoutes.post("/me/resume/presigned-url", authenticate, getPresignedUploadUrl);
userRoutes.get("/:username/resume", downloadResume);
