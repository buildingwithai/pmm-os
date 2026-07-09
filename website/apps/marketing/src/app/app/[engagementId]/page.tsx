import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/cloud/db";
import { KIT_CSS } from "@/lib/cloud/kit/kit-style";
import { editorMeta, firstViewId, renderView, type KitContent } from "@/lib/cloud/kit/render";
import { resolveUserId } from "@/lib/cloud/workspace-auth";
import { WorkspacePalette } from "../workspace-palette";
import { KitEditor } from "./kit-editor";
import { ShareButton } from "./share-button";

export const metadata: Metadata = { title: "Workspace — PMM OS Cloud", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * The product workspace (spec v5): the rail is the kit's own sidebar, the
 * middle pane is the LIVE EDITOR over the vendored block registry — the same
 * editing surface the local kit ships, hosted. Cloud rows: Assets, Runs &
 * sync, History. ⌘K jumps anywhere; Share mints a read-only link.
 */
const CLOUD_VIEWS = new Set(["__assets", "__runs", "__history"]);

const fmtDate = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export default async function EngagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ engagementId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { engagementId } = await params;
  const { view: viewParam } = await searchParams;
  const sql = db();
  const userId = await resolveUserId();

  if (!sql || !userId) {
    return (
      <main className="cw-empty">
        <h1>The workspace is being wired</h1>
        <p><Link href="/cloud">Join the waitlist</Link> to be first in.</p>
      </main>
    );
  }

  const rows = (await sql`
    SELECT e.product_name, k.content, k.version
    FROM engagements e
    JOIN kits k ON k.engagement_id = e.id
    WHERE e.id = ${engagementId} AND e.owner_id = ${userId}
    ORDER BY k.version DESC LIMIT 1
  `) as Array<{ product_name: string; content: KitContent; version: number }>;
  if (rows.length === 0) notFound();
  const { product_name, content: kit, version } = rows[0];

  const cloudView = viewParam && CLOUD_VIEWS.has(viewParam) ? viewParam : null;
  const viewId = !cloudView && viewParam && kit.views?.[viewParam] ? viewParam : firstViewId(kit);
  const rendered = !cloudView && viewId
    ? renderView(kit, viewId, (id) => `/app/${engagementId}?view=${encodeURIComponent(id)}`)
    : null;

  const viewList = (kit.sidebar || []).flatMap((g) => g.items.map(([, label, id]) => ({ id, label })));
  const paletteItems = viewList.map((v) => ({
    kind: "section", label: `${product_name} · ${v.label}`, href: `/app/${engagementId}?view=${encodeURIComponent(v.id)}`,
  }));
  const meta = editorMeta();

  const [{ asset_count }] = (await sql`
    SELECT count(*)::int AS asset_count FROM assets WHERE engagement_id = ${engagementId}
  `) as Array<{ asset_count: number }>;
  const [{ run_count }] = (await sql`
    SELECT count(*)::int AS run_count FROM runs WHERE engagement_id = ${engagementId}
  `) as Array<{ run_count: number }>;

  return (
    <main className="cw-shell">
      <style dangerouslySetInnerHTML={{ __html: KIT_CSS }} />
      <aside className="cw-rail" aria-label={`${product_name} sections`}>
        <Link className="cw-item" href="/app">
          <strong>← All products</strong>
        </Link>
        <span className="cw-label">{product_name} · kit v{version}</span>
        {(kit.sidebar || []).map((group) => (
          <div key={group.group}>
            <span className="cw-label">{group.group}</span>
            {group.items.map(([num, label, id]) => (
              <Link
                aria-current={id === viewId && !cloudView ? "page" : undefined}
                className={`cw-item ${id === viewId && !cloudView ? "is-on" : ""}`}
                href={`/app/${engagementId}?view=${encodeURIComponent(id)}`}
                key={id}
              >
                <strong>
                  <span className="cw-num">{num}</span> {label}
                </strong>
              </Link>
            ))}
          </div>
        ))}
        <span className="cw-label">Cloud</span>
        <Link className={`cw-item ${cloudView === "__assets" ? "is-on" : ""}`} href={`/app/${engagementId}?view=__assets`}>
          <strong>▦ Assets</strong><small>{asset_count}</small>
        </Link>
        <Link className={`cw-item ${cloudView === "__runs" ? "is-on" : ""}`} href={`/app/${engagementId}?view=__runs`}>
          <strong>↻ Runs &amp; sync</strong><small>{run_count}</small>
        </Link>
        <Link className={`cw-item ${cloudView === "__history" ? "is-on" : ""}`} href={`/app/${engagementId}?view=__history`}>
          <strong>⧗ History</strong><small>v{version}</small>
        </Link>
        <div className="cw-railfoot">
          <ShareButton engagementId={engagementId} />
        </div>
      </aside>
      <section className="cwk-view">
        <WorkspacePalette local={paletteItems} />
        {cloudView === "__assets" ? (
          <AssetsView engagementId={engagementId} productName={product_name} sql={sql} />
        ) : cloudView === "__runs" ? (
          <RunsView engagementId={engagementId} productName={product_name} sql={sql} />
        ) : cloudView === "__history" ? (
          <HistoryView engagementId={engagementId} productName={product_name} sql={sql} version={version} />
        ) : rendered ? (
          <>
            <div className="cwk-head" dangerouslySetInnerHTML={{ __html: rendered.head }} />
            <div className="cwk-blocks" dangerouslySetInnerHTML={{ __html: rendered.bodyHtml }} />
            <KitEditor
              content={kit as never}
              engagementId={engagementId}
              key={`${viewId}-v${version}`}
              menu={meta.menu as never}
              transform={meta.transform}
              viewId={viewId!}
              viewList={viewList}
            />
          </>
        ) : (
          <div className="cw-empty" style={{ minHeight: "auto" }}>
            <h1>This kit has no views yet</h1>
            <p>Re-sync from the plugin to populate it.</p>
          </div>
        )}
      </section>
    </main>
  );
}

