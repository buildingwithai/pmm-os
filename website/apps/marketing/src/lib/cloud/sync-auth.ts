import { createHash, timingSafeEqual } from "node:crypto";
import { db, type SyncIdentity } from "@/lib/cloud/db";

/**
 * Sync-token auth for the plugin -> cloud channel.
 *
 * Durable path: sync_devices table (token stored as sha256, never raw).
 * Bootstrap path (before the settings UI exists): PMM_OS_SYNC_TOKENS env,
 * comma-separated `token:email` pairs — same allowlist pattern as the
 * research gateway. Users are upserted on first sync either way.
 */

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function authenticateSync(authorization: string | null): Promise<SyncIdentity | null> {
  if (!authorization) return null;
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (token.length < 16 || token.length > 200) return null;
  const hash = sha256(token);

  const sql = db();
  if (sql) {
    const rows = (await sql`
      SELECT d.owner_id, u.email FROM sync_devices d
      JOIN users u ON u.id = d.owner_id
      WHERE d.token_hash = ${hash} AND d.revoked = false
    `) as Array<{ owner_id: string; email: string }>;
    if (rows.length === 1) {
      await sql`UPDATE sync_devices SET last_synced_at = now() WHERE token_hash = ${hash}`;
      return { userId: rows[0].owner_id, email: rows[0].email, deviceName: "registered" };
    }
  }

  // bootstrap allowlist: token:email pairs
  for (const pair of (process.env.PMM_OS_SYNC_TOKENS || "").split(",")) {
    const [t, email] = pair.trim().split(":");
    if (t && email && safeEqual(hash, sha256(t))) {
      // the email may already belong to a signed-up (Clerk) user — the
      // bootstrap token must resolve to THAT identity, not mint a boot_*
      // twin (users.email is unique; syncs land where the owner signs in)
      if (sql) {
        const [existing] = (await sql`SELECT id FROM users WHERE email = ${email}`) as Array<{ id: string }>;
        if (existing) return { userId: existing.id, email, deviceName: "bootstrap-token" };
      }
      const userId = `boot_${sha256(email).slice(0, 20)}`;
      if (sql) {
        await sql`INSERT INTO users (id, email) VALUES (${userId}, ${email}) ON CONFLICT (id) DO NOTHING`;
      }
      return { userId, email, deviceName: "bootstrap-token" };
    }
  }
  return null;
}
