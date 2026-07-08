---
name: idkwidk-template-provisioning
description: Guide agents through secure setup of this SaaS template across GitHub, Vercel, Convex, Clerk, and Codex without leaking provider credentials.
---

# idkWidk Template Provisioning

Use this skill when a user wants to set up a fresh project from this template,
verify provider credentials, create provider resources, or make the template
work on a new computer.

## Rules

- Do not ask the user to paste real secrets into chat.
- Store reusable provider secrets with `npm run vault:set`.
- Store non-secret provider IDs with `npm run vault:metadata`.
- Never write organization tokens to `.env.local`.
- Never commit `.env.local` or `.idkwidk/provisioning/state.json`.
- Run read-only checks before live provider creation.
- Run one live provider mutation at a time, then verify it.
- Explain each step in plain language.

## First Run

From the repo root:

```bash
npm run setup:factory -- --project <project-slug>
npm run setup:agent -- --profile personal --project <project-slug>
npm --silent run setup:agent -- --profile personal --project <project-slug> --json
npm run setup:bootstrap -- --project <project-slug>
npm run setup:onboard -- --project <project-slug>
npm run setup:project -- --project <project-slug>
npm run setup:project -- --project <project-slug> --install --confirm-install
npm run setup:start -- --profile personal --project <project-slug>
npm run setup:walkthrough -- --profile personal --project <project-slug>
npm run setup:credentials -- --profile personal --project <project-slug>
npm run setup:credentials -- --profile personal --project <project-slug> --verify
```

`setup:bootstrap` and `setup:project` run the same front-door engine.

`setup:factory` is the clearest new-project command. It runs the same
front-door engine with credential setup and read-only provider checks enabled.
It still does not create provider resources without the existing guarded live
commands and explicit confirmation flags.

`setup:onboard` runs that front door with credential setup and read-only checks
enabled for a new computer or new user.

Use `setup:credentials` when the profile is missing or reusable provider access
has not been stored on this computer yet. It initializes the local profile,
collects non-secret metadata, and runs secure `vault:set` prompts for tokens.

Use `setup:agent` when an agent or plugin needs one safe control-center command
that chooses the next action and says whether user input is required. It does
not create provider resources, call provider APIs, or print secrets.

To show the provider token and metadata checklist without exposing secret
values:

```bash
npm run setup:tokens -- --profile personal
npm --silent run setup:tokens -- --profile personal --json
```

After provider credentials are stored:

```bash
npm run setup:bootstrap -- --profile personal --project <project-slug> --check-access
npm run setup:walkthrough -- --profile personal --project <project-slug> --check-access
```

To explain what is copied with the template and what stays local:

```bash
npm run setup:locations
```

To report what is complete, blocked, pending, and guided:

```bash
npm run setup:audit -- --profile personal --project <project-slug>
```

To report what remains from the implementation plan and technical spec:

```bash
npm run setup:completion -- --profile personal --project <project-slug>
npm --silent run setup:completion -- --profile personal --project <project-slug> --json
```

To give an agent or plugin a stable setup snapshot without scraping prose:

```bash
npm run setup:status -- --profile personal --project <project-slug>
npm --silent run setup:status -- --profile personal --project <project-slug> --json
```

To give an agent or plugin one combined safe snapshot with local machine health,
provider status, the setup plan, and the production checklist command:

```bash
npm run setup:snapshot -- --profile personal --project <project-slug>
npm --silent run setup:snapshot -- --profile personal --project <project-slug> --json
```

To give an agent or plugin exactly one safe next action without scraping prose:

```bash
npm run setup:next -- --profile personal --project <project-slug>
npm --silent run setup:next -- --profile personal --project <project-slug> --json
```

To give an agent or plugin the ordered provider setup ladder without scraping
prose:

```bash
npm run setup:plan -- --profile personal --project <project-slug> --dry-run
npm --silent run setup:plan -- --profile personal --project <project-slug> --dry-run --json
```

To check the local machine, CLIs, keychain, and ignore rules before live
provider work:

```bash
npm run setup:doctor -- --profile personal
npm --silent run setup:doctor -- --profile personal --json
```

To focus only on the final production auth and dashboard-protection blockers:

```bash
npm run setup:production -- --profile personal --project <project-slug>
npm --silent run setup:production -- --profile personal --project <project-slug> --json
```

When the user explicitly wants the agent to offer live provider setup one step
at a time, run:

```bash
npm run setup:walkthrough -- --profile personal --project <project-slug> --live
```

The walkthrough still asks before each live mutation and uses the existing
guarded `vault:*` commands.

## Provider Order

1. GitHub repository.
2. Vercel project.
3. Convex project and deployment.
4. Clerk application.
5. Codex/OpenAI setup notes or official secure flow.
6. End-to-end verification.

## Live Creation Commands

Only run these after the user explicitly approves the target project name.

```bash
npm run vault:github -- --profile personal --project <project-slug> --create --confirm-create --visibility private
npm run vault:vercel -- --profile personal --project <project-slug> --create --confirm-create
npm run vault:vercel-dashboard -- --profile personal --project <project-slug> --create --confirm-create
npm run vault:convex -- --profile personal --project <project-slug> --create --confirm-create --deployment-type dev
```

Clerk uses the official CLI/login flow. Production setup is interactive because
Clerk needs a real production domain, DNS access, and sometimes production OAuth
credentials:

```bash
npm run setup:production -- --profile personal --project <project-slug>
npm --silent run setup:production -- --profile personal --project <project-slug> --json
npm run setup:production -- --profile personal --project <project-slug> --domain <your-production-domain>
npm run setup:production -- --profile personal --project <project-slug> --deploy-prod --confirm-prod-deploy
npm run setup:production -- --profile personal --project <project-slug> --pull-prod-env --confirm-prod-env
npm run setup:production -- --profile personal --project <project-slug> --sync-vercel-env --confirm-env
```

Only treat Clerk production auth as ready after live Clerk keys are stored in
the vault. A production instance existing by itself is not enough.

## Verification

Run:

```bash
npm run vault:state -- --project <project-slug>
npm run vault:readiness -- --profile personal --project <project-slug>
npm run vault:vercel-dashboard -- --profile personal --project <project-slug> --dry-run --check-access
npm run analytics:convex:verify -- --profile personal --project <project-slug>
npm run setup:vault-metadata:verify
npm run setup:plugin:verify
npm run setup:completion -- --profile personal --project <project-slug>
npm run setup:plugin-discovery:verify
npm run setup:plugin:package -- --check
npm run setup:fresh-clone:verify
npm run setup:release:verify -- --profile personal --project <project-slug>
npm run dashboard:env
npm run dashboard:test
npm run secret:scan
npm run preview:verify
git status --short
```

For production readiness, also run dashboard and marketing builds and verify
the deployed provider readbacks.

## Rollback Planning

Before or after live provider setup, agents can print a non-destructive cleanup
plan:

```bash
npm run vault:rollback -- --profile personal --project <project-slug> --dry-run
```

This prints provider-specific cleanup guidance without deleting repos, projects,
deployments, env vars, or secrets.

## Troubleshooting

If setup fails, read:

```text
docs/idkwidk/usertour-website-integration/PROVISIONING_TROUBLESHOOTING.md
```

Use the troubleshooting guide before inventing a workaround or retrying with
broader provider permissions.