type Sql = NonNullable<ReturnType<typeof db>>;

async function AssetsView({ engagementId, productName, sql }: { engagementId: string; productName: string; sql: Sql }) {
  const assets = (await sql`
    SELECT id, kind, prompt, status, storage_url, parent_image_id, created_at, error
    FROM assets WHERE engagement_id = ${engagementId} ORDER BY created_at DESC LIMIT 120
  `) as Array<{ id: string; kind: string; prompt: string | null; status: string; storage_url: string | null; parent_image_id: string | null; created_at: string; error: string | null }>;
  return (
    <>
      <div className="cwk-head">
        <span className="eyebrow">Cloud · Assets</span>
        <h1>{productName} assets</h1>
        <p className="sub">Everything generated for this product — images, and the videos they became. Lineage rides on every card.</p>
      </div>
      {assets.length === 0 ? (
        <div className="ck-empty">
          <p>No assets yet. Open the <Link href={`/app/studio?for=${engagementId}`}>Studio</Link> — it starts scoped to {productName} with the kit&apos;s image prompts loaded, or type <code>/image</code> inside any kit section.</p>
        </div>
      ) : (
        <div className="cws-grid">
          {assets.map((a) => (
            <div className={`cws-thumb is-card ${a.kind === "video" ? "is-video" : ""}`} key={a.id}>
              {a.storage_url && !a.storage_url.startsWith("mock://") && a.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={a.prompt || "generated image"} loading="lazy" src={a.storage_url} style={{ width: "100%", borderRadius: 6, objectFit: "cover", aspectRatio: "4/3" }} />
              ) : null}
              <span>{(a.prompt || (a.parent_image_id ? "video · from image" : "untitled")).slice(0, 60)}</span>
              <small>
                {a.status === "failed" ? `failed — ${a.error || "no credits charged"}` : a.status}
                {a.parent_image_id ? " · from image" : ""} · {fmtDate(a.created_at)}
              </small>
              {a.storage_url && !a.storage_url.startsWith("mock://") ? (
                <a download href={a.storage_url} rel="noopener noreferrer" target="_blank">⤓ download</a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

async function RunsView({ engagementId, productName, sql }: { engagementId: string; productName: string; sql: Sql }) {
  const runs = (await sql`
    SELECT r.id, r.label, r.ran_at, r.desks_completed, r.engine_calls, r.gaps,
      (SELECT count(*)::int FROM evidence_records ev WHERE ev.run_id = r.id) AS evidence
    FROM runs r WHERE r.engagement_id = ${engagementId} ORDER BY r.ran_at DESC LIMIT 50
  `) as Array<{ id: string; label: string; ran_at: string; desks_completed: number; engine_calls: number | null; gaps: unknown[]; evidence: number }>;
  const queued = (await sql`
    SELECT view, instruction, mode, status, created_at FROM generation_queue
    WHERE engagement_id = ${engagementId} ORDER BY created_at DESC LIMIT 20
  `) as Array<{ view: string; instruction: string; mode: string; status: string; created_at: string }>;
  return (
    <>
      <div className="cwk-head">
        <span className="eyebrow">Cloud · Runs &amp; sync</span>
        <h1>{productName} research runs</h1>
        <p className="sub">Every run the plugin synced — desks, engine calls, evidence, and the gaps it logged instead of hiding.</p>
      </div>
      {runs.length === 0 ? (
        <div className="ck-empty"><p>No runs synced yet. From the engagement folder, run <code>npx pmm-os sync</code> — runs land here with their evidence.</p></div>
      ) : (
        <div className="rows">
          {runs.map((r) => (
            <div className="row" key={r.id}>
              <div>
                <div className="t">{r.label}</div>
                <div className="d">
                  {r.desks_completed}/10 desks · {r.evidence} evidence records
                  {r.engine_calls ? ` · ${r.engine_calls} engine calls` : ""}
                  {Array.isArray(r.gaps) && r.gaps.length ? ` · ${r.gaps.length} logged gap${r.gaps.length > 1 ? "s" : ""}` : " · no gaps logged"}
                </div>
                {Array.isArray(r.gaps) && r.gaps.length ? (
                  <div className="d" style={{ opacity: 0.8 }}>{r.gaps.map((g) => String(g)).join(" · ").slice(0, 300)}</div>
                ) : null}
              </div>
              <div className="meta">{fmtDate(r.ran_at)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="cwk-head" style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: 18 }}>Generation queue</h1>
        <p className="sub">Blocks queued from the editor (&ldquo;/regenerate from evidence&rdquo;). The next plugin session fulfils them: &ldquo;process the generation queue&rdquo;.</p>
      </div>
      {queued.length === 0 ? (
        <div className="ck-empty"><p>Queue is empty — nothing waiting on the plugin.</p></div>
      ) : (
        <div className="rows">
          {queued.map((g, i) => (
            <div className="row" key={i}>
              <div>
                <div className="t">{g.mode} · {g.view}</div>
                <div className="d">{g.instruction.slice(0, 200)}</div>
              </div>
              <div className="meta">{g.status} · {fmtDate(g.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

async function HistoryView({ engagementId, productName, sql, version }: { engagementId: string; productName: string; sql: Sql; version: number }) {
  const versions = (await sql`
    SELECT k.version, k.synced_from, k.updated_at,
      (SELECT count(*)::int FROM kit_block_history h WHERE h.kit_id = k.id) AS edits
    FROM kits k WHERE k.engagement_id = ${engagementId} ORDER BY k.version DESC LIMIT 60
  `) as Array<{ version: number; synced_from: string | null; updated_at: string; edits: number }>;
  return (
    <>
      <div className="cwk-head">
        <span className="eyebrow">Cloud · History</span>
        <h1>{productName} kit versions</h1>
        <p className="sub">Every save is a version — cloud edits, structural changes, and plugin syncs all land here. Restore never deletes: it writes the old content as a new version.</p>
      </div>
      <div className="rows">
        {versions.map((v) => (
          <div className="row" key={v.version}>
            <div>
              <div className="t">v{v.version}{v.version === version ? " · current" : ""}</div>
              <div className="d">{v.synced_from || "sync"} · {v.edits} block edit{v.edits === 1 ? "" : "s"}</div>
            </div>
            <div className="meta">
              {fmtDate(v.updated_at)}
              {v.version !== version ? <RestoreForm engagementId={engagementId} version={v.version} /> : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RestoreForm({ engagementId, version }: { engagementId: string; version: number }) {
  async function restore() {
    "use server";
    const uid = await resolveUserId();
    if (!uid) return;
    const sql = db();
    if (!sql) return;
    const [old] = (await sql`
      SELECT k.content, (SELECT max(version) FROM kits WHERE engagement_id = ${engagementId}) AS latest
      FROM kits k JOIN engagements e ON e.id = k.engagement_id
      WHERE k.engagement_id = ${engagementId} AND e.owner_id = ${uid} AND k.version = ${version}
    `) as Array<{ content: Record<string, unknown>; latest: number }>;
    if (!old) return;
    await sql`
      INSERT INTO kits (engagement_id, content, version, synced_from)
      VALUES (${engagementId}, ${JSON.stringify(old.content)}::jsonb, ${old.latest + 1}, ${"restore-v" + version})
    `;
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/app/${engagementId}`);
  }
  return (
    <form action={restore} style={{ display: "inline" }}>
      <button className="ck-restore" type="submit">Restore</button>
    </form>
  );
}
