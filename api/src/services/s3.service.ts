import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3";
import { env } from "../config/env";

export async function generatePresignedUploadUrl(
  userId: string,
  fileName: string,
  contentType: string
) {
  const fileExtension = fileName.split(".").pop();
  const s3Key = `resumes/${userId}/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, s3Key };
}
