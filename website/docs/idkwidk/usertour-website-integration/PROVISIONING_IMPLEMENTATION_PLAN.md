# Provisioning Implementation Plan

## Phase 0: Planning Artifacts

Status: completed

- Add user signal brief.
- Add technical specification.
- Add implementation plan.
- Add verification matrix.
- Add autonomous continuation runbook.
- Update Mission Control.

Exit criteria:

- A future agent can identify the next safest task without reading chat history.

## Phase 1: Local State And Evidence

Status: implemented and covered by local/fresh-clone evidence

Tasks:

- Add `.idkwidk/provisioning/state.json` read/write helpers.
- Add `vault:state` command to print sanitized local state.
- Record GitHub dry-run and read-check results without secrets.
- Add tests or script-level verification for state writes.

Implemented:

- `vault:state`
- sanitized state writer under `.idkwidk/provisioning/state.json`
- GitHub plan and read-check state recording
- provider dry-run state recording

Exit criteria:

- Dry-run evidence persists locally.
- State contains no secrets.
- Missing, exists, and inconclusive GitHub read-check states are represented.

## Phase 2: GitHub Create Boundary

Status: implemented and live-verified for `buildingwithai/idkwidk-template`

Tasks:

- Add `vault:github --create --confirm-create`.
- Require prior read-check result of `not-found`.
- Create repo with `gh repo create` or GitHub API using Keychain token.
- Record created repo URL in local state.
- Verify with read-only `gh repo view`.
- Do not push code yet.

Implemented:

- `vault:github --create --confirm-create --visibility private|public|internal`
- refusal unless state has matching GitHub read-check `not-found`
- post-create GitHub readback verification
- no push behavior

Exit criteria:

- A repo can be created only after dry-run and read-check.
- Existing repo names are refused.
- Created repo is verified through GitHub readback.

## Phase 3: GitHub Connect/Push Boundary

Status: implemented and live-verified for the `template` remote

Tasks:

- Add explicit `--connect-existing` flow.
- Add explicit `--push-initial` flow.
- Refuse to push with dirty secrets or tracked env files.
- Add remote only after user confirmation.
- Verify remote URL.

Implemented:

- `vault:github --connect-existing --confirm-connect`
- `vault:github --push-initial --confirm-push`
- refusal when env files appear tracked
- refusal to push when worktree has uncommitted changes

Exit criteria:

- Template can connect to an existing repo or push to a newly created repo
  without leaking env files.

## Phase 4: Vercel Adapter

Status: marketing and dashboard service boundaries implemented and live-verified

Tasks:

- Add `vault:vercel` dry-run.
- Add read-only project existence check.
- Add create/link command behind confirmation.
- Add project env var writer for project-specific keys only.
- Verify project through Vercel readback.

Implemented:

- `vault:vercel --dry-run`
- `vault:vercel --dry-run --check-access`
- `vault:vercel --create --confirm-create`
- readback verification after create
- `vault:vercel-dashboard --create --confirm-create`
- dashboard settings/env readback for `idkwidk-template-dashboard`

Added:

- non-secret template-mode env plan/write boundary
- separate dashboard service rooted at `apps/dashboard`

Exit criteria:

- Vercel project exists and is linked to GitHub repo or local project.
- Env vars are set without exposing organization token.
- Dashboard service has its own Vercel project and does not use production auth
  bypass.

## Phase 5: Convex Adapter

Status: create/read/connect boundary implemented and live-verified for
`idkwidk-template`; analytics write/read proof implemented

Tasks:

- Confirm official Convex CLI/API command sequence.
- Add dry-run plan.
- Add read-only project/deployment check.
- Add create/link flow behind confirmation.
- Write generated Convex project env values.
- Verify dashboard can write to Convex.

Implemented:

- `vault:convex --dry-run`
- `vault:convex --dry-run --check-access`
- `vault:convex --create --confirm-create --deployment-type dev`
- team access token support through Convex Management API
- cloud deployment connection through official Convex CLI
- generated local env values in ignored `apps/dashboard/.env.local`
- live analytics smoke proof through `npm run analytics:convex:verify`
- readiness evidence for the Convex analytics write path

Exit criteria:

- Convex project-specific values are available.
- Dashboard analytics write path works against the selected Convex deployment.

Remaining:

- Production dashboard use still depends on Clerk production auth.

## Phase 6: Clerk Adapter

