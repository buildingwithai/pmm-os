import type { LucideIcon } from "lucide-react";
import {
  Search,
  Blocks,
  Code2,
  FileText,
  GitBranch,
  Layers3,
  MessageSquare,
  Rocket,
  ScrollText,
  Server,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  date: string;
  summary: string;
  author: string;
  readTime: string;
  image: string;
  accent: "violet" | "blue" | "mist" | "green" | "purple" | "navy";
};

export type ArticleText =
  | string
  | Array<
      | string
      | {
          type: "link";
          text: string;
          href: string;
        }
    >;

export type ArticleBlock =
  | { type: "paragraph"; text: ArticleText }
  | { type: "heading"; id: string; title: string }
  | { type: "subheading"; id: string; title: string }
  | { type: "list"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "callout"; text: ArticleText }
  | { type: "leadQuestion"; text: string }
  | { type: "figure"; src: string; alt: string; caption: string }
  | {
      type: "linkList";
      items: Array<{
        label: string;
        href: string;
        description: string;
      }>;
    };

export type ArticleContent = {
  slug: string;
  toc: Array<{ id: string; title: string }>;
  blocks: ArticleBlock[];
};

export type CardItem = {
  title: string;
  copy: string;
  icon: LucideIcon;
};

export type FeatureDetail = CardItem & {
  id: string;
  image: string;
  points: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "one-source-of-truth-for-launches",
    category: "Playbook",
    title: "Your launch doc dies in a Drive folder. Here's the fix.",
    date: "June 12, 2026",
    summary:
      "Most launches are run from a sprawl of stale Google Docs, decks, and Notion pages that drift apart the moment the strategy changes. A single source of truth that regenerates every artifact fixes it. Here's how PMM OS does it.",
    author: "PMM OS",
    readTime: "8 min read",
    image: "/images/launch-kit/overview.png",
    accent: "violet",
  },
  {
    slug: "positioning-before-messaging",
    category: "Positioning",
    title: "Positioning before messaging: the order most teams get wrong",
    date: "June 9, 2026",
    summary:
      "Teams jump straight to taglines and homepage copy without doing the positioning work underneath. The result is messaging that sounds nice and converts no one. A walkthrough of the right order — and how to run it as skills.",
    author: "PMM OS",
    readTime: "9 min read",
    image: "/images/launch-kit/positioning.png",
    accent: "blue",
  },
  {
    slug: "gtm-from-the-terminal",
    category: "Workflow",
    title: "Run your whole GTM motion from the terminal",
    date: "June 5, 2026",
    summary:
      "Product marketing is mostly structured thinking plus a lot of artifact production. That's exactly what a plugin of 45 skills, grounded in your product context and routed by an orchestrator, is good at. A tour of the workflow.",
    author: "PMM OS",
    readTime: "7 min read",
    image: "/images/launch-kit/competitive.png",
    accent: "green",
  },
  {
    slug: "one-source-many-outputs",
    category: "Engineering",
    title: "One source, many outputs: a uniform block model for launch content",
    date: "May 30, 2026",
    summary:
      "An interactive site, clean markdown, and a real .pptx deck — all from one JSON file. The trick is a uniform block registry where render, markdown, slash menu, and exports flow from a single contract. Here's the design.",
    author: "PMM OS",
    readTime: "8 min read",
    image: "/images/launch-kit/pricing.png",
    accent: "purple",
  },
];

