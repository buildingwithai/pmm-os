import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * Sync devices/tokens (Settings → Connections). Replaces the
 * PMM_OS_SYNC_TOKENS bootstrap: tokens are minted here, shown ONCE, stored
 * as sha256 — the same hash sync-auth checks.
 *
 * GET               → list devices (never the token)
 * POST {name}       → create device, returns the raw token exactly once
 * POST {revoke:id}  → revoke
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  const devices = (await sql`
    SELECT id, device_name, last_synced_at, revoked, created_at
    FROM sync_devices WHERE owner_id = ${uid} ORDER BY created_at DESC LIMIT 50
  `) as Array<Record<string, unknown>>;
  return NextResponse.json({ ok: true, devices });
}

export async function POST(request: NextRequest) {
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  let body: { name?: string; revoke?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (body.revoke) {
    await sql`UPDATE sync_devices SET revoked = true WHERE id = ${body.revoke} AND owner_id = ${uid}`;
    return NextResponse.json({ ok: true, revoked: true });
  }
  const name = (body.name || "").trim().slice(0, 80) || "My machine";
  const token = "pmm_" + randomBytes(24).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  await sql`INSERT INTO users (id, email) VALUES (${uid}, '') ON CONFLICT (id) DO NOTHING`;
  const [device] = (await sql`
    INSERT INTO sync_devices (owner_id, token_hash, device_name) VALUES (${uid}, ${hash}, ${name})
    RETURNING id
  `) as Array<{ id: string }>;
  // the raw token appears in this response and never again
  return NextResponse.json({ ok: true, deviceId: device.id, token });
}
