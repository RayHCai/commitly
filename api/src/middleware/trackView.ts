import { Request } from "express";
import { prisma } from "../config/prisma";

export const trackView = (customLinkId: string, req: Request) => {
  prisma.linkView
    .create({
      data: {
        customLinkId,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
        referrer:
          (req.headers.referer as string) ||
          (req.headers.referrer as string) ||
          null,
      },
    })
    .catch((err) => {
      console.error("Failed to track view:", err);
    });
};
