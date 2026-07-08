# Mission Control: Kiranism Dashboard Clone

## Original Objective

Literally clone `Kiranism/next-shadcn-dashboard-starter`, get it running, and visually validate the real dashboard before adapting it into the broader template.

## Current User-Level Goal

Use the cloned boilerplate as the visible SaaS dashboard foundation, but make it work locally before Clerk or Convex are configured.

## Current Engineering Phase

Feature flag vendor/adapt integration in the cloned dashboard app.

## Task Classification

- Work type: Build/setup, auth bypass, visual validation
- Risk level: Medium, because auth boundaries are involved
- Platform: Next.js dashboard clone
- Clone path: `/Users/jovannytovar/CascadeProjects/idkWidk/.external-repos/next-shadcn-dashboard-starter`
- Tracked app path: `/Users/jovannytovar/CascadeProjects/idkWidk/apps/dashboard`

## Evidence Collected

| Evidence | Result |
|---|---|
| `npm install` in clone | Completed |
| `npm run build` in clone | Passed |
| `npm run lint` in clone | Passed with upstream warnings only |
| Dev server | Running on `http://localhost:3015` |
| Auth routes in bypass mode | `/auth/sign-in` and `/auth/sign-up` redirect to `/dashboard/overview` |
| Dashboard route matrix | Core dashboard routes return `200` |
| Visual screenshots | Captured under `/tmp/kiranism-clone-visuals-pass2` |
| Local template docs | Added to clone at `docs/local-template-mode.md` |
| Tracked dashboard app | Promoted clean source copy into `apps/dashboard` |
| `npm install` in `apps/dashboard` | Completed |
| `npm run lint` in `apps/dashboard` | Passed with upstream warnings only |
| `npm run build` in `apps/dashboard` | Passed |
| `apps/dashboard` route matrix | Dashboard routes return `200` on port `3015` |
| Tracked app screenshot | Captured at `/tmp/idkwidk-apps-dashboard/overview.png` |
| Root dashboard scripts | Added in root `package.json` |
| Dashboard lockfile | `apps/dashboard/package-lock.json` is no longer ignored so npm installs are reproducible |
| Feature flag route | Added to `apps/dashboard/src/app/dashboard/feature-flags/page.tsx` |
| Feature flag navigation | Added to the cloned dashboard sidebar at `/dashboard/feature-flags` |
| Vendor provenance | Unleash Apache-2.0 license copied into `apps/dashboard/docs/vendor/unleash` |
| Feature flag route check | `http://localhost:3015/dashboard/feature-flags` returns `200 text/html` |
| Feature flag browser proof | Screenshot saved at `/tmp/idkwidk-dashboard-feature-flags.png`; no console errors |
| Old website feature flag route | Parked as a handoff to the dashboard app instead of a duplicate admin UI |
| Old website toggle API | Parked with `410 Gone` so the wrong app cannot pretend to write flags |
| Old website feature flag links | Updated to use the dashboard app URL helper instead of `/app/feature-flags` |
| Cleanup review | Added `docs/idkwidk/kiranism-dashboard-clone/CLEANUP_REVIEW.md` with env, ignore, secret-scan, and large-folder findings |
| Dry-run staging scope | `git add -n` would stage 733 files: 610 dashboard, 102 website, 18 docs, 3 root |
| Clerk/Convex next phase | Added `docs/idkwidk/kiranism-dashboard-clone/CLERK_CONVEX_NEXT_PHASE.md` to define the real auth and storage boundary without credentials |
| Dashboard Convex boundary | Added optional Convex package, schema, functions, and repository calls while preserving seed fallback without credentials |
| Dashboard Clerk access boundary | Added a server-side feature flag access helper that keeps template mode read-only and maps real Clerk org admins to future write access |
| Clerk access browser proof | `/dashboard/feature-flags` shows `Writes locked`, `Access boundary`, `Local Workspace`, and `template-org` with no browser console errors |
| Dashboard guarded write boundary | Added a server action for feature flag overrides; template mode and non-admin users are refused before Convex is called |
| Guarded write browser proof | `/dashboard/feature-flags` shows locked toggle controls in template mode; three toggle buttons are disabled and no console errors were logged |
| Feature flag write decision boundary | Extracted feature flag write authorization into a pure helper before the server action calls storage |
| Feature flag write boundary tests | Added `npm run dashboard:test` with Vitest coverage for unknown flags, read-only/template refusal, and admin storage input |
| Dashboard dependency audit | `npm --prefix apps/dashboard audit --audit-level=moderate` reports `object-path` through `sort-by` and `ws` through `convex`; npm suggests `--force` breaking changes |
| Dashboard audit cleanup | Added targeted npm overrides for `object-path@0.11.8` and `ws@8.20.1`; dashboard audit now reports 0 vulnerabilities |
| Disposable provider runbook | Added real Clerk and Convex verification steps plus `npm run dashboard:env` so provider mode can be checked without printing secrets |
| Template env hardening | Added tests around `npm run dashboard:env` mode detection so template, real-provider, and partial-provider states are guarded |

