# Provisioning Agent Runbook

## Purpose

This file tells coding agents how to help a user provision this template without
leaking organization credentials or creating provider resources by accident.

## Rules

- Do not ask the user to paste real secrets into chat.
- Do not write organization tokens to `.env.local`.
- Do not commit generated env files.
- Do not print token values.
- Run `npm run setup:bootstrap` before setup work.
- Run read-only checks before any live provider action.
- Show the user what provider resources will be created before creating them.
- Treat GitHub, Vercel, Convex, Clerk, and Codex as separate trust boundaries.
- Use project-specific keys in project env files, not organization-level tokens.
- Stop if the selected provider organization, team, or workspace is ambiguous.

## Safe Agent Flow

1. Read the user's requested project name and target provider profile.
2. Run the agent control center first:

```bash
npm run setup:agent -- --profile <profile> --project <project>
npm --silent run setup:agent -- --profile <profile> --project <project> --json
```

This is the preferred first read for agents and plugins. It does not create
provider resources, call provider APIs, or print secrets. It reports the next
safe command and whether the agent can continue without user input.

3. If deeper human-facing setup output is needed, run the guided bootstrap
   command:

```bash
npm run setup:bootstrap -- --profile <profile> --project <project>
```

4. If the profile or reusable provider credentials are missing, tell the user
   to run the credential wizard in their terminal:

```bash
npm run setup:credentials -- --profile <profile> --project <project>
```

If the user needs to know exactly which tokens, metadata values, or provider
CLI logins are needed, show the token checklist:

```bash
npm run setup:tokens -- --profile <profile>
npm --silent run setup:tokens -- --profile <profile> --json
```

For a new computer, the lower-lift shortcut is:

```bash
npm run setup:onboard -- --profile <profile> --project <project>
```

This wizard stores secrets through `vault:set` prompts and keeps metadata in the
local profile outside the repo.

5. If provider credentials are stored, run the read-only access wrapper:

```bash
npm run setup:bootstrap -- --profile <profile> --project <project> --check-access
```

6. If the user asks "what is next?", run the short next-action command:

```bash
npm run setup:next -- --profile <profile> --project <project>
npm --silent run setup:next -- --profile <profile> --project <project> --json
```

For agents and plugins, prefer the JSON form when you need exactly one safe
next action. It does not call provider APIs or print secret values.

7. If another agent or tool needs parseable setup state, use:

```bash
npm --silent run setup:status -- --profile <profile> --project <project> --json
```

8. If another agent or tool needs one combined parseable view of local safety,
   provider status, and setup plan, use:

```bash
npm --silent run setup:snapshot -- --profile <profile> --project <project> --json
```

This is the preferred first read for agents because it avoids stitching
multiple text commands together.

9. If another agent or tool needs only the ordered provider action ladder, use:

```bash
npm --silent run setup:plan -- --profile <profile> --project <project> --dry-run --json
```

10. Before handing the plugin to another user or a future marketplace flow, run
   the non-publishing package check:

```bash
npm run setup:plugin:package -- --check
```

This validates the plugin package inputs and secret boundary without creating
or publishing an archive.

This returns read-only checks, guarded live commands, and required confirmation
flags without calling provider APIs or printing secrets.

11. If another agent or tool needs only parseable local machine health, use:

```bash
npm --silent run setup:doctor -- --profile <profile> --json
```

This returns Node/npm/Git/provider CLI/keychain/env-ignore checks without
calling provider APIs or printing secrets.

12. Use the lower-level setup wrapper only when you need detailed provider
   output for debugging:

```bash
npm run setup -- --profile <profile> --project <project> --check-access
```

13. Run the first provider-specific dry run when you need deeper evidence:

```bash
npm run vault:github -- --profile <profile> --project <project> --dry-run
```

14. If the dry run shows a stored GitHub token, run the read-only existence
   check:

```bash
npm run vault:github -- --profile <profile> --project <project> --dry-run --check-existing
```

13. Run the remaining provider dry-runs:

```bash
npm run vault:vercel -- --profile <profile> --project <project> --dry-run
npm run vault:vercel-dashboard -- --profile <profile> --project <project> --dry-run --check-access
npm run vault:convex -- --profile <profile> --project <project> --dry-run
npm run vault:clerk -- --profile <profile> --project <project> --dry-run
npm run vault:codex -- --profile <profile> --project <project> --dry-run
```

14. Verify that copied metadata values are normalized or rejected safely:

```bash
npm run setup:vault-metadata:verify
```

15. Explain missing tokens or metadata in plain language.
16. For Clerk development keys, prefer the guarded CLI pull after the user has
    logged in and selected or created an app:

```bash
npm run vault:metadata -- --profile <profile> --provider clerk --key applicationId --value <app-id>
npm run vault:clerk -- --profile <profile> --project <project> --pull-dev-env --confirm-dev-env
```

This stores Clerk app keys in the local vault and does not print them.

16. Generate local env files only after a dry run:

```bash
npm run vault:env -- --profile <profile> --dry-run
```

17. If files already exist, do not overwrite them unless the user explicitly
   approves `--force`.
18. After provider adapters are implemented, call only one live provider adapter
   at a time and verify its result before moving to the next provider.
19. Print a rollback plan after live provider setup:

```bash
npm run vault:rollback -- --profile <profile> --project <project> --dry-run
```

20. Print a production readiness report:

```bash
npm run vault:readiness -- --profile <profile> --project <project>
```

21. If a check fails, use:

```text
docs/idkwidk/usertour-website-integration/PROVISIONING_TROUBLESHOOTING.md
```

Do not broaden provider scopes or retry live mutations until the failing
boundary is understood.

## Provider Order

Use this order because each step depends on the earlier project identity:

1. GitHub repository
2. Vercel marketing project
3. Vercel dashboard service
4. Convex project/deployment
5. Clerk application
6. Clerk production through `npm run setup:production`
   and `npm --silent run setup:production -- --json`
7. Clerk live keys and Vercel env sync through `setup:production`
8. Codex workspace instructions or supported secure setup flow

## Verification

After setup, verify:

- `apps/dashboard/.env.local` exists and is gitignored.
- `apps/marketing/.env.local` exists and is gitignored.
- No real secrets are tracked by Git.
- `npm run setup:plugin:verify` passes before treating the local plugin as
  reusable.
- `npm run analytics:convex:verify -- --profile <profile> --project <project>`
  passes before claiming live analytics storage works.
- Dashboard build can run.
- Marketing build can run.
- Dashboard starts on port `3015`.
- Marketing starts on port `3020`.
- Dashboard Vercel service is verified separately from the marketing Vercel
  project.
- Dashboard production use is blocked until Clerk production auth exists.
- `vault:rollback --dry-run` prints provider-specific cleanup guidance.
- If production preview servers are running, `npm run preview:verify` checks
  dashboard and marketing routes.
- `vault:readiness` separates ready, pending, blocked, and guided setup items.
- `npm run setup:fresh-clone:verify` proves the committed template can be
  cloned without carrying local env files, provisioning state, or the original
  user's profile config.

## Current Boundary

GitHub, Vercel, and Convex have live guarded creation/readback paths. Clerk is
partially live through the official CLI and stored app keys. Codex/OpenAI setup
must stay on official secure flows until an automation API is verified.

The bootstrap command is still non-mutating unless the user explicitly turns on
the existing guarded live flow. It is intentionally a guide and safety gate, not
a hidden one-command infrastructure mutator.
