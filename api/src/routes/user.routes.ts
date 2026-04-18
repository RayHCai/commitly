import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  updateProfile,
  getPresignedUploadUrl,
} from "../controllers/user.controller";

export const userRoutes = Router();

userRoutes.patch("/me", authenticate, updateProfile);
userRoutes.post("/me/resume/presigned-url", authenticate, getPresignedUploadUrl);
