import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { db } from "@/lib/cloud/db";
import { ensureUser } from "@/lib/cloud/ensure-user";

export const metadata: Metadata = {
  title: "Workspace — PMM OS Cloud",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

/**
 * The cloud workspace shell (spec v5, single level).
 * Renders honestly per state:
 *  - no server config yet  -> "being wired" notice
 *  - no Clerk keys         -> sign-in not available yet (waitlist link)
 *  - signed in, no products-> first-run: the sync command IS the content
 *  - products              -> rail + kit workspace (next build phase)
 */
async function resolveWorkspaceUser(): Promise<{ userId: string; email: string } | null> {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    return { userId, email: user?.emailAddresses?.[0]?.emailAddress || "" };
  }
  if (process.env.NODE_ENV !== "production" && process.env.PMM_OS_DEV_USER) {
    return { userId: process.env.PMM_OS_DEV_USER, email: "dev@local" };
  }
  return null;
}

export default async function WorkspacePage() {
  const sql = db();
  const resolved = await resolveWorkspaceUser();

  if (!resolved || !sql) {
    return (
      <main className="cw-empty">
        <Terminal aria-hidden="true" size={28} />
        <h1>The workspace is being wired</h1>
        <p>
          Accounts open with the first invites — the plugin, the research, and the launch kits
          all work locally today.{" "}
          <Link href="/cloud">Join the waitlist</Link> to be first in.
        </p>
      </main>
    );
  }

  const { userId, email } = resolved;
  await ensureUser(sql, userId, email === "dev@local" ? "" : email);
  const engagements = (await sql`
    SELECT id, product_name, last_synced_at,
      (SELECT count(*) FROM assets a WHERE a.engagement_id = e.id) AS asset_count
    FROM engagements e
    WHERE owner_id = ${userId} AND status = 'active'
    ORDER BY last_synced_at DESC NULLS LAST
  `) as Array<{ id: string; product_name: string; last_synced_at: string | null; asset_count: string }>;

  if (engagements.length === 0) {
    return (
      <main className="cw-empty">
        <Terminal aria-hidden="true" size={28} />
        <h1>Sync your first product</h1>
        <p>From an engagement folder the plugin has worked on, run:</p>
        <pre>npx pmm-os sync https://pmm-os-green.vercel.app &lt;your-sync-token&gt;</pre>
        <p className="cw-dim">
          Your kit, evidence, and runs appear here seconds later. Token setup lives in
          Settings once you&apos;re in — for the beta, your invite email includes it.
        </p>
      </main>
    );
  }

  return (
    <main className="cw-shell">
      <aside className="cw-rail" aria-label="Products">
        <span className="cw-label">Products</span>
        {engagements.map((e) => (
          <Link className="cw-item" href={`/app/${e.id}`} key={e.id}>
            <strong>{e.product_name}</strong>
            <small>
              {e.last_synced_at ? new Date(e.last_synced_at).toLocaleDateString() : "—"} · ▦ {e.asset_count}
            </small>
          </Link>
        ))}
        <span className="cw-label">Spaces</span>
        <Link className="cw-item" href="/app/studio"><strong>Studio</strong></Link>
        <Link className="cw-item" href="/app/settings"><strong>Settings</strong></Link>
      </aside>
      <section className="cw-main">
        <h1>Pick a product</h1>
        <p className="cw-dim">
          Select a product on the left — its launch kit opens right here.
          <ArrowRight aria-hidden="true" size={15} />
        </p>
      </section>
    </main>
  );
}
