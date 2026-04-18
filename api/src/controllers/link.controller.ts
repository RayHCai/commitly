import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";
import * as linkService from "../services/link.service";

export const createLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, title, targetUrl } = req.body;
    const link = await linkService.createLink({
      userId: req.user!.userId,
      username: req.user!.username,
      slug,
      title,
      targetUrl,
    });
    res.status(201).json({
      success: true,
      data: {
        ...link,
        publicUrl: `${env.BASE_URL}/${req.user!.username}/${link.slug}`,
      },
    });
  }
);
