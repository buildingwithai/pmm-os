import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt = siteConfig.title;
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f8fafc",
          color: "#0f172a",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: "100%" }}>
          <div style={{ color: "#2563eb", fontSize: 30, fontWeight: 800 }}>idkWidk</div>
          <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 1.04, maxWidth: 960 }}>
            Codex plugin and SaaS template
          </div>
          <div style={{ color: "#475569", fontSize: 32, lineHeight: 1.3, maxWidth: 980 }}>
            Marketing, docs, blog, analytics, billing, and dashboard boundaries for AI-built products.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
