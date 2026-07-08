# Organization Provisioning Runbook

## Goal

Let a user clone this template many times without copying personal secrets into
the repo. Organization-level tokens are stored once on the local machine, then
each clone can generate local project env files and later provision
project-specific provider resources.

## What Is Stored Where

Stored outside the repo:

- Secret organization tokens in the OS keychain.
- Non-secret profile metadata in `~/.config/idkwidk-template/profiles.json`.

Stored inside each clone:

- Only generated `.env.local` files.
- `.env.local` is gitignored.
- Project-specific keys are left blank until provisioning creates them.

## Supported Providers

The local vault accepts organization-level tokens for:

- GitHub
- Vercel
- Convex
- Clerk
- Codex

The current implementation stores and checks these tokens safely. Full provider
project creation is the next provisioning slice.

## First-Time Setup

Create a reusable machine-level profile:

```bash
npm run vault:init -- --profile personal
```

Add non-secret provider metadata:

```bash
npm run vault:metadata -- --profile personal --provider github --key owner --value your-org
npm run vault:metadata -- --profile personal --provider vercel --key teamSlug --value your-team
npm run vault:metadata -- --profile personal --provider convex --key teamSlug --value your-team
npm run vault:metadata -- --profile personal --provider clerk --key organizationId --value org_...
npm run vault:metadata -- --profile personal --provider codex --key workspaceName --value your-workspace
```

Store organization-level tokens:

```bash
npm run vault:set -- --profile personal --provider github --key organizationToken
npm run vault:set -- --profile personal --provider vercel --key organizationToken
npm run vault:set -- --profile personal --provider convex --key organizationToken
npm run vault:set -- --profile personal --provider clerk --key organizationToken
npm run vault:set -- --profile personal --provider codex --key organizationToken
```

The CLI prompts for each secret. Do not pass real tokens directly in shell
history.

Check the local machine before setup:

```bash
npm run vault:doctor -- --profile personal
```

The doctor checks Node, Git, macOS Keychain, profile existence, provider token
presence, and whether local env files are ignored by Git.

Rotate a saved token:

```bash
npm run vault:rotate -- --profile personal --provider github --key organizationToken
```

Delete one saved token:

```bash
npm run vault:delete -- --profile personal --provider github --key organizationToken
```

Delete a whole local profile:

```bash
npm run vault:delete -- --profile personal
```

## Per-Clone Setup

From any fresh clone:

```bash
npm run vault:check -- --profile personal
npm run vault:env -- --profile personal --dry-run
npm run vault:env -- --profile personal --force
```

This writes:

- `apps/dashboard/.env.local`
- `apps/marketing/.env.local`

The files are gitignored and stay local to the clone.

`--dry-run` prints the files that would be created without changing anything.
`--force` is required when either `.env.local` file already exists. If the tool
replaces an existing env file, it writes a timestamped backup next to it first.

## Provisioning Plan

The template can show the exact zero-to-one plan for a project without creating
anything:

```bash
npm run vault:provision -- --profile personal --project my-saas --dry-run
```

This checks which organization tokens are stored, shows the non-secret metadata
that will choose the target organization/team/workspace, and prints the provider
actions. It does not call provider APIs or create resources.

For the current low-lift setup path, start with:

```bash
npm run setup:onboard -- --profile personal --project my-saas
```

That command runs the setup front door with credential setup and read-only
provider checks enabled. Live provider changes still happen only through the
printed guarded commands or `setup:walkthrough -- --live`.

Agents can read the same plan as JSON:

```bash
npm --silent run setup:plan -- --profile personal --project my-saas --dry-run --json
```

Agents should read the provisioning checklist in:

- `docs/idkwidk/usertour-website-integration/PROVISIONING_AGENT_RUNBOOK.md`
- `docs/idkwidk/usertour-website-integration/provisioning-plan.example.json`
- `docs/idkwidk/usertour-website-integration/PROVIDER_SCOPE_GUIDE.md`
- `docs/idkwidk/usertour-website-integration/PROVIDER_TOKEN_SETUP.md`
- `docs/idkwidk/usertour-website-integration/GITHUB_PROVIDER_ADAPTER.md`
- `docs/idkwidk/usertour-website-integration/PROVIDER_DRY_RUN_ADAPTERS.md`

For the easiest safe local pass, run:

```bash
npm run setup:bootstrap -- --profile personal --project my-saas
```

After reusable provider access is stored locally, run read-only provider checks:

```bash
npm run setup:bootstrap -- --profile personal --project my-saas --check-access
```

Run the GitHub-specific dry run:

```bash
npm run vault:github -- --profile personal --project my-saas --dry-run
```

Run all provider dry-runs:

```bash
npm run vault:vercel -- --profile personal --project my-saas --dry-run
npm run vault:convex -- --profile personal --project my-saas --dry-run
npm run vault:clerk -- --profile personal --project my-saas --dry-run
npm run vault:codex -- --profile personal --project my-saas --dry-run
```

View sanitized local provisioning state:

```bash
npm run vault:state
```

Ask the CLI what is missing next:

```bash
npm run vault:next -- --profile personal --project my-saas
```

Show token timing and setup commands:

```bash
npm run vault:tokens
```

## Security Rules

- Do not commit organization tokens.
- Do not put organization tokens in `.env.local`.
- Use organization tokens only to create project-specific resources.
- Store generated project keys in provider-managed project environments when
  possible.
- Treat project-specific keys as disposable compared with organization tokens.

## What This Does Not Do Yet

This runbook and CLI do not yet call provider APIs to create projects. The next
slice should add provider adapters:

- GitHub: create repo from template or push current repo.
- Vercel: create/link project and set env vars.
- Convex: create dev/prod deployment and write project env vars.
- Clerk: create application and return publishable/secret keys.
- Codex: document or call the available secure key/workspace setup flow.

## Why This Shape Is Safer

A template clone should contain code and instructions, not the user's personal
or organization credentials. The reusable vault lives outside cloned repos, so a
new clone can be provisioned without duplicating secrets into source control.
