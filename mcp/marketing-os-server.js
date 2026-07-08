#!/usr/bin/env node
/*
  Read-only MCP server for PMM OS.
  Exposes local skills, PMM references, templates, launch planning, campaign briefs,
  coaching rubrics, PLG planning, product lifecycle planning, PRD/prototype planning, artifact bundle planning, image prompt packs, GTM signal workflows, OSP adapter guidance, and marketing MCP recommendations.
*/

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = path.resolve(process.env.PLUGIN_ROOT || process.cwd());

function safeJoin(base, ...parts) {
  const resolved = path.resolve(base, ...parts);
  if (!resolved.startsWith(path.resolve(base))) throw new Error("Path escapes plugin root");
  return resolved;
}
function exists(relPath) { try { return fs.existsSync(safeJoin(ROOT, relPath)); } catch { return false; } }
function readText(relPath, maxChars = 50000) {
  const full = safeJoin(ROOT, relPath);
  return fs.readFileSync(full, "utf8").slice(0, maxChars);
}
function listFiles(relDir, predicate = () => true) {
  const dir = safeJoin(ROOT, relDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && predicate(d.name))
    .map((d) => path.join(relDir, d.name).replace(/\\/g, "/"));
}
function listDirs(relDir) {
  const dir = safeJoin(ROOT, relDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}
function skillIndex() {
  const out = [];
  for (const name of listDirs("skills")) {
    const rel = `skills/${name}/SKILL.md`;
    if (!exists(rel)) continue;
    const content = readText(rel, 16000);
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    const description = fm ? ((fm[1].match(/description:\s*(.*)/) || [])[1] || "").replace(/^[ '\"]+|[ '\"]+$/g, "") : "";
    out.push({ name, path: rel, description, content });
  }
  return out;
}
function parseRegistry() {
  if (!exists("tools/REGISTRY.md")) return [];
  const rows = readText("tools/REGISTRY.md", 80000).split(/\r?\n/);
  const tools = [];
  for (const line of rows) {
    if (!line.startsWith("|") || line.includes("---") || line.toLowerCase().includes("| tool |")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    const [tool, category, api, mcp, cli, sdk, guide] = cells;
    if (!tool || tool === "Tool") continue;
    tools.push({
      tool: tool.replace(/\*\*/g, ""), category,
      api: api.includes("✓"), mcp: mcp.includes("✓"), cli: cli.includes("✓"), sdk: sdk.includes("✓"),
      guide: (guide.match(/\(([^)]+)\)/) || [])[1] || guide,
    });
  }
  return tools;
}

const MCP_BY_WORKFLOW = {
  planning: ["GitHub", "Linear", "Slack", "Google Drive", "Google Sheets", "Notion"],
  research: ["Exa", "Google Search Console", "Semrush", "Ahrefs", "Gong", "Zoom", "Intercom"],
  analytics: ["GA4", "Mixpanel", "Amplitude", "PostHog", "Segment"],
  seo: ["Google Search Console", "DataForSEO", "RankParse", "Exa", "Semrush", "Ahrefs"],
  aeo: ["Exa", "Google Search Console", "Semrush", "RankParse", "OSP Marketing Tools"],
  ads: ["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads"],
  email: ["Mailchimp", "Customer.io", "Resend", "SendGrid", "Postmark", "Klaviyo"],
  crm: ["HubSpot", "Salesforce", "Close", "Outreach", "ZoomInfo", "Clay"],
  pricing: ["Stripe", "Paddle", "Rewardful", "Tolt", "PartnerStack"],
  launch: ["GitHub", "Linear", "Slack", "Google Drive", "Google Sheets", "GA4", "Mailchimp", "HubSpot"],
  artifacts: ["Google Drive", "Google Docs", "Google Slides", "Figma", "Image Generation", "Canva", "Webflow"],
  cms: ["Webflow", "WordPress", "Contentful", "Sanity", "Strapi"],
  qa: ["Playwright", "Chrome DevTools", "Figma"],
  plg: ["GA4", "Mixpanel", "Amplitude", "PostHog", "Segment", "HubSpot", "Salesforce", "Stripe"],
  product: ["GitHub", "Linear", "Jira", "Google Drive", "Google Docs", "Figma", "Playwright"],
  prd: ["GitHub", "Linear", "Jira", "Figma", "Google Docs", "Playwright"],
  prototype: ["Figma", "Playwright", "Chrome DevTools", "GitHub"],
  validation: ["GA4", "Mixpanel", "Amplitude", "PostHog", "Segment", "HubSpot", "Salesforce", "Gong", "Intercom", "Slack"],
};

function workflowForTask(task) {
  const t = String(task || "").toLowerCase();
  if (/plg|product.led growth|product-led growth|activation|aha moment|time to value|growth loop|pql|pqa|free trial|freemium|reverse trial|aarrr|north star|retention|expansion|churn/.test(t)) return "plg";
  if (/prd|requirements document|product spec|user stories|acceptance criteria/.test(t)) return "prd";
  if (/prototype|wireframe|mockup|html prototype|ui flow/.test(t)) return "prototype";
  if (/product lifecycle|product strategy|roadmap|prioritization|rice|moscow|full pm cycle|product planning/.test(t)) return "product";
  if (/post.launch|post-launch|retrospective|impact analysis|campaign readout|feedback synthesis|iteration plan|adoption review|measure impact/.test(t)) return "validation";
  if (/coach|feedback|review|critique|pressure test|roleplay|30.60.90|walk through/.test(t)) return "coach";
  if (/launch|gtm|go.to.market|rollout|release|beta|ga\b/.test(t)) return "launch";
  if (/campaign brief|creative brief|campaign plan|smp|single.minded/.test(t)) return "campaign";
  if (/artifact|deliverable|asset pack|slides|pptx|docx|image|mockup|social post|files/.test(t)) return "artifacts";
  if (/signal|account research|outbound|sequence|prospecting|icp scoring/.test(t)) return "signal";
  if (/aeo|geo|ai visibility|llm citation|answer engine|ai search|chatgpt mention/.test(t)) return "aeo";
  if (/feature announcement|release notes|changelog|announce/.test(t)) return "announcement";
  if (/pricing|packaging|tier|sku|value metric|monetization/.test(t)) return "pricing";
  if (/competitor|competitive|battlecard|comparison|alternative/.test(t)) return "competitive";
  if (/customer|persona|icp|jtbd|voc|win.loss|research/.test(t)) return "research";
  if (/seo|keyword|search|schema|content|metadata|technical writing|value map/.test(t)) return "seo";
  if (/ad|paid|creative/.test(t)) return "ads";
  if (/email|newsletter|lifecycle|drip|sequence/.test(t)) return "email";
  if (/cro|conversion|landing|experiment|a\/b|ab test|funnel/.test(t)) return "cro";
  return "product-marketing";
}
function workflowPlan(task) {
  const family = workflowForTask(task);
  const map = {
    "product-marketing": ["product-marketing-os", "pmm-product-context", "product-marketing"],
    plg: ["plg-gtm-strategy", "analytics", "onboarding", "pricing", "pmm-artifact-factory"],
    product: ["product-lifecycle-os", "pmm-product-context", "pmm-customer-research", "pmm-messaging-positioning", "prd-prototype-factory", "pmm-go-to-market"],
    prd: ["prd-prototype-factory", "product-lifecycle-os", "pmm-go-to-market", "pmm-artifact-factory"],
    prototype: ["prd-prototype-factory", "pmm-artifact-factory", "pmm-coach"],
    validation: ["post-launch-learning-loop", "analytics", "pmm-coach", "plg-gtm-strategy"],
    coach: ["pmm-coach"],
    artifacts: ["pmm-artifact-factory", "pmm-coach"],
    campaign: ["pmm-campaign-brief", "pmm-artifact-factory", "pmm-coach"],
    signal: ["gtm-signal-campaign", "cold-email", "revops", "analytics"],
    aeo: ["pmm-aeo-geo", "ai-seo", "schema", "pmm-competitive-intelligence"],
    announcement: ["pmm-feature-announcement", "emails", "social", "image", "pmm-artifact-factory"],
    launch: ["product-marketing-os", "pmm-go-to-market", "pmm-campaign-brief", "pmm-artifact-factory", "launch", "emails", "social", "sales-enablement", "analytics", "pmm-coach"],
    pricing: ["product-marketing-os", "pmm-pricing-packaging", "pricing", "paywalls", "analytics"],
    competitive: ["pmm-competitive-intelligence", "competitor-profiling", "competitors", "sales-enablement"],
    research: ["pmm-customer-research", "customer-research", "revops"],
    seo: ["osp-technical-marketing", "seo-audit", "ai-seo", "schema", "content-strategy"],
    ads: ["product-marketing-os", "ads", "ad-creative", "analytics"],
    email: ["product-marketing-os", "emails", "copywriting", "analytics"],
    cro: ["product-marketing-os", "cro", "copywriting", "ab-testing", "analytics"],
  };
  const artifacts = {
    "product-marketing": ["product context", "ICP", "positioning", "proof points", "voice of customer"],
    plg: ["PLG readiness assessment", "funnel map", "AHA moment diagnosis", "growth loop design", "PQL/PQA model", "metric tree", "experiment roadmap"],
    product: ["product lifecycle plan", "market and user research", "positioning", "roadmap", "prioritization", "PRD", "prototype brief", "release plan", "impact readout"],
    prd: ["PRD", "user stories", "acceptance criteria", "analytics events", "prototype brief", "GTM implications"],
    prototype: ["prototype brief", "wireframe outline", "HTML prototype scaffold", "design QA checklist", "stakeholder review notes"],
    validation: ["metric scorecard", "baseline vs target vs actual", "feedback themes", "root cause analysis", "PMM coach critique", "iteration plan"],
    coach: ["coach review", "pressure-test questions", "revision plan"],
    artifacts: ["artifact bundle plan", "docx brief", "pptx outline", "csv social posts", "json image prompts"],
    campaign: ["campaign brief", "channel plan", "content deliverables", "RACI", "KPIs"],
    signal: ["account research", "signal logic", "sequence copy", "suppression rules", "metrics"],
    aeo: ["query set", "gap inventory", "fix briefs", "measurement dashboard spec"],
    announcement: ["story extraction", "blog/changelog", "email", "social", "in-product copy"],
    launch: ["launch tier", "launch brief", "campaign brief", "activity checklist", "asset pack", "enablement plan", "measurement plan"],
    pricing: ["pricing hypothesis", "package matrix", "value metric", "pricing-page guidance", "risk plan"],
    competitive: ["competitor profile", "battlecard", "comparison-page inputs", "objection handling"],
    research: ["research plan", "interview guide", "VoC themes", "JTBD", "persona notes"],
    seo: ["value map", "metadata brief", "content brief", "schema plan", "internal linking plan"],
    ads: ["campaign brief", "creative angles", "audience plan", "tracking plan"],
    email: ["sequence brief", "emails", "audience segments", "send criteria", "success metrics"],
    cro: ["conversion audit", "hypotheses", "test plan", "analytics events", "implementation tickets"],
  };
  return { family, skills: map[family] || map["product-marketing"], artifacts: artifacts[family] || artifacts["product-marketing"] };
}
function textResult(text) { return { content: [{ type: "text", text }] }; }
function jsonText(obj) { return textResult(JSON.stringify(obj, null, 2)); }
function campaignBriefTemplate(type = "product_launch") {
  const templates = {
    product_launch: { name: "Product Launch", depth: "Full brief", timeline: "8-12 weeks", channels: ["email", "in-product", "social", "blog", "PR", "sales enablement"] },
    feature_update: { name: "Feature Update", depth: "Light or full brief", timeline: "4-6 weeks", channels: ["in-product", "email", "blog", "social"] },
    competitive_response: { name: "Competitive Response", depth: "Full brief", timeline: "2-4 weeks", channels: ["email", "social", "PR", "blog", "paid search", "sales enablement"] },
    seasonal_campaign: { name: "Seasonal Campaign", depth: "Full brief", timeline: "6-8 weeks", channels: ["email", "social", "paid search", "in-product"] },
    re_engagement: { name: "Re-engagement", depth: "Light or full brief", timeline: "4-6 weeks", channels: ["email", "in-product", "paid retargeting"] },
    brand_awareness: { name: "Brand Awareness", depth: "Full brief", timeline: "10-16 weeks", channels: ["social", "video", "PR", "events", "paid"] },
  };
  return templates[type] || templates.product_launch;
}

const TOOLS = [
  { name: "route_marketing_workflow", description: "Map a marketing or PMM task to the right skill chain, artifacts, and MCP recommendations.", inputSchema: { type: "object", properties: { task: { type: "string" }, product_context: { type: "string" }, requested_output: { type: "string" } }, required: ["task"] } },
  { name: "lookup_skill", description: "Search bundled skills by name, description, and SKILL.md content.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number", default: 10 } }, required: ["query"] } },
  { name: "list_marketing_tools", description: "List marketing tools from tools/REGISTRY.md, optionally filtered by category or MCP availability.", inputSchema: { type: "object", properties: { category: { type: "string" }, mcp_only: { type: "boolean" } } } },
  { name: "read_integration_guide", description: "Read a local integration guide from tools/integrations/<tool>.md.", inputSchema: { type: "object", properties: { tool: { type: "string" } }, required: ["tool"] } },
  { name: "recommend_mcp_servers", description: "Recommend MCP servers for a marketing workflow and explain their role.", inputSchema: { type: "object", properties: { workflow: { type: "string" }, stack: { type: "array", items: { type: "string" } } }, required: ["workflow"] } },
  { name: "list_pmm_resources", description: "List PMM references and templates bundled with product-marketing-os.", inputSchema: { type: "object", properties: { kind: { type: "string", enum: ["references", "assets", "all"] } } } },
  { name: "read_pmm_resource", description: "Read a PMM reference or template by file name.", inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
  { name: "launch_plan_builder", description: "Generate a tier-aware launch plan skeleton using launch tier and activity references.", inputSchema: { type: "object", properties: { tier: { type: "string" }, feature: { type: "string" }, audience: { type: "string" }, release_stage: { type: "string" } }, required: ["feature"] } },
  { name: "naming_scorecard", description: "Create a naming scorecard for product, feature, program, or event names.", inputSchema: { type: "object", properties: { names: { type: "array", items: { type: "string" } }, audience: { type: "string" }, category: { type: "string" } }, required: ["names"] } },
  { name: "pmm_artifact_map", description: "Return the recommended PMM artifact set for an objective.", inputSchema: { type: "object", properties: { objective: { type: "string" } }, required: ["objective"] } },
  { name: "campaign_brief_builder", description: "Return a 14-section campaign brief skeleton and quality checks for a campaign type.", inputSchema: { type: "object", properties: { campaign_type: { type: "string" }, campaign_name: { type: "string" }, objective: { type: "string" }, audience: { type: "string" } } } },
  { name: "artifact_bundle_plan", description: "Plan a multi-file deliverable pack for a launch, campaign, or PMM project.", inputSchema: { type: "object", properties: { project: { type: "string" }, tier: { type: "string" }, deliverables: { type: "array", items: { type: "string" } }, include_images: { type: "boolean" }, include_slides: { type: "boolean" } }, required: ["project"] } },
  { name: "image_prompt_pack", description: "Create structured image-generation briefs for launch, campaign, social, ad, mockup, or slide visuals.", inputSchema: { type: "object", properties: { project: { type: "string" }, message: { type: "string" }, formats: { type: "array", items: { type: "string" } }, variants: { type: "number" } }, required: ["project", "message"] } },
  { name: "pmm_coach_review", description: "Return a senior-PMM coaching scorecard and improvement plan for a described artifact.", inputSchema: { type: "object", properties: { artifact_type: { type: "string" }, audience: { type: "string" }, summary: { type: "string" } }, required: ["artifact_type", "summary"] } },
  { name: "gtm_signal_campaign_plan", description: "Plan a signal-triggered GTM campaign with research, sequence, suppression, and metrics.", inputSchema: { type: "object", properties: { signal: { type: "string" }, persona: { type: "string" }, tier: { type: "string" } }, required: ["signal", "persona"] } },
  { name: "osp_value_map_skeleton", description: "Create an OSP-style technical marketing value map skeleton.", inputSchema: { type: "object", properties: { product: { type: "string" }, audience: { type: "string" }, features: { type: "array", items: { type: "string" } } }, required: ["product"] } },

  { name: "plg_readiness_assessment", description: "Create a PLG readiness assessment with fit score, funnel risks, and next experiments.", inputSchema: { type: "object", properties: { product: { type: "string" }, audience: { type: "string" }, motion: { type: "string" }, activation_event: { type: "string" } }, required: ["product"] } },
  { name: "plg_metrics_map", description: "Create a PLG metric tree across acquisition, activation, engagement, conversion, retention, expansion, and referral.", inputSchema: { type: "object", properties: { product: { type: "string" }, north_star: { type: "string" }, activation_event: { type: "string" } }, required: ["product"] } },
  { name: "growth_loop_designer", description: "Design a growth loop with trigger, action, value created, distribution surface, metrics, and experiments.", inputSchema: { type: "object", properties: { loop_type: { type: "string" }, product: { type: "string" }, audience: { type: "string" } }, required: ["product"] } },
  { name: "pm_lifecycle_plan", description: "Create a five-layer product lifecycle plan from perception to validation.", inputSchema: { type: "object", properties: { product: { type: "string" }, stage: { type: "string" }, mode: { type: "string" } }, required: ["product"] } },
  { name: "prd_plan_builder", description: "Create a scenario-driven PRD plan with sections, missing information, and quality gates.", inputSchema: { type: "object", properties: { product: { type: "string" }, scenario: { type: "string" }, audience: { type: "string" } }, required: ["product"] } },
  { name: "prototype_brief_builder", description: "Create a prototype brief for wireframe, mockup, or interactive HTML prototype output.", inputSchema: { type: "object", properties: { product: { type: "string" }, prototype_type: { type: "string" }, user_flow: { type: "string" } }, required: ["product"] } },
  { name: "post_launch_learning_plan", description: "Create a post-launch learning plan with metric scorecard, feedback synthesis, and iteration actions.", inputSchema: { type: "object", properties: { launch: { type: "string" }, objective: { type: "string" }, period: { type: "string" } }, required: ["launch"] } },
  { name: "agent_orchestration_map", description: "Recommend which agents or skills should handle a complex marketing, PLG, or product workflow.", inputSchema: { type: "object", properties: { workflow: { type: "string" } }, required: ["workflow"] } },

  { name: "battlecard_builder", description: "Create a sales-ready competitive battlecard skeleton with threat level, strengths, weaknesses, talk tracks, and evidence gaps.", inputSchema: { type: "object", properties: { competitor: { type: "string" }, our_product: { type: "string" }, deal_stage: { type: "string" } }, required: ["competitor"] } },
  { name: "positioning_exercise_builder", description: "Create a five-step positioning exercise output using alternatives, attributes, value, target customer, and market category.", inputSchema: { type: "object", properties: { product: { type: "string" }, audience: { type: "string" }, category: { type: "string" } }, required: ["product"] } },
  { name: "pricing_analysis_builder", description: "Create a competitive pricing analysis skeleton with value metrics, packaging, feature gates, and recommendations.", inputSchema: { type: "object", properties: { market: { type: "string" }, competitors: { type: "array", items: { type: "string" } } }, required: ["market"] } },
  { name: "messaging_hierarchy_builder", description: "Create a messaging hierarchy with POV, value proposition, benefits, proof, features, personas, and channel mapping.", inputSchema: { type: "object", properties: { product: { type: "string" }, audience: { type: "string" }, positioning: { type: "string" } }, required: ["product"] } },
  { name: "icp_definition_builder", description: "Create a layered ICP and anti-ICP with triggers, tiers, signals, and activation plan.", inputSchema: { type: "object", properties: { product: { type: "string" }, market: { type: "string" }, motion: { type: "string" } }, required: ["product"] } },
  { name: "voc_synthesis_plan", description: "Plan VOC synthesis from interviews, calls, reviews, surveys, support, and CRM notes into themes and evidence chains.", inputSchema: { type: "object", properties: { sources: { type: "array", items: { type: "string" } }, persona: { type: "string" } } } },
  { name: "sales_narrative_builder", description: "Create a seven-beat sales narrative and slide-by-slide guide.", inputSchema: { type: "object", properties: { product: { type: "string" }, audience: { type: "string" }, ask: { type: "string" } }, required: ["product"] } },
  { name: "competitive_landing_page_builder", description: "Create a competitive landing page outline for alternatives, comparison, and paid search pages.", inputSchema: { type: "object", properties: { competitor: { type: "string" }, product: { type: "string" }, intent: { type: "string" } }, required: ["competitor", "product"] } },
  { name: "adaptive_messaging_response", description: "Create a Detect, Decide, Draft, Deploy response plan for a competitor or market move.", inputSchema: { type: "object", properties: { trigger: { type: "string" }, competitor: { type: "string" }, posture: { type: "string" } }, required: ["trigger"] } },
  { name: "outreach_sequence_builder", description: "Create a founder-led outreach message and cadence grounded in why-this-person, why-now, and one CTA.", inputSchema: { type: "object", properties: { recipient: { type: "string" }, why_now: { type: "string" }, channel: { type: "string" } }, required: ["recipient", "why_now"] } },
  { name: "account_research_brief", description: "Create an account research brief with company snapshot, signals, stakeholders, why now, why us, and hook.", inputSchema: { type: "object", properties: { company: { type: "string" }, domain: { type: "string" }, signal: { type: "string" } }, required: ["company"] } },
  { name: "icp_scoring_matrix", description: "Create an ICP scoring matrix with firmographic, technographic, organizational, and signal score components.", inputSchema: { type: "object", properties: { accounts: { type: "array", items: { type: "string" } }, icp: { type: "string" } }, required: ["accounts"] } },
  { name: "weekly_gtm_update_plan", description: "Create a weekly GTM context update plan with stale sections, proposed updates, and human-input questions.", inputSchema: { type: "object", properties: { week: { type: "string" }, focus: { type: "string" } } } },
  { name: "osp_meta_information_builder", description: "Create OSP-style metadata: H1, meta title, meta description, slug, search intent, and CTR notes.", inputSchema: { type: "object", properties: { topic: { type: "string" }, keyword: { type: "string" }, audience: { type: "string" } }, required: ["topic"] } },
  { name: "osp_editing_code_review", description: "Create an OSP-style editing code review for technical marketing content.", inputSchema: { type: "object", properties: { content_summary: { type: "string" }, content_type: { type: "string" } }, required: ["content_summary"] } },
  { name: "osp_onpage_seo_checklist", description: "Create an OSP-style on-page SEO checklist for a technical marketing page.", inputSchema: { type: "object", properties: { page: { type: "string" }, keyword: { type: "string" }, intent: { type: "string" } }, required: ["page"] } },
  { name: "slash_command_manifest", description: "List adapted PMM slash commands and their mapped PMM OS skills.", inputSchema: { type: "object", properties: { command: { type: "string" } } } },
];

async function callTool(name, args) {
  if (name === "route_marketing_workflow") {
    const plan = workflowPlan(args.task);
    return jsonText({ task: args.task, workflow_family: plan.family, skill_chain: plan.skills, artifacts_to_create: plan.artifacts, recommended_mcp_groups: plan.family === "launch" ? ["planning", "analytics", "email", "crm", "artifacts"] : plan.family === "plg" ? ["plg", "analytics", "crm", "pricing"] : plan.family === "product" ? ["product", "research", "prd", "prototype"] : plan.family === "prd" ? ["prd", "product", "prototype"] : plan.family === "prototype" ? ["prototype", "qa"] : plan.family === "validation" ? ["validation", "analytics", "crm"] : [plan.family], next_step: "Ground in product context, create concrete artifacts, then run pmm-coach review before final handoff." });
  }
  if (name === "lookup_skill") {
    const q = String(args.query || "").toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const matches = skillIndex().map((s) => {
      const hay = `${s.name}\n${s.description}\n${s.content}`.toLowerCase();
      const score = terms.reduce((n, term) => n + (hay.includes(term) ? 1 : 0), 0);
      return { name: s.name, path: s.path, description: s.description, score };
    }).filter((s) => s.score > 0 || s.name.includes(q)).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, Number(args.limit || 10));
    return jsonText(matches);
  }
  if (name === "list_marketing_tools") {
    let tools = parseRegistry();
    if (args.category) tools = tools.filter((t) => t.category.toLowerCase().includes(String(args.category).toLowerCase()));
    if (args.mcp_only) tools = tools.filter((t) => t.mcp);
    return jsonText(tools);
  }
  if (name === "read_integration_guide") {
    const slug = String(args.tool || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const rel = `tools/integrations/${slug}.md`;
    if (!exists(rel)) return textResult(`No integration guide found for ${slug}. Try list_marketing_tools first.`);
    return textResult(readText(rel));
  }
  if (name === "recommend_mcp_servers") {
    const workflow = String(args.workflow || "").toLowerCase();
    const selected = new Set();
    for (const [key, servers] of Object.entries(MCP_BY_WORKFLOW)) if (workflow.includes(key) || key.includes(workflow)) servers.forEach((s) => selected.add(s));
    if (selected.size === 0) ["GitHub", "Linear", "Slack", "Google Drive", "GA4", "HubSpot", "Composio"].forEach((s) => selected.add(s));
    return jsonText({ workflow: args.workflow, recommended_servers: Array.from(selected), use_composio_for: ["HubSpot", "Salesforce", "Meta Ads", "LinkedIn Ads", "Google Sheets", "Slack", "Notion"], policy: "Read first, preview second, dry-run third, write only when the target account and object are explicit." });
  }
  if (name === "list_pmm_resources") {
    const kind = args.kind || "all";
    const refs = listFiles("skills/product-marketing-os/references", (n) => n.endsWith(".md"));
    const assets = listFiles("skills/product-marketing-os/assets", (n) => n.endsWith(".md"));
    return jsonText({ references: kind === "assets" ? [] : refs, assets: kind === "references" ? [] : assets });
  }
  if (name === "read_pmm_resource") {
    const requested = String(args.name || "").toLowerCase();
    const all = [...listFiles("skills/product-marketing-os/references", (n) => n.endsWith(".md")), ...listFiles("skills/product-marketing-os/assets", (n) => n.endsWith(".md"))];
    const found = all.find((rel) => path.basename(rel).toLowerCase() === requested || rel.toLowerCase().endsWith(requested));
    if (!found) return textResult(`Resource not found: ${args.name}. Use list_pmm_resources first.`);
    return textResult(readText(found));
  }
  if (name === "launch_plan_builder") {
    const tierRaw = String(args.tier || "medium").toLowerCase();
    const tier = tierRaw === "l1" || tierRaw === "large" || tierRaw === "tier 1" ? "Large" : tierRaw === "l3" || tierRaw === "small" || tierRaw === "tier 3" ? "Small" : "Medium";
    const activities = tier === "Large" ? ["launch brief", "campaign brief", "press or analyst plan", "launch blog", "customer comms", "social pack", "product page", "sales enablement", "demo script", "launch video", "paid demand gen", "measurement dashboard", "PMM coach review"] : tier === "Medium" ? ["launch brief", "campaign brief", "launch blog", "customer comms", "social", "sales enablement", "demo notes", "optional product page update", "measurement dashboard", "PMM coach review"] : ["launch brief", "blog or changelog", "social", "community promotion", "docs update", "basic measurement"];
    return jsonText({ feature: args.feature, audience: args.audience || "TBD", release_stage: args.release_stage || "TBD", launch_tier: tier, activity_checklist: activities, artifacts: ["launch brief", "campaign brief", "messaging", "channel plan", "enablement", "measurement plan", "risk and rollback plan"], recommended_references: ["marketing-launch-tiers.md", "launch-activity-list.md", "rollout-process.md", "campaign-brief-framework.md", "launch-deliverable-matrix.md"] });
  }
  if (name === "naming_scorecard") {
    const names = Array.isArray(args.names) ? args.names : [];
    return jsonText({ audience: args.audience || "TBD", category: args.category || "TBD", scorecard: names.map((n) => ({ name: n, positioning: null, clarity: null, tone: null, resonance: null, recall: null, uniqueness: null, defendability: null, translation_risk: null, notes: "Score 1 to 5. Run external trademark and domain checks separately." })) });
  }
  if (name === "pmm_artifact_map") {
    const plan = workflowPlan(args.objective);
    return jsonText({ objective: args.objective, skill_chain: plan.skills, required_artifacts: plan.artifacts, adjacent_artifacts: ["source-of-truth context", "risks and assumptions", "owners and due dates", "measurement plan", "handoff checklist", "PMM coach review"], storage: ".agents/marketing-os/" });
  }
  if (name === "campaign_brief_builder") {
    const type = String(args.campaign_type || "product_launch").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const tmpl = campaignBriefTemplate(type);
    return jsonText({ campaign_name: args.campaign_name || "TBD", template: tmpl, sections: ["Campaign Name", "Background and Context", "Objective", "Target Audience", "Key Insight", "Positioning Statement", "Key Messages", "Single-Minded Proposition", "Channel Plan", "Content Deliverables", "Timeline", "Budget", "Success Metrics and KPIs", "RACI and Approvals"], starting_values: { objective: args.objective || "TBD", audience: args.audience || "TBD" }, quality_checks: ["one primary objective", "specific audience", "human insight", "single-minded proposition", "owners", "metrics", "competitive context", "why now"] });
  }
  if (name === "artifact_bundle_plan") {
    const tier = String(args.tier || "medium").toLowerCase();
    const base = ["launch brief", "campaign brief", "messaging hierarchy", "email sequence", "social post pack", "sales one-pager", "FAQ", "measurement plan"];
    if (args.include_slides !== false) base.push("deck outline", "pptx scaffold");
    if (args.include_images !== false) base.push("image generation briefs", "social/ad creative prompts");
    const custom = Array.isArray(args.deliverables) ? args.deliverables : [];
    return jsonText({ project: args.project, tier, deliverables: Array.from(new Set([...base, ...custom])), formats: ["md", "docx", "pptx", "csv", "json", "html"], script: "skills/pmm-artifact-factory/scripts/render_artifact_bundle.py", output_path: ".agents/marketing-os/outputs/[project-slug]/", review: "Run pmm-coach before exporting final files." });
  }
  if (name === "image_prompt_pack") {
    const formats = Array.isArray(args.formats) && args.formats.length ? args.formats : ["launch hero", "social graphic", "ad concept", "slide visual"];
    const variants = Math.max(1, Math.min(10, Number(args.variants || 3)));
    return jsonText({ project: args.project, message: args.message, prompts: formats.flatMap((format) => Array.from({ length: variants }, (_, i) => ({ format, variant: i + 1, brief: { purpose: `Support ${args.project}`, channel: format, core_message: args.message, composition: "Clear B2B SaaS visual with one focal idea", must_include: ["product or workflow context", "single visual hierarchy", "space for headline if needed"], must_avoid: ["crowded UI", "illegible text", "generic stock-photo feel"], aspect_ratio: format.includes("hero") || format.includes("slide") ? "16:9" : "1:1" } }))) });
  }
  if (name === "pmm_coach_review") {
    return jsonText({ artifact_type: args.artifact_type, audience: args.audience || "TBD", scorecard: { clarity: null, audience_fit: null, pmm_fundamentals: null, evidence: null, business_impact: null, actionability: null, risk_handling: null }, review_questions: ["What is the main point in one sentence?", "Who exactly is this for?", "What claim lacks proof?", "What stakeholder objection will surface first?", "What is the highest leverage revision?"], next_actions: ["Run the relevant skill for the weakest area", "Revise the artifact", "Run final QA before handoff"] });
  }
  if (name === "gtm_signal_campaign_plan") {
    return jsonText({ signal: args.signal, persona: args.persona, tier: args.tier || "Tier 2", steps: ["define trigger logic", "segment target list", "research accounts", "design touch sequence", "write copy", "set suppression rules", "define measurement"], outputs: ["brief.md", "account-research.md", "sequences/tier1.md", "sequences/tier2.md", "sequences/tier3.md", "metrics.md", "results.md"], metrics: ["reply rate", "meeting rate", "pipeline per 100 accounts", "signal-triggered lift"], safety: "Do not push to outreach tools until suppression and target list are approved." });
  }
  if (name === "osp_value_map_skeleton") {
    return jsonText({ product: args.product, audience: args.audience || "TBD", features: args.features || [], value_map: { tagline: "TBD", positions: ["market", "technical", "UX", "business"], personas: [], value_cases: [], feature_hierarchy: [], validation: ["feature connects to value case", "value case connects to persona need", "claim has proof"] }, recommended_mcp: "osp_marketing_tools" });
  }

  if (name === "plg_readiness_assessment") {
    return jsonText({ product: args.product, audience: args.audience || "TBD", current_motion: args.motion || "TBD", activation_event: args.activation_event || "TBD", fit_score: null, assessment: [
      { condition: "Clear user pain", score: null, evidence: "TBD", next_action: "Define the specific job and trigger." },
      { condition: "Fast time to value", score: null, evidence: "TBD", next_action: "Measure time from signup to first value." },
      { condition: "Observable activation", score: null, evidence: "TBD", next_action: "Instrument the activation event." },
      { condition: "Repeat usage", score: null, evidence: "TBD", next_action: "Map the habit loop and retention cohorts." },
      { condition: "Expansion path", score: null, evidence: "TBD", next_action: "Define account-level expansion triggers." }
    ], deliverables: ["PLG funnel map", "AHA moment diagnosis", "metric tree", "30/60/90 experiment roadmap"], recommended_mcp_groups: ["analytics", "crm", "pricing"] });
  }
  if (name === "plg_metrics_map") {
    return jsonText({ product: args.product, north_star: args.north_star || "TBD", activation_event: args.activation_event || "TBD", stages: [
      { stage: "Acquisition", metrics: ["qualified visitors", "signup conversion", "source quality"] },
      { stage: "Activation", metrics: ["activation rate", "time to value", "AHA completion"] },
      { stage: "Engagement", metrics: ["key action frequency", "WAU/MAU", "feature adoption"] },
      { stage: "Conversion", metrics: ["free-to-paid", "trial-to-paid", "paywall conversion"] },
      { stage: "Retention", metrics: ["D7", "D30", "cohort retention", "logo retention"] },
      { stage: "Expansion", metrics: ["seat growth", "usage growth", "upgrade rate", "NRR"] },
      { stage: "Referral", metrics: ["invites sent", "invite acceptance", "viral coefficient"] }
    ], instrumentation_needed: ["user ID", "account ID", "activation event", "plan/tier", "source", "cohort date"] });
  }
  if (name === "growth_loop_designer") {
    return jsonText({ product: args.product, audience: args.audience || "TBD", loop_type: args.loop_type || "usage-based", loop: { trigger: "TBD", user_action: "TBD", value_created: "TBD", distribution_surface: "TBD", new_user_or_expansion_path: "TBD", reinforcement: "TBD" }, metrics: ["loop input", "loop output", "cycle time", "conversion rate", "quality guardrail"], experiments: ["reduce friction in the action", "increase visibility of created value", "improve invite/share prompt", "tighten target segment"] });
  }
  if (name === "pm_lifecycle_plan") {
    return jsonText({ product: args.product, stage: args.stage || "TBD", mode: args.mode || "copilot", layers: [
      { layer: "Perception", outputs: ["market intelligence", "user research", "competitive analysis", "requirement gaps"], gate: "target user, problem, alternatives, market context" },
      { layer: "Strategy", outputs: ["positioning", "roadmap", "prioritization", "tradeoffs"], gate: "positioning, priority, success criteria" },
      { layer: "Design", outputs: ["PRD", "user stories", "acceptance criteria", "prototype"], gate: "scope, stories, acceptance criteria, metrics" },
      { layer: "Delivery", outputs: ["requirement review", "project plan", "release checklist", "GTM handoff"], gate: "owners, risks, instrumentation, release plan" },
      { layer: "Validation", outputs: ["impact analysis", "feedback synthesis", "iteration plan"], gate: "baseline vs target vs actual" }
    ], recommended_skills: ["product-lifecycle-os", "prd-prototype-factory", "product-marketing-os", "pmm-go-to-market", "post-launch-learning-loop"] });
  }
  if (name === "prd_plan_builder") {
    const scenario = String(args.scenario || "new_feature").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const required = scenario.includes("iteration") ? ["current feature", "current UI state", "iteration goal"] : scenario.includes("new_product") || scenario.includes("0") ? ["background", "constraints", "target user", "reference products"] : ["product architecture", "design constraints", "entry point", "target user"];
    return jsonText({ product: args.product, scenario, audience: args.audience || "TBD", required_context: required, sections: ["problem and opportunity", "target user and use case", "goals and non-goals", "user stories", "functional requirements", "non-functional requirements", "user flow", "acceptance criteria", "success metrics", "analytics events", "dependencies", "risks", "launch and GTM implications"], quality_gate: "Do not hand off until scope, stories, acceptance criteria, and metrics are clear." });
  }
  if (name === "prototype_brief_builder") {
    return jsonText({ product: args.product, prototype_type: args.prototype_type || "interactive HTML", user_flow: args.user_flow || "TBD", brief: { purpose: "Validate product flow before build or stakeholder review", fidelity: args.prototype_type || "wireframe/mockup/interactive", screens: ["entry", "primary workflow", "success", "empty", "error"], interactions: ["primary action", "secondary action", "navigation", "state change"], accessibility: ["semantic labels", "keyboard reachable controls", "color contrast"], output_path: ".agents/marketing-os/outputs/[project]/prototype.html" }, handoff: ["PRD", "acceptance criteria", "analytics events", "GTM implications"] });
  }
  if (name === "post_launch_learning_plan") {
    return jsonText({ launch: args.launch, objective: args.objective || "TBD", period: args.period || "TBD", scorecard: ["baseline", "target", "actual", "status", "note"], feedback_sources: ["customers", "sales", "CS", "support", "analytics", "CRM", "session recordings"], outputs: ["impact report", "feedback synthesis", "root cause analysis", "PMM coach critique", "iteration plan"], escalation: { weak_activation: "plg-gtm-strategy", weak_conversion: "pmm-message-market-fit or cro", weak_sales_feedback: "sales-enablement or pmm-coach", weak_product_fit: "product-lifecycle-os or prd-prototype-factory" } });
  }
  if (name === "agent_orchestration_map") {
    return jsonText({ workflow: args.workflow, recommended_sequence: ["marketing-researcher", "product-lifecycle-orchestrator", "plg-growth-operator", "gtm-operator", "artifact-producer", "pmm-coach", "launch-qa"], rule: "Delegate bounded research and QA to agents. Keep final strategy synthesis in the main thread unless the user asks for a full multi-agent workflow.", memory: ".agents/marketing-os/" });
  }


  if (name === "battlecard_builder") {
    return jsonText({ competitor: args.competitor, our_product: args.our_product || "TBD", threat_level: "TBD", sections: ["their pitch", "where they win", "where they lose", "counter-positioning", "quick comparison", "how to win", "encounter scenarios", "what not to say", "needs research"], talk_track: { acknowledge: "TBD", reframe: "TBD", proof: "TBD", close: "TBD" } });
  }
  if (name === "positioning_exercise_builder") {
    return jsonText({ product: args.product, audience: args.audience || "TBD", category: args.category || "TBD", steps: ["competitive alternatives", "unique attributes", "value themes", "target customer", "market category"], outputs: ["positioning statement", "category options", "messaging pillars", "validation checklist"] });
  }
  if (name === "pricing_analysis_builder") {
    return jsonText({ market: args.market, competitors: args.competitors || [], sections: ["pricing landscape", "value metric distribution", "packaging strategy", "feature gating matrix", "competitor deep dives", "price positioning map", "recommendations", "data confidence"], validation: ["last verified date", "public source", "estimated data flagged", "enterprise pricing caveat"] });
  }
  if (name === "messaging_hierarchy_builder") {
    return jsonText({ product: args.product, audience: args.audience || "TBD", stack: ["POV", "value proposition", "3 benefits", "proof points", "features"], outputs: ["persona variants", "channel map", "message guardrails", "proof inventory"] });
  }
  if (name === "icp_definition_builder") {
    return jsonText({ product: args.product, market: args.market || "TBD", motion: args.motion || "TBD", dimensions: ["firmographic", "behavioral", "psychographic", "language", "technographic", "trigger events"], outputs: ["primary ICP", "secondary ICP", "anti-ICP", "account tiers", "activation plan", "disqualification checklist"] });
  }
  if (name === "voc_synthesis_plan") {
    return jsonText({ sources: args.sources || [], persona: args.persona || "TBD", synthesis: ["source inventory", "verbatim language", "frequency-weighted themes", "echo language bank", "contradiction map", "objection map", "evidence chains", "messaging implications"] });
  }
  if (name === "sales_narrative_builder") {
    return jsonText({ product: args.product, audience: args.audience || "TBD", ask: args.ask || "TBD", story_arc: ["shift", "cost", "old way", "new way", "proof", "product", "ask"], outputs: ["deck outline", "talk track", "demo narrative", "60-second version", "objection inserts"] });
  }
  if (name === "competitive_landing_page_builder") {
    return jsonText({ competitor: args.competitor, product: args.product, intent: args.intent || "comparison", sections: ["hero", "why switch", "comparison table", "use case fit", "proof", "migration", "FAQ", "CTA", "SEO metadata", "claims review"] });
  }
  if (name === "adaptive_messaging_response") {
    return jsonText({ trigger: args.trigger, competitor: args.competitor || "TBD", posture: args.posture || "choose: ignore, acknowledge, counter, reposition", workflow: ["Detect", "Decide", "Draft", "Deploy"], outputs: ["trigger capture", "response posture", "battlecard", "sales Slack post", "internal FAQ", "what not to say", "deployment checklist"] });
  }
  if (name === "outreach_sequence_builder") {
    return jsonText({ recipient: args.recipient, why_now: args.why_now, channel: args.channel || "email", message_parts: ["specific hook", "bridge", "proof", "one CTA"], cadence: [{ day: 1, channel: args.channel || "email", purpose: "initial" }, { day: 4, channel: "email", purpose: "bump" }, { day: 10, channel: "LinkedIn", purpose: "channel switch" }, { day: 21, channel: "email", purpose: "breakup" }] });
  }
  if (name === "account_research_brief") {
    return jsonText({ company: args.company, domain: args.domain || "TBD", signal: args.signal || "TBD", sections: ["company snapshot", "funding and growth", "tech stack", "stakeholder map", "active signals", "competitive context", "why now", "why us", "hook", "next action"], decision: "If there is no why now, monitor instead of outreach." });
  }
  if (name === "icp_scoring_matrix") {
    return jsonText({ accounts: args.accounts || [], scoring: { firmographic: 30, technographic: 20, organizational: 20, signals: 30 }, tiers: [{ range: "80-100", tier: "Tier 1", action: "immediate research and AE follow-up" }, { range: "60-79", tier: "Tier 2", action: "signal-triggered sequence" }, { range: "40-59", tier: "Tier 3", action: "automated sequence" }, { range: "20-39", tier: "Tier 4", action: "monitor" }, { range: "0-19", tier: "Exclude", action: "remove" }] });
  }
  if (name === "weekly_gtm_update_plan") {
    return jsonText({ week: args.week || "current", focus: args.focus || "GTM context freshness", read: ["current priorities", "signal library", "ICP definition", "competitor radar", "active campaigns", "recent outputs"], checks: ["stale priorities", "campaign results missing", "signal performance outdated", "competitor radar older than 60 days", "ICP evolution older than 90 days"], output: "current vs proposed updates plus human-input questions" });
  }
  if (name === "osp_meta_information_builder") {
    return jsonText({ topic: args.topic, keyword: args.keyword || "TBD", audience: args.audience || "TBD", metadata: { h1: "TBD", meta_title: "50-60 characters", meta_description: "155-160 characters", slug: "seo-friendly-url", search_intent: "TBD", ctr_notes: [] } });
  }
  if (name === "osp_editing_code_review") {
    return jsonText({ content_summary: args.content_summary, content_type: args.content_type || "technical marketing", checks: ["scope", "narrative", "flow", "style", "phrasing", "word choice", "grammar", "technical accuracy", "inclusive language"], output: ["diagnosis", "before-after suggestions", "priority fixes"] });
  }
  if (name === "osp_onpage_seo_checklist") {
    return jsonText({ page: args.page, keyword: args.keyword || "TBD", intent: args.intent || "TBD", checklist: ["intent fit", "H1 and metadata", "keyword placement", "internal links", "content depth", "schema opportunities", "FAQ or how-to blocks", "promotion plan", "measurement plan"] });
  }
  if (name === "slash_command_manifest") {
    const command = args.command || "all";
    const commands = { "/battlecard": "pmm-battlecard", "/positioning": "pmm-positioning-exercise", "/launch-brief": "pmm-launch-brief", "/pricing-analysis": "pmm-pricing-analysis" };
    return jsonText({ command, commands, note: "Claude command shims are included under .claude/commands, but Codex should route to the mapped skills." });
  }

  throw new Error(`Unknown tool: ${name}`);
}
function respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n"); }
function respondError(id, code, message) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n"); }
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (!msg.id && msg.method && msg.method.startsWith("notifications/")) return;
  try {
    if (msg.method === "initialize") return respond(msg.id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "marketing-os", version: "2.1.0" } });
    if (msg.method === "tools/list") return respond(msg.id, { tools: TOOLS });
    if (msg.method === "tools/call") return respond(msg.id, await callTool((msg.params || {}).name, (msg.params || {}).arguments || {}));
    respondError(msg.id, -32601, `Method not found: ${msg.method}`);
  } catch (err) { respondError(msg.id, -32000, err && err.message ? err.message : String(err)); }
});
