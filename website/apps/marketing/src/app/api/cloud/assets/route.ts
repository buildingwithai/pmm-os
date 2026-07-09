import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { generateImage, startVideo } from "@/lib/cloud/generate";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * POST /api/cloud/assets — create + generate an asset (composer studio).
 * Body: { kind: "image"|"video", prompt?, engagementId?, parentImageId? }
 *
 * Auth: Clerk session (browser). Dev bypass mirrors the workspace pages.
 * Generation: gpt-image-2 (in-request) / Grok Imagine (async job — the
 * client polls GET /api/cloud/assets/[assetId]). Without provider keys the
 * whole flow runs in MOCK mode. Credits are NEVER charged on failure,
 * and the response says so.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // image generation runs inside the request

export async function POST(request: NextRequest) {
  const uid = await resolveUserId();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  const sql = db();
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });

  let body: { kind?: string; prompt?: string; engagementId?: string; parentImageId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const kind = body.kind === "video" ? "video" : body.kind === "image" ? "image" : null;
  if (!kind) return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  const prompt = (body.prompt || "").slice(0, 4000);
  if (kind === "image" && !prompt) return NextResponse.json({ error: "missing_prompt" }, { status: 400 });

  // video requires a source image the caller owns
  let parentImageId: string | null = null;
  let parentImageUrl: string | null = null;
  if (kind === "video") {
    if (!body.parentImageId) return NextResponse.json({ error: "missing_parent_image" }, { status: 400 });
    const [parent] = (await sql`
      SELECT id, storage_url FROM assets WHERE id = ${body.parentImageId} AND owner_id = ${uid} AND kind = 'image'
    `) as Array<{ id: string; storage_url: string | null }>;
    if (!parent) return NextResponse.json({ error: "parent_image_not_found" }, { status: 404 });
    parentImageId = parent.id;
    parentImageUrl = parent.storage_url;
  }

  // engagement scoping (optional, must be owned)
  let engagementId: string | null = null;
  if (body.engagementId) {
    const [e] = (await sql`
      SELECT id FROM engagements WHERE id = ${body.engagementId} AND owner_id = ${uid}
    `) as Array<{ id: string }>;
    if (e) engagementId = e.id;
  }

  const model = kind === "image" ? "gpt-image-2" : "grok-imagine-video";
  const [asset] = (await sql`
    INSERT INTO assets (owner_id, engagement_id, kind, prompt, model, parent_image_id, status)
    VALUES (${uid}, ${engagementId}, ${kind}, ${prompt || null}, ${model}, ${parentImageId}, 'generating')
    RETURNING id
  `) as Array<{ id: string }>;

  const hasKeys = kind === "image" ? Boolean(process.env.OPENAI_API_KEY) : Boolean(process.env.XAI_API_KEY);
  if (!hasKeys) {
    // mock completion: the full state machine runs; no credits charged
    await sql`UPDATE assets SET status = 'ready', storage_url = ${`mock://${kind}/${asset.id}`}, credits_charged = 0 WHERE id = ${asset.id}`;
    return NextResponse.json({ ok: true, assetId: asset.id, status: "ready", mock: true, creditsCharged: 0 });
  }

  if (kind === "image") {
    try {
      const { url } = await generateImage(prompt, asset.id);
      await sql`UPDATE assets SET status = 'ready', storage_url = ${url}, credits_charged = 1 WHERE id = ${asset.id}`;
      return NextResponse.json({ ok: true, assetId: asset.id, status: "ready", url, creditsCharged: 1 });
    } catch (e) {
      await sql`UPDATE assets SET status = 'failed', error = ${(e as Error).message.slice(0, 500)}, credits_charged = 0 WHERE id = ${asset.id}`;
      return NextResponse.json({ ok: false, assetId: asset.id, status: "failed", error: "generation_failed", creditsCharged: 0 }, { status: 502 });
    }
  }

  // video: async — start the provider job, the client polls GET /api/cloud/assets/[assetId]
  if (!parentImageUrl || parentImageUrl.startsWith("mock://") || parentImageUrl.startsWith("data:")) {
    await sql`UPDATE assets SET status = 'failed', error = 'source image has no hosted URL — regenerate it with storage enabled', credits_charged = 0 WHERE id = ${asset.id}`;
    return NextResponse.json({ ok: false, assetId: asset.id, status: "failed", error: "parent_image_not_hosted", creditsCharged: 0 }, { status: 400 });
  }
  try {
    const jobId = await startVideo(prompt, parentImageUrl);
    await sql`UPDATE assets SET provider_job_id = ${jobId} WHERE id = ${asset.id}`;
    return NextResponse.json({ ok: true, assetId: asset.id, status: "generating", creditsCharged: 0 });
  } catch (e) {
    await sql`UPDATE assets SET status = 'failed', error = ${(e as Error).message.slice(0, 500)}, credits_charged = 0 WHERE id = ${asset.id}`;
    return NextResponse.json({ ok: false, assetId: asset.id, status: "failed", error: "generation_failed", creditsCharged: 0 }, { status: 502 });
  }
}
