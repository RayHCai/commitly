import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3.js";
import { env } from "../config/env.js";

export async function generatePresignedDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: "attachment",
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

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

export async function getS3Object(s3Key: string) {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
  });
  const response = await s3Client.send(command);
  return {
    body: response.Body,
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: response.ContentLength,
  };
}