Status: development app/key path implemented, production deploy-status boundary
implemented, production instance blocked on domain/DNS input

Tasks:

- Confirm official Clerk API/CLI sequence.
- Add dry-run plan.
- Add app existence/config readback.
- Add create/configure flow behind confirmation.
- Configure local and production redirect/origin URLs.
- Write project-specific Clerk keys.
- Verify dashboard auth behavior with bypass disabled.

Implemented:

- Clerk CLI readback through `vault:clerk --dry-run`.
- Existing app detection and development instance readback.
- Stored publishable key metadata and secret key in Keychain.
- Guarded development env pull through
  `vault:clerk --pull-dev-env --confirm-dev-env`, storing Clerk app keys in the
  local vault without printing them.
- Production domain preflight through `clerk.productionDomain` metadata.
- Guarded refusal before launching Clerk production deploy when no production
  domain is stored, unless `--allow-domain-prompt` is explicitly provided.
- Guarded production env pull command:
  `vault:clerk --pull-prod-env --confirm-prod-env`.
- Safe failure when the production instance does not exist.
- Vercel env targeting keeps Clerk dev keys development-only.
- Guarded production deploy status command:
  `vault:clerk --deploy-status`.
- Guarded interactive production deploy launcher:
  `vault:clerk --deploy-prod --confirm-prod-deploy`.
- Readiness only treats Clerk production auth as ready after live Clerk keys are
  pulled into the vault.

Exit criteria:

- Clerk app works for dashboard routes.
- Missing-key setup-required route still works when keys are absent.

Remaining:

- Choose the real production domain and complete Clerk's interactive production
  deploy/DNS flow.
- Pull live `pk_live` and `sk_live` keys into the vault.
- Re-run Vercel env sync so production/preview receive live Clerk keys.
- Verify real sign-in with auth bypass disabled.

## Phase 7: Codex/OpenAI Setup

Status: dry-run/guidance implemented, official live support pending

Tasks:

- Confirm whether an official Codex project/workspace API exists.
- If supported, add secure setup adapter.
- If unsupported, add guided runbook only.
- Do not invent token semantics.

Exit criteria:

- Codex setup path is honest and repeatable.

## Phase 8: End-To-End Verification

Status: implemented for local/template verification; production readiness still
depends on Clerk production auth and dashboard protection

Tasks:

- Run `npm run vault:doctor`.
- Run setup dry-run.
- Verify local env files are ignored.
- Run dashboard lint/tests/build.
- Run marketing typecheck/build.
- Start production preview.
- Verify dashboard on `3015`.
- Verify marketing on `3020`.
- Verify provider readbacks.

Implemented:

- `setup:project` single front door for people and agents
- `setup:bootstrap` easy-to-remember alias for the same front-door engine
- `setup:factory` new-project alias that runs credential setup and read-only
  provider checks through the same front-door engine
- `setup:completion` implementation-plan checklist for humans, agents, and
  plugins
- `npm run secret:scan`
- production preview launcher through `scripts/start-preview-app.mjs`
- dashboard env/test/build checks
- marketing typecheck/build checks
- provider readback through `vault:verify`
- Vercel dashboard service readback through `vault:verify`
- Convex analytics write/read proof through `npm run analytics:convex:verify`
- runtime route proof through `npm run preview:verify`
- fresh-clone setup proof through `npm run setup:fresh-clone:verify`
- isolated profile config support through `IDKWIDK_TEMPLATE_CONFIG_DIR`
- isolated provider auth proof through `IDKWIDK_TEMPLATE_IGNORE_GLOBAL_CLI_AUTH`
- local plugin package proof through `npm run setup:plugin:verify`
- non-publishing plugin archive/package check through
  `npm run setup:plugin:package -- --check`
- top-level provisioning proof through `npm run setup:release:verify`

Exit criteria:

- The template can be cloned and provisioned with documented evidence.

## Phase 9: Cleanup And Release

Status: non-destructive rollback planning implemented; destructive cleanup
commands intentionally deferred

Tasks:

- Update docs and session handoff.
- Remove stale claims.
- Add troubleshooting section.
- Add cleanup/rollback commands per provider.
- Run secret scan.

Implemented:

- `vault:rollback --dry-run`
- troubleshooting guide for common setup and provider-boundary failures
- provider-specific cleanup guidance for local files/vault, GitHub, Vercel,
  Convex, Clerk, and Codex

