# Completion Checklist

Date: 2026-05-20

## Current Rule
Home page and final blog visual layout are intentionally excluded. SEO and blog plumbing still belong to this template.

## Done
- App shell, dashboard, settings, activity feed, pricing, docs, provider recipes, and adapter playground exist.
- Provider registry, provider health checks, and no-SDK adapter boundaries exist.
- Billing boundaries exist for checkout, portal, webhook, and entitlement.
- Billing event mapping and entitlement repository boundaries exist.
- Blog data layer, blog index search/filter/category behavior, blog article routes, RSS, sitemap, robots, metadata, and OG image route exist.
- `.env.example` lists the core and optional provider keys.
- Clerk middleware protects app/settings/provider API surfaces once Clerk keys are configured.
- Root Clerk provider and app-shell auth status are wired conditionally.
- Convex schema exists for organization settings, provider config, activity events, and billing entitlement.
- Convex functions exist for organization settings, provider config, activity events, and billing entitlement.
- Clerk CLI and Convex CLI setup scripts exist.
- Agent setup guide exists for Clerk + Convex.

## Still Stubbed On Purpose
- Clerk organization switcher and full account-management UI are not added yet.
- Next.js route repositories do not import generated Convex `api` bindings yet. Run `convex dev/deploy` first.
- Stripe SDK checkout, portal, and webhook signature verification.
- Provider SDK/API calls for Formbricks, Chatwoot, Twenty, Cal.com, Dub, Unleash, analytics, and observability.

## Definition Of Done For Production
- Clerk protects `/app/*` and provides organization access.
- Convex stores organization settings, provider config, activity events, and billing entitlement.
- Stripe Checkout creates real subscription sessions.
- Stripe Portal opens real customer portal sessions.
- Stripe Webhook verifies signatures and writes entitlement through Convex.
- Optional providers can be enabled per workspace and fail safely when keys are missing.
- `AGENT_SETUP.md` has been followed in a real Clerk + Convex project.
- SEO routes return valid `200` responses: `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/opengraph-image`.
- `npm run test:adapters` and `npm run build` pass.
