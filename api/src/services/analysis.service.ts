import { prisma } from "../config/prisma";

interface CreateAnalysisInput {
  userId: string;
  payload?: any;
}

export async function createAnalysisRequest(data: CreateAnalysisInput) {
  return prisma.analysisRequest.create({
    data: {
      userId: data.userId,
      payload: data.payload || {},
      status: "PENDING",
    },
  });
}
