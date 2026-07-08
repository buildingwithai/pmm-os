# Mission Control: Usertour Website Integration

## Original Objective

Fork or bring in `buildingwithai/usertour-website-template` so the homepage,
blog, docs, pricing, support, about, privacy, terms, and license pages become
the front end of this SaaS template, while the dashboard remains the backend
product/admin experience.

## Current User-Level Goal

Make the SaaS template self-provisionable: a user should be able to clone it,
store organization-level provider access safely outside the repo, and let an
agent create or connect project-specific GitHub, Vercel, Convex, Clerk, and
Codex/OpenAI setup without leaking secrets.

## Current Engineering Phase

Hardening credential-safe project provisioning.

## Task Classification

- Work type: External repo integration, frontend architecture, visual/runtime QA
- Risk level: Level 3
- Product surface: Multi-surface web app
- Source repo: `https://github.com/buildingwithai/usertour-website-template.git`
- Target repo: `/Users/jovannytovar/CascadeProjects/idkWidk`

## Current Hypothesis

The safest path is to clone the website template into an ignored idkWidk lab
path first, inspect license/build/runtime, then decide whether it should replace
`apps/website`, become a new `apps/marketing`, or be merged behind a shared app
entrypoint with the existing dashboard.

## Evidence Collected

| Evidence | Source | Confidence | Notes |
|---|---|---:|---|
| User wants frontend and backend visible as one SaaS product | User prompt | High | Public site plus dashboard shell |
| Existing dashboard app is in `apps/dashboard` | Repo listing | High | Already has local template auth/Convex bypass |
| Existing website app was in `apps/website` | Repo listing | High | Removed after preserving SEO plumbing in marketing |
| idkWidk external lab path was not ignored yet | `.gitignore` | High | Added ignored `.idkwidk/*` lab paths |

## Active Workstream

Credential-safe provider provisioning.

## Blocking Issues

| Issue | Why it blocks | Owner | Status |
|---|---|---|---|
| Source repo license and stack unknown | Determines whether direct adoption is safe and how to preserve provenance | Codex | Open |
| Source repo runtime unknown | We need real behavior, not README assumptions | Codex | Open |
| Existing `apps/website` created confusing `3005` surface | User only needs dashboard and marketing | Codex | Closed |
| Website analytics section missing | User wants a Google Analytics style view | Codex | Closed |
| Analytics endpoints returned 500 without live Convex | Local template must work without provider services | Codex | Closed |
| Website dev runtime served stale missing `.next` chunk | Browser proof for `/app` failed even though build passed | Codex | Closed |
| Analytics pages looked empty or unproven | User needs visible proof that dashboard analytics routes work | Codex | Closed |
| Convex was not running locally | Live writes failed with `ECONNREFUSED 127.0.0.1:3210` | Codex | Closed |

## Parked Issues

- Real Clerk/Convex provider verification remains parked; this request is about
  local product integration and public website shape.
- Historical docs still mention old `apps/website` work. Those are records of
  earlier phases, not active app surfaces.
- Website/blog layout is out of scope for this slice because the user said they
  will use something else for homepage/blog layout.

## Decisions

- Use `.idkwidk/external-repos/buildingwithai__usertour-website-template/`
  for the research clone.
- Do not commit the research clone.
- Do not put provider secrets into the template.
- Adopt the source as `apps/marketing` first instead of replacing
  `apps/website`.
- Keep source license/provenance in `apps/marketing/docs/PROVENANCE.md`.
- Remove `apps/website` from the active template because it is not the product
  dashboard or the marketing site.
- Move sitemap, robots, RSS, metadata, and OG image ownership into
  `apps/marketing`.
- Add analytics as a provider boundary first instead of vendoring a whole
  analytics product into the app.
- Keep local analytics credential-free and mock-backed until a real provider is
  deliberately selected.
- Analytics event writes must fail open in local template mode so missing
  Convex does not break marketing, website, or dashboard routes.
- Use Convex as the first real persistence provider for analytics events,
  performance data, and replay snapshots.
- Use local Convex dev deployment for verification instead of binding the
  template to an unrelated existing project.
- Replay capture is privacy-sanitized event replay, not full DOM rrweb snapshot
  recording. It stores clicks, scrolls, pageviews, resize, errors, and input
  value length.
- Organization-level provider tokens must live outside the repo in the local
  vault/OS keychain.
- Provider automation must start dry-run first.
- GitHub is the first provider adapter boundary. It now supports dry-run
  planning and an explicit read-only repository existence check.
- Full provisioning now has a technical spec, implementation plan,
  verification matrix, autonomy runbook, and user signal brief.
