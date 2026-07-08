import { blogPosts } from "@/data/usertour-pages";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const items = blogPosts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
  <guid>${absoluteUrl(`/blog/${post.slug}`)}</guid>
  <description>${escapeXml(post.summary)}</description>
  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${escapeXml(siteConfig.title)}</title>
  <link>${siteConfig.url}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>en-us</language>
  ${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
    },
  });
}
