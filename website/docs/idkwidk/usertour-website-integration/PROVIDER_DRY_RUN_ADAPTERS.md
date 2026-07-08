# Provider Dry-Run Adapters

## Purpose

These adapters let the template plan provider setup without calling provider
APIs or creating resources. They exist so humans and agents can see what will
happen before any live mutation.

## Commands

```bash
npm run vault:vercel -- --profile personal --project my-saas --dry-run
npm run vault:convex -- --profile personal --project my-saas --dry-run
npm run vault:clerk -- --profile personal --project my-saas --dry-run
npm run vault:codex -- --profile personal --project my-saas --dry-run
```

Vercel also supports a read-only access check:

```bash
npm run vault:vercel -- --profile personal --project my-saas --dry-run --check-access
```

That check calls Vercel's REST API to verify the token can read the authenticated
user, find the configured team slug, and look for the project name. It does not
create or mutate anything.

After a successful `project: not-found` check, Vercel project creation is gated
behind explicit confirmation:

```bash
npm run vault:vercel -- --profile personal --project my-saas --create --confirm-create
```

This creates the Vercel project and immediately runs readback verification. It
does not configure deployments or environment variables yet.

Plan non-secret Vercel template-mode env vars:

```bash
npm run vault:vercel -- --profile personal --project my-saas --plan-env
```

Write those non-secret env vars:

```bash
npm run vault:vercel -- --profile personal --project my-saas --set-env --confirm-env
```

This currently writes only safe template-mode values like auth bypass and
analytics defaults. It intentionally does not write Clerk or Convex project
secrets.

## Required Metadata

```bash
npm run vault:metadata -- --profile personal --provider vercel --key teamSlug --value your-team
npm run vault:metadata -- --profile personal --provider convex --key teamSlug --value your-team
npm run vault:metadata -- --profile personal --provider clerk --key organizationId --value org_...
npm run vault:metadata -- --profile personal --provider codex --key workspaceName --value your-workspace
```

## State Recording

Each dry-run records sanitized local evidence in:

```text
.idkwidk/provisioning/state.json
```

The state file is local and gitignored. It must not contain organization token
values.

## Current Boundary

These adapters do not yet create Vercel projects, Convex deployments, Clerk
apps, or Codex workspaces. Live provider support must be added one provider at a
time with read-only checks, explicit confirmation flags, and readback
verification.
