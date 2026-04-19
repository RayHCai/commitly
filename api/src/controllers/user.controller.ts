import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as userService from "../services/user.service.js";
import * as s3Service from "../services/s3.service.js";
import { prisma } from "../config/prisma.js";

export const getMe = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  }
);

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

export const downloadResume = asyncHandler(
  async (req: Request, res: Response) => {
    const username = req.params.username as string;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { resumeS3Key: true },
    });

    if (!user?.resumeS3Key) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    let s3Object;
    try {
      s3Object = await s3Service.getS3Object(user.resumeS3Key);
    } catch (err: any) {
      if (err.Code === "NoSuchKey" || err.name === "NoSuchKey") {
        return res.status(404).json({ success: false, message: "Resume not found" });
      }
      throw err;
    }

    const { body, contentType, contentLength } = s3Object;

    res.setHeader("Content-Disposition", `attachment; filename="resume.pdf"`);
    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);

    (body as NodeJS.ReadableStream).pipe(res);
  }
);
