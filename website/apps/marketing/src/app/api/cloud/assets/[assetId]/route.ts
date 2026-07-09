import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { pollVideo } from "@/lib/cloud/generate";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * GET /api/cloud/assets/[assetId] — asset status; for a generating video it
 * polls the provider job and advances the row (ready → blob-stored URL,
 * credits charged on success only; failed → error, credits 0).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VIDEO_CREDITS = 10; // 6s @720p flat rate for V1 — repriced with billing

export async function GET(request: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });

  const [asset] = (await sql`
    SELECT id, kind, status, storage_url, provider_job_id, error, credits_charged
    FROM assets WHERE id = ${assetId} AND owner_id = ${uid}
  `) as Array<{ id: string; kind: string; status: string; storage_url: string | null; provider_job_id: string | null; error: string | null; credits_charged: number }>;
  if (!asset) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (asset.kind === "video" && asset.status === "generating" && asset.provider_job_id) {
    const r = await pollVideo(asset.provider_job_id, asset.id);
    if (r.status === "ready") {
      await sql`UPDATE assets SET status = 'ready', storage_url = ${r.url}, credits_charged = ${VIDEO_CREDITS} WHERE id = ${asset.id}`;
      return NextResponse.json({ ok: true, assetId: asset.id, status: "ready", url: r.url, creditsCharged: VIDEO_CREDITS });
    }
    if (r.status === "failed") {
      await sql`UPDATE assets SET status = 'failed', error = ${r.error.slice(0, 500)}, credits_charged = 0 WHERE id = ${asset.id}`;
      return NextResponse.json({ ok: false, assetId: asset.id, status: "failed", error: r.error, creditsCharged: 0 });
    }
    return NextResponse.json({ ok: true, assetId: asset.id, status: "generating" });
  }

  return NextResponse.json({
    ok: asset.status !== "failed",
    assetId: asset.id,
    status: asset.status,
    url: asset.storage_url,
    error: asset.error,
    creditsCharged: asset.credits_charged,
  });
}
