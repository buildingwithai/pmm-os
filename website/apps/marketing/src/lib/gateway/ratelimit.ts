/**
 * Per-token rate limiting for the research gateway.
 *
 * Production: Upstash Redis sliding-window (connectionless REST — the serverless
 * standard; "Vercel KV" is Upstash Redis under the hood). Enforced across all
 * ephemeral function instances.
 *
 * Local/dev or misconfigured: falls back to an in-memory limiter so the route is
 * never fully unprotected during development.
 *
 * ponytail: the in-memory fallback is PER-INSTANCE (a serverless deploy runs many),
 * so it's best-effort only — real production protection REQUIRES the Upstash env
 * vars below. The route logs a one-time warning when it falls back so a
 * misconfigured prod deploy is loud, not silent.
 */

export type RateVerdict = {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms when the window resets
  backend: "redis" | "memory";
};

const PER_MINUTE = Number(process.env.PMM_OS_RATE_PER_MIN || "60");
const WINDOW_MS = 60_000;

// --- in-memory fallback (single instance, best-effort) ---
const memBuckets = new Map<string, number[]>();
function memoryLimit(key: string): RateVerdict {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (memBuckets.get(key) || []).filter((t) => t > cutoff);
  hits.push(now);
  memBuckets.set(key, hits);
  // opportunistic cleanup so the map can't grow unbounded
  if (memBuckets.size > 5000) {
    for (const [k, v] of memBuckets) {
      if (v.every((t) => t <= cutoff)) memBuckets.delete(k);
    }
  }
  const remaining = Math.max(0, PER_MINUTE - hits.length);
  return {
    ok: hits.length <= PER_MINUTE,
    limit: PER_MINUTE,
    remaining,
    reset: now + WINDOW_MS,
    backend: "memory",
  };
}

// --- Upstash Redis (lazy: only loaded when configured, so the package being
//     absent or the env being unset both degrade to memory instead of crashing) ---
let redisLimiter: { limit: (key: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> } | null =
  null;
let redisTried = false;
let warnedFallback = false;

function redisEnv(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function getRedisLimiter() {
  if (redisTried) return redisLimiter;
  redisTried = true;
  const env = redisEnv();
  if (!env) return null;
  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);
    const redis = new Redis({ url: env.url, token: env.token });
    redisLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(PER_MINUTE, "60 s"),
      prefix: "pmmos:rerank",
      analytics: false,
    });
  } catch {
    redisLimiter = null; // package missing → memory fallback
  }
  return redisLimiter;
}

export async function checkRateLimit(subject: string): Promise<RateVerdict> {
  const limiter = await getRedisLimiter();
  if (limiter) {
    const r = await limiter.limit(subject);
    return { ok: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset, backend: "redis" };
  }
  if (!warnedFallback && process.env.NODE_ENV === "production") {
    warnedFallback = true;
    console.warn(
      "[research-gateway] rate limiting is running IN-MEMORY (per-instance, not durable). Set UPSTASH_REDIS_REST_URL/TOKEN for real protection.",
    );
  }
  return memoryLimit(subject);
}