- Local provisioning state helpers are implemented.
- GitHub guarded create command is implemented but not live-verified.
- GitHub connect/push gates are implemented but not live-verified.
- Provider token timing guide is implemented in docs and CLI.
- GitHub repository `buildingwithai/idkwidk-template` was created and verified
  as private.
- Connect now defaults to a `template` remote to avoid overwriting existing
  `origin`.
- Vercel token works for personal scope `jovannytovar-4890`; project
  `idkwidk-template` is not found yet.
- Vercel project `jovannytovar-4890/idkwidk-template` was created and verified.
- Vercel deployments/env vars are not configured yet.
- Vercel non-secret template-mode env plan/write boundary is implemented.
- Vercel non-secret template-mode env vars were configured:
  `NEXT_PUBLIC_AUTH_BYPASS`, `NEXT_PUBLIC_ANALYTICS_PROVIDER`,
  `NEXT_PUBLIC_ANALYTICS_SITE_ID`, and `NEXT_PUBLIC_DASHBOARD_URL`.
- Vercel, Convex, Clerk, and Codex dry-run adapters are implemented.
- Convex team access token and team ID were verified through the Management API.
- Convex project `idkwidk-template` was created and read back.
- Convex cloud deployment was connected through the official CLI and dashboard
  env now points at the cloud deployment.
- A local setup skill was added at
  `.agents/skills/idkwidk-template-provisioning/SKILL.md`.
- `npm run setup` now supports both `--dry-run` and `--check-access`.
- Convex deploy key `vercel-prod` was created and stored in the OS keychain.
- Vercel project env now has the expected Convex and Clerk env key names.
- `vault:verify` now checks Vercel env key readback without printing values.
- Vercel env targeting now keeps Clerk development keys development-only until
  live Clerk production keys exist.
- Clerk production env pull command was added and verified to fail safely while
  no Clerk production instance exists.
- Non-destructive rollback planning was added through `vault:rollback --dry-run`.
- Tracked-file secret scan was added through `npm run secret:scan`.
- Dashboard build, marketing typecheck, and marketing build are passing in the
  current provider state.
- Production preview route proof was added through `npm run preview:verify`.

## Files Touched Or Likely Involved

- `.gitignore`
- `apps/dashboard/**`
- `apps/marketing/**`
- `package.json`
- `docs/idkwidk/usertour-website-integration/**`
- `apps/dashboard/src/app/dashboard/analytics/page.tsx`
- `apps/dashboard/src/lib/analytics/**`
- `apps/marketing/src/components/analytics-tracker.tsx`
- `apps/marketing/src/app/api/analytics/events/route.ts`
- `scripts/template-vault.mjs`
- `scripts/template-setup.mjs`
- `docs/idkwidk/usertour-website-integration/*PROVISIONING*`
- `docs/idkwidk/usertour-website-integration/GITHUB_PROVIDER_ADAPTER.md`
- `docs/idkwidk/usertour-website-integration/PROVISIONING_TECHNICAL_SPEC.md`
- `docs/idkwidk/usertour-website-integration/PROVISIONING_IMPLEMENTATION_PLAN.md`
- `docs/idkwidk/usertour-website-integration/PROVISIONING_VERIFICATION_MATRIX.md`
- `docs/idkwidk/usertour-website-integration/PROVISIONING_AUTONOMY_RUNBOOK.md`
- `docs/idkwidk/usertour-website-integration/PROVISIONING_USER_SIGNAL_BRIEF.md`

## Verification Plan

- Keep `node --check scripts/template-vault.mjs` green.
- Keep `node --check scripts/template-setup.mjs` green.
- Keep `npm run vault:doctor` green.
- Keep fake-token safety tests proving secrets are not printed or written.
- Keep `docs/idkwidk/usertour-website-integration/PROVISIONING_VERIFICATION_MATRIX.md`
  updated after each provider slice.
- Before claiming any live provider support, verify with real provider readback.

## Next Best Action

Create the Clerk production instance in the Clerk Dashboard for the real
production domain, pull live keys into the vault, and re-run Vercel env sync.
Browser screenshot proof remains separate because the Chrome DevTools connector
was unavailable during the route-level preview pass.

## Resume Prompt

Continue provisioning automation from
`docs/idkwidk/usertour-website-integration/PROVISIONING_IMPLEMENTATION_PLAN.md`.
Start with the current `setup:status` and `setup:next` output instead of stale
phase names. Keep organization tokens outside the repo, run dry-run before
mutation, update the verification matrix, and do not claim a provider is
complete until readback verification passes.
