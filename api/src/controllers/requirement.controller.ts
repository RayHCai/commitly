import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as requirementService from "../services/requirement.service.js";

// Service-only: worker calls this after matching commits to requirements
export const createRequirements = asyncHandler(
  async (req: Request, res: Response) => {
    const { linkId, requirements } = req.body;

    if (!linkId || !Array.isArray(requirements)) {
      return res.status(400).json({
        success: false,
        message: "linkId and requirements array are required",
      });
    }

    const created = await requirementService.createRequirementsForLink(
      linkId,
      requirements
    );

    res.status(201).json({ success: true, data: created });
  }
);

// Service-only: worker calls this to replace requirements (for general link refresh)
export const replaceRequirements = asyncHandler(
  async (req: Request, res: Response) => {
    const { linkId, requirements } = req.body;

    if (!linkId || !Array.isArray(requirements)) {
      return res.status(400).json({
        success: false,
        message: "linkId and requirements array are required",
      });
    }

    const created = await requirementService.replaceRequirementsForLink(
      linkId,
      requirements
    );

    res.status(200).json({ success: true, data: created });
  }
);

// Authenticated: get requirements for a specific link
export const getLinkRequirements = asyncHandler(
  async (req: Request, res: Response) => {
    const linkId = req.params.linkId as string;
    const requirements = await requirementService.getRequirementsByLink(
      linkId,
      req.user!.userId
    );
    res.json({ success: true, data: requirements });
  }
);

// Authenticated: get all links with their requirements for the current user
export const getMyRequirements = asyncHandler(
  async (req: Request, res: Response) => {
    const links = await requirementService.getRequirementsByUserLinks(
      req.user!.userId
    );
    res.json({ success: true, data: links });
  }
);
