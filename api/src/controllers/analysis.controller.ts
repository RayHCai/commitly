import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as analysisService from "../services/analysis.service";

export const createAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const { payload } = req.body;
    const analysis = await analysisService.createAnalysisRequest({
      userId: req.user!.userId,
      payload,
    });
    res.status(201).json({ success: true, data: analysis });
  }
);
