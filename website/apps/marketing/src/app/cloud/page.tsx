import type { Metadata } from "next";
import Image from "next/image";
import { Camera, Clapperboard, Database, FlaskConical, Share2, Sparkles, Terminal, Wand2 } from "lucide-react";
import { CloudWaitlistForm } from "@/components/cloud-waitlist-form";
import { Badge } from "@/components/usertour-home";
import { UsertourPageShell } from "@/components/usertour-page-shell";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "PMM OS Cloud — the companion web app",
  description:
    "The memory and media layer for PMM OS: a synced research library for every engagement, an asset studio that turns launch kits into images and video, and a hosted research reranker. Join the waitlist.",
  alternates: { canonical: absoluteUrl("/cloud") },
};

const pillars = [
  {
    icon: Database,
    status: "In design",
    title: "Research library",
    copy: "Every engagement the plugin runs — evidence ledgers, desk findings, screenshots, launch kits — synced to one workspace. Browse by product, share a kit with a link, and never lose a sweep to a laptop again.",
    points: ["Sync from the plugin with one command", "Hosted, shareable launch kits", "Evidence records with source screenshots"],
  },
  {
    icon: Clapperboard,
    status: "In design",
    title: "Asset studio",
    copy: "Your kit already contains the image prompts and campaign formats. The studio executes them — hero images, social proof cards, and launch-film drafts — versioned, stored, and ready to download.",
    points: ["Images from your kit's own prompts", "Image-to-video launch clips", "Evidence packs: captioned screenshots for social proof"],
  },
  {
    icon: FlaskConical,
    status: "In private beta",
    title: "Research Intelligence",
    copy: "A hosted reranker that upgrades the plugin's relevance judging — the LLM key lives on our servers, never on your machine. Connect with one command; disconnect anytime and the plugin falls back to local ranking.",
    points: ["npx pmm-os research-connect — that's the whole setup", "No AI key on your machine, ever", "Per-account rate limits and controls"],
  },
];

const principles = [
  {
    icon: Terminal,
    title: "The plugin stays the engine",
    copy: "Research keeps running locally in Claude Code / Codex with your own sessions and your own model subscription. Cloud never sees a password and never runs your research for you.",
  },
  {
    icon: Share2,
    title: "Cloud is the memory",
    copy: "What a terminal can't do: durable history across engagements, sharing with teammates, and media generation. That's Cloud's whole job — nothing moves there that works better locally.",
  },
  {
    icon: Camera,
    title: "Evidence stays evidence",
    copy: "Synced records keep their source URLs, capture dates, and claim types. A shared kit shows the same citations the plugin produced — trust travels with the work.",
  },
];

export default function CloudPage() {
  return (
    <UsertourPageShell>
      <section className="ut-subhero">
        <div className="ut-hero-aurora" />
        <div className="ut-shell ut-subhero-inner">
          <Badge>PMM OS Cloud · waitlist open</Badge>
          <h1 className="ut-gradient-text">The web app your terminal can&apos;t be</h1>
          <p>
            The plugin does the research and writes the strategy — locally, free, yours. Cloud is
            the companion we&apos;re building for everything after: a synced library of every
            engagement, an asset studio that turns kits into images and launch videos, and a hosted
            research reranker.
          </p>
          <CloudWaitlistForm source="cloud-hero" />
          <p className="ut-waitlist-note">No spam — one email when your invite is ready.</p>
        </div>
      </section>

      <section className="ut-page-section">
        <div className="ut-shell ut-section-heading">
          <h2 className="ut-gradient-text">Three things, done properly</h2>
          <p>Each ships when it&apos;s production-ready — statuses below are the honest ones.</p>
        </div>
        <div className="ut-shell ut-cloud-grid">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title}>
                <span className="ut-cloud-status">{pillar.status}</span>
                <span className="ut-point-icon">
                  <Icon size={24} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
                <ul>
                  {pillar.points.map((point) => (
                    <li key={point}>
                      <Sparkles aria-hidden="true" size={14} />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ut-page-section is-tight">
        <div className="ut-shell ut-cloud-preview">
          <div>
            <Badge>From the kit to the campaign</Badge>
            <h2 className="ut-gradient-text">Your strategy already wrote the brief</h2>
            <p className="ut-muted">
              A PMM OS launch kit carries positioning, campaign formats, and image prompts. Cloud
              picks up exactly there — the same evidence-cited kit becomes the hero image, the
              social proof pack, and the fifteen-second launch film. One source, now with media.
            </p>
          </div>
          <div className="ut-feature-visual">
            <Image
              alt="A PMM OS launch kit campaign view — the source the asset studio executes"
              height={620}
              src="/images/launch-kit/market-desk.png"
              width={900}
            />
          </div>
        </div>
      </section>

      <section className="ut-page-section is-tight">
        <div className="ut-shell ut-section-heading">
          <h2 className="ut-gradient-text">How it holds together</h2>
          <p>The split that keeps your data yours.</p>
        </div>
        <div className="ut-shell ut-cloud-principles">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
                <span className="ut-point-icon">
                  <Icon size={22} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ut-page-section">
        <div className="ut-shell ut-cloud-cta">
          <Wand2 aria-hidden="true" size={26} />
          <h2 className="ut-gradient-text">Be first in when it opens</h2>
          <p>
            The waitlist is the only queue — no tiers, no tricks. Plugin users get invited in the
            order they signed up.
          </p>
          <CloudWaitlistForm source="cloud-footer" />
        </div>
      </section>
    </UsertourPageShell>
  );
}
