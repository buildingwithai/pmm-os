import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Check,
  ChevronDown,
  Command,
  DollarSign,
  FileText,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Megaphone,
  Menu,
  Presentation,
  Rocket,
  ScrollText,
  Search,
  Send,
  Sparkles,
  Star,
  Swords,
  Target,
  Terminal,
  Users,
  Waypoints,
} from "lucide-react";
import { TerminalRun } from "@/components/terminal-run";
import type { FeatureSection, TechItem } from "@/types/usertour";

const GITHUB_URL = "https://github.com/buildingwithai/pmm-os";

const menuGroups = [
  {
    label: "Workflows",
    items: [
      { title: "Positioning", copy: "April Dunford–style, then a message house.", href: "/features#positioning", icon: Target },
      { title: "Messaging & personas", copy: "ICP, JTBD, value props, variants.", href: "/features#messaging", icon: Users },
      { title: "Pricing & packaging", copy: "Tiers, value metrics, willingness to pay.", href: "/features#pricing", icon: DollarSign },
      { title: "Competitive intel", copy: "Battlecards and win/loss narratives.", href: "/features#competitive", icon: Swords },
      { title: "GTM & launch", copy: "Tiered launch plans and rollout.", href: "/features#gtm", icon: Rocket },
      { title: "Research desks", copy: "Ten desks, every platform, cited evidence.", href: "/features#research", icon: Search },
    ],
  },
  {
    label: "The launch kit",
    items: [
      { title: "Interactive app", copy: "Sidebar · main · inspector, ⌘K palette.", href: "/features#launch-kit", icon: LayoutDashboard },
      { title: "Modeless editor", copy: "Inline edit, slash blocks, turn-into.", href: "/features#editor", icon: Blocks },
      { title: "Anchored comments", copy: "Highlight → comment, reorder-safe.", href: "/features#comments", icon: MessageSquare },
      { title: "One source, many exports", copy: "HTML · Markdown · pptx deck.", href: "/features#exports", icon: Presentation },
    ],
  },
  {
    label: "Resources",
    items: [
      { title: "Documentation", copy: "Install, skills, and the launch kit.", href: "/docs", icon: ScrollText },
      { title: "Blog", copy: "Playbooks and release notes.", href: "/blog", icon: Send },
      { title: "PMM OS Cloud", copy: "The web app: research library + asset studio.", href: "/cloud", icon: Sparkles },
      { title: "Pricing", copy: "Plugin free forever · Cloud coming.", href: "/pricing", icon: LayoutDashboard },
      { title: "Support", copy: "Setup help and issues.", href: "/support", icon: LifeBuoy },
      { title: "GitHub", copy: "Source, releases, marketplace.", href: GITHUB_URL, icon: Search },
    ],
  },
];

