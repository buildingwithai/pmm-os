import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/cloud/db";
import { KIT_CSS } from "@/lib/cloud/kit/kit-style";
import { firstViewId, renderView, type KitContent } from "@/lib/cloud/kit/render";

export const metadata: Metadata = { title: "Shared launch kit — PMM OS", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Public read-only kit view behind an unguessable share token (V1: view role).
 * Same renderer as the workspace — the shared page IS the kit, minus editing.
 */
export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { token } = await params;
  const { view: viewParam } = await searchParams;
  const sql = db();
  if (!sql || !token || token.length > 60) notFound();

  const rows = (await sql`
    SELECT e.product_name, e.id AS engagement_id, k.content, k.version
    FROM share_links s
    JOIN engagements e ON e.id = s.engagement_id
    JOIN kits k ON k.engagement_id = e.id
    WHERE s.token = ${token} AND s.revoked = false
    ORDER BY k.version DESC LIMIT 1
  `) as Array<{ product_name: string; engagement_id: string; content: KitContent; version: number }>;
  if (rows.length === 0) notFound();
  const { product_name, content: kit, version } = rows[0];

  const viewId = viewParam && kit.views?.[viewParam] ? viewParam : firstViewId(kit);
  const href = (id: string) => `/share/${token}?view=${encodeURIComponent(id)}`;
  const rendered = viewId ? renderView(kit, viewId, href) : null;

  return (
    <main className="cw-shell">
      <style dangerouslySetInnerHTML={{ __html: KIT_CSS }} />
      <aside className="cw-rail" aria-label={`${product_name} sections`}>
        <span className="cw-label">{product_name} · shared kit v{version}</span>
        {(kit.sidebar || []).map((group) => (
          <div key={group.group}>
            <span className="cw-label">{group.group}</span>
            {group.items.map(([num, label, id]) => (
              <Link
                aria-current={id === viewId ? "page" : undefined}
                className={`cw-item ${id === viewId ? "is-on" : ""}`}
                href={href(id)}
                key={id}
              >
                <strong><span className="cw-num">{num}</span> {label}</strong>
              </Link>
            ))}
          </div>
        ))}
        <div className="cw-railfoot">
          <p className="cw-dim" style={{ padding: "0 10px" }}>
            Read-only share. Built with <Link href="/">PMM OS</Link>.
          </p>
        </div>
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
          </div>
        )}
      </section>
    </main>
  );
}
