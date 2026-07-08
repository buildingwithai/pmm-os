# Provider Token Setup

## Rule

Do not paste real tokens into chat. Do not put organization tokens in
`.env.local`. Store them with `npm run vault:set` so they go into the OS
keychain.

## When You Need Each Token

| Provider | When To Get It | Why |
|---|---|---|
| GitHub | First real provider step | Create/connect the repository and verify it exists |
| Vercel | After GitHub repo identity is clear | Create/link deployment project and set project env vars |
| Convex | When moving from local/providerless mode to real backend persistence | Create/link project or deployment and get project env values |
| Clerk | When ready to disable auth bypass and use real sign-in | Create/configure app and get project-specific Clerk keys |
| Codex/OpenAI | Only if official tooling asks for it | Use official secure setup flows, not invented token semantics |

## GitHub

Use a fine-grained token when possible.

Minimum intent:

- Resource owner: your GitHub user or organization.
- Repository access: enough to create/connect this template repo.
- Permissions: repository creation and contents access for later initial push.

Store it:

```bash
npm run vault:set -- --profile personal --provider github --key organizationToken
```

The prompt hides typed token input in an interactive terminal. Do not pass real
tokens with `--value`; that can save them in shell history.

Set metadata:

```bash
npm run vault:metadata -- --profile personal --provider github --key owner --value <github-owner-or-org>
```

First real checks:

```bash
npm run vault:github -- --profile personal --project my-saas --dry-run
npm run vault:github -- --profile personal --project my-saas --dry-run --check-existing
```

## Vercel

Use a Vercel access token scoped to the team/account that should own the
project.

Store it:

```bash
npm run vault:set -- --profile personal --provider vercel --key organizationToken
```

Set metadata:

```bash
npm run vault:metadata -- --profile personal --provider vercel --key teamSlug --value <team-slug>
```

Current safe command:

```bash
npm run vault:vercel -- --profile personal --project my-saas --dry-run
```

## Convex

Convex setup is different from GitHub/Vercel. A brand-new user on a brand-new
computer should not start by hunting for an organization token.

### Fully Automated Project Creation

Use this when you want an agent or setup script to create Convex projects for
your own team.

In Convex Team Settings, copy:

- Team ID: non-secret metadata.
- Team access token: secret, store in the OS keychain.

Store them:

```bash
npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>
npm run vault:set -- --profile personal --provider convex --key teamAccessToken
```

Use the real number only, for example `--value 391508`. If you accidentally
paste `Team ID: 391508`, `Team ID: 391508>`, or `<391508>`, the vault command
normalizes it before saving. If you paste the placeholder `<team-id>`, setup
refuses it so the bad value does not get stored.

Check the metadata safety behavior without credentials:

```bash
npm run setup:vault-metadata:verify
```

Check access without creating anything:

```bash
npm run vault:convex -- --profile personal --project my-saas --dry-run --check-access
```

Create only after explicit approval:

```bash
npm run vault:convex -- --profile personal --project my-saas --create --confirm-create --deployment-type dev
```

This token can manage projects for the team. Do not commit it and do not put it
in app runtime env files.

### New User / New Computer

First log in with the Convex CLI:

```bash
cd apps/dashboard
npm exec convex -- login
```

Then create or connect a cloud project:

```bash
cd apps/dashboard
npm exec convex -- dev --configure new --team <team-slug> --project <project-slug> --dev-deployment cloud --once
```

This writes local ignored setup values:

```text
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
```

### Local Anonymous Mode

If the user does not want a Convex account yet, run a local anonymous backend:

```bash
cd apps/dashboard
npm exec convex -- dev --configure new --dev-deployment local --once
```

This is good for trying the template, but it is not a shared production backend.

### CI / Agent Deploys

For Vercel, CI, or an agent that cannot use your interactive Convex login, create
a deploy key after the project exists:

```bash
cd apps/dashboard
npm exec convex -- deployment token create vercel-prod --deployment prod --save-env .env.production.local
```

Store that deploy key in the OS keychain only when you need non-interactive
deploys:

```bash
npm run vault:set -- --profile personal --provider convex --key deployKey
```

Set non-secret team metadata:

```bash
npm run vault:metadata -- --profile personal --provider convex --key teamSlug --value <team-slug>
npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>
```

Current safe command:

```bash
npm run vault:convex -- --profile personal --project my-saas --dry-run
```

## Clerk

Use the official Clerk CLI and Dashboard flow. Clerk does not need the same
organization-token pattern as GitHub or Vercel for the normal template path.

For a new or existing app:

```bash
npm exec clerk -- auth login
npm exec clerk -- apps list --json
npm exec clerk -- link --app <app-id>
npm exec clerk -- env pull --app <app-id> --file apps/dashboard/.env.local
```

Store the selected app values in the vault/profile. The lower-lift path is to
store or discover the app ID, then let the Clerk CLI pull the development keys
into the vault without printing them:

```bash
npm run vault:metadata -- --profile personal --provider clerk --key applicationId --value <app-id>
npm run vault:clerk -- --profile personal --project my-saas --pull-dev-env --confirm-dev-env
```

If `clerk.applicationId` is missing, the dev env sync can use a Clerk app whose
name exactly matches the project slug. Manual storage is still available:

```bash
npm run vault:metadata -- --profile personal --provider clerk --key publishableKey --value <pk_test_or_pk_live>
npm run vault:set -- --profile personal --provider clerk --key secretKey
```

For production, store the real domain first. This is not a secret, but it must
be a domain you own and can edit DNS records for:

```bash
npm run setup:production -- --profile personal --project my-saas --domain <your-production-domain>
```

Then create the production instance through Clerk's guarded interactive flow.
After production exists, pull live keys into the vault and sync Vercel env:

```bash
npm run setup:production -- --profile personal --project my-saas --deploy-prod --confirm-prod-deploy
npm run setup:production -- --profile personal --project my-saas --pull-prod-env --confirm-prod-env
npm run setup:production -- --profile personal --project my-saas --sync-vercel-env --confirm-env
```

Current safe check:

```bash
npm run setup:production -- --profile personal --project my-saas
```

## Codex/OpenAI

Do not create a fake token workflow for Codex. Use the official secure setup
flow available in Codex/OpenAI tooling. Store only non-secret workspace metadata
unless a supported token workflow is verified.

```bash
npm run vault:metadata -- --profile personal --provider codex --key workspaceName --value <workspace-name>
npm run vault:codex -- --profile personal --project my-saas --dry-run
```

## Recommended Order

1. Run local dry-runs with no real tokens.
2. Add GitHub metadata and token.
3. Run GitHub read-only check.
4. Create/connect GitHub repo only after the check says the name is available
   or you intentionally choose an existing repo.
5. Add Vercel token after GitHub repo identity is settled.
6. Run Convex CLI setup when real backend persistence is needed.
7. Add Clerk app keys when real auth is needed.
8. Run `setup:production` after storing a real production domain.
9. Keep Codex/OpenAI setup honest and tool-supported.