export const articleContents: Record<string, ArticleContent> = {
  "one-source-of-truth-for-launches": {
    slug: "one-source-of-truth-for-launches",
    toc: [
      { id: "sprawl", title: "The artifact sprawl problem" },
      { id: "drift", title: "Why everything drifts" },
      { id: "source", title: "One source, regenerated" },
      { id: "kit", title: "What the launch kit actually is" },
      { id: "practice", title: "Putting it into practice" },
    ],
    blocks: [
      { type: "paragraph", text: "Every product launch produces the same mess: a positioning doc here, a messaging doc there, a pricing spreadsheet, a competitive battlecard, a deck for the sales team, a one-pager for the website, and a Slack thread where half the real decisions actually live. Each one starts as a copy of the last, and within two weeks they disagree with each other." },
      { type: "leadQuestion", text: "If you changed your positioning today, how many separate documents would you have to hunt down and update by hand?" },
      { type: "heading", id: "sprawl", title: "The artifact sprawl problem" },
      { type: "paragraph", text: "The number is usually somewhere between five and fifteen. That's the artifact sprawl problem: the same handful of strategic decisions — who it's for, what it replaces, why it wins, what it costs — get re-typed into a dozen formats, owned by different people, living in different tools." },
      { type: "paragraph", text: "Sprawl isn't a tidiness issue. It's a correctness issue. When the sales deck says one thing and the website says another, the gap doesn't show up in a review — it shows up in a lost deal." },
      { type: "list", items: [
        "Positioning lives in a doc nobody opens after week one.",
        "Messaging gets copied into the homepage and then edited only on the homepage.",
        "The deck is a fork of a fork of last quarter's deck.",
        "Pricing is a spreadsheet the deck screenshots once and never re-checks.",
      ] },
      { type: "heading", id: "drift", title: "Why everything drifts" },
      { type: "paragraph", text: "Documents drift because the cost of keeping them in sync is paid by a human, manually, every time anything changes — and that cost is always higher than the perceived cost of letting one doc go stale. So they all go stale, just at different rates." },
      { type: "callout", text: "The fix isn't discipline. Discipline doesn't scale, and it's the first thing to go under launch pressure. The fix is structural: make the artifacts derive from one source instead of being maintained in parallel." },
      { type: "heading", id: "source", title: "One source, regenerated" },
      { type: "paragraph", text: "The alternative is the pattern every modern toolchain already uses: keep the truth in one structured place, and generate every surface from it. Code generates its own docs. Design tokens generate themes. Your launch artifacts can work the same way." },
      { type: "paragraph", text: "In PMM OS, the truth is a single structured file. From it, the plugin regenerates an interactive HTML hub, a clean markdown mirror of every section, and a slide deck you can export to PowerPoint. Change the positioning once and all three update — because they were never separate documents in the first place." },
      { type: "numbered", items: [
        "Capture the strategy as structured content, not prose scattered across tools.",
        "Generate the interactive kit, the markdown, and the deck from it.",
        "Edit in the kit; every output regenerates from the same source.",
        "Share one link instead of attaching five files that will disagree by Friday.",
      ] },
      { type: "heading", id: "kit", title: "What the launch kit actually is" },
      { type: "paragraph", text: "The interactive kit is a single self-contained HTML app — a left sidebar of sections, a main workspace, and an inspector — with a command palette and a present mode for when you need to walk a room through it. It opens in any browser with no build step and no dependencies." },
      { type: "paragraph", text: "Crucially, it's editable. Every block is inline-editable, you can insert blocks with a slash menu, convert a block from one type to another, and leave comments anchored to specific text. Those edits write back to the one source — so the kit isn't a read-only export, it's the working surface." },
      { type: "heading", id: "practice", title: "Putting it into practice" },
      { type: "paragraph", text: "Start with your next launch, not a retroactive cleanup. Run the positioning and messaging skills, let them populate the kit, then edit it live with the people who own the launch. When pricing shifts the week before go-live — and it will — you change it once and re-export the deck instead of reconciling five files at 11pm." },
      { type: "callout", text: "The goal isn't a prettier document. It's removing the manual sync tax entirely, so the deck, the site, and the docs can't disagree." },
    ],
  },
  "positioning-before-messaging": {
    slug: "positioning-before-messaging",
    toc: [
      { id: "confusion", title: "Positioning vs. messaging" },
      { id: "skip", title: "What happens when you skip it" },
      { id: "order", title: "The right order" },
      { id: "skills", title: "Running it as skills" },
    ],
    blocks: [
      { type: "paragraph", text: "Ask ten teams to improve their messaging and nine will start rewriting the homepage headline. It feels like progress because words change. But messaging is the surface — it only works when there's a stable foundation underneath it, and that foundation is positioning." },
      { type: "leadQuestion", text: "Could a stranger read your homepage and correctly say who the product is for and what it replaces? If not, the problem isn't the words." },
      { type: "heading", id: "confusion", title: "Positioning vs. messaging" },
      { type: "paragraph", text: "Positioning is a set of decisions: who the best-fit customer is, what competitive alternatives they're weighing, the unique attributes you have that the alternatives don't, the value those attributes enable, and the market category you're framing yourself in. It's strategy, and most of it never ships verbatim." },
      { type: "paragraph", text: "Messaging is the expression of those decisions for a specific audience and channel — the value proposition, the benefits, the proof, the words on the page. It's downstream by definition." },
      { type: "callout", text: "If you can't write your positioning down as decisions, your messaging is improvisation. It might sound good. It won't be consistent, and it won't compound." },
      { type: "heading", id: "skip", title: "What happens when you skip it" },
      { type: "paragraph", text: "When teams skip positioning, the symptoms are predictable. Every stakeholder has a different one-liner. The homepage reads as a feature list because nobody agreed on the single most important thing. Sales invents their own pitch because the official one doesn't survive contact with a real buyer." },
      { type: "list", items: [
        "Three people describe the product three different ways in the same meeting.",
        "The homepage leads with features because no value theme was chosen.",
        "Competitive comparisons feel defensive instead of confident.",
        "New hires take months to learn 'how we talk about this.'",
      ] },
      { type: "heading", id: "order", title: "The right order" },
      { type: "paragraph", text: "The sequence that actually compounds: establish the competitive alternatives first, because your value only means something relative to what the customer would otherwise do. Then name your unique attributes, map them to value, pick the value themes that matter most to your best-fit segment, and only then choose the market category that makes those themes obvious." },
      { type: "numbered", items: [
        "List the real competitive alternatives — including 'do nothing in a spreadsheet.'",
        "Name the attributes you have that those alternatives don't.",
        "Translate each attribute into the value it enables.",
        "Choose the value themes your best-fit customer cares about most.",
        "Frame the market category that makes those themes the obvious lens.",
      ] },
      { type: "paragraph", text: "Messaging comes after all of that, and it gets dramatically easier — because now you're expressing decisions, not making them on the fly in a copy doc." },
      { type: "heading", id: "skills", title: "Running it as skills" },
      { type: "paragraph", text: "This is exactly the kind of structured-thinking-plus-artifact work that breaks down cleanly into skills. A positioning exercise produces the decisions; a positioning audit pressure-tests them for whitespace and differentiation; a messaging hierarchy turns the approved positioning into a point of view, value props, benefits, proof, and persona variants." },
      { type: "callout", text: "Do positioning once, audit it, then let messaging derive from it. When the positioning changes, the messaging regenerates from the new foundation instead of being hand-patched in twelve places." },
    ],
  },
  "gtm-from-the-terminal": {
    slug: "gtm-from-the-terminal",
    toc: [
      { id: "shape", title: "The shape of PMM work" },
      { id: "context", title: "Grounded in one product context" },
      { id: "orchestrator", title: "The orchestrator" },
      { id: "local", title: "Local, and yours" },
    ],
    blocks: [
      { type: "paragraph", text: "Strip product marketing down to its mechanics and you find two things repeated over and over: structured thinking (positioning, segmentation, narrative) and artifact production (briefs, battlecards, decks, pages). Both are exactly what a coding-assistant plugin is good at — if the skills are designed for it." },
      { type: "heading", id: "shape", title: "The shape of PMM work" },
      { type: "paragraph", text: "A launch isn't one task. It's a sequence: understand the product, define the audience, position it, build the messaging, check the competition, set the pricing story, plan the rollout, and package the whole thing for the people who'll execute. Each step has a known shape and a known output." },
      { type: "list", items: [
        "Product context — the shared brief every other step reads from.",
        "ICP and personas — who, and what they're trying to get done.",
        "Positioning and messaging — the foundation and its expression.",
        "Competitive and pricing — how you win and what it costs.",
        "Launch plan and enablement — who does what, by when.",
      ] },
      { type: "heading", id: "context", title: "Grounded in one product context" },
      { type: "paragraph", text: "The failure mode of 'AI for marketing' is generic output — confident paragraphs that could describe any product. The cure is grounding. A shared product-context artifact captures what the product actually is, and every downstream skill reads from it, so the positioning, the messaging, and the pricing all describe the same product instead of three slightly different ones." },
      { type: "callout", text: "Generic output isn't a model problem. It's a grounding problem. Give every skill the same source of product truth and the output stops sounding like a press release for a company that doesn't exist." },
      { type: "heading", id: "orchestrator", title: "The orchestrator" },
      { type: "paragraph", text: "Individual skills are useful, but the leverage is in the sequence. An orchestrator routes the work end-to-end: it knows that messaging depends on positioning, that the battlecard wants the competitive research, and that the last step is packaging everything into the launch kit. You describe the product; it runs the motion." },
      { type: "numbered", items: [
        "Establish product context once.",
        "Generate positioning, then messaging on top of it.",
        "Produce personas, competitive intel, and the pricing story.",
        "Plan the launch and the enablement.",
        "Package it all into the interactive launch kit and exports.",
      ] },
      { type: "heading", id: "local", title: "Local, and yours" },
      { type: "paragraph", text: "Because it's a plugin that runs in your terminal, the whole motion happens locally. There's no SaaS to log into, no seats to buy, and nothing uploaded — your unreleased strategy stays on your machine. It's open-source, so you can read every skill and add your own." },
      { type: "callout", text: "The pitch isn't 'AI writes your marketing.' It's 'your GTM motion, as a set of grounded, inspectable skills you run locally — ending in something you can actually ship.'" },
    ],
  },
  "one-source-many-outputs": {
    slug: "one-source-many-outputs",
    toc: [
      { id: "problem", title: "Three formats, one truth" },
      { id: "registry", title: "A uniform block registry" },
      { id: "outputs", title: "Adding an output is one function" },
      { id: "editing", title: "Editing without breaking the model" },
    ],
    blocks: [
      { type: "paragraph", text: "A launch needs to exist in several shapes at once: a browsable site for async readers, clean markdown for the wiki, and slides for the room. The naive approach maintains three documents. The durable approach maintains one model and renders the three." },
      { type: "heading", id: "problem", title: "Three formats, one truth" },
      { type: "paragraph", text: "The content of a launch is structured: sections, and within them blocks — a heading, a paragraph, a key-value list, a table, a callout, a checklist. If you capture that structure as data instead of as formatted prose, every output format becomes a pure function of the same data." },
      { type: "callout", text: "Blocks are { id, type, …fields }. That uniform envelope is the whole trick — it's what lets one source become an app, a doc, and a deck without three codebases." },
      { type: "heading", id: "registry", title: "A uniform block registry" },
      { type: "paragraph", text: "Each block type registers its behavior in one place: how it renders to HTML, how it serializes to markdown, how it appears in the slash menu, and what it can 'turn into.' The generator and the editor both dispatch through that registry, so a block type is defined once and works everywhere." },
      { type: "list", items: [
        "render → the interactive HTML app",
        "markdown → the docs mirror",
        "slash + transform → the editor's insert and convert menus",
        "serialize → any new export target",
      ] },
      { type: "heading", id: "outputs", title: "Adding an output is one function" },
      { type: "paragraph", text: "Because every output is a function over the same blocks, adding a format isn't a project — it's a serializer. A Marp slide deck, for instance, is just 'walk the sections, emit a slide per section from the existing markdown.' Run it through marp-cli and you have a real .pptx, generated from the identical source that produced the site." },
      { type: "numbered", items: [
        "One JSON file holds the blocks.",
        "The registry renders them to HTML and markdown.",
        "A deck serializer emits Marp; marp-cli turns it into .pptx.",
        "Edit the source once and all three regenerate in sync.",
      ] },
      { type: "heading", id: "editing", title: "Editing without breaking the model" },
      { type: "paragraph", text: "The subtle part is keeping the model intact while humans edit it. Edits are anchored to stable block ids rather than positions, so reordering a section can't orphan a comment, and moving a block between sections carries its comments with it. The editor is modeless — you just type — but everything it does maps back to a clean operation on the block model." },
      { type: "callout", text: "Make the data model the product, not the document. Then the document, the deck, and the site are just views — and they can never drift, because there's nothing to keep in sync." },
    ],
  },
};

