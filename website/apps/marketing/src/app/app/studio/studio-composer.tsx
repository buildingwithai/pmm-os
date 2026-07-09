"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, Image as ImageIcon, LoaderCircle } from "lucide-react";

type Asset = {
  id: string; kind: "image" | "video"; prompt: string | null;
  status: string; storage_url?: string | null; parent_image_id: string | null; created_at: string;
};
type Engagement = { id: string; product_name: string };
type KitPrompt = { name: string; prompt: string };

const realUrl = (u?: string | null) => (u && !u.startsWith("mock://") ? u : null);

export function StudioComposer({
  engagements, initialAssets, initialFor, kitPrompts,
}: {
  engagements: Engagement[];
  initialAssets: Asset[];
  initialFor?: string;
  kitPrompts?: Record<string, KitPrompt[]>;
}) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [forId, setForId] = useState<string>(initialFor ?? (engagements[0]?.id || ""));
  const [sourceId, setSourceId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; kind: "error" | "info" } | null>(null);
  const watched = useRef(new Map<string, EventSource | ReturnType<typeof setInterval>>());

  const images = assets.filter((a) => a.kind === "image" && a.status === "ready");
  const prompts = (kitPrompts && forId && kitPrompts[forId]) || [];

  /* videos render async — the server watches the job and PUSHES status over
     SSE (one stream per render); plain polling only as fallback if the
     stream can't be held open */
  useEffect(() => {
    const settle = (id: string, data: { status?: string; url?: string; error?: string }) => {
      if (!data.status || data.status === "generating") return false;
      setAssets((prev) => prev.map((x) => x.id === id ? { ...x, status: data.status!, storage_url: data.url || x.storage_url } : x));
      if (data.status === "failed") setNotice({ text: `Render failed: ${data.error || "provider error"} — no credits charged.`, kind: "error" });
      const w = watched.current.get(id);
      if (w instanceof EventSource) w.close(); else if (w) clearInterval(w);
      watched.current.delete(id);
      return true;
    };
    const pollFallback = (id: string) => {
      const t = setInterval(async () => {
        try { settle(id, await (await fetch(`/api/cloud/assets/${id}`)).json()); } catch { /* next tick */ }
      }, 4000);
      watched.current.set(id, t);
    };
    for (const a of assets) {
      if (a.status !== "generating" || watched.current.has(a.id)) continue;
      if (typeof EventSource === "undefined") { pollFallback(a.id); continue; }
      const es = new EventSource(`/api/cloud/assets/${a.id}/events`);
      watched.current.set(a.id, es);
      es.onmessage = (ev) => { try { settle(a.id, JSON.parse(ev.data)); } catch { /* malformed frame */ } };
      es.onerror = () => { es.close(); if (watched.current.get(a.id) === es) { watched.current.delete(a.id); pollFallback(a.id); } };
    }
  }, [assets]);

  /* close every live stream/timer exactly once, on unmount */
  useEffect(() => {
    const current = watched.current;
    return () => {
      for (const w of current.values()) { if (w instanceof EventSource) w.close(); else clearInterval(w); }
      current.clear();
    };
  }, []);

  async function generate(kind: "image" | "video", parentImageId?: string) {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/cloud/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          prompt: prompt || undefined,
          engagementId: forId || undefined,
          parentImageId: parentImageId || (kind === "video" ? sourceId : undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice({
          kind: "error",
          text: data.error === "missing_parent_image" ? "Pick a source image first — video always starts from an image."
            : data.error === "missing_prompt" ? "Write a prompt first."
            : data.error === "parent_image_not_hosted" ? "That image has no hosted file (mock mode) — regenerate it once storage keys are live, then animate it."
            : data.error === "generation_failed" ? "The model rejected this one — no credits were charged. Adjust the prompt and retry."
            : "Something went wrong — no credits were charged.",
        });
      } else {
        setAssets((prev) => [{
          id: data.assetId, kind, prompt: kind === "image" ? prompt : prompt || null,
          status: data.status, storage_url: data.url || null,
          parent_image_id: parentImageId || sourceId || null,
          created_at: new Date().toISOString(),
        }, ...prev]);
        if (data.mock) setNotice({ kind: "info", text: "Mock mode — the flow ran end-to-end; real rendering starts when the provider keys are set. No credits charged." });
        if (kind === "video" && data.status === "generating") setNotice({ kind: "info", text: "Rendering the video — typically under two minutes. It appears below when done." });
        if (kind === "image") setPrompt("");
      }
    } catch {
      setNotice({ kind: "error", text: "Couldn't reach the server — no credits were charged." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cws">
      <div className="cws-bar">
        <label className="cws-for">
          <span>For:</span>
          <select onChange={(e) => setForId(e.target.value)} value={forId}>
            {engagements.map((e) => <option key={e.id} value={e.id}>{e.product_name}</option>)}
            <option value="">No product</option>
          </select>
        </label>
        <div className="cws-modes" role="tablist" aria-label="Asset type">
          <button aria-selected={mode === "image"} className={mode === "image" ? "is-on" : ""} onClick={() => setMode("image")} role="tab" type="button">
            <ImageIcon aria-hidden="true" size={14} /> Image
          </button>
          <button aria-selected={mode === "video"} className={mode === "video" ? "is-on" : ""} onClick={() => setMode("video")} role="tab" type="button">
            <Clapperboard aria-hidden="true" size={14} /> Animate image
          </button>
        </div>
      </div>

      {mode === "image" ? (
        <div className="cws-compose">
          {prompts.length > 0 ? (
            <div className="cws-prompts" aria-label="Prompts the research wrote">
              {prompts.slice(0, 6).map((p) => (
                <button key={p.name} onClick={() => setPrompt(p.prompt)} title={p.prompt} type="button">
                  ✦ {p.name}
                </button>
              ))}
            </div>
          ) : null}
          <label className="sr-only" htmlFor="studio-prompt">Image prompt</label>
          <textarea
            id="studio-prompt"
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={prompts.length ? "Pick a kit prompt above, or describe the image yourself…" : "Describe the image — or open a product's kit and use /image on a block to prefill from its prompts."}
            rows={3}
            value={prompt}
          />
          <button className="cws-go" disabled={busy || !prompt.trim()} onClick={() => generate("image")} type="button">
            {busy ? <LoaderCircle aria-hidden="true" className="ut-spin" size={15} /> : <ArrowRight aria-hidden="true" size={15} />}
            Generate image
          </button>
        </div>
      ) : (
        <div className="cws-compose">
          <p className="cws-hint">Step 1 — pick the source image{images.length === 0 ? " (generate an image first)" : ""}:</p>
          <div className="cws-grid">
            {images.map((a) => (
              <button
                aria-pressed={sourceId === a.id}
                className={`cws-thumb ${sourceId === a.id ? "is-on" : ""}`}
                key={a.id}
                onClick={() => setSourceId(a.id)}
                type="button"
              >
                {realUrl(a.storage_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={a.prompt || "generated image"} src={realUrl(a.storage_url)!} />
                ) : (
                  <ImageIcon aria-hidden="true" size={16} />
                )}
                <span>{(a.prompt || "untitled").slice(0, 42)}</span>
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="studio-motion">Motion direction (optional)</label>
          <textarea
            id="studio-motion"
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional — how should it move? e.g. slow push-in, the chart line draws itself…"
            rows={2}
            value={prompt}
          />
          <button className="cws-go" disabled={busy || !sourceId} onClick={() => generate("video")} type="button">
            {busy ? <LoaderCircle aria-hidden="true" className="ut-spin" size={15} /> : <Clapperboard aria-hidden="true" size={15} />}
            Animate
          </button>
        </div>
      )}

      {notice ? <p className={notice.kind === "error" ? "cws-error" : "cws-hint"} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</p> : null}

      <h2 className="cws-h">Assets</h2>
      {assets.length === 0 ? (
        <p className="cws-hint">Nothing yet — your first generation lands here.</p>
      ) : (
        <div className="cws-grid">
          {assets.map((a) => (
            <div className={`cws-thumb is-card ${a.kind === "video" ? "is-video" : ""}`} key={a.id}>
              {a.kind === "image" && realUrl(a.storage_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={a.prompt || "generated image"} src={realUrl(a.storage_url)!} />
              ) : a.kind === "video" && realUrl(a.storage_url) && a.status === "ready" ? (
                <video controls muted preload="metadata" src={realUrl(a.storage_url)!} />
              ) : a.status === "generating" ? (
                <LoaderCircle aria-hidden="true" className="ut-spin" size={16} />
              ) : a.kind === "video" ? (
                <Clapperboard aria-hidden="true" size={16} />
              ) : (
                <ImageIcon aria-hidden="true" size={16} />
              )}
              <span>{(a.prompt || (a.parent_image_id ? "from image" : "untitled")).slice(0, 48)}</span>
              <small>{a.status}{a.parent_image_id ? " · from image" : ""}</small>
              {a.kind === "image" && a.status === "ready" ? (
                <button onClick={() => { setSourceId(a.id); generate("video", a.id); }} type="button">▸ Animate</button>
              ) : null}
              {realUrl(a.storage_url) ? (
                <a download href={realUrl(a.storage_url)!} rel="noopener noreferrer" target="_blank">⤓</a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
