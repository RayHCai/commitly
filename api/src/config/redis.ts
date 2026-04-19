import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null; // stop retrying after 3 attempts
    return Math.min(times * 200, 1000);
  },
});

let redisAvailable = false;
redis.on("ready", () => { redisAvailable = true; });
redis.on("error", (err) => {
  if (redisAvailable || err.message !== (redis as any)._lastRedisErr) {
    console.error("Redis connection error:", err.message);
    (redis as any)._lastRedisErr = err.message;
  }
  redisAvailable = false;
});

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // Cache write failures are non-critical
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Cache invalidation failures are non-critical
  }
}
