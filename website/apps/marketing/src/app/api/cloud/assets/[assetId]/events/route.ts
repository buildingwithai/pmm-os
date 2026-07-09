import { NextRequest } from "next/server";
import { db } from "@/lib/cloud/db";
import { pollVideo } from "@/lib/cloud/generate";
import { resolveUserId } from "@/lib/cloud/workspace-auth";

/**
 * GET /api/cloud/assets/[assetId]/events — Server-Sent Events for a render.
 *
 * The realtime layer for generation: ONE server loop watches the provider
 * job and pushes status to the browser (EventSource), instead of the client
 * hammering the poll route. Emits `data: {status, url?, error?, creditsCharged?}`
 * every transition, then closes on a terminal state. The plain poll route
 * stays as the fallback when the stream can't be held open.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const VIDEO_CREDITS = 10; // must match the poll route
const TICK_MS = 3000;
const MAX_MS = 280_000; // close before the platform kills the function

export async function GET(request: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const uid = await resolveUserId();
  const sql = db();
  if (!uid) return new Response("sign_in_required", { status: 401 });
  if (!sql) return new Response("cloud_not_configured", { status: 503 });

  const [asset] = (await sql`
    SELECT id, kind, status, storage_url, provider_job_id, error, credits_charged
    FROM assets WHERE id = ${assetId} AND owner_id = ${uid}
  `) as Array<{ id: string; kind: string; status: string; storage_url: string | null; provider_job_id: string | null; error: string | null; credits_charged: number }>;
  if (!asset) return new Response("not_found", { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      const close = () => { try { controller.close(); } catch { /* already closed */ } };

      // already settled (or not a video job): one event, done
      if (asset.status !== "generating" || asset.kind !== "video" || !asset.provider_job_id) {
        send({ status: asset.status, url: asset.storage_url, error: asset.error, creditsCharged: asset.credits_charged });
        close();
        return;
      }

      send({ status: "generating" });
      const started = Date.now();
      let aborted = false;
      request.signal.addEventListener("abort", () => { aborted = true; });

      while (!aborted && Date.now() - started < MAX_MS) {
        await new Promise((r) => setTimeout(r, TICK_MS));
        if (aborted) break;
        try {
          const r = await pollVideo(asset.provider_job_id, asset.id);
          if (r.status === "ready") {
            await sql`UPDATE assets SET status = 'ready', storage_url = ${r.url}, credits_charged = ${VIDEO_CREDITS} WHERE id = ${asset.id}`;
            send({ status: "ready", url: r.url, creditsCharged: VIDEO_CREDITS });
            break;
          }
          if (r.status === "failed") {
            await sql`UPDATE assets SET status = 'failed', error = ${r.error.slice(0, 500)}, credits_charged = 0 WHERE id = ${asset.id}`;
            send({ status: "failed", error: r.error, creditsCharged: 0 });
            break;
          }
          send({ status: "generating" }); // heartbeat keeps proxies from idling the stream
        } catch {
          // transient provider/db hiccup — next tick retries; the client's
          // fallback poll covers us if the stream itself dies
        }
      }
      close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
