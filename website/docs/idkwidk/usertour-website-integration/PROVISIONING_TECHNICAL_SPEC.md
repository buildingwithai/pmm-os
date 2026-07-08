# Provisioning Technical Specification

## Objective

Build a credential-safe provisioning system that lets a user create a new SaaS
project from this template using organization-level access stored outside the
repo. The system must generate project-specific provider resources and local
configuration without copying the original user's secrets into the template.

## Non-Goals

- Do not store organization tokens in repo files.
- Do not create provider resources without explicit confirmation.
- Do not make Codex automation claims unless a supported API or secure workflow
  is verified.
- Do not break local providerless mode.

## Actors

- Human user: owns the provider organizations and approves live mutation.
- Agent: runs setup commands, validates state, and reports evidence.
- Provider APIs/CLIs: GitHub, Vercel, Convex, Clerk, and Codex/OpenAI setup
  surfaces.
- Template app: dashboard on `3015`, marketing on `3020`.

## Secret Classes

| Class | Examples | Storage | Repo Safe |
|---|---|---|---|
| Organization access | GitHub/Vercel/Convex/Clerk org tokens | OS keychain | No |
| Project runtime keys | Clerk secret key, Convex URL/deployment | `.env.local` and provider env | No |
| Non-secret metadata | GitHub owner, Vercel team slug | profile JSON | Yes, but stored outside repo |
| Evidence/state | dry-run result, created resource IDs | `.idkwidk/provisioning/state.json` | No, local generated state |

## Current Files

- `scripts/template-vault.mjs`: vault, env generation, doctor, provider plans.
- `scripts/template-setup.mjs`: safe dry-run setup wrapper.
- `scripts/template-credentials-wizard.mjs`: one-time local credential bootstrap
  wrapper for new computers and users.
- `docs/idkwidk/usertour-website-integration/ORG_PROVISIONING_RUNBOOK.md`
- `docs/idkwidk/usertour-website-integration/GITHUB_PROVIDER_ADAPTER.md`
- `docs/idkwidk/usertour-website-integration/PROVISIONING_AGENT_RUNBOOK.md`

## Target CLI

```bash
npm run setup:bootstrap -- --project my-saas
npm run setup:factory -- --project my-saas
npm run setup:onboard -- --project my-saas
npm run setup:bootstrap -- --profile personal --project my-saas --credentials --check-access
npm run setup:project -- --project my-saas
npm run setup:project -- --profile personal --project my-saas --install --confirm-install
npm run setup:project -- --profile personal --project my-saas --credentials --check-access
npm run setup:project -- --profile personal --project my-saas --live
npm run setup:project -- --profile personal --project my-saas --verify --fresh-clone
npm run setup:production -- --profile personal --project my-saas
npm --silent run setup:production -- --profile personal --project my-saas --json
npm run setup:start -- --profile personal --project my-saas
npm run setup:walkthrough -- --profile personal --project my-saas
npm run setup:walkthrough -- --profile personal --project my-saas --check-access
npm run setup:walkthrough -- --profile personal --project my-saas --live
npm run setup:start -- --profile personal --project my-saas --check-access
npm run setup:next -- --profile personal --project my-saas
npm --silent run setup:next -- --profile personal --project my-saas --json
npm run setup:status -- --profile personal --project my-saas
npm --silent run setup:status -- --profile personal --project my-saas --json
npm run setup:snapshot -- --profile personal --project my-saas
npm --silent run setup:snapshot -- --profile personal --project my-saas --json
npm --silent run setup:plan -- --profile personal --project my-saas --dry-run --json
npm --silent run setup:doctor -- --profile personal --json
npm run setup:locations
npm run setup:audit -- --profile personal --project my-saas
npm run setup:completion -- --profile personal --project my-saas
npm --silent run setup:completion -- --profile personal --project my-saas --json
npm run setup:guide -- --profile personal --project my-saas
npm run setup:credentials -- --profile personal --project my-saas
npm run setup:credentials -- --profile personal --project my-saas --verify
npm run setup:tokens -- --profile personal
npm --silent run setup:tokens -- --profile personal --json
npm run setup:vault-metadata:verify
npm run setup:plugin:verify
npm run setup:plugin-discovery:verify
npm run setup:plugin:package -- --check
npm run setup:fresh-clone:verify
npm run setup:release:verify -- --profile personal --project my-saas
npm run setup -- --profile personal --project my-saas --dry-run
npm run vault:github -- --profile personal --project my-saas --dry-run --check-existing
npm run vault:github -- --profile personal --project my-saas --create --confirm-create
npm run vault:vercel -- --profile personal --project my-saas --dry-run
npm run vault:vercel-dashboard -- --profile personal --project my-saas --dry-run --check-access
npm run vault:vercel-dashboard -- --profile personal --project my-saas --plan-env
npm run vault:convex -- --profile personal --project my-saas --dry-run
npm run analytics:convex:verify -- --profile personal --project my-saas
npm run vault:clerk -- --profile personal --project my-saas --dry-run
npm run vault:clerk -- --profile personal --project my-saas --pull-dev-env --confirm-dev-env
npm run setup:production -- --profile personal --project my-saas
npm --silent run setup:production -- --profile personal --project my-saas --json
npm run setup:production -- --profile personal --project my-saas --deploy-prod --confirm-prod-deploy
npm run setup:production -- --profile personal --project my-saas --pull-prod-env --confirm-prod-env
npm run setup:production -- --profile personal --project my-saas --sync-vercel-env --confirm-env
npm run provision:verify -- --profile personal --project my-saas
```