const headerLinks = [
  { label: "Skills", href: "/features" },
  { label: "Cloud", href: "/cloud" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
];

const featureSections: FeatureSection[] = [
  {
    eyebrow: "45 skills",
    title: "The whole GTM motion, in one plugin",
    description:
      "Positioning, messaging, personas, pricing, competitive intel, launch planning, PLG, and sales enablement — 45 skills that share one product context and route to the right deliverable.",
    points: [
      {
        title: "Orchestrated, not à la carte",
        description:
          "The agentic-marketing-orchestrator sequences skills into a real workflow and ends by packaging everything into the launch kit.",
        icon: Waypoints,
      },
      {
        title: "Grounded in your product",
        description:
          "A shared product-context skill keeps positioning, messaging, and pricing consistent across every artifact you generate.",
        icon: Target,
      },
    ],
    image: "/images/launch-kit/overview.png",
    imageAlt: "PMM OS launch kit — overview",
  },
  {
    eyebrow: "Launch kit",
    title: "An interactive launch kit, not a doc dump",
    description:
      "Your PMM work becomes a single self-contained HTML app: a left sidebar, a main workspace, and an inspector — with a command palette, present mode, and a modeless, Notion-style editor.",
    points: [
      {
        title: "Modeless editing",
        description:
          "Every block is inline-editable — no edit button. Type “/” to insert blocks, select to format, and “turn into” to convert.",
        icon: Blocks,
      },
      {
        title: "Highlight → comment",
        description:
          "Select any text to leave a comment anchored to that block. Comments survive reorders and stream into a running notebook.",
        icon: MessageSquare,
      },
    ],
    image: "/images/launch-kit/positioning.png",
    imageAlt: "PMM OS launch kit — modeless editor and comments",
    reverse: true,
  },
  {
    eyebrow: "One source",
    title: "One source, many outputs",
    description:
      "Everything regenerates from a single kit-content.json. A uniform block registry turns it into the interactive app, markdown mirrors, and a Marp slide deck — so a new export target is one serializer away.",
    points: [
      {
        title: "Uniform block model",
        description:
          "Blocks are { id, type, … }. Render, markdown, slash menu, and “turn into” all flow from one registry — add a type in one place.",
        icon: Layers,
      },
      {
        title: "Edit once, ship everywhere",
        description:
          "Change the strategy and the site, the deck, and the docs all update. Export a real .pptx with marp-cli straight from the blocks.",
        icon: Presentation,
      },
    ],
    image: "/images/launch-kit/pricing.png",
    imageAlt: "PMM OS launch kit — pricing section",
  },
  {
    eyebrow: "10 research desks",
    title: "Research that would survive a consulting review",
    description:
      "Ten specialist desks — customer, competitive, market, pricing, channels, KOL, events, reviews, GTM, product — each opens its own hypothesis, sweeps its platform matrix, and writes typed, dated, cited evidence into one ledger before any strategy is written.",
    points: [
      {
        title: "Every platform, judged for relevance",
        description:
          "Reddit, X, TikTok, Instagram, YouTube (full transcripts), LinkedIn, Hacker News, GitHub, review sites, and the web — every candidate is judged against the desk\u2019s hypothesis before it becomes evidence. Noise never counts as coverage.",
        icon: Search,
      },
      {
        title: "Sign in with your sessions, never passwords",
        description:
          "Social research uses the browser sessions you already have. If one expires, the desk names the fix, degrades to public reads, and keeps going \u2014 a dead session never kills a run.",
        icon: Check,
      },
    ],
    image: "/images/launch-kit/events-desk.png",
    imageAlt: "PMM OS research desk \u2014 ranked events table with sourced evidence",
    reverse: true,
  },
  {
    eyebrow: "Local & yours",
    title: "Runs in your terminal",
    description:
      "PMM OS is a Claude Code / Codex plugin — not a SaaS. It runs locally, your data never leaves your machine, and the generator has zero runtime dependencies.",
    points: [
      {
        title: "Zero-dependency generator",
        description:
          "The launch-kit builder uses Node built-ins only. Clone, run one command, and open the kit — no install ceremony.",
        icon: Terminal,
      },
      {
        title: "Your data stays local",
        description:
          "Skills run inside Claude Code on your machine. No accounts, no upload, no lock-in — it’s open-source on GitHub.",
        icon: FileText,
      },
    ],
    image: "/images/launch-kit/competitive.png",
    imageAlt: "PMM OS launch kit — competitive section",
    reverse: true,
  },
];

const techItems: TechItem[] = [
  { name: "Product Marketing", description: "Positioning, messaging, narrative, and launch briefs.", href: "/features#positioning", tone: "dark" },
  { name: "GTM Engineering", description: "ICP scoring, signal campaigns, account research, outreach.", href: "/features#gtm", tone: "blue" },
  { name: "PLG & Growth", description: "Activation, onboarding, growth loops, and metric trees.", href: "/features#plg", tone: "cyan" },
  { name: "Competitive Intel", description: "Battlecards, comparison pages, and win/loss synthesis.", href: "/features#competitive", tone: "dark" },
  { name: "Pricing & Packaging", description: "Tiers, value metrics, and willingness-to-pay analysis.", href: "/features#pricing", tone: "violet" },
  { name: "Launch Kit Factory", description: "Interactive HTML, markdown mirrors, and a pptx deck.", href: "/features#launch-kit", tone: "orange" },
];

const faqs = [
  {
    question: "What is PMM OS?",
    answer:
      "A Claude Code / Codex plugin: 45 product-marketing, GTM, and PLG skills, two built-in research engines, and an interactive launch-kit workspace generator. It turns a product brief into positioning, messaging, personas, pricing, competitive intel, and a shippable launch kit — without leaving your terminal.",
  },
  {
    question: "How do I install it?",
    answer:
      "One command: npx pmm-os install — it registers the plugin with Claude Code for you. (Or add it straight from GitHub: /plugin marketplace add buildingwithai/pmm-os.) Then invoke a skill like /product-marketing-os inside Claude Code.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes. PMM OS is open-source (MIT) and free to install from npm or GitHub. There’s no SaaS account, seat, or session metering.",
  },
  {
    question: "Does my data leave my machine?",
    answer:
      "No. The skills run locally inside Claude Code and the launch-kit generator is zero-dependency Node. Nothing is uploaded — your product strategy stays on your machine.",
  },
  {
    question: "What exactly is the launch kit?",
    answer:
      "A single self-contained HTML app — sidebar, main workspace, inspector, command palette, present mode, and a modeless Notion-style editor — generated from one kit-content.json. The same source also emits markdown mirrors and a Marp slide deck you can export to .pptx.",
  },
  {
    question: "How does the research actually work?",
    answer:
      "A research brief plans ten specialist desks scoped to your product. Each desk opens a mini-hypothesis, fans out 15\u201330 engine calls across its platform matrix \u2014 Reddit, X, TikTok, Instagram, YouTube (with full video transcripts), LinkedIn, Hacker News, GitHub, review sites, and the web \u2014 judges every candidate for relevance, and writes typed, dated, cited evidence into one ledger. Strategy skills are gated on that evidence: no research, no deliverable.",
  },
  {
    question: "How do social sign-ins work?",
    answer:
      "You never type a password into the plugin. It reads the sessions you\u2019re already logged into in your browser (X, Instagram, TikTok, LinkedIn) via one setup command per platform. If a session expires mid-run, the desk tells you exactly which state you\u2019re in and the one-line fix, then degrades to public reads and keeps going.",
  },
  {
    question: "Can I edit the output, or is it static?",
    answer:
      "It’s fully editable. Inline modeless editing, slash-insert blocks, “turn into”, drag-reorder, move-to-section, and anchored comments all write back to the single source, so every output regenerates in sync.",
  },
];

const footerGroups = [
  ["Plugin", "Skills", "Research desks", "Launch kit", "Install"],
  ["Workflows", "Positioning", "Messaging", "Pricing", "Competitive", "GTM"],
  ["Resources", "Documentation", "Cloud", "Blog", "Support", "GitHub"],
  ["Company", "About", "Privacy", "Terms", "License"],
];

function ButtonLink({
  children,
  href = "#",
  variant = "primary",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  if (href.startsWith("http")) {
    return (
      <a className={`ut-button ut-button-${variant}`} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link className={`ut-button ut-button-${variant}`} href={href}>
      {children}
    </Link>
  );
}

export function UsertourHome() {
  return (
    <main className="ut-page">
      <Header />
      <Hero />
      <StatsStrip />
      <PipelineSection />
      <Testimonial />
      {featureSections.map((section) => (
        <FeatureBlock key={section.title} section={section} />
      ))}
      <TechStack />
      <FaqSection />
      <BottomCta />
      <Footer />
    </main>
  );
}

function Wordmark() {
  return (
    <span className="ut-logo-text" aria-hidden="true">
      <Command size={20} />
      <strong>PMM OS</strong>
    </span>
  );
}

/** Clerk's hosted sign-up portal, derived from the publishable key
    (pk_test_<base64 of frontend-api domain>). No key → /app, which shows the
    workspace's own not-wired state. */
function signUpUrl(): string {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) return "/app";
  try {
    const domain = atob(pk.split("_")[2]).replace(/\$$/, ""); // e.g. pleasing-akita-1.clerk.accounts.dev
    const portal = domain.replace(".clerk.accounts.dev", ".accounts.dev");
    const back = encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || "https://pmm-os-green.vercel.app") + "/app");
    return `https://${portal}/sign-up?redirect_url=${back}`;
  } catch {
    return "/app";
  }
}

