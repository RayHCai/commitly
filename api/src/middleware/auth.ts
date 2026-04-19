import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

async function authenticateServiceToken(req: Request) {
  const serviceToken = req.headers["x-service-token"] as string | undefined;
  if (!serviceToken) return false;

  if (serviceToken !== env.SERVICE_TOKEN) {
    throw new ApiError(401, "Invalid service token");
  }

  const userId =
    (req.query.userId as string) || (req.body && req.body.userId);
  if (!userId) {
    throw new ApiError(400, "userId is required with service token auth");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  req.user = { userId: user.id, username: user.username };
  return true;
}

// Accepts either JWT or service token
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Mode 1: JWT (frontend)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        username: string;
      };
      req.user = decoded;
      return next();
    }

    // Mode 2: Service token (service-to-service)
    if (await authenticateServiceToken(req)) {
      return next();
    }

    throw new ApiError(401, "Missing authorization");
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

// Service token only — rejects JWT
export const serviceOnly = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (await authenticateServiceToken(req)) {
      return next();
    }
    throw new ApiError(401, "Service token required");
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(new ApiError(401, "Invalid service token"));
  }
};
