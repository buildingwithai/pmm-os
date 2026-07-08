# Feature Flags Vendor/Adapt Verification Matrix

Date: 2026-05-20

Scope:

- Unleash fork source exists locally.
- Apache-2.0 license is preserved.
- Adapted Unleash naming validation runs inside the cloned dashboard template.
- `/dashboard/feature-flags` renders in the Kiranism dashboard shell.
- Feature flags run in seed mode until template users add real Convex keys.

| Requirement or risk | Test or check | Environment | Owner | Status | Evidence | Gap or follow-up |
| --- | --- | --- | --- | --- | --- | --- |
| Fork source exists without bloating Git history | `git clone --depth 1 https://github.com/Unleash/unleash.git .external-repos/unleash` and `git check-ignore -v .external-repos/unleash` | Local repo | Codex | Pass | `.external-repos/unleash` exists and is ignored by `.gitignore` | None |
| Apache license is preserved | Check `docs/vendor/unleash/LICENSE` | Local repo | Codex | Pass | License file copied from Unleash | Keep this file if vendored code remains |
| Adapted Unleash logic exists in dashboard | Inspect `apps/dashboard/src/lib/vendor/unleash/feature-naming.ts` | `apps/dashboard` | Codex | Pass | Naming validator is framework independent and has Unleash provenance comment | Add focused unit tests if dashboard test runner is added |
| Feature flag seed registry exists | Inspect `apps/dashboard/src/lib/feature-flags/**` | `apps/dashboard` | Codex | Pass | Three template flags are listed with owner, stage, rollout and source | Replace seed repository with Convex when credentials are intentionally configured |
| Feature flag admin route loads | `curl -s -o /dev/null -w "%{http_code} %{content_type}\\n" http://localhost:3015/dashboard/feature-flags` | Local dev server | Codex | Pass | Returns `200 text/html; charset=utf-8` | None |
| Dashboard links to feature flags | Sidebar navigation includes `/dashboard/feature-flags` | `apps/dashboard` | Codex | Pass | `apps/dashboard/src/config/nav-config.ts` includes `Feature Flags` | Browser screenshot still required |
| Template still lints | `npm run dashboard:lint` | Root repo | Codex | Pass | Lint passes with upstream starter warnings only | None |
| Template still builds | `npm run dashboard:build` | Root repo | Codex | Pass | Build passes and lists `/dashboard/feature-flags` | None |
| Visual route proof | Browser screenshot of `/dashboard/feature-flags` | Local dev server | Codex | Pass | Screenshot saved to `/tmp/idkwidk-dashboard-feature-flags.png`; DOM has `Feature Flags`, `Provider health`, and `Inspector`; console errors are empty | Desktop-width screenshot still useful later if the user wants a wide-layout review |
| Old website admin route is parked | Inspect `apps/website/app/app/feature-flags/page.tsx` | `apps/website` | Codex | Pass | Old route now renders a handoff to `/dashboard/feature-flags` instead of a duplicate admin UI | Remove the route entirely when all old website links are gone |
| Old website toggle API is parked | POST `/api/feature-flags/toggle` | `apps/website` | Codex | Pass | Returns `410 application/json` with `Feature flag writes moved to the dashboard app.` | None |
| Old website sitemap no longer advertises old admin route | `curl http://localhost:3005/sitemap.xml \| grep /app/feature-flags` | `apps/website` | Codex | Pass | No `/app/feature-flags` entry returned | None |
| Old website links point to dashboard app | `grep -R "href=\"/app/feature-flags\"|/app/feature-flags" apps/website/app README.md docs` | Local repo | Codex | Pass | Only the handoff page text and docs mention `/app/feature-flags`; visible website links use `dashboardFeatureFlagsUrl` | Remove handoff page later if dead-link protection is no longer needed |

Not verified:

- Real Convex persistence, because this template intentionally does not include personal Convex credentials.
- Real Clerk-protected admin access, because this template intentionally does not include personal Clerk credentials.
- Removing the older `apps/website/app/app/feature-flags` route entirely. It is now a handoff page so external old links do not break, but internal website links point directly at the dashboard app.

Plain English result:

The old website route proved the concept earlier. The current source of truth is now the cloned dashboard app. The dashboard feature flag page opens, builds, and shows seed data with adapted Unleash naming validation until a future template user connects Clerk and Convex with their own credentials. The older website route has been parked as a handoff instead of a second admin screen.
