# Auth Production Runbook

## Local Template Mode

Use this when cloning the template or running without provider credentials:

```text
NEXT_PUBLIC_AUTH_BYPASS=true
```

In this mode:

- Clerk is not loaded by the app provider.
- Clerk middleware is not used.
- Dashboard preview works without Clerk keys.

## Production Clerk Mode

Use this when deploying with real authentication:

```text
NEXT_PUBLIC_AUTH_BYPASS=false
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Then rebuild the dashboard. Auth mode is selected at build time for the Next
server bundle.

## Clerk CLI Setup

For a new clone, let the Clerk CLI do the app setup first:

```bash
npm exec clerk -- auth login
npm exec clerk -- apps list --json
npm exec clerk -- apps create "idkwidk-template" --json
npm exec clerk -- link --app <app-id>
npm exec clerk -- env pull --app <app-id> --file apps/dashboard/.env.local
```

The CLI writes `CLERK_PUBLISHABLE_KEY`. Next.js client code also needs:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<same value as CLERK_PUBLISHABLE_KEY>
```

Keep `apps/dashboard/.env.local` ignored. Do not commit `CLERK_SECRET_KEY`.

## Production Instance

The Clerk CLI can walk through production activation, but it is intentionally
interactive. Clerk production requires a real production domain, DNS access, and
production OAuth credentials for any enabled social providers.

Current status for this workspace:

- Clerk application: `idkwidk-template`
- Development instance: configured
- Production instance: not configured

To finish production:

1. Check Clerk's production state:

```bash
npm run setup:production -- --profile personal --project idkwidk-template
npm --silent run setup:production -- --profile personal --project idkwidk-template --json
```

This records sanitized production state locally without creating anything.

2. Store the production domain as non-secret metadata:

```bash
npm run setup:production -- --profile personal --project idkwidk-template --domain <your-production-domain>
```

3. When you have the production domain ready, start Clerk's interactive deploy:

```bash
npm run setup:production -- --profile personal --project idkwidk-template --deploy-prod --confirm-prod-deploy
```

If the domain metadata is missing, this command refuses to start so the agent
does not get stuck at Clerk's prompt. A human can intentionally bypass that
preflight with `--allow-domain-prompt`.

The command may ask for:

- A production domain you own.
- DNS records to add.
- Production OAuth credentials for enabled social providers.

Do not paste secrets into chat. Enter provider values only into the Clerk CLI or
the provider dashboards.

4. Re-check status:

```bash
npm run setup:production -- --profile personal --project idkwidk-template
```

5. Pull production keys:

```bash
npm run setup:production -- --profile personal --project idkwidk-template --pull-prod-env --confirm-prod-env
```

This stores live Clerk keys in the OS keychain and metadata profile without
printing them. It fails safely if the production instance does not exist yet or
if Clerk does not return live `pk_live` and `sk_live` keys.

5. Set production Clerk env vars in the deployment provider:

```bash
npm run setup:production -- --profile personal --project idkwidk-template --sync-vercel-env --confirm-env
```

If the production Clerk instance is not configured, Vercel only receives Clerk
development keys for the `development` target. Production and preview do not get
development Clerk keys.

## Missing-Key Behavior

If `NEXT_PUBLIC_AUTH_BYPASS=false` but Clerk keys are missing or invalid:

- `/dashboard/*` redirects to `/auth/setup-required`.
- `/api/*` returns `503` with an auth setup error.
- The dashboard does not silently open.

## Verified Locally

- Local template preview returned `200` for `/dashboard/analytics`.
- Missing-key production build redirected `/dashboard/analytics` to
  `/auth/setup-required`.
- Missing-key production API request returned `503`.
- Clerk CLI login works.
- Clerk app creation and linking works.
- Clerk development env pull works.
- Clerk production env pull fails safely when no production instance exists.
- Real-Clerk dashboard build passes with `NEXT_PUBLIC_AUTH_BYPASS=false`.

## Not Yet Verified

- Real Clerk sign-in in browser with the development Clerk instance.
- Clerk production instance because a real production domain is still needed.
- Organization-scoped route authorization.
- Billing access with live Clerk Billing.
