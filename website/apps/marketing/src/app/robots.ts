import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteConfig.url,
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
