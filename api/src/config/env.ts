import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  SERVICE_TOKEN: z.string(),
  FRONTEND_URL: z.string().url(),
  WORKER_URL: z.string().url().transform((url) => url.replace(/\/$/, "")),
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

export const env = envSchema.parse(process.env);
