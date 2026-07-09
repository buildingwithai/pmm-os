import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/cloud/db";
import { StudioComposer } from "./studio-composer";

export const metadata: Metadata = { title: "Studio — PMM OS Cloud", robots: { index: false } };
export const dynamic = "force-dynamic";

async function userId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { auth } = await import("@clerk/nextjs/server");
    return (await auth()).userId;
  }
  if (process.env.NODE_ENV !== "production" && process.env.PMM_OS_DEV_USER) return process.env.PMM_OS_DEV_USER;
  return null;
}

export default async function StudioPage() {
  const sql = db();
  const uid = await userId();
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
    SELECT id, kind, prompt, status, parent_image_id, created_at FROM assets
    WHERE owner_id = ${uid} ORDER BY created_at DESC LIMIT 60
  `) as Array<{ id: string; kind: "image" | "video"; prompt: string | null; status: string; parent_image_id: string | null; created_at: string }>;

  return (
    <main className="cw-shell">
      <aside className="cw-rail" aria-label="Studio">
        <Link className="cw-item" href="/app"><strong>← All products</strong></Link>
        <span className="cw-label">Spaces</span>
        <span className="cw-item is-on"><strong>Studio</strong></span>
      </aside>
      <section className="cwk-view">
        <div className="cwk-head">
          <span className="eyebrow">Studio</span>
          <h1>Make something from the research</h1>
          <p className="sub">Images from prompts, video from any image — everything files under its product.</p>
        </div>
        <StudioComposer engagements={engagements} initialAssets={assets} />
      </section>
    </main>
  );
}
