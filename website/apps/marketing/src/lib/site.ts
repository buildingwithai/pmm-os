export const siteConfig = {
  name: "PMM OS",
  title: "PMM OS — Product Marketing & GTM skills for Claude Code",
  description:
    "A Claude Code / Codex plugin — npx pmm-os install — 45 product-marketing, GTM, and PLG skills with a ten-desk research pipeline (Reddit, X, TikTok, Instagram, YouTube transcripts, LinkedIn, review sites) that turns a product brief into cited evidence, positioning, messaging, pricing, competitive intel, and a shippable interactive launch kit.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://pmm-os.com",
  author: "PMM OS",
  twitter: "@buildingwithai",
  github: "https://github.com/buildingwithai/pmm-os",
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}