export const articleTemplate: ArticleContent = articleContents["one-source-of-truth-for-launches"];

export const featureCards: CardItem[] = [
  { title: "45 skills", copy: "Positioning, messaging, personas, pricing, competitive, GTM, PLG, and sales enablement — the whole motion.", icon: Sparkles },
  { title: "10 research desks", copy: "Customer, competitive, market, pricing, channels, KOL, events, reviews, GTM, product — cited evidence before strategy.", icon: Search },
  { title: "Orchestrator", copy: "The agentic-marketing-orchestrator sequences skills into a real workflow and packages the result.", icon: GitBranch },
  { title: "Interactive launch kit", copy: "Your PMM work becomes a self-contained HTML app — sidebar, inspector, command palette, present mode.", icon: Layers3 },
  { title: "Modeless editor", copy: "Edit any block inline — no edit button. Slash to insert, select to format, turn-into to convert.", icon: Wand2 },
  { title: "Anchored comments", copy: "Highlight text to leave a comment tied to that block. Reorder-safe, streamed into a notebook.", icon: MessageSquare },
  { title: "One source, many outputs", copy: "A single kit-content.json becomes the app, markdown mirrors, and a Marp slide deck → .pptx.", icon: FileText },
  { title: "Runs locally", copy: "It's a Claude Code / Codex plugin. No SaaS, no upload — your strategy stays on your machine.", icon: ShieldCheck },
  { title: "Open source", copy: "Install from GitHub, inspect every skill, fork it, and add your own block types and exports.", icon: Code2 },
];

