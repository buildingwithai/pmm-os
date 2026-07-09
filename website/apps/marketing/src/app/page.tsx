import { UsertourHome } from "@/components/usertour-home";
import { siteConfig } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PMM OS",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  description: siteConfig.description,
  url: siteConfig.url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  softwareRequirements: "Claude Code or Codex",
  license: "https://opensource.org/licenses/MIT",
};

export default function Home() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <UsertourHome />
    </>
  );
}
