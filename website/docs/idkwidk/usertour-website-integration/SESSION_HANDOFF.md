# Session Handoff: Website Integration And Analytics Boundary

## What Changed

- Added `apps/marketing` from `buildingwithai/usertour-website-template`.
- Added marketing scripts to the root `package.json`.
- Added a local analytics event endpoint at
  `apps/marketing/src/app/api/analytics/events/route.ts`.
- Added a client page-view tracker at
  `apps/marketing/src/components/analytics-tracker.tsx`.
- Added a dashboard analytics provider boundary in
  `apps/dashboard/src/lib/analytics`.
- Added `/dashboard/analytics` and linked it in the dashboard sidebar.
- Added expanded analytics subroutes for pages, sessions, events, errors,
  countries, performance, replay, funnels, journeys, and retention.
- Added Convex analytics schema/functions while keeping local-template fallback.
- Changed analytics event writes to fail open when the provider is unavailable.
- Populated the local-template analytics provider with realistic mock data for
  page analytics and overview time series instead of empty states.
- Added accessible labels to the replay player controls.
- Added strict Convex-backed analytics writes for pageviews, custom events,
  performance events, browser errors, and sanitized replay snapshots.
- Added live browser capture for pageviews, link/button interactions,
  performance metrics, scroll, clicks, resize, errors, and input length.
- Added dashboard and marketing replay API routes that persist to Convex.
- Added `analytics:storeReplaySnapshot` to Convex.
- Added production preview scripts:
  `npm run preview:build` and `npm run preview`.
- Switched dashboard dev to webpack to avoid the multi-GB Turbopack dev cache.
- Disabled local Sentry/Clerk middleware loading in credential-free template
  mode so preview works without provider keys.
- Added deliberate production auth mode:
  Clerk loads only when auth bypass is off and real Clerk keys are configured.
  Missing production keys now stop at `/auth/setup-required` instead of opening
  the dashboard or crashing.
- Moved optional dashboard demo routes out of `src/app` into
  `apps/dashboard/src/optional-dashboard-demos` so they are not active routes
  in the default dashboard.
- Removed the old `apps/website` surface so local development only uses the
  dashboard and marketing apps.
- Moved SEO plumbing into `apps/marketing`: metadata, sitemap, robots, RSS, and
  OG image.
- Updated the root `dev` script to start only dashboard and marketing.
- Documented the analytics boundary in
  `docs/idkwidk/usertour-website-integration/ANALYTICS_BOUNDARY.md`.

## What Was Verified

- `npm run marketing:lint` passed.
- `npm run marketing:typecheck` passed.
- `npm run marketing:build` passed.
- `npm run dashboard:lint` passed with existing upstream warnings.
- `npm run dashboard:test` passed: 2 files, 6 tests.
- `npm run dashboard:build` passed.
- `npm run marketing:build` passed.
- `npm run marketing:lint` passed.
- `npm run marketing:typecheck` passed.
- `curl http://localhost:3020/` returned `200`.
- `curl -X POST http://localhost:3020/api/analytics/events` returned `200`.
- `curl -X POST http://localhost:3015/api/analytics/events` returned `200`.
- Marketing SEO routes returned `200`: `/robots.txt`, `/sitemap.xml`,
  `/rss.xml`, and `/opengraph-image`.
- Port `3005` was stopped and is no longer listening.
- `curl http://localhost:3015/dashboard/analytics` returned `200` after restarting the stale dashboard dev server.
- Dashboard analytics subroutes returned `200` locally:
  `/dashboard/analytics/pages`, `/sessions`, `/events`, `/errors`,
  `/countries`, `/performance`, `/replay`, `/funnels`, `/journeys`,
  and `/retention`.
- Dashboard analytics browser checks verified populated local-template content
  for pages, events, countries, funnels, and replay.
