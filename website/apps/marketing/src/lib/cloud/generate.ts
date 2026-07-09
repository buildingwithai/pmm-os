/**
 * Generation backends behind one interface (HANDOFF F rule: providers churn —
 * the abstraction is mandatory). Verified contracts 2026-07-09:
 *  - OpenAI POST /v1/images/generations, model gpt-image-2, b64_json response
 *  - xAI  POST /v1/videos/generations → { request_id }; GET /v1/videos/{id}
 *         → { status: done|failed|expired, video: { url } }
 *
 * Outputs land in Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
 * ponytail: without the blob token, images store as data: URLs and videos
 * keep the provider's hosted URL (which can expire) — the upgrade path is
 * simply adding the token in Vercel.
 */
import { put } from "@vercel/blob";

async function store(path: string, data: Buffer | ArrayBuffer, contentType: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const body: Buffer = Buffer.isBuffer(data) ? data : Buffer.from(new Uint8Array(data));
  const blob = await put(path, body, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function generateImage(prompt: string, assetId: string): Promise<{ url: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("image backend not configured");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.PMM_OS_IMAGE_MODEL || "gpt-image-2",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`image generation failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = data.data?.[0];
  if (first?.b64_json) {
    const buf = Buffer.from(first.b64_json, "base64");
    const url = await store(`assets/${assetId}.png`, buf, "image/png");
    return { url: url || `data:image/png;base64,${first.b64_json}` };
  }
  if (first?.url) return { url: first.url };
  throw new Error("image generation returned no image");
}

export async function startVideo(prompt: string, sourceImageUrl: string): Promise<string> {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("video backend not configured");
  const res = await fetch("https://api.x.ai/v1/videos/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.PMM_OS_VIDEO_MODEL || "grok-imagine-video",
      prompt: prompt || "Animate this image naturally, keeping its composition and mood.",
      image: { url: sourceImageUrl },
      duration: 6,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`video start failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as { request_id?: string };
  if (!data.request_id) throw new Error("video start returned no request id");
  return data.request_id;
}

export async function pollVideo(requestId: string, assetId: string): Promise<
  { status: "generating" } | { status: "ready"; url: string } | { status: "failed"; error: string }
> {
  const key = process.env.XAI_API_KEY;
  if (!key) return { status: "failed", error: "video backend not configured" };
  const res = await fetch(`https://api.x.ai/v1/videos/${encodeURIComponent(requestId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return { status: "failed", error: `poll failed (${res.status})` };
  const data = (await res.json()) as { status?: string; video?: { url?: string } };
  if (data.status === "done" && data.video?.url) {
    // pull the finished video into our storage so the URL doesn't expire
    try {
      const v = await fetch(data.video.url);
      if (v.ok) {
        const url = await store(`assets/${assetId}.mp4`, await v.arrayBuffer(), "video/mp4");
        if (url) return { status: "ready", url };
      }
    } catch { /* keep the provider URL below */ }
    return { status: "ready", url: data.video.url };
  }
  if (data.status === "failed" || data.status === "expired") {
    return { status: "failed", error: "provider reported " + data.status };
  }
  return { status: "generating" };
}
