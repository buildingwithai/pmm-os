"use client";

import { useState } from "react";
import { ArrowRight, Clapperboard, Image as ImageIcon, LoaderCircle } from "lucide-react";

type Asset = {
  id: string; kind: "image" | "video"; prompt: string | null;
  status: string; parent_image_id: string | null; created_at: string;
};
type Engagement = { id: string; product_name: string };

export function StudioComposer({ engagements, initialAssets }: { engagements: Engagement[]; initialAssets: Asset[] }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [forId, setForId] = useState<string>(engagements[0]?.id || "");
  const [sourceId, setSourceId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const images = assets.filter((a) => a.kind === "image" && a.status === "ready");

  async function generate(kind: "image" | "video", parentImageId?: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/cloud/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          prompt: kind === "image" ? prompt : undefined,
          engagementId: forId || undefined,
          parentImageId: parentImageId || (kind === "video" ? sourceId : undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.error === "missing_parent_image" ? "Pick a source image first — video always starts from an image."
          : data.error === "missing_prompt" ? "Write a prompt first."
          : data.error === "generation_backend_pending" ? "Generation keys aren't enabled yet — your request was recorded, no credits charged."
          : "Something went wrong — no credits were charged.",
        );
      } else {
        setAssets((prev) => [{
          id: data.assetId, kind, prompt: kind === "image" ? prompt : null,
          status: data.status, parent_image_id: parentImageId || sourceId || null,
          created_at: new Date().toISOString(),
        }, ...prev]);
        if (kind === "image") setPrompt("");
      }
    } catch {
      setError("Couldn't reach the server — no credits were charged.");
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
          <label className="sr-only" htmlFor="studio-prompt">Image prompt</label>
          <textarea
            id="studio-prompt"
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image — or open a product's kit and use /image on a block to prefill from its prompts."
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
                <ImageIcon aria-hidden="true" size={16} />
                <span>{(a.prompt || "untitled").slice(0, 42)}</span>
              </button>
            ))}
          </div>
          <button className="cws-go" disabled={busy || !sourceId} onClick={() => generate("video")} type="button">
            {busy ? <LoaderCircle aria-hidden="true" className="ut-spin" size={15} /> : <Clapperboard aria-hidden="true" size={15} />}
            Animate
          </button>
        </div>
      )}

      {error ? <p className="cws-error" role="alert">{error}</p> : null}

      <h2 className="cws-h">Assets</h2>
      {assets.length === 0 ? (
        <p className="cws-hint">Nothing yet — your first generation lands here.</p>
      ) : (
        <div className="cws-grid">
          {assets.map((a) => (
            <div className={`cws-thumb is-card ${a.kind === "video" ? "is-video" : ""}`} key={a.id}>
              {a.kind === "video" ? <Clapperboard aria-hidden="true" size={16} /> : <ImageIcon aria-hidden="true" size={16} />}
              <span>{(a.prompt || (a.parent_image_id ? "from image" : "untitled")).slice(0, 48)}</span>
              <small>{a.status}{a.parent_image_id ? " · from image" : ""}</small>
              {a.kind === "image" && a.status === "ready" ? (
                <button onClick={() => generate("video", a.id)} type="button">▸ Animate</button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