## Provider Adapter Contract

Every provider adapter must implement this lifecycle:

1. `plan`: local validation only.
2. `read`: read-only provider check.
3. `create`: live mutation behind explicit confirmation.
4. `record`: write non-secret evidence/state.
5. `verify`: prove the created resource exists.
6. `rollback`: print or perform safe cleanup actions.

Current rollback rule:

- `vault:rollback --dry-run` prints cleanup guidance only.
- Destructive deletes must stay manual until each provider delete path has its
  own confirmation gate, readback, and backup/export warning.

Every adapter must:

- Accept `--profile`.
- Accept `--project`.
- Refuse live mutation unless a provider-specific confirmation flag is present.
- Avoid printing secrets.
- Use stored organization tokens only for provider API/CLI authentication.
- Write only project-specific generated values to env files or provider envs.
- Fail closed for auth/permission errors.

## Local State

Create generated state under:

```text
.idkwidk/provisioning/state.json
```

This path is gitignored by the root `.gitignore`.
The repo ignores `.idkwidk/provisioning/`.

Suggested shape:

```json
{
  "project": "my-saas",
  "profile": "personal",
  "updatedAt": "2026-05-29T00:00:00.000Z",
  "providers": {
    "github": {
      "owner": "example-org",
      "repo": "my-saas",
      "url": "https://github.com/example-org/my-saas",
      "readCheck": "not-found",
      "created": false,
      "verified": false
    }
  }
}
```

State must not contain token values.

For fresh-clone and CI-style verification, the profile directory can be
isolated with:

```bash
IDKWIDK_TEMPLATE_CONFIG_DIR=/tmp/idkwidk-template-profile npm run setup:guide -- --profile smoke --project smoke
```

This proves the setup flow does not depend on the original user's local profile
file.

## Provider Order

1. GitHub: create or connect repository.
2. Vercel: create or link deployment project to repo.
3. Convex: create or link backend deployment.
4. Clerk: create auth application and configure URLs.
5. Codex/OpenAI: document or perform supported secure setup flow.
6. Verification: build, env check, app boot, route checks.

## GitHub Adapter

Implemented:

- dry-run plan exists.
- read-only `--check-existing` exists.
- sanitized state recording exists.
- guarded create command exists.
- live creation verified for `buildingwithai/idkwidk-template`.
- connect/push boundary exists and was verified with the `template` remote.

## Vercel Adapter

Implemented:

- Require `vercel.teamSlug`.
- Read token from vault.
- Dry-run target project name and team.
- Read-only check if project exists.
- Create project only after confirmation.
- Set dashboard and marketing env vars only after project exists.
- Use two Vercel projects:
  - `<project>` rooted at `apps/marketing`.
  - `<project>-dashboard` rooted at `apps/dashboard`.
- For the dashboard service, `NEXT_PUBLIC_AUTH_BYPASS` targets Vercel
  development only. Production and preview must use real Clerk production auth
  before the dashboard is treated as a production admin surface.

## Convex Adapter

Implemented:

- Do not model Convex as an organization-token provider.
- Prefer official Convex CLI behavior for local development and deploys.
- Support Convex Management API for fully automated project provisioning when
  `convex.teamId` metadata and `convex.teamAccessToken` secret are present.
- Support three explicit modes:
  - Team access token: create/list projects through Management API, then use
    project/deployment-scoped keys for deploy work.
  - New user/new computer: `convex login`, then `convex dev --configure new`.
  - Local anonymous: `convex dev --configure new --dev-deployment local`.
  - CI/agent: `CONVEX_DEPLOY_KEY` from `convex deployment token create`.
