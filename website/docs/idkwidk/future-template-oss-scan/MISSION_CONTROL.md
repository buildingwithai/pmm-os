# Mission Control: Future Template OSS Scan

## Original Objective
Use idkWidk to go through the user's GitHub repo list and decide what should become part of a reusable future SaaS/product template.

## Current Phase
OSS research and architecture classification.

## Active Blocker
None. The current work is a planning pass, not a code integration pass.

## Evidence Collected
- Live GitHub metadata was queried with `gh repo view` for the listed repos.
- Root source layouts were queried with `gh api repos/<owner>/<repo>/contents`.
- `pqoqubbw/icons` was checked by web search because an initial command typo failed.

## Decisions
- Treat the list as candidate building blocks, not a mandate to copy every repo into the core.
- Separate core template code from optional services and external-service adapters.
- Do not copy AGPL/custom licensed code into the core template without a deliberate license decision.
- Keep the future app UI aligned with AGENTS.md: sidebar, toolbar, main list/feed/table, and right inspector.

## Side Quests
- Missing `rg` locally: Parked. Use `grep/find` for now.
- Exact legal interpretation of custom/AGPL licenses: Parked. Engineering guidance only.

## Next Best Action
Write the OSS research brief and identify the first implementation slice.

## Progress Update: 2026-05-20
- Added a visible `/template` capability map to the website.
- Added `apps/website/app/lib/template-capabilities.ts` as the first structured map of core, adapter-ready, service-recipe, and reference-only capabilities.
- Added `apps/website/app/lib/analytics-providers.ts` as the first provider registry slice for Plausible, OpenPanel, and Rybbit.
- Wired the new page into Home, Docs, and Blog navigation.

## Current Verification Target
- `npm run build` passed in `apps/website`.
- `/template` returned HTTP 200 from the local dev server.
- Playwright screenshots were captured:
  - `/tmp/idkwidk-template-map.png`
  - `/tmp/idkwidk-template-map-mobile.png`
- Desktop and mobile renders use sidebar, rows, dividers, and inspector layout instead of card grids.

## Progress Update: Additional Lifecycle Repos
- Added Formbricks, Chatwoot, Twenty, Cal.com, Dub, and Kiranism dashboard starter to the template capability map.
- Verified live GitHub metadata and root source layouts for those repos before classifying them.
- Classified Formbricks, Chatwoot, Twenty, and Dub as optional service/integration recipes because they are full products with non-MIT/custom license signals.
- Classified Cal.com as adapter-ready scheduling and Kiranism as the primary dashboard starter reference to adapt.

## Progress Update: Provider Layer Start
- Added `apps/website/app/lib/provider-registry.ts`.
- Added `docs/idkwidk/future-template-oss-scan/PROVIDER_LAYER.md`.
- Updated `/template` to render the provider layer by category.
- This is intentionally metadata-first: no service SDKs were installed yet.

## Progress Update: App Shell Start
- Added `/app` as a command-center route.
- The route uses a sidebar, toolbar, central provider list, category filters, search input, and right inspector.
- The route is client-side only where needed for row selection and filtering.
- Kiranism is treated as dashboard-shell inspiration, but the implementation follows the no-card-soup split-view rule.

## App Shell Verification
- `npm run build` passed after the app shell route was added.
- `/app` returned HTTP 200 locally.
- Screenshots were captured:
  - `/tmp/idkwidk-app-shell.png`
  - `/tmp/idkwidk-app-shell-mobile.png`
- One CSS warning about `align-items: end` was fixed by using `flex-end`.

## Progress Update: Provider Health
- Added `apps/website/app/lib/provider-health.ts`.
- Split `/app` into a server wrapper and `AppCommandCenterClient`.
- The server wrapper checks required env keys and passes only status, configured key names, and missing key names to the client.
- `/app` now shows provider health in the list and right inspector.
- `npm run build` passed.
- `/app` returned HTTP 200 locally.
- Screenshots were captured:
  - `/tmp/idkwidk-app-health.png`
  - `/tmp/idkwidk-app-health-mobile.png`
  - `/tmp/idkwidk-app-health-mobile-full.png`

## Progress Update: Provider Recipes
- Added dynamic provider setup recipe route at `/app/providers/[providerId]`.
- Each provider recipe shows setup text, boundaries, license posture, env keys, health status, source repo, and implementation steps.
- Linked the selected provider inspector to its setup recipe.

## Progress Update: First Adapter Interfaces
- Added no-SDK adapters under `apps/website/app/lib/adapters/`.
- Added feature flag adapter with `off` and `unleash` provider modes.
- Added scheduling adapter with `off` and `cal` provider modes.
- Added attribution adapter with `off` and `dub` provider modes.
- Updated provider layer docs to record adapter boundaries.

## Progress Update: Adapter Playground
- Added `/app/playground` as a split-view adapter test surface.
- The playground exercises feature flags, scheduling URL generation, and attribution URL generation without requiring SDK installs.
- Added pure URL builder helpers so client-side previews can use the same provider-boundary logic safely.

