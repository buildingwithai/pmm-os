import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/usertour-pages";
import { absoluteUrl } from "@/lib/site";

const staticRoutes = [
  "/",
  "/features",
  "/blog",
  "/pricing",
  "/docs",
  "/support",
  "/about",
  "/privacy",
  "/terms",
  "/license",
];

function parsePostDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    changeFrequency: "weekly" as const,
    lastModified: now,
    priority: route === "/" ? 1 : 0.7,
    url: absoluteUrl(route),
  }));
  const blogEntries = blogPosts.map((post) => ({
    changeFrequency: "monthly" as const,
    lastModified: parsePostDate(post.date),
    priority: 0.6,
    url: absoluteUrl(`/blog/${post.slug}`),
  }));

  return [...staticEntries, ...blogEntries];
}
