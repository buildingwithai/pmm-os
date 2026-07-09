import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/cloud/db";
import { KIT_CSS } from "@/lib/cloud/kit/kit-style";
import { firstViewId, renderView, type KitContent } from "@/lib/cloud/kit/render";

export const metadata: Metadata = { title: "Workspace — PMM OS Cloud", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * The product workspace (spec v5): the rail is the kit's own sidebar, the
 * middle pane renders the selected view through the vendored block registry —
 * the same HTML the local kit produces. Editing lands next phase.
 *
 * Auth: Clerk when configured. Without Clerk keys, a dev-only bypass
 * (PMM_OS_DEV_USER) allows local verification; production without keys shows
 * the being-wired state like /app.
 */
async function resolveUserId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  }
  if (process.env.NODE_ENV !== "production" && process.env.PMM_OS_DEV_USER) {
    return process.env.PMM_OS_DEV_USER; // local dev only, never set in prod
  }
  return null;
}

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

  const viewId = viewParam && kit.views?.[viewParam] ? viewParam : firstViewId(kit);
  const rendered = viewId
    ? renderView(kit, viewId, (id) => `/app/${engagementId}?view=${encodeURIComponent(id)}`)
    : null;

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
                aria-current={id === viewId ? "page" : undefined}
                className={`cw-item ${id === viewId ? "is-on" : ""}`}
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
        <span className="cw-item is-soon"><strong>▦ Assets</strong><small>next phase</small></span>
        <span className="cw-item is-soon"><strong>↻ Runs &amp; sync</strong><small>next phase</small></span>
      </aside>
      <section className="cwk-view">
        {rendered ? (
          <>
            <div className="cwk-head" dangerouslySetInnerHTML={{ __html: rendered.head }} />
            <div className="cwk-blocks" dangerouslySetInnerHTML={{ __html: rendered.bodyHtml }} />
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
