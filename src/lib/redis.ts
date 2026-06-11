import { Redis } from "@upstash/redis";

// Check if environment variables are available. 
// If they aren't (e.g., during local dev without .env), we'll gracefully fallback or throw.
export const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null;
