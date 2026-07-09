import { timingSafeEqual, createHash } from "node:crypto";

/**
 * PMM OS research-gateway token validation.
 *
 * Callers (the plugin, running on a member's machine) present a PMM OS token as
 * `Authorization: Bearer <token>`. That token is the MEMBER's credential — it is
 * fine for it to live on their machine. What must NEVER reach a client is the
 * upstream provider key (OPENAI_API_KEY), which stays in server env only.
 *
 * Token store, current milestone: a server-side allowlist in `PMM_OS_GATEWAY_TOKENS`
 * (comma-separated). This is the single seam to swap for a Clerk/Neon member lookup —
 * keep `validateToken` async so that swap is a drop-in.
 *
 * ponytail: allowlist-in-env is the beta ceiling. Upgrade path = look the token's
 * SHA-256 up in a members table (id, tier, active, monthly_quota) so tokens can be
 * issued/revoked per member without a redeploy. The hashing + constant-time compare
 * below already assume you never store raw tokens once that lands.
 */

export type TokenIdentity = {
  ok: boolean;
  /** Stable, non-secret id for rate-limit keying + logging (never the raw token). */
  subject: string;
  tier: "free" | "pro";
};

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/** Constant-time compare of two equal-length-agnostic strings via their hashes. */
function safeEqualHashes(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function validateToken(raw: string | null): Promise<TokenIdentity> {
  const miss: TokenIdentity = { ok: false, subject: "anon", tier: "free" };
  if (!raw) return miss;
  const token = raw.replace(/^Bearer\s+/i, "").trim();
  if (!token || token.length < 16 || token.length > 200) return miss;

  const allow = (process.env.PMM_OS_GATEWAY_TOKENS || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (allow.length === 0) return miss;

  const presented = sha256(token);
  for (const candidate of allow) {
    if (safeEqualHashes(presented, sha256(candidate))) {
      // Subject is a short, non-reversible fingerprint — safe to log and to key
      // the rate limiter on, never the raw token.
      return { ok: true, subject: presented.slice(0, 16), tier: "pro" };
    }
  }
  return miss;
}
