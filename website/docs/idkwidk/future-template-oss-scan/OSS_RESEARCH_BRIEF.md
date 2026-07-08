# OSS Research Brief: Future Template Building Blocks

Date: 2026-05-20

## Original Objective
Evaluate the user's repo list as possible building blocks for a reusable SaaS/product template that can support small plugins, Chrome extensions, internal tools, and larger SaaS platforms.

## Search Terms Used
- Direct GitHub repository metadata for each provided repo.
- Direct GitHub root source layout for each provided repo.
- Web search for `pqoqubbw/icons` after a typo in the first GitHub CLI query.

## Template Strategy
The right architecture is a small core with optional modules, not one giant app.

Core should be:
- Next.js app shell
- Clerk auth
- Convex backend
- Provider registry
- Blog/docs content system
- Billing adapter layer
- Feature flag adapter layer
- Analytics adapter layer
- Observability adapter layer
- Onboarding adapter layer
- Deployment recipes

Optional services should live as Docker profiles, setup recipes, or separate packages. They should not become required dependencies for every new product.

## Repo Classification

| Repo | What it is | License signal | Template role | Recommendation |
| --- | --- | --- | --- | --- |
| plausible/analytics | Privacy-first web analytics, Elixir/Phoenix, Postgres/ClickHouse | AGPL-3.0 | Optional analytics service | Good self-hosted analytics option, but do not copy into core. Add `ANALYTICS_PROVIDER=plausible` adapter/docs. |
| makeplane/plane | Project/product management platform, Linear/Jira alternative | AGPL-3.0 | Optional product ops service | Useful for internal roadmap/issues. Keep as external service or reference only. Too big for core. |
| Unleash/unleash | Feature management and experiments | Apache-2.0 | Feature flag provider | Strong candidate for optional feature flag service. Core should expose a feature-flag interface. |
| highlight/highlight | Observability, session replay, logs, traces | Other/custom | Observability reference/service | Good product reference, but license needs deeper review before reuse. Prefer adapter/docs. |
| shipgtm/router | Form handling and lead routing | AGPL-3.0 | Marketing ops module reference | Useful for lead-routing workflow ideas. Keep external/reference due AGPL. |
| Openpanel-dev/openpanel | Web and product analytics | AGPL-3.0 | Optional product analytics service | Good Mixpanel-like option. Add adapter/docs, not copied core. |
| multica-ai/multica | Managed coding-agent/skills platform | Other/custom | Agent ops reference/service | Useful for agent-task product patterns. License and architecture need deeper audit. |
| rajput-hemant/lipi | Notion-like collaborative workspace | MIT | Docs/workspace reference | MIT and Next/shadcn fit are useful. WIP and smaller adoption mean inspect before adoption. |
| docmost/docmost | Collaborative wiki/docs/knowledge base | AGPL-3.0 | Optional docs/wiki service | Strong external docs/wiki service, not core code. |
| nolly-studio/cult-ui | Tailwind/shadcn-compatible animated UI components | MIT | UI component source | Good candidate for selective, attributed UI inspiration/components. Use sparingly to avoid decorative UI drift. |
| JCodesMore/ai-website-cloner-template | AI website cloning starter | MIT | Design/research tool reference | Useful as an optional internal tool for reference capture, not core product feature. |
| fastrepl/anarlog | Local-first AI notes/meeting app | MIT | Desktop/local-first reference | Useful reference if template later supports desktop/Tauri/local-first products. Not core. |
| DenchHQ/DenchClaw | Local productivity, CRM automation, outreach agents | MIT | Sales/outreach/agent reference | Potentially relevant to Quick Ping-like flows. Needs deeper source audit before reuse. |
| Dokploy/dokploy | Self-hosted deployment platform | Other/custom plus proprietary files | Deployment option | Useful as deployment recipe/reference. Do not embed. |
| openai/symphony | Codex/agent orchestration in isolated implementation runs | Apache-2.0 | Agent workflow reference | Strong reference for agent run orchestration. Keep as optional advanced module/reference. |
| paperclipai/paperclip | Agent management work app | MIT | Agent operations reference | Interesting agent team/workflow patterns. Needs deeper audit before reuse. |
| TryGhost/Ghost | Publishing, memberships, newsletters | MIT | Publishing/blog service option | Strong optional CMS/publishing service, but likely overkill if template uses MDX blog. |
| pqoqubbw/icons | Animated icons for React/TypeScript | MIT | UI asset library | Useful for selective icon/micro-interaction assets. Keep restrained and accessible. |
| rybbit-io/rybbit | Privacy-friendly web/product analytics | AGPL-3.0 | Optional analytics service | Strong Plausible/OpenPanel alternative. Keep as provider adapter/service profile. |
| btseytlin/hr-breaker | AI resume optimizer | MIT | Vertical app example | Useful for vertical SaaS/product patterns, not a template primitive. |
| spacedriveapp/spacebot | AI agent for teams and communities | Other/custom | Agent/community automation reference | Useful reference, not core until license/source audit is complete. |
| eracle/OpenOutreach | LinkedIn automation and outreach | Other/custom | Sales/outreach reference | Useful concepts, but high platform-policy risk. Do not ship as default module. |
| AppFlowy-IO/AppFlowy | Open-source Notion alternative | AGPL-3.0 | Optional workspace service/reference | Strong product/reference, too large and copyleft for core. |
| openreplay/openreplay | Session replay, cobrowsing, product analytics | Other/custom | Optional session replay service | Useful for debugging/customer success. Keep as external service option. |
| papermark/papermark | DocSend alternative with analytics and custom domains | Other/custom | Sales enablement/doc-sharing reference | Very relevant for sales/customer lifecycle. Need license review before reuse. |
| ixartz/SaaS-Boilerplate | Next.js SaaS boilerplate with auth, tenancy, roles, i18n, testing | MIT | SaaS foundation reference | Best direct foundation reference from this list. Still adapt, do not blindly adopt everything. |
| formbricks/formbricks | Survey, feedback, and experience management platform | Other/custom | Optional feedback service | Add as a product feedback and research recipe. Do not copy the full platform into core. |
| chatwoot/chatwoot | Live chat, email support, and shared support desk | Other/custom | Optional support service | Add as the customer support recipe and widget/provider integration. |
| twentyhq/twenty | Open-source CRM/Salesforce alternative | Other/custom | Optional CRM service | Add as CRM integration/service recipe for sales and customer success workflows. |
| calcom/cal.com | Scheduling infrastructure | MIT | Scheduling adapter/service | Add as default scheduling integration reference for demos, onboarding, support calls, and interviews. |
| dubinc/dub | Link attribution, short links, and campaign tracking | Other/custom | Attribution/link provider | Add as growth attribution adapter/service recipe. |
| Kiranism/next-shadcn-dashboard-starter | Next.js 16 shadcn dashboard starter | MIT | Product dashboard reference | Add as the primary dashboard starter reference, but adapt it to the no-card-soup split-view rule. |

