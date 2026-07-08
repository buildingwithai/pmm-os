# Clerk And Convex Next Phase

Date: 2026-05-20

## Goal

Turn the dashboard feature-flag page from seed data into real workspace-scoped
state, without putting personal Clerk or Convex credentials into the reusable
template.

## Current State

The dashboard app is in `apps/dashboard`.

Feature flags currently use:

- `apps/dashboard/src/lib/feature-flags/registry.ts`
- `apps/dashboard/src/lib/feature-flags/repository.ts`
- `apps/dashboard/src/app/dashboard/feature-flags/page.tsx`
- `apps/dashboard/src/lib/vendor/unleash/feature-naming.ts`

Auth currently uses:

- Clerk from the cloned starter.
- `NEXT_PUBLIC_AUTH_BYPASS=true` for local template mode.
- `apps/dashboard/src/lib/auth-bypass.ts` for the local template user.

Storage currently uses:

- Seed data when Convex setup is missing.
- Optional Convex calls when `NEXT_PUBLIC_CONVEX_URL` is present.
- Dashboard-side Convex schema and functions now exist.
- Generic Convex server helpers are used so the template builds before
  `convex/_generated` files exist.

## Required Setup Inputs

These values must come from the future template owner, not from this repo:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

Optional values after billing or webhooks are enabled:

```text
CLERK_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Clerk Boundary

The feature-flag page should use Clerk for:

- signed-in user identity
- active organization/workspace id
- admin or owner permission checks

Local template mode should keep working when `NEXT_PUBLIC_AUTH_BYPASS=true`.

Expected behavior:

| Mode | Behavior |
| --- | --- |
| Template mode | Show seed flags and a local workspace label |
| Real Clerk, no organization | Ask the user to create or select a workspace |
| Real Clerk with non-admin role | Read-only feature flag list |
| Real Clerk with admin role | Read/write feature flag controls |

## Convex Boundary

Convex should store only organization-scoped overrides, not the full registry.
The registry remains code-owned so a fresh template always has known defaults.

Suggested table:

```ts
featureFlagOverrides: defineTable({
  enabled: v.boolean(),
  flagKey: v.string(),
  organizationId: v.string(),
  source: v.union(v.literal("native"), v.literal("unleash-reference")),
  updatedAt: v.number(),
  updatedByUserId: v.string()
}).index("by_organization_flag", ["organizationId", "flagKey"])
```

Suggested functions:

```text
featureFlags:listFeatureFlagOverrides
featureFlags:setFeatureFlagOverride
```

The dashboard repository should merge:

```text
code registry defaults + Convex organization overrides = visible flag state
```

## Implementation Order

1. Add Convex dependency and initialize `apps/dashboard/convex`. Done.
2. Add schema and functions for `featureFlagOverrides`. Done.
3. Add a dashboard repository adapter that uses Convex only when
   `NEXT_PUBLIC_CONVEX_URL` exists. Done.
4. Keep seed fallback when Convex is missing. Done.
5. Verify template mode still builds and loads without real credentials. Done.
6. Add Clerk server helper for active organization and role. Done.
7. Add read-only state for non-admin users. Done.
8. Add toggle controls only for admin/owner users. Done.
9. Verify real mode only after a test Clerk app and test Convex deployment are
   intentionally created.

## Verification Matrix

| Check | Expected result |
| --- | --- |
| No Clerk and no Convex | Dashboard route still loads in template mode |
| Clerk enabled, Convex missing | Route loads but explains storage is not configured |
| Convex enabled, Clerk missing | Route refuses writes and keeps seed view |
| Clerk admin and Convex enabled | Admin can toggle an override |
| Clerk non-admin and Convex enabled | User can view but not toggle |
| Bad flag key | Write is rejected |
| Missing organization id | Write is rejected |
| Build | `npm run dashboard:build` passes |
| Lint | `npm run dashboard:lint` passes with upstream starter warnings only |

## Next Safest Action

Do not add real credentials. The next implementation step is disposable
real-mode verification: create or connect a throwaway Clerk app and Convex
deployment, then prove that admin users can write and non-admin users cannot.
Use `docs/idkwidk/kiranism-dashboard-clone/DISPOSABLE_PROVIDER_VERIFICATION.md`
and `npm run dashboard:env` before testing real provider mode.