- Record `convex.teamId` and `convex.teamSlug` when known, but do not require
  them for local anonymous mode.
- Create or link project/deployments through the CLI.
- Return project-specific `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT`.
- Verify live analytics writes with `npm run analytics:convex:verify`.
- Record only non-secret analytics proof in local provisioning state.
- Do not store Convex team access tokens or deploy keys in app env files that
  are committed.

## Clerk Adapter

Implemented:

- Use the official Clerk CLI for app selection, linking, and env pulls.
- Require a user-selected app unless Clerk exposes a stable non-interactive
  creation path for the current workspace.
- Return project-specific Clerk publishable and secret keys through guarded env
  pull commands.
- Pull Clerk development app keys into the local vault with
  `--pull-dev-env --confirm-dev-env` after the user has logged in and selected
  or created an app.
- Keep local auth bypass available until real keys are present.
- Store `clerk.productionDomain` as non-secret metadata before launching the
  interactive production deploy flow.
- Pull production Clerk keys with a guarded command only after the production
  instance exists.
- Do not target Vercel production or preview with Clerk development keys.
- Expose `--deploy-status` as a read-only Clerk production check.
- Expose `--deploy-prod --confirm-prod-deploy` as an interactive launcher for
  Clerk's official production flow. This command may require domain, DNS, and
  OAuth provider input from the human user.
- Refuse `--deploy-prod --confirm-prod-deploy` when `clerk.productionDomain` is
  missing unless the user explicitly passes `--allow-domain-prompt`.
- Treat `productionInstanceExists` and `productionConfigured` separately.
  Production auth is not ready until live `pk_live` and `sk_live` keys are
  stored in the local vault.

Remaining:

- Configure and verify Clerk production for a real domain that the user owns.
- Pull live production keys into the vault.
- Re-sync Vercel env after live Clerk production keys exist.
- Verify dashboard auth behavior with auth bypass disabled.

## Codex Adapter

Implemented:

- Treat Codex as a special provider.
- Prefer official secure setup flows over custom token handling.
- Store only non-secret workspace metadata unless a supported token workflow is
  confirmed.
- Do not claim automated workspace creation without verified support.

Remaining:

- Add live Codex workspace/project automation only if an official supported API
  or install flow is verified.

## Verification Requirements

- `npm run vault:doctor` passes.
- `npm run vault:doctor -- --profile <profile>` reports Node, npm, Git,
  GitHub CLI, Vercel CLI, Convex CLI, Clerk CLI, OS keychain, env ignore, and
  profile readiness before provider setup proceeds.
- `npm run setup:install -- --check` verifies the root script package and the
  dashboard and marketing package manifests and lockfiles before a new user
  installs dependencies.
- `npm run setup:production -- --profile <profile> --project <project>` focuses
  the final Clerk production auth and Vercel production env-sync path without
  hiding live mutations behind unconfirmed commands.
- `npm run setup:completion -- --profile <profile> --project <project>` prints
  the implementation-plan completion checklist, and `--json` exposes the same
  checklist for agents/plugins without provider API calls or secret output.
- `npm run setup:plugin:verify` passes.
- `npm run setup:vault-metadata:verify` passes and proves copied metadata
  values are normalized or rejected before they are stored.
- `npm run setup:fresh-clone:verify` passes from a clean committed source tree.
  It sets `IDKWIDK_TEMPLATE_IGNORE_GLOBAL_CLI_AUTH=1`, so the proof cannot
  borrow the current developer's global Convex or Clerk CLI login.
- No `.env.local` files are tracked.
- No fake or real token strings appear in repo search.
- Dashboard env check passes.
- Convex analytics write/read check passes.
- Dashboard Vercel service settings/env readback passes.
- Dashboard build passes.
- Marketing build passes.
- Dashboard starts on `3015`.
- Marketing starts on `3020`.
- Provider resources are read back from provider APIs/CLIs after creation.

## Failure Handling

- Missing token: print setup command, do not continue.
- Ambiguous owner/team/org: stop and ask for confirmation.
- Resource already exists: stop and require connect-vs-rename decision.
- Provider auth failure: stop, do not retry with broader scope.
- Partial setup failure: write state, print cleanup path, do not hide partial
  resources.

## Security Rules

- Never print token values.
- Never store organization tokens in `.env.local`.
- Never use provider tokens outside their adapter boundary.
- Prefer least-privilege scopes.
- Require dry-run before mutation.
- Require explicit confirmation before mutation.
- Keep generated state local and gitignored.

