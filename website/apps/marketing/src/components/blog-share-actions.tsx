"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function BlogShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openShare(network: "x" | "linkedin") {
    const url = encodeURIComponent(window.location.href);
    const shareUrl =
      network === "x"
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${url}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="ut-share-box" aria-label="Share article">
      <strong>Share</strong>
      <button type="button" onClick={copyLink}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <button
        type="button"
        onClick={() => openShare("x")}
        aria-label="Share on X"
      >
        X
      </button>
      <button
        type="button"
        onClick={() => openShare("linkedin")}
        aria-label="Share on LinkedIn"
      >
        in
      </button>
      <span aria-hidden="true">
        <Share2 size={16} />
      </span>
    </div>
  );
}
