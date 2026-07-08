import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { absoluteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": absoluteUrl("/rss.xml"),
    },
  },
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    description: siteConfig.description,
    images: [{ alt: siteConfig.title, url: absoluteUrl("/opengraph-image") }],
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.title,
    type: "website",
    url: siteConfig.url,
  },
  publisher: siteConfig.author,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.twitter,
    description: siteConfig.description,
    images: [absoluteUrl("/opengraph-image")],
    title: siteConfig.title,
  },
  icons: {
    icon: "/seo/usertour/02-favicon.png",
    apple: "/seo/usertour/08-favicon-180x180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