## Setup Plugin Contract

The Codex plugin is a wrapper, not a second provisioning engine.

It must:

- Use `npm run setup:agent -- --project <project>` when an agent or plugin
  needs one safe control-center command that reads setup state, chooses the next
  action, and reports whether user input is required.
- Use `npm --silent run setup:agent -- --json` when an agent or plugin needs
  that control-center decision as stable machine-readable JSON. This command
  must not call provider APIs or print secrets.
- Start with `npm run setup:bootstrap -- --project <project>` or
  `npm run setup:project -- --project <project>`. They use the same front-door
  engine.
- Use `npm run setup:factory -- --project <project>` as the clearest
  new-project/plugin command. It is the front-door engine with credential setup
  and read-only provider checks enabled.
- Use `npm run setup:onboard -- --project <project>` for a new computer or new
  user when reusable provider access may not be stored yet. This is only a
  shortcut for `setup:bootstrap` with credential setup and read-only checks
  enabled.
- Use `npm run setup:start` when only the lower-level setup guide is needed.
- Use `npm run setup:walkthrough` when the agent needs direct control of the
  guided walkthrough.
- Use `npm run setup:walkthrough -- --live` only when the user has explicitly
  approved guided provider setup. The walkthrough still asks before each live
  command and uses the existing provider confirmation flags.
- Use `npm run setup:next` when the user wants the next exact action without
  rerunning every provider check.
- Use `npm --silent run setup:next -- --json` when an agent or plugin needs
  exactly one machine-readable next action. This command must not call provider
  APIs or print secrets.
- Use `npm run setup:status` when a person needs a safe setup snapshot.
- Use `npm --silent run setup:status -- --json` when an agent or plugin needs a
  stable machine-readable setup snapshot. The silent npm form keeps stdout as
  valid JSON. This command must not call provider APIs or print secrets.
- Use `npm run setup:snapshot` when a person or agent needs one combined safe
  view of local machine health, provider status, setup plan, and the production
  checklist command.
- Use `npm --silent run setup:snapshot -- --json` when an agent or plugin needs
  that combined view as stable machine-readable JSON. This command must not call
  provider APIs or print secrets. If the local profile does not exist yet, the
  plan field must be `null` and the next action must point to credential setup.
- Use `npm --silent run setup:plan -- --dry-run --json` when an agent or plugin
  needs the provider setup ladder, including read-only checks, guarded live
  commands, and required confirmation flags.
- Use `npm run setup:locations` when the user asks what persists across clones,
  what stays local to a computer, or how another user can safely install the
  template without inheriting the original user's secrets.
- Use `npm run setup:audit` when the user asks whether the full objective is
  complete. The audit must separate template portability from production
  readiness and must not treat blocked Clerk production auth as done.
- Use `npm run setup:guide` as the lower-level guide when needed.
- Use `npm run setup:credentials` when a profile or reusable provider access is
  missing.
- Use `npm run setup:credentials -- --verify` when the user wants the lowest
  lift path for saving credentials and immediately checking provider access.
- Use `npm run setup:tokens` when the user needs the provider token, metadata,
  and CLI-login checklist without exposing secret values.
- Use `npm --silent run setup:tokens -- --json` when an agent or plugin needs
  that provider-token checklist as stable machine-readable JSON.
- Use `npm run setup:vault-metadata:verify` before handoff to prove copied
  metadata values such as Convex team IDs are normalized or rejected safely.
- Pass `npm run setup:plugin:verify` before it is treated as reusable.
- Pass `npm run setup:plugin-discovery:verify` before claiming marketplace
  discovery works.
- Pass `npm run setup:plugin:package -- --check` before claiming the local
  plugin can be safely packaged for another user or future marketplace flow.
- Explain missing credentials in plain language.
- Point the user to `npm run vault:tokens` instead of asking for secrets in
  chat.
- Keep all provider mutations in `scripts/template-vault.mjs`.
- Require explicit user approval before every `--confirm-*` command.
- Run provider readbacks after each mutation.
- Finish with `vault:readiness`, `vault:verify`, build checks, route checks,
  and `secret:scan`.
- Use `npm run setup:release:verify -- --profile <profile> --project <project>`
  as the top-level proof command. Use `--build`, `--preview`, and
  `--fresh-clone` when those heavier checks are expected.

It must not:

- Store organization tokens inside plugin files.
- Store project runtime keys in tracked files.
- Invent Codex/OpenAI organization-token behavior that is not officially
  supported.
- Hide destructive cleanup behind a vague "fix everything" command.
