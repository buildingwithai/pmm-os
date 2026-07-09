"use client";

/** Share the kit as a hosted read-only link (V1: view role). */
import { useState } from "react";

export function ShareButton({ engagementId }: { engagementId: string }) {
  const [state, setState] = useState<"idle" | "busy" | "copied" | "error">("idle");
  const [url, setUrl] = useState("");

  async function share() {
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/cloud/share", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      const full = location.origin + data.url;
      setUrl(full);
      await navigator.clipboard.writeText(full).catch(() => {});
      setState("copied");
      setTimeout(() => setState("idle"), 2400);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2400);
    }
  }

  return (
    <button className="ck-share" onClick={share} type="button">
      {state === "busy" ? "Creating link…"
        : state === "copied" ? "Link copied ✓"
        : state === "error" ? "Couldn't share — retry"
        : url ? "Copy share link" : "Share"}
    </button>
  );
}
