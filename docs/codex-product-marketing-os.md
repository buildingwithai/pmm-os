# Product Marketing OS Architecture

## Goal

The plugin should behave like a product marketing and growth operating system. A user should be able to ask for one deliverable and get the adjacent deliverables Codex needs to make it actionable.

## Workflow families

| Workflow | Main skill | Supporting skills | Typical outputs | MCPs that add leverage |
|---|---|---|---|---|
| Product context | `product-marketing-os`, `pmm-product-context` | `product-marketing`, `customer-research` | `.agents/product-marketing.md`, ICP, positioning, proof | GitHub, Google Drive, Notion, Slack, HubSpot |
| Messaging | `pmm-messaging-positioning` | `copywriting`, `copy-editing`, `cro` | message house, value props, personas, page briefs | Google Drive, Figma, Webflow, CMS |
| Competitive intel | `pmm-competitive-intelligence` | `competitor-profiling`, `competitors`, `sales-enablement` | battlecards, comparison inputs, objection handling | Exa, Google Search Console, Semrush, Ahrefs, CRM |
| Customer research | `pmm-customer-research` | `customer-research`, `revops` | ICP, JTBD, VoC, win-loss themes | Gong, Zoom, HubSpot, Salesforce, Intercom |
| Pricing | `pmm-pricing-packaging` | `pricing`, `paywalls`, `analytics` | package matrix, pricing page plan, value metric | Stripe, Paddle, ProfitWell, GA4, Mixpanel |
| GTM launch | `pmm-go-to-market` | `launch`, `emails`, `social`, `ads`, `sales-enablement` | launch tier, launch plan, activity checklist, timeline | Linear, GitHub, Slack, Mailchimp, Google Ads, GA4 |
| Experimentation | `cro`, `ab-testing`, `analytics` | `copywriting`, `signup`, `onboarding` | hypotheses, variants, metrics, event plan | GA4, Mixpanel, PostHog, Optimizely, Playwright |

## Behind-the-scenes chain

1. Hooks identify the request and load product context.
2. The orchestrator skill maps the job to a workflow family.
3. The MCP server retrieves the right references, templates, and integration recommendations.
4. Focused skills create the artifact.
5. The MCP layer recommends next system actions, such as creating a Linear launch checklist, pulling GA4 baseline data, or drafting CRM enablement notes.
6. Safety hooks add friction before production writes.
7. The quality gate checks for missing PMM basics: audience, claim, proof, owner, due date, channel, metric, and dependency.

## Where artifacts should live

Default to this structure unless the user asks otherwise:

```text
.agents/
  product-marketing.md
  marketing-os/
    messaging.md
    competitive-intelligence.md
    customer-research.md
    pricing-packaging.md
    launch-plan.md
    enablement.md
    measurement-plan.md
```

## Data handling

Marketing systems often include PII, ad spend, customer revenue, and private pipeline data. The plugin should prefer aggregated outputs and redacted summaries. Use dry-run or preview modes before changing ad campaigns, CRM objects, email sends, payment records, or public site content.
