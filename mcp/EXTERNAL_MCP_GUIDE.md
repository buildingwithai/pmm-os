# External MCP Guide for PMM OS

The bundled `marketing-os` MCP is read-only and local. It routes workflows, exposes templates, and recommends tools. For live systems, connect external MCP servers based on the workflow.

## Default external MCP stack

| Workflow | MCPs |
|---|---|
| Planning | GitHub, Linear, Slack, Google Drive, Google Sheets, Notion |
| Research | Exa, Google Search Console, Semrush, Ahrefs, RankParse, Gong, Zoom, Intercom |
| Technical marketing | OSP Marketing Tools, Google Search Console, Exa, schema/SEO tooling |
| Analytics | GA4, Mixpanel, Amplitude, PostHog, Segment |
| PLG and product analytics | Mixpanel, Amplitude, PostHog, GA4, Segment, Stripe, HubSpot, Salesforce |
| Product lifecycle | GitHub, Linear, Jira, Google Docs, Google Drive, Figma, Playwright, Chrome DevTools |
| PRD and prototype | GitHub, Linear, Jira, Figma, Playwright, Chrome DevTools, Google Docs |
| Post-launch learning | Analytics MCPs, CRM MCPs, Gong, Zoom, Intercom, Slack, support tools |
| Ads | Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads |
| Lifecycle | Mailchimp, Customer.io, Resend, SendGrid, Postmark, Kit, Klaviyo |
| CRM and RevOps | HubSpot, Salesforce, Close, Outreach, ZoomInfo, Clay |
| Monetization | Stripe, Paddle, Rewardful, Tolt, PartnerStack |
| Publishing | Webflow, WordPress, Contentful, Sanity, Strapi |
| Visual and QA | Figma, Playwright, Chrome DevTools, image generation tools |

## OSP Marketing Tools

Use the OSP MCP for technical marketing workflows:

- Product value maps
- Metadata generation
- Semantic editing reviews
- Technical writing guidance
- On-page SEO reviews

Keep OSP as an external MCP because it carries its own methodology and CC BY-SA 4.0 license obligations.

## Composio bridge

Use Composio when a marketing tool has difficult OAuth setup or no stable first-party MCP. Good candidates include HubSpot, Salesforce, Meta Ads, LinkedIn Ads, Google Sheets, Slack, and Notion.

## Approval policy

Use this policy for production systems:

1. Read-only by default.
2. Preview before write.
3. Dry run when available.
4. User approval before sending email, launching ads, publishing CMS content, updating CRM records, charging customers, changing pricing, or modifying analytics configuration.

## Artifact systems

For deliverables, Codex can create files directly in the repo. Recommended file outputs:

- Markdown for drafts
- DOCX for stakeholder briefs
- PPTX for decks
- CSV for calendars and post packs
- JSON for image prompts and structured handoffs
- HTML for landing page prototypes

Use `pmm-artifact-factory` to plan the bundle before generating files. Use `prd-prototype-factory` when the deliverable should include a PRD, acceptance criteria, analytics events, or a prototype scaffold. Use `plg-gtm-strategy` when the artifact should include activation, retention, expansion, or PQL/PQA metrics.