export const featureDetails: FeatureDetail[] = [
  {
    id: "launch-kit",
    title: "An interactive launch kit",
    copy: "Your PMM artifacts become one self-contained HTML app: a left sidebar, a main workspace, and an inspector — plus a ⌘K command palette, present mode, and status tracking. No build step, no dependencies, opens in any browser.",
    icon: Layers3,
    image: "/images/launch-kit/overview.png",
    points: ["App-shell: sidebar · main · inspector", "Command palette + present/deck mode", "Self-contained — one HTML file"],
  },
  {
    id: "editor",
    title: "Modeless, Notion-style editing",
    copy: "Every block is inline-editable — there's no edit mode to toggle. Type “/” to insert blocks, select text to format, “turn into” to convert a block, drag to reorder, and move blocks between sections. Everything writes back to one source.",
    icon: Wand2,
    image: "/images/launch-kit/positioning.png",
    points: ["Inline edit + slash insert", "Turn-into, duplicate, move-to-section", "Highlight → anchored comment"],
  },
  {
    id: "exports",
    title: "One source, many outputs",
    copy: "A uniform block registry turns one kit-content.json into the interactive app, a markdown mirror of every section, and a Marp slide deck you can export to .pptx with one command. Add an export target and it's a single serializer.",
    icon: FileText,
    image: "/images/launch-kit/pricing.png",
    points: ["Interactive HTML + markdown mirrors", "Marp deck → real .pptx", "Uniform { id, type } block model"],
  },
  {
    id: "skills",
    title: "39 skills, orchestrated",
    copy: "Positioning and messaging, ICP and personas, pricing and packaging, competitive battlecards, launch and lifecycle, PLG and growth, sales enablement — grounded in one shared product context and routed by the orchestrator.",
    icon: Sparkles,
    image: "/images/launch-kit/competitive.png",
    points: ["Grounded in your product context", "Routed end-to-end by the orchestrator", "Each skill emits a real artifact"],
  },
];

