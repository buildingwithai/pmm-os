#!/usr/bin/env python3
"""Route likely marketing, PMM, GTM, coaching, and artifact prompts before the model responds."""

from __future__ import annotations

import re
from _common import emit_additional, read_event

ROUTES = [
    (r"\b(/battlecard|/positioning|/launch-brief|/pricing-analysis)\b", ["pmm-battlecard", "pmm-positioning-exercise", "pmm-launch-brief", "pmm-pricing-analysis"], ["marketing-os.slash_command_manifest"]),
    (r"\b(i have a (product|app|tool|feature|startup|extension|saas|platform)|take (it|this|my product|my app|my feature) to market|go to market with|launch (my|our|a|this) (product|feature|app|tool)|i'?m building|we'?re building|help me (launch|take .* to market)|new product called|product called)\b", ["pmm-research-brief", "product-marketing-os", "pmm-research-desk"], ["marketing-os.route_marketing_workflow"]),
    (r"\b(research|deep dive|deep-dive|deep research|look (this |it )?up|find out|what (are|do) people say(ing)?|what people (are )?say|sentiment|social listening|trending|what'?s trending|scrape|see what'?s being said|read this (url|link|post|thread)|search (twitter|x|reddit|youtube|github|the web|xiaohongshu|bilibili))\b", ["pmm-research-desk", "last30days", "agent-reach", "pmm-voc-synthesis", "pmm-customer-research"], ["marketing-os.route_marketing_workflow"]),
    (r"\b(event|events|conference|conferences|field marketing|sponsorship|sponsor|trade show|tradeshow|booth|cfp|expo|summit|meetup)\b", ["pmm-research-desk", "pmm-go-to-market", "pmm-campaign-brief"], ["marketing-os.route_marketing_workflow"]),
    (r"\b(plg|product-led growth|product led growth|activation|aha moment|time to value|growth loop|pql|pqa|free trial|freemium|reverse trial|north star|aarrr|retention|expansion|churn)\b", ["plg-gtm-strategy", "analytics", "pricing", "onboarding"], ["marketing-os.plg_readiness_assessment", "marketing-os.plg_metrics_map", "marketing-os.growth_loop_designer", "marketing-os.recommend_mcp_servers"]),
    (r"\b(product lifecycle|product strategy|roadmap|prioritization|rice|moscow|prd|requirements document|product spec|user stories|acceptance criteria|prototype|wireframe|mockup|html prototype)\b", ["product-lifecycle-os", "prd-prototype-factory", "pmm-go-to-market", "pmm-artifact-factory"], ["marketing-os.pm_lifecycle_plan", "marketing-os.prd_plan_builder", "marketing-os.prototype_brief_builder", "marketing-os.artifact_bundle_plan"]),
    (r"\b(post-launch|post launch|retrospective|impact analysis|campaign readout|feedback synthesis|iteration plan|adoption review|measure impact)\b", ["post-launch-learning-loop", "pmm-coach", "plg-gtm-strategy", "analytics"], ["marketing-os.post_launch_learning_plan", "marketing-os.pmm_coach_review", "marketing-os.recommend_mcp_servers"]),
    (r"\b(product marketing|pmm|positioning|messaging|value proposition|message house|tagline|persona messaging)\b", ["product-marketing-os", "pmm-product-context", "pmm-positioning-exercise", "pmm-positioning-audit", "pmm-messaging-hierarchy"], ["marketing-os.route_marketing_workflow", "marketing-os.list_pmm_resources"]),
    (r"\b(launch|go to market|gtm|rollout|release plan|announcement|beta|ga|general availability|feature flag)\b", ["pmm-research-brief", "pmm-research-desk", "product-marketing-os", "pmm-go-to-market", "pmm-launch-brief", "pmm-campaign-brief", "pmm-artifact-factory", "pmm-launch-kit", "launch", "emails", "social", "sales-enablement"], ["marketing-os.launch_plan_builder", "marketing-os.artifact_bundle_plan", "marketing-os.recommend_mcp_servers"]),
    (r"\b(campaign brief|creative brief|campaign plan|smp|single-minded|single minded)\b", ["pmm-campaign-brief", "pmm-artifact-factory", "pmm-coach"], ["marketing-os.campaign_brief_builder", "marketing-os.artifact_bundle_plan"]),
    (r"\b(deliverable|artifact|asset pack|launch kit|slides|pptx|docx|deck|social posts|mockup|image prompt|generate images|visual)\b", ["pmm-artifact-factory", "pmm-launch-kit", "pmm-coach"], ["marketing-os.artifact_bundle_plan", "marketing-os.image_prompt_pack"]),
    (r"\b(feedback|critique|review my|pressure test|roleplay|walk through|coach|improve this|30-60-90|30 60 90)\b", ["pmm-coach"], ["marketing-os.pmm_coach_review"]),
    (r"\b(signal|account research|outbound sequence|prospecting|icp scoring|target account|sales sequence)\b", ["gtm-account-research", "gtm-icp-scoring", "gtm-signal-campaign", "pmm-outreach", "cold-email", "revops"], ["marketing-os.gtm_signal_campaign_plan", "marketing-os.recommend_mcp_servers"]),
    (r"\b(aeo|geo|ai visibility|llm citation|answer engine|generative engine|chatgpt mentions|ai search)\b", ["pmm-aeo-geo", "ai-seo", "schema", "pmm-competitive-intelligence"], ["marketing-os.route_marketing_workflow", "marketing-os.recommend_mcp_servers"]),
    (r"\b(feature announcement|release notes|changelog|product update|announce this)\b", ["pmm-feature-announcement", "emails", "social", "image"], ["marketing-os.image_prompt_pack", "marketing-os.artifact_bundle_plan"]),
    (r"\b(value map|technical marketing|metadata|technical writing|editing codes|on-page seo|osp)\b", ["osp-value-map", "osp-content-optimizer", "osp-technical-marketing", "ai-seo", "schema", "content-strategy"], ["marketing-os.osp_value_map_skeleton", "marketing-os.recommend_mcp_servers"]),
    (r"\b(naming|rename|product name|feature name|brand name|program name)\b", ["product-marketing-os", "pmm-messaging-positioning"], ["marketing-os.naming_scorecard", "marketing-os.read_pmm_resource"]),
    (r"\b(competitor|competitive|battlecard|battle card|alternatives|comparison page|objection)\b", ["pmm-research-desk", "pmm-battlecard", "pmm-adaptive-messaging", "pmm-competitive-intelligence", "last30days", "agent-reach", "competitor-profiling", "competitors", "sales-enablement"], ["marketing-os.recommend_mcp_servers"]),
    (r"\b(customer research|voice of customer|voc|jtbd|jobs to be done|win loss|persona|icp)\b", ["pmm-research-desk", "pmm-icp-definition", "pmm-voc-synthesis", "pmm-personas", "pmm-customer-research", "last30days", "agent-reach", "customer-research", "revops"], ["marketing-os.route_marketing_workflow"]),
    (r"\b(pricing|packaging|tier|plan|sku|value metric|monetization|paywall)\b", ["pmm-research-desk", "pmm-pricing-analysis", "pmm-pricing-packaging", "pricing", "paywalls", "analytics", "plg-gtm-strategy"], ["marketing-os.recommend_mcp_servers"]),
    (r"\b(market analysis|category|tam|swot|porter|five forces|pestel|market research|channels|communities|where (do|does) (my|our|the) (icp|audience|buyers?)|kol|influencer|analyst relations)\b", ["pmm-research-desk", "pmm-positioning-exercise", "pmm-go-to-market", "pmm-aeo-geo"], ["marketing-os.route_marketing_workflow"]),
    (r"\b(cro|conversion|landing page|homepage|signup|funnel|ab test|a/b test|experiment)\b", ["product-marketing-os", "cro", "copywriting", "analytics", "ab-testing"], ["marketing-os.lookup_skill", "marketing-os.recommend_mcp_servers"]),
    (r"\b(seo|keyword|schema|programmatic seo|ai seo|search console|content strategy)\b", ["product-marketing-os", "seo-audit", "ai-seo", "schema", "content-strategy"], ["marketing-os.list_marketing_tools"]),
    (r"\b(ad|ads|paid search|google ads|meta ads|linkedin ads|creative)\b", ["product-marketing-os", "ads", "ad-creative", "analytics", "pmm-campaign-brief"], ["marketing-os.recommend_mcp_servers"]),
    (r"\b(email|newsletter|lifecycle|drip|sequence|cold email|transactional)\b", ["product-marketing-os", "emails", "cold-email", "copywriting"], ["marketing-os.recommend_mcp_servers"]),
]


