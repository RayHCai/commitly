import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { fetchWithRetry } from "../utils/fetchWithRetry";
import { env } from "../config/env";
import * as linkService from "../services/link.service";
import { prisma } from "../config/prisma";

export const getShellLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const links = await linkService.getShellLinks(req.user!.userId);
    res.json({ success: true, data: links });
  }
);

export const createLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, message: "url is required" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ success: false, message: "url must be a valid URL" });
    }

    const link = await linkService.createPendingLink({
      userId: req.user!.userId,
      jobUrl: url,
    });

    fetchWithRetry(`${env.WORKER_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: req.user!.userId,
        url,
        link_id: link.id,
      }),
    }).catch((err) => {
      console.error("Failed to dispatch to worker after retries:", err);
      linkService.failLink(link.id, "Failed to reach worker service").catch(console.error);
    });

    res.status(202).json({
      success: true,
      data: {
        id: link.id,
        status: "PENDING",
        jobUrl: url,
      },
    });
  }
);

export const completeLink = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const {
      company,
      job_title,
      position_id,
      error,
    } = req.body;

    if (error) {
      const link = await linkService.failLink(id, error);
      return res.json({ success: true, data: link });
    }

    if (!company || !job_title) {
      return res.status(400).json({
        success: false,
        message: "company and job_title are required",
      });
    }

    const link = await linkService.completeLink(id, {
      company,
      jobTitle: job_title,
      positionId: position_id || null,
    });

    const user = await prisma.user.findUnique({
      where: { id: link.userId },
      select: { username: true },
    });

    res.json({
      success: true,
      data: {
        ...link,
        publicUrl: `${env.FRONTEND_URL}/${user!.username}/${link.slug}`,
      },
    });
  }
);
