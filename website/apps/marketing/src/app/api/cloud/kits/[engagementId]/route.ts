import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cloud/db";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * The cloud kit editing channel — the port of kit-server's save contract.
 *
 * POST body is exactly ONE of:
 *   { edits: [{ path, value }] }        — modeless text edits (per-path, like api/save)
 *   { full: <kit-content> }             — structural save (like api/save-full)
 *   { comments: [...] }                 — anchored comments incl. resolved flag (like api/comments)
 *   { generate: { view, index?, blockId?, instruction, mode, clean? } } — queue + placeholder
 *   { restore: <version number> }       — version history restore (new version, old content)
 *
 * Every content-changing write lands as a NEW kits row (version+1) with
 * kit_block_history rows per touched path — cloud edits are versioned, sync
 * reconciliation keeps both sides in history (spec v5). Comments update the
 * latest row in place: review chatter must not spam the version timeline.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Kit = { id: string; version: number; content: Record<string, unknown> };
type Sql = NonNullable<ReturnType<typeof db>>;

// only block-level paths inside a view are editable — rejects __proto__ games
// and keeps sidebar/meta/data server-authored
const PATH_RE = /^views\.[A-Za-z0-9_-]+\.blocks\.\d+(\.[A-Za-z0-9_]+|\.\d+)*$/;

function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const segs = path.split(".");
  let cur: unknown = obj;
  for (let i = 0; i < segs.length - 1; i++) {
    if (cur == null || typeof cur !== "object" || !(segs[i] in (cur as object))) throw new Error("bad path: " + path);
    cur = (cur as Record<string, unknown>)[segs[i]];
  }
  const last = segs[segs.length - 1];
  if (cur == null || typeof cur !== "object" || !(last in (cur as object))) throw new Error("bad path: " + path);
  (cur as Record<string, unknown>)[last] = value;
}
function getPath(obj: Record<string, unknown>, path: string): unknown {
  let cur: unknown = obj;
  for (const s of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[s];
  }
  return cur;
}

function canonical(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v as object).sort().map(
      (k) => JSON.stringify(k) + ":" + canonical((v as Record<string, unknown>)[k]),
    ).join(",") + "}";
  }
  return JSON.stringify(v);
}

async function ownedLatestKit(sql: Sql, engagementId: string, uid: string): Promise<Kit | null> {
  const rows = (await sql`
    SELECT k.id, k.version, k.content FROM kits k
    JOIN engagements e ON e.id = k.engagement_id
    WHERE k.engagement_id = ${engagementId} AND e.owner_id = ${uid}
    ORDER BY k.version DESC LIMIT 1
  `) as Kit[];
  return rows[0] || null;
}