def main() -> None:
    event = read_event()
    prompt = str(event.get("prompt", ""))
    lower = prompt.lower()
    skills: list[str] = []
    tools: list[str] = []
    for pattern, route_skills, route_tools in ROUTES:
        if re.search(pattern, lower):
            for skill in route_skills:
                if skill not in skills:
                    skills.append(skill)
            for tool in route_tools:
                if tool not in tools:
                    tools.append(tool)
    if not skills:
        return
    lines = [
        "PMM OS routing note:",
        "- Consider skills: " + ", ".join(f"${s}" for s in skills[:10]),
        "- Consider bundled MCP tools: " + ", ".join(tools[:8]),
        "- Prefer the unified chain: context -> research -> product or PLG strategy -> positioning -> messaging -> PRD/prototype or GTM plan -> artifacts -> PMM Coach review -> interactive launch kit (pmm-launch-kit) -> measurement -> iteration.",
        "- If the user asks for a launch, campaign, or GTM motion, create concrete deliverables instead of stopping at advice.",
        "- ALWAYS finish a launch or GTM motion by building the interactive launch-kit HTML (pmm-launch-kit): author one kit-content.json from the artifacts, then run `node <PMM OS>/skills/pmm-launch-kit/scripts/build-kit.mjs <launch-folder>` (no copy needed). The clickable kit -- not just markdown -- is the deliverable. Skip only if the user says they don't want it.",
        "- For production systems, prefer read-only or dry-run operations before write actions.",
        "- RESEARCH FRONT DOOR: if the user describes a product/feature + a goal (launch, GTM, 'take it to market', positioning) -- often a rambling brain-dump -- START with `pmm-research-brief`. It distills the ramble into a Product Brief + a COMPLETE, MANDATORY Research Plan across ALL 10 desks (product, customer, competitive, market, pricing, channels, analyst/KOL, EVENTS, REVIEWS, GTM/launch) -- scope each with named entities, skip NONE (events is always in: which events, never whether). Then run them via `pmm-research-desk`. An impeccable launch needs the full sweep; do not jump to strategy before the brief + the research land in the evidence ledger.",
        "- RESEARCH: PMM OS ships TWO complementary research engines -- run them, don't guess. `last30days` = engagement-ranked, last-30-days sentiment across Reddit/X/YouTube/TikTok/HN/Polymarket/GitHub (what people actually say, scored by upvotes/likes/money). `agent-reach` = breadth-first fetch/read across 13 platforms (strong on GitHub/dev, video transcripts, web, and Chinese platforms: XiaoHongShu/Bilibili/Xueqiu/V2EX). For VoC, competitive, or any 'what are people saying' task, run BOTH and synthesize -- two independent source pools beats one. They are separate skills by design; do not merge them.",
        "- CAPTURE + HYDRATE: research is not a throwaway chat reply. After a research run, SAVE it to .agents/research/runs/<date>-<slug>-<engine>.md and DISTILL it into the sourced evidence ledger .agents/research/evidence.md (via pmm-product-context). Every other skill HYDRATES from that ledger -- so the same research feeds positioning, messaging, personas, competitive, pricing, and launch, with real citations. See skills/product-marketing-os/references/research-context-pipeline.md.",
        "",
        "GROUND BEFORE YOU GENERATE:",
        "- Never invent product facts (customers, numbers, competitors, proof). Read shared context first (pmm-product-context / .agents/product-marketing.md) AND the research evidence ledger (.agents/research/evidence.md) when they exist. If the ledger already answers a fact, USE it and CITE its source -- do not invent it or re-ask the user.",
        "- If the specifics needed for a non-generic answer are missing, either ask 2-3 sharp questions OR state explicit, labeled assumptions and proceed -- never silently fill the gap with generic filler. A confident, specific answer built on guessed inputs is still the failure mode.",
        "- Gold-standard worked examples for the core deliverables live at skills/product-marketing-os/references/examples/ -- match their level of specificity, reasoning, and proof.",
        "",
        "DEPTH STANDARD (apply to EVERY section, not just long-form):",
        "- Substantive, not bare-minimum. The failure mode is a section reduced to one generic line or a label with a sentence under it. Each section must be:",
        "  - SPECIFIC: name the actual alternatives, segments, numbers, and scenarios. Never 'competitors', 'users', or 'better' -- say which, who, how much.",
        "  - COMPLETE: cover the real dimensions of the section, not just the first one (positioning is alternatives + unique attributes + value + segment + category, each reasoned -- not a tagline).",
        "  - REASONED: show the thinking -- the why, the trade-off, the alternative you considered and rejected. A conclusion with no reasoning is just an assertion.",
        "  - EVIDENCED: every claim carries a proof, example, or source. If you lack one, state what proof is needed rather than asserting.",
        "  - DECISION-USEFUL: someone could act on it.",
        "- Depth is NOT length: a positioning statement is two sentences; a value prop is one. Do not pad. But never one-line-stub a section that deserves real thinking -- if a section is thin, the thinking is thin, so go deeper.",
        "- Before finishing, self-check each section against specific / complete / reasoned / evidenced. Expand anything bare-minimum.",
    ]
    emit_additional("UserPromptSubmit", "\n".join(lines))


if __name__ == "__main__":
    main()
