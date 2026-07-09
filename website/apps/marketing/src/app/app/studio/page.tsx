import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/cloud/db";
import { resolveUserId } from "@/lib/cloud/workspace-auth";
import { StudioComposer } from "./studio-composer";

export const metadata: Metadata = { title: "Studio — PMM OS Cloud", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: forParam } = await searchParams;
  const sql = db();
  const uid = await resolveUserId();
  if (!sql || !uid) {
    return (
      <main className="cw-empty">
        <h1>The studio is being wired</h1>
        <p><Link href="/cloud">Join the waitlist</Link> to be first in.</p>
      </main>
    );
  }
  const engagements = (await sql`
    SELECT id, product_name FROM engagements WHERE owner_id = ${uid} AND status = 'active' ORDER BY last_synced_at DESC NULLS LAST
  `) as Array<{ id: string; product_name: string }>;
  const assets = (await sql`
    SELECT id, kind, prompt, status, storage_url, parent_image_id, created_at FROM assets
    WHERE owner_id = ${uid} ORDER BY created_at DESC LIMIT 60
  `) as Array<{ id: string; kind: "image" | "video"; prompt: string | null; status: string; storage_url: string | null; parent_image_id: string | null; created_at: string }>;

  // the research→creation stitch: each kit's authored image prompts,
  // one-click starting points per product (spec: "prompt prefill")
  const kitRows = (await sql`
    SELECT DISTINCT ON (e.id) e.id, k.content->'data'->'gallery' AS gallery
    FROM engagements e JOIN kits k ON k.engagement_id = e.id
    WHERE e.owner_id = ${uid} ORDER BY e.id, k.version DESC
  `) as Array<{ id: string; gallery: Array<[string, string, string]> | null }>;
  const prompts: Record<string, Array<{ name: string; prompt: string }>> = {};
  for (const r of kitRows) {
    if (Array.isArray(r.gallery)) {
      prompts[r.id] = r.gallery
        .filter((g) => Array.isArray(g) && g[2])
        .map((g) => ({ name: String(g[0]), prompt: String(g[2]).replace(/<[^>]*>/g, "") }));
    }
  }

  const initialFor = forParam && engagements.some((e) => e.id === forParam) ? forParam : engagements[0]?.id || "";

  return (
    <main className="cw-shell">
      <aside className="cw-rail" aria-label="Studio">
        <Link className="cw-item" href="/app"><strong>← All products</strong></Link>
        <span className="cw-label">Spaces</span>
        <span className="cw-item is-on"><strong>Studio</strong></span>
        <Link className="cw-item" href="/app/settings"><strong>Settings</strong></Link>
      </aside>
      <section className="cwk-view">
        <div className="cwk-head">
          <span className="eyebrow">Studio</span>
          <h1>Make something from the research</h1>
          <p className="sub">Images from prompts, video from any image — everything files under its product.</p>
        </div>
        <StudioComposer engagements={engagements} initialAssets={assets} initialFor={initialFor} kitPrompts={prompts} />
      </section>
    </main>
  );
}
