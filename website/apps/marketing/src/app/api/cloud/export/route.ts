import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * GET /api/cloud/export?engagementId= — everything the cloud holds for one
 * engagement as a single JSON download (Settings → Data). No dark patterns:
 * the export is complete — kit versions, evidence, runs, asset records.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  const engagementId = request.nextUrl.searchParams.get("engagementId") || "";

  const [engagement] = (await sql`
    SELECT id, product_name, status, created_at, last_synced_at FROM engagements
    WHERE id = ${engagementId} AND owner_id = ${uid}
  `) as Array<Record<string, unknown>>;
  if (!engagement) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [runs, evidence, kits, assets] = await Promise.all([
    sql`SELECT label, ran_at, desks_completed, engine_calls, gaps FROM runs WHERE engagement_id = ${engagementId} ORDER BY ran_at`,
    sql`SELECT quote, claim_type, who, source, url, captured_at, screenshot_url, desk FROM evidence_records WHERE engagement_id = ${engagementId}`,
    sql`SELECT version, content, synced_from, updated_at FROM kits WHERE engagement_id = ${engagementId} ORDER BY version`,
    sql`SELECT id, kind, prompt, model, parent_image_id, storage_url, status, credits_charged, created_at FROM assets WHERE engagement_id = ${engagementId} ORDER BY created_at`,
  ]);

  const name = String(engagement.product_name || "engagement").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), engagement, runs, evidence, kits, assets }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pmm-os-${name}-export.json"`,
      "Cache-Control": "no-store",
    },
  });
}
