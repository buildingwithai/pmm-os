# Disposable Provider Verification

Date: 2026-05-20

## Purpose

This template must not contain personal Clerk or Convex credentials. Use this
runbook only with disposable provider projects when you need to prove the real
feature-flag write path.

## Safe Local Mode

Use this mode for normal template work:

```text
NEXT_PUBLIC_AUTH_BYPASS=true
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

Expected result:

- `/dashboard/feature-flags` loads.
- Flags come from seed data.
- Toggle buttons are visible but disabled.
- No secrets are needed.

## Real Provider Mode

Use this mode only with throwaway Clerk and Convex projects:

```text
NEXT_PUBLIC_AUTH_BYPASS=false
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<disposable Clerk publishable key>
CLERK_SECRET_KEY=<disposable Clerk secret key>
NEXT_PUBLIC_CONVEX_URL=<disposable Convex URL>
CONVEX_DEPLOYMENT=<disposable Convex deployment>
```

Do not commit `.env.local`. It is ignored by `apps/dashboard/.gitignore`.

## Preflight

Run:

```sh
npm run dashboard:env
```

Expected output for local template mode:

```text
Mode: template
Local env file: .env.local present and gitignored
Auth bypass: on
Clerk keys: missing or incomplete
Convex keys: missing or incomplete
```

Expected output for real provider mode:

```text
Mode: real-provider
Local env file: .env.local present and gitignored
Auth bypass: off
Clerk keys: present
Convex keys: present
```

If the script reports `partial-provider`, stop and fix the env before testing.

## Verification Steps

1. Create or select a disposable Clerk app.
2. Enable Clerk Organizations.
3. Create two disposable users: one organization admin and one non-admin member.
4. Create or select a disposable Convex deployment for `apps/dashboard`.
5. Put only disposable values in `apps/dashboard/.env.local`.
6. Run `npm run dashboard:env`.
7. Run `npm run dashboard:dev`.
8. Sign in as the non-admin member and open `/dashboard/feature-flags`.
9. Confirm the user can see flags but cannot toggle them.
10. Sign in as the organization admin and open `/dashboard/feature-flags`.
11. Toggle `template.providerHealth`.
12. Reload the page and confirm the override persists.
13. Confirm the Convex `featureFlagOverrides` table has one row scoped to the
    Clerk organization id.

## Pass Criteria

- Non-admin users cannot write.
- Admin users can write.
- Convex stores only organization-scoped overrides.
- The code registry remains the default source for all feature flag definitions.
- No provider secrets are committed.

## Cleanup

After verification:

1. Delete the disposable Clerk app or rotate its keys.
2. Delete the disposable Convex deployment.
3. Remove `apps/dashboard/.env.local` or return it to template mode.
4. Run `git status --short` and confirm no env file appears.
