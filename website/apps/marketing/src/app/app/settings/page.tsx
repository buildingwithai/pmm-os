import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/cloud/db";
import { resolveWorkspaceUser } from "@/lib/cloud/workspace-auth";
import { DevicesManager } from "./devices-manager";

export const metadata: Metadata = { title: "Settings — PMM OS Cloud", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Settings — spec v5: six flat sections, nothing nested deeper than one
 * level. Account · Connections · Credits & billing · Research Intelligence ·
 * Preferences · Data. Sections not yet backed by a system say so plainly.
 */
export default async function SettingsPage() {
  const sql = db();
  const user = await resolveWorkspaceUser();
  if (!sql || !user) {
    return (
      <main className="cw-empty">
        <h1>The workspace is being wired</h1>
        <p><Link href="/cloud">Join the waitlist</Link> to be first in.</p>
      </main>
    );
  }

  const engagements = (await sql`
    SELECT id, product_name, status FROM engagements WHERE owner_id = ${user.userId} ORDER BY product_name
  `) as Array<{ id: string; product_name: string; status: string }>;
  const [{ image_count, video_count }] = (await sql`
    SELECT count(*) FILTER (WHERE kind = 'image')::int AS image_count,
           count(*) FILTER (WHERE kind = 'video')::int AS video_count
    FROM assets WHERE owner_id = ${user.userId} AND status = 'ready'
  `) as Array<{ image_count: number; video_count: number }>;

  const syncUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pmm-os-green.vercel.app";

  return (
    <main className="cw-shell">
      <aside className="cw-rail" aria-label="Settings">
        <Link className="cw-item" href="/app"><strong>← All products</strong></Link>
        <span className="cw-label">Spaces</span>
        <Link className="cw-item" href="/app/studio"><strong>Studio</strong></Link>
        <span className="cw-item is-on"><strong>Settings</strong></span>
      </aside>
      <section className="cwk-view ck-settings">
        <div className="cwk-head">
          <span className="eyebrow">Settings</span>
          <h1>Your workspace</h1>
        </div>

        <h2>Account</h2>
        <div className="rows">
          <div className="row">
            <div><div className="t">Signed in as</div><div className="d">{user.email || user.userId}</div></div>
            <div className="meta">{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Clerk" : "dev session"}</div>
          </div>
        </div>
        <p className="ck-note">Profile, passkeys, and account deletion live in the Clerk account panel once sign-in keys are configured.</p>

        <h2>Connections</h2>
        <p className="ck-note">
          Each machine that runs <code>npx pmm-os sync</code> gets its own token. Create one here,
          run the command it shows, and the machine appears with its last-sync time. Revoking a
          token stops that machine&apos;s syncs immediately — nothing already synced is deleted.
        </p>
        <DevicesManager syncUrl={syncUrl} />

        <h2>Credits &amp; billing</h2>
        <div className="rows">
          <div className="row">
            <div><div className="t">Usage so far</div><div className="d">{image_count} images · {video_count} videos generated</div></div>
            <div className="meta">billing not enabled yet</div>
          </div>
        </div>
        <p className="ck-note">Generation runs in mock mode until the owner adds provider keys; credits and Stripe land with the billing phase. Nothing is charged today.</p>

        <h2>Research Intelligence</h2>
        <div className="rows">
          <div className="row">
            <div>
              <div className="t">Gateway</div>
              <div className="d">Reroutes the engine&apos;s LLM rerank through the cloud key. Connect from any engagement folder:</div>
              <pre className="ck-code">npx pmm-os research-connect {syncUrl}/api/research/rerank &lt;your-token&gt;</pre>
            </div>
            <div className="meta">{process.env.OPENAI_API_KEY ? "live" : "mock until keys"}</div>
          </div>
        </div>

        <h2>Preferences</h2>
        <div className="rows">
          <div className="row">
            <div><div className="t">Image model</div><div className="d">gpt-image-2 (default quality: standard)</div></div>
            <div className="meta">fixed in V1</div>
          </div>
          <div className="row">
            <div><div className="t">Video model</div><div className="d">grok-imagine-video · 720p · up to 15s</div></div>
            <div className="meta">fixed in V1</div>
          </div>
        </div>

        <h2>Data</h2>
        {engagements.length === 0 ? (
          <p className="ck-note">No engagements yet — sync one first, then export or archive it here.</p>
        ) : (
          <div className="rows">
            {engagements.map((e) => (
              <div className="row" key={e.id}>
                <div><div className="t">{e.product_name}</div><div className="d">{e.status}</div></div>
                <div className="meta">
                  <a href={`/api/cloud/export?engagementId=${e.id}`}>⤓ export everything (JSON)</a>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="ck-note">
          The export contains every kit version, evidence record, run, and asset record the cloud
          holds for that product. Deleting an engagement is permanent and removes all of it —
          that action ships with the billing phase so the confirmation can name exact counts.
        </p>
      </section>
    </main>
  );
}
