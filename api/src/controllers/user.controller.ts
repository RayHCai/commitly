import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as userService from "../services/user.service";
import * as s3Service from "../services/s3.service";

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { linkedinUrl, resumeS3Key } = req.body;
    const user = await userService.updateProfile(req.user!.userId, {
      linkedinUrl,
      resumeS3Key,
    });
    res.json({ success: true, data: user });
  }
);

export const getPresignedUploadUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { fileName, contentType } = req.body;
    const { uploadUrl, s3Key } = await s3Service.generatePresignedUploadUrl(
      req.user!.userId,
      fileName,
      contentType
    );
    res.json({ success: true, data: { uploadUrl, s3Key } });
  }
);