export const pricingPlans = [
  {
    name: "Plugin",
    price: "$0",
    cadence: "free forever",
    copy: "The full OS — open source, runs locally in Claude Code / Codex.",
    items: [
      "All 45 skills",
      "10 research desks · every platform",
      "Video transcripts + judged relevance",
      "Interactive launch kit + exports",
      "Social research with your own sessions",
      "MIT license · community support",
    ],
    cta: "Install the plugin",
    href: "https://github.com/buildingwithai/pmm-os",
    available: true,
  },
  {
    name: "Cloud",
    price: "Coming soon",
    cadence: "join the waitlist",
    copy: "The companion web app — memory and media for every engagement.",
    items: [
      "Research library: every engagement, synced + shareable",
      "Asset studio: images + launch videos from your kit",
      "Research Intelligence: hosted LLM rerank (in beta)",
      "Evidence packs with captioned screenshots",
      "Usage across products and launches",
      "One account, one credit meter",
    ],
    cta: "Join the waitlist",
    href: "/cloud",
    available: false,
  },
];



export const docsCards: CardItem[] = [
  { title: "Quickstart", copy: "Add the plugin, open Claude Code, and call your first skill.", icon: Rocket },
  { title: "The 39 skills", copy: "What each skill produces and when to reach for it.", icon: Sparkles },
  { title: "Orchestrator", copy: "How skills are sequenced into an end-to-end workflow.", icon: GitBranch },
  { title: "Launch kit", copy: "Generate the interactive app and the markdown mirrors.", icon: Layers3 },
  { title: "Editing the kit", copy: "Modeless editing, slash blocks, turn-into, and comments.", icon: Wand2 },
  { title: "Exports", copy: "HTML, markdown, and a Marp deck → .pptx.", icon: FileText },
  { title: "Block registry", copy: "Add your own block types, transforms, and export targets.", icon: Blocks },
  { title: "Self-host & CLI", copy: "Zero-dependency generator and the local editor server.", icon: Server },
];