export function Header() {
  return (
    <header className="ut-header">
      <div className="ut-shell ut-header-inner">
        <Link className="ut-logo" href="/" aria-label="PMM OS home">
          <Wordmark />
        </Link>
        <details className="ut-mobile-nav">
          <summary aria-label="Open navigation">
            <Menu size={21} />
          </summary>
          <div className="ut-mobile-nav-panel">
            {menuGroups.map((group) => (
              <div className="ut-mobile-nav-group" key={group.label}>
                <strong>{group.label}</strong>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a href={item.href} key={item.title}>
                      <Icon size={17} />
                      <span>{item.title}</span>
                    </a>
                  );
                })}
              </div>
            ))}
            <div className="ut-mobile-nav-row">
              {headerLinks.map((item) => (
                <a href={item.href} key={item.label}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </details>
        <nav className="ut-nav" aria-label="Main navigation">
          {menuGroups.map((group) => (
            <div className="ut-nav-menu" key={group.label}>
              <button aria-expanded="false" className="ut-nav-trigger" type="button">
                {group.label}
                <ChevronDown size={14} />
              </button>
              <div className="ut-nav-panel">
                <div className={`ut-nav-panel-grid ${group.items.length > 4 ? "is-wide" : ""}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a href={item.href} key={item.title}>
                        <span>
                          <Icon size={18} />
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.copy}</small>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {headerLinks.map((item) => (
            <a className="ut-nav-link" href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ut-header-actions">
          <a className="ut-github-link" href={GITHUB_URL} aria-label="GitHub">
            <GitHubMark />
          </a>
          <Link className="ut-nav-link" href="/app">Sign in</Link>
          <ButtonLink href={signUpUrl()}>Sign up</ButtonLink>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="ut-hero">
      <div className="ut-hero-aurora" />
      <div className="ut-shell ut-hero-inner">
        <Badge>Claude Code · Codex plugin</Badge>
        <h1 className="ut-gradient-text">The Product Marketing OS for your terminal</h1>
        <p className="ut-hero-copy">
          45 PMM, GTM, and PLG skills with a built-in research pipeline: ten specialist desks
          sweep Reddit, X, TikTok, Instagram, YouTube, LinkedIn, review sites, and the web —
          with full video transcripts — then turn the evidence into positioning, messaging,
          pricing, and competitive intel, packaged as an interactive launch-kit workspace.
          Every claim cited. Open-source, local, no SaaS.
        </p>
        <div className="ut-hero-install" aria-label="Install command">
          <span className="ut-install-prompt">$</span>
          <span>npx pmm-os install</span>
        </div>
        <div className="ut-hero-actions">
          <ButtonLink href={GITHUB_URL}>
            Install the plugin
            <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink href="/features" variant="secondary">Browse the 45 skills</ButtonLink>
          <ButtonLink href="/launch-kit/index.html" variant="secondary">Open the launch kit ↗</ButtonLink>
          <ButtonLink href={GITHUB_URL} variant="ghost">
            <Star size={17} />
            Star on GitHub
          </ButtonLink>
        </div>
        <div className="ut-product-frame">
          <div className="ut-product-tabs">
            {["Overview", "Positioning", "Messaging", "Pricing", "Competitive", "Launch plan"].map((item) => (
              <span key={item}>
                <Sparkles size={14} />
                {item}
              </span>
            ))}
          </div>
          <iframe
            className="ut-product-embed"
            src="/launch-kit/index.html"
            title="Interactive launch kit — live demo"
            loading="lazy"
          />
          <p className="ut-product-caption">
            Live, interactive — this is the launch kit the plugin generates. Click around, hit ⌘K, or press Present.
          </p>
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="ut-testimonial">
      <div className="ut-shell ut-quote-card">
        <p>
          We replaced a folder of stale Google Docs with one source of truth that regenerates the
          whole launch kit — the site, the deck, and the docs — every time the strategy changes. The
          first launch brief took an afternoon instead of a sprint.
        </p>
        <div className="ut-person">
          <span className="ut-person-mark" aria-hidden="true">
            <Megaphone size={26} />
          </span>
          <div>
            <strong>Built with PMM OS</strong>
            <span>The launch kit, generated by the plugin</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const STATS: Array<[string, string]> = [
  ["45", "skills, one orchestrator"],
  ["10", "research desks per engagement"],
  ["15+", "platforms swept, video included"],
  ["1", "command to install"],
];

function StatsStrip() {
  return (
    <section aria-label="PMM OS in numbers" className="ut-stats">
      <div className="ut-shell ut-stats-row">
        {STATS.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const DESKS = [
  "Product",
  "Customer",
  "Competitive",
  "Market",
  "Pricing",
  "Channels",
  "KOL",
  "Events",
  "Reviews",
  "GTM",
];

function PipelineSection() {
  return (
    <section className="ut-pipeline">
      <div className="ut-shell ut-section-heading">
        <h2 className="ut-gradient-text">Watch a run, end to end</h2>
        <p>
          One sentence in. Ten specialist desks sweep every platform your buyers are on, judge
          every candidate against the hypothesis, and write cited evidence — then the strategy
          skills build on it. This is a real run’s shape, replayed.
        </p>
      </div>
      <div className="ut-shell ut-pipeline-grid">
        <TerminalRun />
        <div className="ut-pipeline-side">
          <div className="ut-pipeline-step">
            <span className="ut-pipeline-num">1</span>
            <div>
              <h3>Brief becomes a plan</h3>
              <p>Scope, hypothesis, and kill-conditions before a single engine call.</p>
            </div>
          </div>
          <div className="ut-pipeline-step">
            <span className="ut-pipeline-num">2</span>
            <div>
              <h3>Ten desks, in sprints</h3>
              <p>Each desk’s findings re-scope the next — the sweep compounds.</p>
              <div className="ut-desk-chips" aria-label="The ten research desks">
                {DESKS.map((desk) => (
                  <span key={desk}>{desk}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="ut-pipeline-step">
            <span className="ut-pipeline-num">3</span>
            <div>
              <h3>Evidence, then strategy</h3>
              <p>
                Typed, dated, cited records gate every deliverable — no research, no
                positioning. The kit ships with its sources attached.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({ section }: { section: FeatureSection }) {
  return (
    <section className="ut-feature">
      <div className={`ut-shell ut-feature-grid ${section.reverse ? "is-reverse" : ""}`}>
        <div className="ut-feature-copy">
          <Badge>{section.eyebrow}</Badge>
          <h2 className="ut-gradient-text">{section.title}</h2>
          <p className="ut-muted">{section.description}</p>
          <div className="ut-point-list">
            {section.points.map((point) => (
              <article key={point.title}>
                <span className="ut-point-icon">
                  <point.icon size={24} />
                </span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="ut-feature-visual">
          <Image src={section.image} alt={section.imageAlt} width={900} height={620} />
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="ut-tech">
      <div className="ut-shell">
        <div className="ut-section-heading">
          <h2 className="ut-gradient-text">What&apos;s inside</h2>
          <p>45 skills across the full go-to-market motion — each one grounded in your product and routed by the orchestrator.</p>
        </div>
        <div className="ut-tech-grid">
          {techItems.map((item) => (
            <Link className={`ut-tech-card tone-${item.tone}`} href={item.href} key={item.name}>
              <span>
                <Sparkles size={20} />
              </span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="ut-faq">
      <div className="ut-shell">
        <div className="ut-section-heading">
          <Badge>FAQ</Badge>
          <h2 className="ut-gradient-text">Frequently asked questions</h2>
          <p>Everything you need to know about PMM OS. Can&apos;t find what you&apos;re looking for? Open an issue on GitHub.</p>
        </div>
        <div className="ut-faq-list">
          {faqs.map((item) => (
            <details className="ut-faq-item" key={item.question}>
              <summary>
                <span>{item.question}</span>
                <ChevronDown size={20} />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCta() {
  return (
    <section className="ut-bottom-cta">
      <div className="ut-bottom-overlay" />
      <div className="ut-shell ut-bottom-content">
        <h2 className="ut-gradient-text">Ship your next launch from the terminal</h2>
        <p>Install PMM OS and turn your product brief into an interactive launch kit in an afternoon.</p>
        <div className="ut-hero-actions">
          <ButtonLink href={GITHUB_URL}>
            Install the plugin
            <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink href={GITHUB_URL} variant="secondary">
            <GitHubMark />
            Star on GitHub
          </ButtonLink>
        </div>
        <div className="ut-trust">
          <span>
            <Check size={16} />
            Open-source &amp; free
          </span>
          <span>
            <Check size={16} />
            Runs locally — your data stays yours
          </span>
        </div>
      </div>
    </section>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="ut-eyebrow">
      <Sparkles size={16} />
      <span>{children}</span>
    </div>
  );
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.36 6.84 9.72.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.28 9.28 0 0 1 12 6.99c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.95.68 1.92v2.78c0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="ut-footer">
      <div className="ut-shell ut-footer-grid">
        <div className="ut-footer-brand">
          <Wordmark />
          <p>42 product-marketing, GTM &amp; PLG skills for Claude Code — turn a brief into positioning, messaging, pricing, competitive intel, and an interactive launch kit.</p>
        </div>
        {footerGroups.map(([title, ...links]) => (
          <div className="ut-footer-group" key={title}>
            <h3>{title}</h3>
            {links.map((link) => (
              <a href={footerHref(link)} key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="ut-shell ut-footer-bottom">
        <span>&copy; 2026 PMM OS. Open-source.</span>
        <span>
          <a href="/privacy">Privacy</a>&nbsp;&nbsp; <a href="/terms">Terms</a>&nbsp;&nbsp; <a href="/license">License</a>
        </span>
      </div>
    </footer>
  );
}

function footerHref(label: string) {
  const slug = label.toLowerCase().replaceAll(" ", "-");
  if (label === "Pricing") return "/pricing";
  if (label === "Documentation" || label === "Install") return "/docs";
  if (label === "Blog") return "/blog";
  if (label === "Support") return "/support";
  if (label === "GitHub") return GITHUB_URL;
  if (label === "Skills") return "/features";
  if (label === "Launch kit") return "/features#launch-kit";
  if (label === "Changelog") return "/blog";
  if (["Positioning", "Messaging", "Pricing", "Competitive", "GTM"].includes(label)) return `/features#${slug}`;
  if (label === "About") return "/about";
  if (label === "Privacy") return "/privacy";
  if (label === "Terms") return "/terms";
  if (label === "License") return "/license";
  return "#";
}
