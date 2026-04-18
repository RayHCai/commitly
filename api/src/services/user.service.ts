import { prisma } from "../config/prisma";

interface UpdateProfileInput {
  linkedinUrl?: string;
  resumeS3Key?: string;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      linkedinUrl: true,
      resumeS3Key: true,
    },
  });
}
