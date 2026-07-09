import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * GET /api/cloud/search?q= — global full-text search across every kit's views
 * and the evidence ledger, scoped to the signed-in owner (V1 punch-list).
 *
 * ponytail: kit text is matched by walking the JSON in process, evidence by
 * ILIKE — fine to a few hundred kits; the upgrade path is a tsvector column.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const strip = (s: unknown) => String(s ?? "").replace(/<[^>]*>/g, "");

export async function GET(request: NextRequest) {
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  const q = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  if (q.length < 2) return NextResponse.json({ ok: true, results: [] });
  const needle = q.toLowerCase();

  type Result = { kind: string; label: string; detail: string; href: string };
  const results: Result[] = [];

  const kits = (await sql`
    SELECT DISTINCT ON (e.id) e.id AS engagement_id, e.product_name, k.content
    FROM engagements e JOIN kits k ON k.engagement_id = e.id
    WHERE e.owner_id = ${uid} AND e.status = 'active'
    ORDER BY e.id, k.version DESC
  `) as Array<{ engagement_id: string; product_name: string; content: { views?: Record<string, { title?: string; h1?: string; blocks?: Array<Record<string, unknown>> }> } }>;

  for (const kit of kits) {
    for (const [viewId, view] of Object.entries(kit.content.views || {})) {
      const title = strip(view.title || view.h1 || viewId);
      const hay = strip(JSON.stringify(view.blocks || [])).toLowerCase();
      if (title.toLowerCase().includes(needle) || hay.includes(needle)) {
        const at = hay.indexOf(needle);
        results.push({
          kind: "section",
          label: `${kit.product_name} · ${title}`,
          detail: at >= 0 ? "…" + hay.slice(Math.max(0, at - 40), at + 60).replace(/\\?"/g, "").trim() + "…" : "",
          href: `/app/${kit.engagement_id}?view=${encodeURIComponent(viewId)}`,
        });
      }
      if (results.length >= 20) break;
    }
    if (results.length >= 20) break;
  }

  const evidence = (await sql`
    SELECT ev.quote, ev.source, ev.who, e.product_name, e.id AS engagement_id
    FROM evidence_records ev JOIN engagements e ON e.id = ev.engagement_id
    WHERE e.owner_id = ${uid} AND ev.quote ILIKE ${"%" + q + "%"}
    LIMIT 10
  `) as Array<{ quote: string; source: string | null; who: string | null; product_name: string; engagement_id: string }>;
  for (const ev of evidence) {
    results.push({
      kind: "evidence",
      label: `${ev.product_name} · ${ev.who || ev.source || "evidence"}`,
      detail: "“" + strip(ev.quote).slice(0, 110) + "”",
      href: `/app/${ev.engagement_id}?view=__runs`,
    });
  }

  return NextResponse.json({ ok: true, results: results.slice(0, 25) });
}