## Decisions

- Keep the clone as the working reference in `.external-repos/next-shadcn-dashboard-starter`.
- Add `NEXT_PUBLIC_AUTH_BYPASS=true` for local template mode.
- Skip Clerk middleware protection when bypass mode is enabled.
- Do not require Convex because this clone does not use Convex yet.
- Preserve the original Clerk path for later real-auth setup.
- Split local and Clerk runtime paths so local template mode does not call Clerk hooks.
- Document local template mode in the cloned boilerplate.
- Fix blocking lint errors from conditional hooks and missing accessible labels.
- Promote the clean dashboard source into `apps/dashboard` so the template includes it.
- Track the npm lockfile because the root scripts use npm.
- Move the feature-flag admin surface into `apps/dashboard` instead of the older `apps/website` route.
- Keep feature flag state in seed mode until a future template user connects their own Convex project.
- Preserve the adapted Unleash naming validation with local provenance comments and license docs.

## Files Touched In Clone

- `.env.local`
- `src/lib/auth-bypass.ts`
- `src/proxy.ts`
- `src/app/page.tsx`
- `src/app/auth/sign-in/[[...sign-in]]/page.tsx`
- `src/app/auth/sign-up/[[...sign-up]]/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/billing/page.tsx`
- `src/app/dashboard/exclusive/page.tsx`
- `src/app/dashboard/workspaces/page.tsx`
- `src/app/dashboard/workspaces/team/[[...rest]]/page.tsx`
- `src/components/kbar/index.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/providers.tsx`
- `src/components/org-switcher.tsx`
- `src/features/profile/components/profile-view-page.tsx`
- `env.example.txt`
- `README.md`
- `docs/local-template-mode.md`
- `src/components/ui/input-group.tsx`
- `src/features/chat/components/message-composer.tsx`
- `src/components/forms/demo-form.tsx`
- `apps/dashboard/**`
- root `README.md`
- root `package.json`
- `apps/dashboard/.gitignore`
- `apps/dashboard/package-lock.json`
- `apps/dashboard/src/app/dashboard/feature-flags/page.tsx`
- `apps/dashboard/src/lib/feature-flags/**`
- `apps/dashboard/src/lib/vendor/unleash/feature-naming.ts`
- `apps/dashboard/src/config/nav-config.ts`
- `apps/dashboard/src/components/icons.tsx`
- `apps/dashboard/docs/vendor/unleash/**`
- `docs/idkwidk/kiranism-dashboard-clone/CLEANUP_REVIEW.md`
- `docs/idkwidk/kiranism-dashboard-clone/CLERK_CONVEX_NEXT_PHASE.md`
- `apps/dashboard/convex/schema.ts`
- `apps/dashboard/convex/featureFlags.ts`
- `apps/dashboard/src/lib/convex/**`

## Blocking Issues

None known for local dashboard viewing.

## Parked Issues

- Decide whether to keep `.external-repos/next-shadcn-dashboard-starter` as a temporary reference after `apps/dashboard` is accepted.
- Replace starter sample data with our product-specific data only after the user approves moving from literal clone to adaptation.
- Add real Convex writes for feature flag overrides only after the template owner creates their own Convex project.
- Verify the guarded write path with disposable Clerk and Convex projects when the template owner is ready to use real provider setup.
- Use `docs/idkwidk/kiranism-dashboard-clone/DISPOSABLE_PROVIDER_VERIFICATION.md` for disposable real-provider testing.
- Watch the dashboard overrides during future dependency upgrades; remove them if upstream `sort-by` or `convex` stops pinning vulnerable transitive versions.
- Remove the old website handoff route entirely once external dead-link protection is no longer needed.
- Keep the starter `.agents` and `.claude` skill folders tracked for now because this phase preserves the literal clone before deeper adaptation.

## Next Best Action

Verify the guarded write path with disposable Clerk and Convex projects next. Keep real provider credentials out of the reusable template.

## Resume Prompt

Continue from `apps/dashboard` as the tracked Kiranism clone. Keep `NEXT_PUBLIC_AUTH_BYPASS=true`, verify `npm run dashboard:lint`, `npm run dashboard:build`, and keep the dashboard visible at `http://localhost:3015/dashboard/feature-flags`.
