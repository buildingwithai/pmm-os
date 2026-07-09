import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * Share links for a kit (V1: view role only).
 * POST { engagementId }            → create (or return existing live) link
 * POST { engagementId, revoke:id } → revoke
 * GET  ?engagementId=              → list live links
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Sql = NonNullable<ReturnType<typeof db>>;
async function owned(sql: Sql, engagementId: string, uid: string): Promise<boolean> {
  const rows = (await sql`SELECT 1 FROM engagements WHERE id = ${engagementId} AND owner_id = ${uid}`) as unknown[];
  return rows.length === 1;
}

export async function GET(request: NextRequest) {
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  const engagementId = request.nextUrl.searchParams.get("engagementId") || "";
  if (!(await owned(sql, engagementId, uid))) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const links = (await sql`
    SELECT id, token, role, created_at FROM share_links
    WHERE engagement_id = ${engagementId} AND revoked = false ORDER BY created_at DESC
  `) as Array<Record<string, unknown>>;
  return NextResponse.json({ ok: true, links });
}

export async function POST(request: NextRequest) {
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  let body: { engagementId?: string; revoke?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.engagementId || !(await owned(sql, body.engagementId, uid))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (body.revoke) {
    await sql`UPDATE share_links SET revoked = true WHERE id = ${body.revoke} AND engagement_id = ${body.engagementId}`;
    return NextResponse.json({ ok: true, revoked: true });
  }
  const [existing] = (await sql`
    SELECT token FROM share_links WHERE engagement_id = ${body.engagementId} AND revoked = false LIMIT 1
  `) as Array<{ token: string }>;
  const token = existing?.token || randomBytes(18).toString("base64url");
  if (!existing) {
    await sql`INSERT INTO share_links (engagement_id, token) VALUES (${body.engagementId}, ${token})`;
  }
  return NextResponse.json({ ok: true, token, url: `/share/${token}` });
}
