# Agent Setup: Clerk and Convex

Date: 2026-05-20

## Goal
Give a human or coding agent the shortest safe path to turn this template from setup mode into a real Clerk + Convex app.

This file is intentionally operational. It tells the next agent what to run, what to expect, and what not to fake.

## Current Local State
- `@clerk/nextjs` is installed.
- `clerk` CLI is installed as a dev dependency.
- `convex` is installed and `npx convex --version` works.
- `stripe` is installed.
- Clerk middleware is wired but only protects routes when Clerk keys exist.
- Convex schema and functions exist.
- Next route repositories call Convex over HTTP when Convex env keys exist.
- Without env keys, routes fail safely and show setup errors.

## Official References Used
- Convex CLI docs: https://docs.convex.dev/cli
- Convex environment variable docs: https://docs.convex.dev/production/environment-variables
- Convex + Clerk docs: https://docs.convex.dev/auth/clerk
- Clerk CLI page: https://clerk.com/cli

## Setup Order

### 1. Install dependencies

```bash
cd apps/website
npm install
```

### 2. Initialize Clerk

```bash
npm run setup:clerk
```

Expected behavior:
- Clerk CLI detects the framework.
- It logs in if needed.
- It links or creates a Clerk application.
- It writes the needed Clerk environment keys.

Important keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

If the CLI cannot complete, use the Clerk dashboard and manually add those keys to `.env.local`.

### 3. Initialize Convex

```bash
npm run setup:convex
```

Expected behavior:
- Convex logs in if needed.
- It links or creates a Convex project.
- It writes `CONVEX_DEPLOYMENT` to `.env.local`.
- It generates the real `convex/_generated` files.
- It pushes schema and functions to the dev deployment.

Important keys:

```bash
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

If `NEXT_PUBLIC_CONVEX_URL` is not written automatically, copy it from the Convex dashboard or CLI output into `.env.local`.

### 4. Connect Clerk to Convex

Follow the Convex + Clerk guide:

```text
https://docs.convex.dev/auth/clerk
```

The key step is creating `convex/auth.config.ts` with the Clerk issuer domain from the Clerk dashboard.

The issuer usually looks like:

```bash
https://your-clerk-instance.clerk.accounts.dev
```

Do not guess this value. Copy it from Clerk.

### 5. Verify local app

Run these in separate terminals:

```bash
npm run setup:convex
npm run dev
```

Then check:

```bash
curl http://localhost:3000/api/activity
curl http://localhost:3000/api/settings/organization
```

Expected behavior after setup:
- `/app` should show Clerk sign-in/user state.
- API routes should stop reporting missing Clerk/Convex keys.
- Convex-backed routes should call the function names listed in `convex/README.md`.

## Useful Commands

```bash
npm run setup:convex:dashboard
npm run setup:convex:docs
npm run setup:convex:env
npx convex run activity:listActivityEvents '{"organizationId":"current-organization"}'
npx convex run settings:getOrganizationSettings '{"organizationId":"current-organization"}'
```

## Production Notes
- Use `CONVEX_DEPLOY_KEY` in CI for non-interactive Convex deploys.
- Use environment variables from the deployment platform, not checked-in files.
- Stripe webhook secrets must be environment-specific.
- Clerk production issuer must be configured separately from development issuer.

## What Not To Do
- Do not hard-code Clerk keys.
- Do not commit `.env.local`.
- Do not unlock paid features from a checkout success page.
- Do not bypass Convex entitlement writes.
- Do not remove the safe setup errors; they protect local and demo setups.
