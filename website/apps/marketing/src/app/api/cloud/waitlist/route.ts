import { NextRequest, NextResponse } from "next/server";

/**
 * PMM OS Cloud waitlist.
 * Stores signups in Upstash Redis (same store the research gateway uses for
 * rate limiting). Without the Redis env vars it logs server-side and still
 * returns success — a misconfigured store must never eat a signup silently,
 * so the fallback also warns loudly in the logs.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function store(email: string, source: string): Promise<"redis" | "log"> {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url, token });
      await redis.hset("pmmos:cloud:waitlist", {
        [email.toLowerCase()]: JSON.stringify({ at: new Date().toISOString(), source }),
      });
      return "redis";
    } catch (err) {
      console.error("[waitlist] redis store failed, falling back to log:", err);
    }
  }
  console.warn(`[waitlist] SIGNUP (no durable store configured): ${email} source=${source}`);
  return "log";
}

// simple per-IP throttle so the form can't be scripted into a spam vector
const seen = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) || []).filter((t) => now - t < 60_000);
  hits.push(now);
  seen.set(ip, hits);
  return hits.length > 5;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }
  let body: { email?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = (body.email || "").trim();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  const backend = await store(email, (body.source || "cloud-page").slice(0, 40));
  return NextResponse.json({ ok: true, backend });
}
