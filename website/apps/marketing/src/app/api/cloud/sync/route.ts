import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { authenticateSync } from "@/lib/cloud/sync-auth";

/**
 * POST /api/cloud/sync — the plugin pushes one engagement's current state.
 *
 * Body (all optional except product):
 * {
 *   product: string,
 *   run?: { label, ranAt, desksCompleted?, engineCalls?, gaps?: [] },
 *   evidence?: [{ quote, claimType?, who?, source?, url?, capturedAt?, desk?, screenshotUrl? }],
 *   kitContent?: object   // the kit-content.json — versioned on change
 * }
 *
 * Design: idempotent upserts; evidence is appended per run (re-sync of the same
 * run label replaces that run's evidence, not the engagement's whole ledger).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY = 15_000_000; // a kit + evidence is ~1MB; 15MB is the abuse ceiling

export async function POST(request: NextRequest) {
  const identity = await authenticateSync(request.headers.get("authorization"));
  if (!identity) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  const sql = db();
  if (!sql) {
    return NextResponse.json(
      { error: "cloud_not_configured", fix: "set DATABASE_URL in the server environment" },
      { status: 503 },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  let body: {
    product?: string;
    run?: { label?: string; ranAt?: string; desksCompleted?: number; engineCalls?: number; gaps?: unknown[] };
    evidence?: Array<Record<string, unknown>>;
    kitContent?: Record<string, unknown>;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const product = (body.product || "").trim().slice(0, 120);
  if (!product) return NextResponse.json({ error: "missing_product" }, { status: 400 });

  // engagement upsert
  const [engagement] = (await sql`
    INSERT INTO engagements (owner_id, product_name, last_synced_at)
    VALUES (${identity.userId}, ${product}, now())
    ON CONFLICT (owner_id, product_name)
    DO UPDATE SET last_synced_at = now(), status = 'active'
    RETURNING id
  `) as Array<{ id: string }>;

  let runId: string | null = null;
  let evidenceCount = 0;
  if (body.run?.label) {
    const label = String(body.run.label).slice(0, 200);
    const ranAt = body.run.ranAt ? new Date(body.run.ranAt) : new Date();
    // replace-on-relabel: same run label re-synced = refreshed, not duplicated.
    // evidence FK is ON DELETE SET NULL, so the old run's ledger must go explicitly
    // or every re-sync would duplicate it as orphaned rows.
    await sql`DELETE FROM evidence_records WHERE run_id IN
      (SELECT id FROM runs WHERE engagement_id = ${engagement.id} AND label = ${label})`;
    await sql`DELETE FROM runs WHERE engagement_id = ${engagement.id} AND label = ${label}`;
    const [run] = (await sql`
      INSERT INTO runs (engagement_id, label, ran_at, desks_completed, engine_calls, gaps)
      VALUES (${engagement.id}, ${label}, ${ranAt.toISOString()},
              ${Number(body.run.desksCompleted) || 0}, ${Number(body.run.engineCalls) || null},
              ${JSON.stringify(body.run.gaps || [])})
      RETURNING id
    `) as Array<{ id: string }>;
    runId = run.id;

    for (const e of (body.evidence || []).slice(0, 2000)) {
      const quote = String(e.quote || "").slice(0, 4000);
      if (!quote) continue;
      const claim = ["fact", "estimate", "assumption"].includes(String(e.claimType)) ? String(e.claimType) : null;
      await sql`
        INSERT INTO evidence_records (engagement_id, run_id, quote, claim_type, who, source, url, captured_at, screenshot_url, desk)
        VALUES (${engagement.id}, ${runId}, ${quote}, ${claim},
                ${e.who ? String(e.who).slice(0, 300) : null}, ${e.source ? String(e.source).slice(0, 100) : null},
                ${e.url ? String(e.url).slice(0, 2000) : null}, ${e.capturedAt ? String(e.capturedAt) : null},
                ${e.screenshotUrl ? String(e.screenshotUrl).slice(0, 2000) : null}, ${e.desk ? String(e.desk).slice(0, 60) : null})
      `;
      evidenceCount++;
    }
  }

  let kitVersion: number | null = null;
  if (body.kitContent && typeof body.kitContent === "object") {
    const content = JSON.stringify(body.kitContent);
    // canonical hash (sorted keys) — jsonb normalizes key order, so string
    // comparison against a round-tripped value can never be trusted
    const canonical = (v: unknown): string => {
      if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
      if (v && typeof v === "object") {
        return "{" + Object.keys(v as object).sort().map(
          (k) => JSON.stringify(k) + ":" + canonical((v as Record<string, unknown>)[k]),
        ).join(",") + "}";
      }
      return JSON.stringify(v);
    };
    const hash = createHash("sha256").update(canonical(body.kitContent)).digest("hex");
    const [latest] = (await sql`
      SELECT id, version, content_hash FROM kits WHERE engagement_id = ${engagement.id}
      ORDER BY version DESC LIMIT 1
    `) as Array<{ id: string; version: number; content_hash: string | null }>;
    if (!latest || latest.content_hash !== hash) {
      const next = (latest?.version || 0) + 1;
      await sql`
        INSERT INTO kits (engagement_id, content, version, synced_from, content_hash)
        VALUES (${engagement.id}, ${content}::jsonb, ${next}, ${identity.deviceName}, ${hash})
      `;
      kitVersion = next;
    } else {
      kitVersion = latest.version;
    }
  }

  return NextResponse.json({
    ok: true,
    engagementId: engagement.id,
    runId,
    evidenceStored: evidenceCount,
    kitVersion,
  });
}