## Progress Update: Provider-Specific Recipes
- Added `apps/website/app/lib/provider-recipes.ts`.
- Added deeper setup recipes for Formbricks, Chatwoot, Twenty, Cal.com, and Dub.
- Updated `/app/providers/[providerId]` so matching providers show product use, environment examples, verification checks, and owner notes.

## Progress Update: Customer Lifecycle Adapters
- Added no-SDK adapters for Formbricks, Chatwoot, and Twenty boundaries.
- Feedback adapter can describe and queue survey prompt events.
- Support adapter creates safe Chatwoot-style identity payloads.
- CRM adapter normalizes lead data before any Twenty API sync exists.
- Updated `/app` and `/app/playground` so these adapters are visible and testable.

## Progress Update: Adapter Smoke Tests
- Added `tsx` as the smallest TypeScript test runner bridge for Node's built-in test runner.
- Added `npm run test:adapters`.
- Added smoke tests for feature flags, scheduling, attribution, feedback, support, and CRM adapters.
- Parked npm audit findings from the `tsx` install because force-fixing dependencies is unrelated to the current adapter slice.

## Progress Update: Public Integration Docs
- Added `/docs/integrations` as the public guide for turning optional providers on.
- Linked the integration guide from `/docs`.
- The guide explains provider boundaries, adapter-first setup, provider rows, recipe links, and a minimum env file with providers disabled.

## Progress Update: Core Stack Docs
- Added `/docs/core-stack` for Clerk, Convex, and Stripe setup.
- Linked the core stack guide from `/docs`.
- The guide explains ownership boundaries, environment keys, setup order, and verification checks for the required app spine.

## Progress Update: Product Dashboard Starter
- Added `apps/website/app/lib/core-stack-health.ts`.
- Added `/app/dashboard` as a split-view product dashboard starter.
- The dashboard shows core stack readiness, provider readiness, product ownership rows, core health rows, lifecycle adapter state, and a right inspector.
- Linked the route from `/app`.

## Progress Update: Pricing and Billing Boundary
- Added `apps/website/app/lib/adapters/billing.ts` with no-SDK Stripe billing plans and checkout mode.
- Added `/pricing` as a starter pricing route connected to the billing adapter.
- Added `/docs/billing` as the public Stripe billing setup guide.
- Added `/api/billing/checkout` as a safe route stub that returns setup errors until real Stripe SDK checkout is implemented.
- Updated adapter smoke tests to cover billing off mode and Stripe subscription mode.
- Linked pricing and billing docs from the home, docs, and core stack pages.

## Progress Update: Product Settings Starter
- Added `/app/settings` as a split-view settings route.
- The route shows organization ownership, plan access, provider setup, access boundaries, managed provider health, core health, and implementation notes.
- Linked settings from `/app` and `/app/dashboard`.

## Progress Update: Account Settings Persistence Boundary
- Added `apps/website/app/lib/settings-boundary.ts`.
- Added `/api/settings/organization` with safe GET and POST stubs.
- Added `/docs/account-settings` explaining Clerk access ownership and Convex persistence ownership.
- Linked account settings docs from `/docs` and `/app/settings`.

## Progress Update: Activity Feed Boundary
- Added `apps/website/app/lib/activity-boundary.ts`.
- Added `/api/activity` as a safe seed-event route until Convex queries are implemented.
- Added `/app/activity` as a split-view product activity feed.
- Linked activity from `/app` and `/app/dashboard`.
- Added smoke tests for the activity boundary.

## Progress Update: Billing Entitlement Contract
- Added safe billing route boundaries for checkout, portal, webhook, and entitlement.
- Added `apps/website/app/lib/billing-events.ts` to map already-verified Stripe event data into local entitlement writes.
- Added `apps/website/app/lib/billing-entitlement-repository.ts` as the future Convex storage boundary.
- Added `docs/idkwidk/future-template-oss-scan/BILLING_CONTRACT.md`.
- The current routes still refuse fake success until Stripe SDK verification and Convex writes are implemented.

## Progress Update: SEO and Blog Plumbing
- Added site metadata configuration, canonical URL helper, root Open Graph/Twitter metadata, sitemap, robots, RSS, and OG image route.
- Added structured blog post data, blog article routes, JSON-LD, and blog index search/filter/category behavior.
- Added `.env.example` and `COMPLETION_CHECKLIST.md`.
- Home page and final blog visual design remain intentionally excluded by user request.

## Progress Update: Clerk and Convex Prep
- Installed `@clerk/nextjs`, `convex`, and `stripe` SDK packages.
- Installed `clerk` CLI as a dev dependency.
- Added Clerk middleware for `/app`, `/api/settings`, and `/api/providers` surfaces.
- Added conditional Clerk provider and app-shell auth status.
- Added `apps/website/convex/schema.ts` for organization settings, provider config, activity events, and billing entitlement.
- Added Convex functions for settings, providers, activity, and billing.
- Added `apps/website/app/lib/auth-boundary.ts` and tests.
- Added `AGENT_SETUP.md` and setup scripts for Clerk and Convex.
- Generated Convex API binding imports and Clerk UI shell wiring remain the next implementation slice.