export const stackCards: CardItem[] = [
  { title: "Claude Code / Codex", copy: "The plugin host — skills run locally in your terminal.", icon: Sparkles },
  { title: "Zero-dependency Node", copy: "The launch-kit generator uses Node built-ins only.", icon: Code2 },
  { title: "TipTap", copy: "Notion-style rich-text editing in the notebook.", icon: Wand2 },
  { title: "Marp", copy: "Turns the blocks into a slide deck and a real .pptx.", icon: FileText },
  { title: "Markdown", copy: "Every section also mirrors to clean markdown.", icon: ScrollText },
  { title: "Open source", copy: "Transparent, inspectable, forkable, self-hostable.", icon: ShieldCheck },
];

export const quickstartSteps = [
  "Add the plugin from the GitHub repository to Claude Code.",
  "Call a skill — e.g. /product-marketing-os or /pmm-launch-kit.",
  "Answer a few questions about your product and audience.",
  "Open the generated launch kit, edit it live, and export the deck.",
];

export const apiRows = [
  ["/product-marketing-os", "The orchestrator — routes a full PMM/GTM workflow end-to-end."],
  ["/pmm-launch-kit", "Packages your artifacts into the interactive launch kit + exports."],
  ["/pmm-messaging-positioning", "Positioning, value props, message house, and persona messaging."],
  ["/pmm-competitive-intelligence", "Battlecards, comparison inputs, and win/loss narratives."],
];

export function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? blogPosts[0];
}