## Recommended Template Layers

### Layer 1: Core Product App
- Next.js app shell
- Clerk auth
- Convex backend
- Stripe and Polar billing adapters
- Resend email adapter
- MDX/Fumadocs-style docs/blog
- Provider registry with environment-driven switches

### Layer 2: Product Command Center
- Persistent sidebar
- Top toolbar
- Main table/list/feed region
- Right inspector panel
- Activity timeline
- Settings area for providers, billing, team, roles, usage, flags, analytics

### Layer 3: Optional Built-In Adapters
- Analytics: Plausible, OpenPanel, Rybbit
- Feature flags: Unleash
- Observability: Highlight, OpenReplay
- Deployment: Vercel by default, Dokploy recipe for self-hosting
- Onboarding: Usertour optional service profile from previous scan
- Sales/docs: Papermark-style document sharing, Router-style lead routing
- Knowledge base: Docmost/AppFlowy/Ghost as external service recipes
- Feedback: Formbricks as service recipe or SDK integration
- Support: Chatwoot as shared inbox/live-chat service recipe
- CRM: Twenty as external CRM recipe or sync target
- Scheduling: Cal.com adapter
- Attribution: Dub adapter

### Layer 4: Reference-Only Inspiration
- Plane for product/project management UX
- Kiranism dashboard starter for Next 16/shadcn dashboard structure
- AppFlowy/Docmost/Lipi for collaborative docs/workspace patterns
- Multica/Paperclip/Symphony/Spacebot for agent operation patterns
- Cult UI/pqoqubbw icons for micro-interactions
- AI website cloner template for research tooling

## Recommended First Implementation Slice
Create a `template-capabilities` architecture page and provider registry in the website first. It should show:
- Core stack
- Optional modules
- Which repos inspired each module
- Provider status: built-in, adapter-ready, service recipe, reference only
- Plain setup instructions for each optional service

This gives the project a usable map before we wire code that may be expensive to remove.

## Risks and Unknowns
- AGPL repos should not be copied into an MIT/private core without deliberate license acceptance.
- `Other/custom` license repos need manual license-file review before any code reuse.
- Many listed repos are full products, not libraries. Full products belong beside the template, not inside it.
- Some repos may have heavy infrastructure requirements: ClickHouse, Postgres, Redis, object storage, workers, browser automation, mobile/desktop runtimes, or custom deployment services.

## Source Audit Notes
- `ixartz/SaaS-Boilerplate` package manifest confirms Clerk, Drizzle, Stripe, Sentry, TanStack Table, Storybook, Vitest, and Playwright. It is a good SaaS reference, but it is still on Next 14/React 18, so use patterns selectively.
- `Unleash/unleash` package manifest confirms it is a full Node service that needs Postgres and its own frontend/backend build. Treat it as a provider, not inline code.
- `Openpanel-dev/openpanel` root manifest confirms a private pnpm monorepo with Docker, ClickHouse, Redis, DB packages, and Vitest. Treat it as an external analytics service.
- `rybbit-io/rybbit` Docker Compose confirms ClickHouse, Postgres, backend, client, and optional Caddy. Treat it as an external analytics service.
- `Papermark` package manifest confirms a large Next app with Prisma, Stripe, Resend, Trigger.dev, Vercel Blob, S3, AI SDK, and document processing. Its license file says most non-enterprise code is AGPLv3, so use as service/reference unless licensing is accepted.
- `Highlight` license file says the main open-source content is Apache-licensed outside enterprise/restricted directories. It is more reusable than the GitHub `Other` label implies, but still best treated as an observability provider.
- `OpenReplay` license file says content defaults to AGPLv3 with some MIT portions and enterprise restrictions. Treat it as external service/reference.
- `Formbricks`, `Chatwoot`, `Twenty`, and `Dub` are active full products with non-MIT or custom license signals from GitHub. Treat as optional services/integrations until license files are reviewed deeply.
- `Cal.com` and `Kiranism/next-shadcn-dashboard-starter` reported MIT license signals. They are better candidates for code-level learning, but Cal.com is still a full product and Kiranism should be adapted to the template's split-view UI rule.

## Next Best Action
Build the template capability map into the current website/docs, then pick one vertical slice to wire first: analytics provider registry is the safest because Plausible/OpenPanel/Rybbit can share one small adapter interface.