- Chrome DevTools opened
  `http://localhost:3015/dashboard/analytics/replay/replay-tmpl-001`; no
  console warnings or errors, network showed `GET` returning `200`, and the
  replay timeline advanced from `0:00 / 0:25` to `0:16 / 0:25`.
- Convex live local deployment was started with `npm run convex:dev` from
  `apps/dashboard`.
- Real Convex-backed writes returned `200` for pageview, custom event,
  performance event, and replay snapshot payloads.
- Dashboard read routes showed the persisted verification data:
  `/live-verification`, `live_verification_clicked`, LCP `1,234`, and replay
  event details for `button.verify` and `input.email`.
- Marketing proxy writes through `http://localhost:3020/api/analytics/events`
  and `/api/analytics/replay` returned `200` and appeared in the dashboard
  replay detail route.
- Production preview was verified:
  `http://localhost:3015/dashboard/analytics` returned `200`,
  `http://localhost:3020/` returned `200`, and removed demo route
  `http://localhost:3015/dashboard/kanban` returned `404`.
- Production auth missing-key behavior was verified with a separate build:
  `/dashboard/analytics` redirected to `/auth/setup-required`, and
  `POST /api/analytics/events` returned `503`.
- Dashboard active route count dropped from 41 to 30 after moving demo routes
  out of the app tree.
- Production preview memory was measured at about 132 MB for dashboard and
  67 MB for marketing.
- Chrome DevTools opened `http://localhost:3015/dashboard/analytics`; no console warnings or errors.
- Chrome DevTools opened `http://localhost:3020/`; no console warnings or errors.
- Chrome DevTools network showed `POST /api/analytics/events` returning `200`.

## Runtime Captures

- `.idkwidk/runtime-captures/usertour-website-integration/target-dashboard-analytics-desktop.png`
- `.idkwidk/runtime-captures/usertour-website-integration/target-dashboard-analytics-a11y.txt`
- `.idkwidk/runtime-captures/usertour-website-integration/target-marketing-home-analytics-tracker.png`
- `.idkwidk/runtime-captures/usertour-website-integration/hardening-dashboard-analytics.png`
- `.idkwidk/runtime-captures/usertour-website-integration/hardening-dashboard-analytics-a11y.txt`
- `.idkwidk/runtime-captures/usertour-website-integration/hardening-marketing-home.png`
- `.idkwidk/runtime-captures/analytics-hardening/countries.png`
- `.idkwidk/runtime-captures/analytics-hardening/replay-detail.png`

## What Was Not Verified

- Browser screenshot proof for the latest live Convex pass was blocked because
  Chrome DevTools MCP disconnected.
- Full rrweb DOM snapshot replay is not implemented. The current replay is
  live persisted event replay with privacy-sanitized events.
- No production deployment was run.
- Production Convex cloud deployment was not verified; the verified backend is
  local Convex dev.
- Real Clerk sign-in with live Clerk keys was not verified because no real
  Clerk keys were used.
- The removed `apps/website` app was not replaced one-for-one. Its active public
  SEO duties moved to `apps/marketing`; old app/admin playground pages are gone.

## Remaining Risks

- Public production needs rate limiting, replay consent/notice, retention, and
  site-level authorization before real users are tracked.
- Full DOM replay would require a separate rrweb storage/player pass and a
  stricter privacy review.
- The dashboard still carries upstream boilerplate lint warnings unrelated to this slice.
- The new marketing app and integration files are uncommitted.
- Historical docs still reference `apps/website`; they describe old phases and
  should not be followed as current setup instructions.

## Next Safest Action

Commit the working two-app Convex analytics slice, then harden production
readiness with rate limiting, retention cleanup, site authorization, and replay
consent controls.

## Resume Prompt

Continue the idkWidk SaaS template integration. The active apps are
`apps/dashboard` on port `3015` and `apps/marketing` on port `3020`.
`apps/website` was removed. Verify git status, keep provider credentials out of
the template, then either commit this slice or run an External Repo Runtime Lab
on Umami as the first real analytics provider candidate.
