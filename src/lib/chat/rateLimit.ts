import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitResult = { ok: true } | { ok: false; retryAfter: number } | { ok: false; unavailable: true };

// Redis.fromEnv reads UPSTASH_REDIS_REST_* and falls back to the KV_REST_API_* names the Vercel integration injects.
const hasUpstash = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN),
);

function createLimiters() {
  const redis = Redis.fromEnv();
  return {
    burst: new Ratelimit({ redis, prefix: "portfolio-chat:burst", limiter: Ratelimit.slidingWindow(15, "10 m") }),
    daily: new Ratelimit({ redis, prefix: "portfolio-chat:daily", limiter: Ratelimit.slidingWindow(50, "1 d") }),
    global: new Ratelimit({ redis, prefix: "portfolio-chat:global", limiter: Ratelimit.fixedWindow(1000, "1 d") }),
  };
}

const limiters = hasUpstash ? createLimiters() : undefined;

/** The caller's IP as reported by Vercel's proxy. */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Per-IP limits (15 per 10 minutes, 50 per day) plus a global daily cap.
 * Without Upstash configured the limiter is skipped locally and fails closed in production.
 */
export async function checkRateLimit(ip: string): Promise<LimitResult> {
  if (!limiters) {
    return process.env.VERCEL_ENV === "production" ? { ok: false, unavailable: true } : { ok: true };
  }

  const results = await Promise.all([limiters.burst.limit(ip), limiters.daily.limit(ip), limiters.global.limit("all")]);
  const blocked = results.filter((result) => !result.success);
  if (blocked.length === 0) return { ok: true };

  const reset = Math.max(...blocked.map((result) => result.reset));
  return { ok: false, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}