async function writeVersion(
  sql: Sql, engagementId: string, uid: string, content: Record<string, unknown>, prevVersion: number, origin: string,
  history: Array<{ path: string; prev: unknown; next: unknown }>,
): Promise<number> {
  const hash = createHash("sha256").update(canonical(content)).digest("hex");
  const next = prevVersion + 1;
  // one atomic transaction: the version row and its history rows land together
  // or not at all. Neon's HTTP driver batches (no interactive tx), so the kit
  // id is generated here instead of via RETURNING.
  const kitId = crypto.randomUUID();
  await sql.transaction([
    sql`INSERT INTO users (id, email) VALUES (${uid}, ${uid + "@placeholder.invalid"}) ON CONFLICT (id) DO NOTHING`,
    sql`
      INSERT INTO kits (id, engagement_id, content, version, synced_from, content_hash)
      VALUES (${kitId}, ${engagementId}, ${JSON.stringify(content)}::jsonb, ${next}, ${origin}, ${hash})
    `,
    // schema check allows origin 'cloud'|'sync' only — the descriptive label
    // (cloud-edit / cloud-structural / restore-vN) lives in kits.synced_from
    ...history.slice(0, 200).map((h) => sql`
      INSERT INTO kit_block_history (kit_id, block_path, prev_value, new_value, edited_by, origin)
      VALUES (${kitId}, ${h.path}, ${JSON.stringify(h.prev ?? null)}::jsonb, ${JSON.stringify(h.next ?? null)}::jsonb, ${uid}, 'cloud')
    `),
  ]);
  return next;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ engagementId: string }> }) {
  const { engagementId } = await params;
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  const versions = (await sql`
    SELECT k.version, k.synced_from, k.updated_at,
      (SELECT count(*) FROM kit_block_history h WHERE h.kit_id = k.id) AS edits
    FROM kits k JOIN engagements e ON e.id = k.engagement_id
    WHERE k.engagement_id = ${engagementId} AND e.owner_id = ${uid}
    ORDER BY k.version DESC LIMIT 100
  `) as Array<Record<string, unknown>>;
  const history = (await sql`
    SELECT h.block_path, h.origin, h.edited_at, k.version
    FROM kit_block_history h
    JOIN kits k ON k.id = h.kit_id
    JOIN engagements e ON e.id = k.engagement_id
    WHERE k.engagement_id = ${engagementId} AND e.owner_id = ${uid}
    ORDER BY h.edited_at DESC LIMIT 80
  `) as Array<Record<string, unknown>>;
  return NextResponse.json({ ok: true, versions, history });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ engagementId: string }> }) {
  const { engagementId } = await params;
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });

  const raw = await request.text();
  if (raw.length > 5_000_000) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  let body: {
    edits?: Array<{ path?: string; value?: string }>;
    full?: Record<string, unknown>;
    comments?: unknown[];
    generate?: { view?: string; index?: number; blockId?: string; instruction?: string; mode?: string; clean?: { path?: string; value?: string } };
    restore?: number;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const kit = await ownedLatestKit(sql, engagementId, uid);
  if (!kit) return NextResponse.json({ error: "kit_not_found" }, { status: 404 });
  const content = kit.content;

  // ── per-path text edits ──
  if (Array.isArray(body.edits)) {
    const history: Array<{ path: string; prev: unknown; next: unknown }> = [];
    try {
      for (const e of body.edits.slice(0, 50)) {
        if (typeof e.path !== "string" || typeof e.value !== "string" || !PATH_RE.test(e.path)) throw new Error("bad edit");
        const prev = getPath(content, e.path);
        if (prev === e.value) continue;
        setPath(content, e.path, e.value);
        history.push({ path: e.path, prev, next: e.value });
      }
    } catch (err) {
      return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
    }
    if (history.length === 0) return NextResponse.json({ ok: true, version: kit.version, applied: 0 });
    const version = await writeVersion(sql, engagementId, uid, content, kit.version, "cloud-edit", history);
    return NextResponse.json({ ok: true, version, applied: history.length });
  }

  // ── structural full save ──
  if (body.full && typeof body.full === "object") {
    if (!body.full.views || !body.full.sidebar) return NextResponse.json({ error: "not_a_kit_document" }, { status: 400 });
    if (canonical(body.full) === canonical(content)) return NextResponse.json({ ok: true, version: kit.version, applied: 0 });
    const version = await writeVersion(sql, engagementId, uid, body.full, kit.version, "cloud-structural",
      [{ path: "__full", prev: null, next: null }]);
    return NextResponse.json({ ok: true, version });
  }

  // ── comments: update latest row in place (no version spam) ──
  if (Array.isArray(body.comments)) {
    await sql`
      UPDATE kits SET content = jsonb_set(content, '{comments}', ${JSON.stringify(body.comments.slice(0, 500))}::jsonb, true)
      WHERE id = ${kit.id}
    `;
    return NextResponse.json({ ok: true, count: body.comments.length });
  }

  // ── generation queue (the /regenerate-from-evidence contract) ──
  if (body.generate && typeof body.generate === "object") {
    const g = body.generate;
    if (typeof g.view !== "string" || !g.instruction?.trim() || !(content.views as Record<string, unknown>)?.[g.view]) {
      return NextResponse.json({ error: "need_view_and_instruction" }, { status: 400 });
    }
    const mode = g.mode === "regenerate" ? "regenerate" : "generate";
    const [q] = (await sql`
      INSERT INTO generation_queue (engagement_id, view, block_index, block_id, instruction, mode)
      VALUES (${engagementId}, ${g.view}, ${Number.isInteger(g.index) ? g.index : null},
              ${g.blockId || null}, ${g.instruction.trim().slice(0, 2000)}, ${mode})
      RETURNING id
    `) as Array<{ id: string }>;
    if (mode === "generate") {
      // fold the slash-text cleanup into the same versioned write (one write, no race)
      if (g.clean && typeof g.clean.path === "string" && typeof g.clean.value === "string" && PATH_RE.test(g.clean.path)) {
        try { setPath(content, g.clean.path, g.clean.value); } catch { /* stale path — placeholder still lands */ }
      }
      const view = (content.views as Record<string, { blocks?: unknown[] }>)[g.view];
      const blocks = view.blocks || (view.blocks = []);
      const ph = {
        type: "callout", genId: q.id,
        callout: "<b>Queued for generation.</b> “" + g.instruction.trim().slice(0, 200).replace(/</g, "&lt;")
          + "” — on the next plugin sync, say “process the generation queue” and this block is written from the evidence.",
      };
      const at = Number.isInteger(g.index) && (g.index as number) >= 0 && (g.index as number) <= blocks.length ? (g.index as number) : blocks.length;
      blocks.splice(at, 0, ph);
      const version = await writeVersion(sql, engagementId, uid, content, kit.version, "cloud-generate",
        [{ path: `views.${g.view}.blocks.${at}`, prev: null, next: ph }]);
      const [{ count }] = (await sql`SELECT count(*)::int AS count FROM generation_queue WHERE engagement_id = ${engagementId} AND status = 'queued'`) as Array<{ count: number }>;
      return NextResponse.json({ ok: true, id: q.id, queued: count, version });
    }
    const [{ count }] = (await sql`SELECT count(*)::int AS count FROM generation_queue WHERE engagement_id = ${engagementId} AND status = 'queued'`) as Array<{ count: number }>;
    return NextResponse.json({ ok: true, id: q.id, queued: count });
  }

  // ── restore a prior version ──
  if (Number.isInteger(body.restore)) {
    const [old] = (await sql`
      SELECT k.content FROM kits k JOIN engagements e ON e.id = k.engagement_id
      WHERE k.engagement_id = ${engagementId} AND e.owner_id = ${uid} AND k.version = ${body.restore}
    `) as Array<{ content: Record<string, unknown> }>;
    if (!old) return NextResponse.json({ error: "version_not_found" }, { status: 404 });
    const version = await writeVersion(sql, engagementId, uid, old.content, kit.version, `restore-v${body.restore}`,
      [{ path: "__restore", prev: kit.version, next: body.restore }]);
    return NextResponse.json({ ok: true, version });
  }

  return NextResponse.json({ error: "unknown_operation" }, { status: 400 });
}
