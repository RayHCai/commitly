import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as linkViewService from "../services/linkView.service";
import { trackView } from "../middleware/trackView";

export const viewLink = asyncHandler(
  async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const slug = req.params.slug as string;
    const linkData = await linkViewService.getLinkPageData(username, slug);

    trackView(linkData.linkId, req);

    res.json({ success: true, data: linkData });
  }
);

export const viewGeneralProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const profileData = await linkViewService.getGeneralProfileData(username);

    trackView(profileData.linkId, req);

    res.json({ success: true, data: profileData });
  }
);