Remaining:

- Keep destructive cleanup manual until each provider delete path has its own
  confirmation gate, backup/export warning, and readback verification.
- no destructive cleanup is performed automatically

Exit criteria:

- User has a clear production-ready setup path.
- Agents have a clear continuation path.

## Phase 10: Setup Skill / Plugin Wrapper

Status: local guide command and plugin scaffold implemented with package and
discovery proof

Tasks:

- Add a single guided command for dry-run and read-only provider checks.
- Add a local agent skill that tells agents how to run setup safely.
- Keep provider mutation logic in normal scripts, not hidden inside a plugin.
- Package as a Codex plugin only after the command contract is stable.

Implemented:

- `npm run setup:start -- --profile <profile> --project <project>`
- `npm run setup:walkthrough -- --profile <profile> --project <project>`
- `npm run setup:walkthrough -- --profile <profile> --project <project> --check-access`
- `npm run setup:walkthrough -- --profile <profile> --project <project> --live`
- `npm run setup:bootstrap -- --profile <profile> --project <project> --check-access`
- `npm run setup:factory -- --profile <profile> --project <project>`
- `npm run setup:bootstrap -- --profile <profile> --project <project>`
- `npm run setup:onboard -- --profile <profile> --project <project>`
- `npm run setup:next -- --profile <profile> --project <project>`
- `npm run setup:status -- --profile <profile> --project <project>`
- `npm --silent run setup:status -- --profile <profile> --project <project> --json`
- `npm run setup:locations`
- `npm run setup:audit -- --profile <profile> --project <project>`
- `npm run setup -- --profile <profile> --project <project> --dry-run`
- `npm run setup -- --profile <profile> --project <project> --check-access`
- `npm run setup:credentials -- --profile <profile> --project <project>`
- `npm run setup:credentials -- --profile <profile> --project <project> --verify`
- `npm run setup:guide -- --profile <profile> --project <project>`
- `.agents/skills/idkwidk-template-provisioning/SKILL.md`
- `plugins/idkwidk-template-provisioner`
- `.agents/plugins/marketplace.json` local plugin entry
- `npm run setup:plugin:verify`
- `npm run setup:plugin-discovery:verify`
- `npm run setup:release:verify -- --profile <profile> --project <project>`
- setup skill/plugin blueprint doc
- reusable credential bootstrap wizard for new computers/users
- credential bootstrap can immediately run read-only provider verification with
  `--verify`
- fresh Codex-style local marketplace discovery simulation
- short next-action command that separates verified providers from the current
  blocker
- storage-location explainer that separates cloned files, local profile
  metadata, OS keychain secrets, ignored env files, and local provisioning state
- metadata normalization for copied setup values, including Convex team IDs and
  Clerk production domains
- `npm run setup:vault-metadata:verify` to prove metadata normalization and
  placeholder rejection without provider credentials
- completion audit that separates ready, blocked, pending, and guided
  requirements with evidence and next actions
- machine-readable setup status for agents/plugins that need a stable JSON
  snapshot without provider API calls or secret output
- guided project walkthrough that offers live provider setup one step at a time
  only when `--live` is explicit
- new-computer onboarding shortcut that runs the bootstrap front door with
  credential setup and read-only checks enabled

Exit criteria:

- A new user or agent can discover the safe setup flow without reading chat
  history.

Remaining:

- Verify real in-app Codex install UX if/when Codex exposes a scriptable local
  install check. Local marketplace, package, fresh-clone, and discovery proof
  exist.
- Add published marketplace packaging only after the local package check stays
  stable across at least one fresh clone.

## Phase 11: Provider Env And Deploy Keys

Status: implemented for Convex and Vercel

Tasks:

- Create a deployment-scoped Convex deploy key without printing it.
- Store the deploy key in the OS keychain.
- Include Convex project values in local env previews.
- Set Vercel project env vars for Convex and Clerk values.
- Verify Vercel env keys by readback without printing values.

Implemented:

- `vault:convex --create-deploy-key --confirm-deploy-key`
- `vault:vercel --plan-env` includes project-specific Convex and Clerk keys
- `vault:vercel --set-env --confirm-env` writes plain and encrypted values
- `vault:verify` reads back Vercel env key names and checks expected keys

Exit criteria:

- Vercel reports all expected env key names.
- No secret values are printed during planning, writing, or verification.
