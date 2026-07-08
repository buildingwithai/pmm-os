# Setup Skill And Plugin Blueprint

## Goal

Make project setup low-lift for a user who clones the template on any computer.
The user should run one guided setup flow, store reusable provider access in a
local vault, and let agents create project-specific resources with explicit
approval.

## Recommended Shape

Start with a local Codex skill, then package it as a plugin only after the setup
contract is stable.

Why:

- The real provider logic already lives in `scripts/template-vault.mjs`.
- A skill can tell agents exactly which commands to run without duplicating
  provider code.
- A plugin can later bundle the same skill, hooks, and setup docs for reuse
  across repositories.

## Current Entry Points

```bash
npm run setup:bootstrap -- --project <project-slug>
npm run setup:onboard -- --project <project-slug>
npm run setup:project -- --project <project-slug>
npm run setup:project -- --project <project-slug> --install --confirm-install
npm run setup:start -- --profile personal --project <project-slug>
npm run setup:locations
npm run setup:audit -- --profile personal --project <project-slug>
npm run setup:status -- --profile personal --project <project-slug>
npm --silent run setup:status -- --profile personal --project <project-slug> --json
npm run setup:production -- --profile personal --project <project-slug>
npm run setup:walkthrough -- --profile personal --project <project-slug>
npm run setup:walkthrough -- --profile personal --project <project-slug> --check-access
npm run setup:walkthrough -- --profile personal --project <project-slug> --live
npm run setup:credentials -- --profile personal --project <project-slug>
npm run setup:credentials -- --profile personal --project <project-slug> --verify
npm run setup:onboard -- --profile personal --project <project-slug>
npm run setup:bootstrap -- --profile personal --project <project-slug> --check-access
npm run setup:plugin:verify
npm run setup:plugin-discovery:verify
npm run setup:fresh-clone:verify
npm run setup:release:verify -- --profile personal --project <project-slug>
npm run setup:guide -- --profile personal --project <project-slug>
npm run setup -- --profile personal --project <project-slug> --dry-run
npm run setup -- --profile personal --project <project-slug> --check-access
```

The bootstrap command is the easy-to-remember first command. It uses the same
front-door engine as `setup:project`, then prints the audit and status snapshot.
The start command is the safe lower-level check. The walkthrough is the
lowest-lift human path: it runs the safe checks, prints the current next action,
and can offer live provider steps one at a time when `--live` is explicit. The
lower-level guide and setup commands remain available for agents and CI.
The locations command explains what moves with the repo and what stays on the
current computer, which is important for cloned templates and new users.
The audit command is the honest completion report: it says what is ready,
blocked, pending, and guided, and it keeps Clerk production readiness separate
from local/template portability.
The status command is the stable snapshot for agents. Use the `npm --silent`
JSON form when another tool needs parseable setup state.
The credentials command is the one-time new-computer helper. It initializes the
profile, collects non-secret metadata, and launches the secure `vault:set`
prompts for reusable provider tokens without storing secrets in the repo. With
`--verify`, it immediately runs the read-only provider walkthrough so the user
can see whether the values they just saved work.
The fresh-clone verifier clones the committed repo into a temporary directory,
uses an isolated profile directory, confirms ignored local files are absent, and
runs the guide without needing the original user's credentials. The plugin
verifier checks the local marketplace entry, plugin manifest, skill frontmatter,
required commands, and secret hygiene.
The discovery verifier copies the local marketplace and plugin into a temporary
fresh-app layout and proves the marketplace entry resolves to the plugin,
manifest, skills, default prompts, and no-secret files without provider
credentials.
The release verifier runs the proof commands in the order an agent should use
before handoff. It keeps expensive build, preview, and clean-clone checks behind
explicit flags so normal setup remains fast.

## Local Vault Contract

Secrets:

- `github.organizationToken`
- `vercel.organizationToken`
- `convex.teamAccessToken`
- `convex.deployKey`
- `clerk.secretKey`
- `clerk.webhookSigningSecret`
- `clerk.platformAccessToken`

Metadata:

- `github.owner`
- `vercel.teamSlug`
- `convex.teamId`
- `convex.teamSlug`
- `clerk.applicationId`
- `clerk.publishableKey`
- `clerk.productionDomain`
- `codex.workspaceName`

Secrets stay in the OS keychain. Metadata stays in the local profile file
outside the repo.

## What The Plugin Does

1. Ask for a profile name and project slug.
2. Run `npm run setup:bootstrap`, `npm run setup:start`, or
   `npm run setup:walkthrough`.
3. Explain missing provider credentials.
4. Guide the user to create or log in to each provider.
5. Store credentials with `vault:set` and metadata with `vault:metadata`.
6. Use `npm run setup:locations` when the user needs to understand what is
   stored where.
7. Use `npm run setup:audit` when the user asks whether everything is complete.
8. Use `npm --silent run setup:status -- --json` when an agent needs machine
   readable setup state.
9. Run `npm run setup:walkthrough -- --check-access`.
10. Ask for explicit approval before each provider mutation.
11. Run one provider create/connect command at a time.
12. Verify provider readback after each mutation.
13. Write only project-specific runtime values to ignored env files and provider
    env stores.
14. Run final app verification.

## Current Boundary

This repo now includes a local skill at:

```text
.agents/skills/idkwidk-template-provisioning/SKILL.md
```

This repo also includes a local plugin scaffold at:

```text
plugins/idkwidk-template-provisioner
```

The skill and plugin give agents a repeatable playbook while the provider
commands remain testable normal scripts.

## Remaining Work

- Verify real in-app Codex install UX when a scriptable local install check is
  available. Local package and discovery verification now exist through
  `npm run setup:plugin:verify` and `npm run setup:plugin-discovery:verify`.
- Publish a distributable plugin only after the local plugin contract stays
  stable across fresh-clone verification and at least one real new-project
  setup.
- Add fully verified Clerk application creation/configuration if Clerk exposes a
  stable non-interactive creation path beyond the current official CLI flow.
- Keep verifying the guarded Clerk development env pull so a user does not need
  to paste Clerk app keys into chat.
- Keep Clerk production deploy behind a domain preflight. The plugin should ask
  for a real production domain that the user owns and can edit DNS for before
  launching Clerk's interactive production flow.
- Decide the final production auth posture. The Vercel env path writes Clerk
  development keys only to Vercel development until live Clerk production keys
  are pulled into the vault.
- Keep cleanup destructive actions manual until each provider has its own
  delete confirmation, backup/export warning, and readback check.
- Keep final production verification current as provider boundaries change.
