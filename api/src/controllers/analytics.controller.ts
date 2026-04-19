import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as analyticsService from "../services/analytics.service.js";

export const getLinkAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const linkId = req.params.linkId as string;
    const analytics = await analyticsService.getLinkAnalytics(
      linkId,
      req.user!.userId
    );
    res.json({ success: true, data: analytics });
  }
);

export const getAllLinksAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const analytics = await analyticsService.getAllLinksAnalytics(
      req.user!.userId
    );
    res.json({ success: true, data: analytics });
  }
);
