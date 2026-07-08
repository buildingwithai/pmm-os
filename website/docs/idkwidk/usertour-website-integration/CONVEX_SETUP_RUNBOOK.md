# Convex Setup Runbook

## Goal

Convex must work for three people:

- A brand-new user on a brand-new computer.
- A user who only wants local/template mode.
- An agent or CI system that cannot use an interactive login.

These are different setup paths. Do not ask users for a fake Convex organization
token.

## Team Access Token Mode

Use this when the owner wants the template agent to create Convex projects
without making the user click through the dashboard for every project.

In Convex Team Settings, create or copy:

- Team ID: safe to store as metadata.
- Team access token: secret, store only in the OS keychain or deployment secret
  store.

From the repo root:

```bash
npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>
npm run vault:set -- --profile personal --provider convex --key teamAccessToken
```

Use the plain numeric team ID, for example `--value 391508`. If a user copies a
label like `Team ID: 391508` or `Team ID: 391508>`, the vault normalizes it. If
they leave the placeholder `<team-id>`, the vault rejects it.

Metadata-only safety check:

```bash
npm run setup:vault-metadata:verify
```

Read-only verification:

```bash
npm run vault:convex -- --profile personal --project idkwidk-template --dry-run --check-access
```

Project creation requires an explicit confirmation flag:

```bash
npm run vault:convex -- --profile personal --project idkwidk-template --create --confirm-create --deployment-type dev
```

This is the highest-power setup path. Treat the team access token like a master
key for Convex project provisioning.

## New User / New Computer

Use this when the user has a Convex account or is ready to create one.

```bash
cd apps/dashboard
npm exec convex -- login
npm exec convex -- login status
npm exec convex -- dev --configure new --team <team-slug> --project <project-slug> --dev-deployment cloud --once
```

Expected result:

- The CLI creates or links a Convex project.
- The CLI creates a development deployment.
- `apps/dashboard/.env.local` gets `CONVEX_DEPLOYMENT`.
- The dashboard env file must also have `NEXT_PUBLIC_CONVEX_URL`.

Verify:

```bash
npm run dashboard:env
cd apps/dashboard
npm exec convex -- dev --once
npm exec convex -- env list
```

## Local Anonymous Mode

Use this when the user does not want to log in yet.

```bash
cd apps/dashboard
npm exec convex -- dev --configure new --dev-deployment local --once
```

This is only for local development. It is not a shared backend and should not be
treated as production proof.

## Agent / CI Mode

Use this only after a Convex project/deployment exists.

```bash
cd apps/dashboard
npm exec convex -- deployment token create vercel-prod --deployment prod --save-env .env.production.local
```

Then store the deploy key in the deployment provider, for example Vercel:

```text
CONVEX_DEPLOY_KEY=...
```

For local vault storage:

```bash
npm run vault:set -- --profile personal --provider convex --key deployKey
```

The deploy key should never be committed.

## Production Deploy

Convex production deploys are done with:

```bash
cd apps/dashboard
npm exec convex -- deploy
```

In CI, `CONVEX_DEPLOY_KEY` selects the deployment non-interactively.

## Template State Command

Use this from the repo root:

```bash
npm run vault:convex -- --profile personal --project idkwidk-template --dry-run
```

It reports:

- Convex CLI availability.
- Login state.
- Known team slug.
- Stored team ID.
- Whether a team access token is stored.
- Whether a deploy key is stored.
- Whether dashboard Convex env values are present.

## Root Shortcuts

These are convenience commands from the repo root:

```bash
npm run convex:login
npm run convex:status
npm run convex:setup:cloud -- --team <team-slug> --project <project-slug>
npm run convex:setup:local
npm run convex:deploy:dry-run
```

## Current Template Expectations

The dashboard expects these runtime values:

```text
NEXT_PUBLIC_ANALYTICS_PROVIDER=convex
NEXT_PUBLIC_CONVEX_URL=...
CONVEX_DEPLOYMENT=...
```

The Convex backend lives in:

```text
apps/dashboard/convex
```

The app currently uses Convex for:

- Analytics event capture.
- Replay persistence.
- Product analytics queries.
- Feature flag storage.
