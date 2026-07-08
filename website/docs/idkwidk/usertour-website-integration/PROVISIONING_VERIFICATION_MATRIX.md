# Provisioning Verification Matrix

| Area | Command Or Check | Expected Result | Status |
|---|---|---|---|
| Script syntax and release gate | `npm run setup:release:verify -- --profile <p> --project <x>` | Syntax-checks provisioning scripts and runs the safe local, plugin, status JSON, doctor JSON, readiness, audit, provider readback, and analytics checks in one place | Passing |
| Dependency install plan | `npm run setup:install -- --check` | Verifies the root script package, plus dashboard and marketing package manifests and lockfiles, without installing packages | Passing |
| Production helper | `npm run setup:production -- --profile <p> --project <x>` | Reports Clerk production status, readiness, audit, next action, and final command ladder without printing secrets | Passing |
| Production helper JSON | `npm --silent run setup:production -- --profile <p> --project <x> --json` | Prints machine-readable Clerk production and dashboard protection checklist without provider API calls or secret output | Passing |
| Agent control center | `npm run setup:agent -- --profile <p> --project <x>` and `--json` | Reads safe snapshots, chooses the next setup action, and reports whether user input is required without provider API calls or secret output | Passing |
| Bootstrap front door | `npm run setup:bootstrap -- --profile <p> --project <x>` | Runs the same low-lift front-door engine as `setup:project`, including audit and status snapshot, without provider mutation | Passing |
| Project factory front door | `npm run setup:factory -- --profile <p> --project <x>` | Runs the front-door engine with credential setup and read-only provider checks enabled, without hidden live provider mutation | Passing in fresh-clone proof |
| Onboarding shortcut | `npm run setup:onboard -- --profile <p> --project <x>` | Runs the bootstrap front door with credential setup and read-only provider checks enabled, without hidden live provider mutation | Passing in fresh-clone proof |
| Project front door | `npm run setup:project -- --profile <p> --project <x>` | Runs storage explanation, guided walkthrough, completion audit, and next-action pointer without provider mutation | Passing |
| Setup start help | `npm run setup:start -- --help` | Explains the human/agent first command without credentials | Passing |
| Setup start fresh profile | `npm run setup:start -- --profile fresh --project smoke` with isolated config | Prints missing-profile guidance without creating resources | Passing in fresh-clone proof |
| Setup start access check | `npm run setup:start -- --profile <p> --project <x> --check-access` | Runs guided read-only provider checks and redacts secrets | Passing for `personal/idkwidk-template` |
| Setup walkthrough | `npm run setup:walkthrough -- --profile <p> --project <x>` | Runs one guided non-mutating setup path and prints safe next actions | Passing |
| Setup walkthrough live guard | `npm run setup:walkthrough -- --profile <p> --project <x> --live` | Offers provider mutations one at a time with yes/no prompts and existing `--confirm-*` gates | Implemented |
| Credential verify path | `npm run setup:credentials -- --profile <p> --project <x> --verify` | After credential setup, runs read-only provider verification without creating resources | Passing in fresh-clone proof |
| Setup status | `npm run setup:status -- --profile <p> --project <x>` | Prints a safe human-readable setup snapshot without provider API calls or secret output | Passing |
| Setup status JSON | `npm --silent run setup:status -- --profile <p> --project <x> --json` | Prints stable machine-readable status and production checklist command for agents/plugins without provider API calls or secret output | Passing |
| Setup snapshot JSON | `npm --silent run setup:snapshot -- --profile <p> --project <x> --json` | Prints one stable machine-readable object with doctor, status, plan data, and production checklist command without provider API calls or secret output | Passing |
| Setup plan JSON | `npm --silent run setup:plan -- --profile <p> --project <x> --dry-run --json` | Prints stable machine-readable provider action ladder without provider API calls or secret output | Passing |
| Setup doctor JSON | `npm --silent run setup:doctor -- --profile <p> --json` | Prints stable machine-readable local safety checks without provider API calls or secret output | Passing |
| Setup token checklist JSON | `npm --silent run setup:tokens -- --profile <p> --json` | Prints provider token, metadata, CLI-login, and storage checklist without provider API calls or secret output | Passing |
| Vault metadata normalization | `npm run setup:vault-metadata:verify` | Proves copied metadata values are normalized or rejected without provider API calls or secret output | Passing |
| Setup next JSON | `npm --silent run setup:next -- --profile <p> --project <x> --json` | Prints exactly one safe next action for agents/plugins without provider API calls or secret output | Passing |
| Plugin package check | `npm run setup:plugin:package -- --check` | Validates local plugin package inputs without publishing, provider API calls, or secret output | Passing |
| Storage locations | `npm run setup:locations` | Explains cloned files, local profile metadata, OS keychain secrets, ignored env files, and local state | Passing |
| Completion audit | `npm run setup:audit -- --profile <p> --project <x>` | Prints requirement-level ready, blocked, pending, and guided evidence without provider API calls | Passing |
| Implementation completion checklist | `npm run setup:completion -- --profile <p> --project <x>` and `--json` | Prints implementation-plan ready, blocked, and guided phases without provider API calls or secret output | Passing |
| Vault doctor | `npm run vault:doctor` | No local safety failures | Known passing before this plan |
| Provider CLI preflight | `npm run vault:doctor -- --profile <p>` | Reports Node, npm, Git, GitHub CLI, Vercel CLI, Convex CLI, Clerk CLI, keychain, env ignore, and profile readiness | Passing |
| Next action fresh profile | `npm run setup:next -- --profile fresh --project smoke` with isolated config | Prints credential bootstrap and read-only check commands without throwing or creating resources | Passing in fresh-clone proof |
| Help output | `npm run vault` | Shows vault commands | Known passing before this plan |
| Token guide | `npm run vault:tokens` | Prints timing and storage commands | Passing |
| Next-step guide | `npm run vault:next` | Prints provider-specific missing setup | Passing |
| GitHub offline dry-run | `npm run vault:github -- --profile <p> --project <x> --dry-run` | No API call, prints plan | Known passing with fake profile |
| GitHub read-only missing token | `--check-existing` without token | Fails closed with next action | Known passing |
| GitHub read-only fake token | `--check-existing` with fake token | Inconclusive, no token printed | Known passing |
| Secret hygiene | `npm run secret:scan` | No token-like secrets in tracked files | Passing |
| Local env ignore | `git check-ignore apps/dashboard/.env.local` | Ignored | Known passing |
| State write | `npm run vault:state` after dry-run setup | Sanitized state, no secrets | Passing with fake profile |
| State ignore | `git check-ignore .idkwidk/provisioning/state.json` | Ignored | Passing |
| Provider dry-runs | `vault:vercel`, `vault:convex`, `vault:clerk`, `vault:codex` | Plans recorded without API calls | Passing with fake profile |
| GitHub real read check | `npm run vault:github -- --profile personal --project idkwidk-readcheck-smoke-20260529 --dry-run --check-existing` | `not-found` result without creating a repo | Passing |
| GitHub create | `--create --confirm-create` | Repo created and verified | Implemented, not live-verified |
| GitHub create | real token and disposable repo | Repo created and verified | Passing for buildingwithai/idkwidk-template |
| GitHub push/connect | `--connect-existing`, `--push-initial` | Remote configured and clean branch pushed | Implemented, remote overwrite guard added |
| Vercel adapter | `vault:vercel --dry-run` | Plan recorded | Dry-run implemented |
| Vercel access check | `vault:vercel --dry-run --check-access` | Token reads user/team/project | Passing for personal scope |
| Vercel create | `vault:vercel --create --confirm-create` | Project created and verified | Passing for jovannytovar-4890/idkwidk-template |
| Vercel env plan | `vault:vercel --plan-env` | Prints non-secret env keys | Passing |
| Vercel env write | `vault:vercel --set-env --confirm-env` | Writes non-secret template env vars | Passing |
| Vercel dashboard create | `vault:vercel-dashboard --create --confirm-create` | Dashboard project created and verified | Passing for jovannytovar-4890/idkwidk-template-dashboard |
| Vercel dashboard settings | `vault:vercel-dashboard --configure-settings --confirm-settings` | Dashboard project rooted at `apps/dashboard` | Passing |
| Vercel dashboard env | `vault:vercel-dashboard --set-env --confirm-env` | Writes dashboard env keys without production auth bypass | Passing with 8 keys |
| Convex adapter | `vault:convex --dry-run` | Plan recorded | Dry-run implemented |
| Convex access check | `vault:convex --dry-run --check-access` | Token reads team and project list | Passing for team `391508` |
| Convex create | `vault:convex --create --confirm-create --deployment-type dev` | Project and dev deployment created | Passing for `idkwidk-template` |
| Convex cloud connect | `convex dev --configure existing --team jovannytovar --project idkwidk-template --dev-deployment cloud --once` | `.env.local` points at cloud deployment and functions are ready | Passing |
| Convex deploy key | `vault:convex --create-deploy-key --confirm-deploy-key` | Deploy key created and stored in Keychain, not printed | Passing for `vercel-prod` |
| Convex analytics write/read | `npm run analytics:convex:verify -- --profile <p> --project <x>` | Writes one synthetic smoke pageview, reads summary/recent events back, records non-secret state | Passing for `personal/idkwidk-template` |
| Vercel env plan | `vault:vercel --plan-env` | Prints key names/types only | Passing with 9 planned keys |
| Vercel env write | `vault:vercel --set-env --confirm-env` | Writes plain/encrypted values without printing secrets | Passing |
| Vercel env readback | `vault:verify` | Reads back expected env key names only | Passing with 9 present |
| Vercel dashboard readback | `vault:verify` | Reads back dashboard root settings and env key targets | Passing with 8 present |
| Setup wrapper dry run | `npm run setup -- --profile <p> --project <x> --dry-run` | Non-mutating setup plan completes and redacts secrets | Passing for `personal/idkwidk-template` |
| Setup wrapper access check | `npm run setup -- --profile <p> --project <x> --check-access` | Read-only provider checks complete and redacts secrets | Passing for `personal/idkwidk-template` |
| Plugin package | `npm run setup:plugin:verify` | Verifies plugin manifest, skill, README start path, troubleshooting link, and no secret-like text | Passing |
| Plugin discovery | `npm run setup:plugin-discovery:verify` | Simulates fresh local marketplace discovery without provider credentials | Passing |
| Fresh clone | `npm run setup:fresh-clone:verify` | Clones committed source, proves no env/state/profile files ship, verifies start/plugin paths, and ignores global Convex/Clerk CLI auth so another computer cannot pass by borrowing this Mac's login | Passing |
| Troubleshooting guide | `PROVISIONING_TROUBLESHOOTING.md` via `setup:plugin:verify` | Exists, is linked, includes start/rollback paths, and has no secret-like text | Passing |
| Clerk adapter | `vault:clerk --dry-run` | Plan recorded | Dry-run implemented |
| Clerk dev env pull | `vault:clerk --pull-dev-env --confirm-dev-env` | Pulls Clerk development keys through CLI and stores them in vault without printing secrets | Implemented |
| Clerk production domain preflight | `vault:clerk --deploy-prod --confirm-prod-deploy` without `clerk.productionDomain` | Refuses before Clerk's interactive domain prompt unless `--allow-domain-prompt` is explicit | Passing |
| Clerk prod env guard | `vault:clerk --pull-prod-env` without confirm | Refuses to run | Passing |
| Clerk prod env missing instance | `vault:clerk --pull-prod-env --confirm-prod-env` before production setup | Fails safely without printing secrets | Passing |
| Vercel Clerk targets | Vercel env readback | Clerk dev keys target development only until live keys exist | Passing |
| Rollback plan | `vault:rollback --dry-run` | Prints provider cleanup guidance without deleting resources | Passing |
| Dashboard build | `npm run dashboard:build` | Passes | Passing |
| Marketing typecheck | `npm run marketing:typecheck` | Passes | Passing |
| Marketing build | `npm run marketing:build` | Passes | Passing |
| Runtime preview | `npm run preview` plus `npm run preview:verify` | Dashboard `3015` and marketing `3020` routes load | Passing by route-level HTTP proof; browser connector unavailable |
| Production readiness | `npm run vault:readiness -- --profile <p> --project <x>` | Separates ready, blocked, pending, and guided items | Passing; production remains blocked on Clerk production auth |

## Evidence Rules

- A provider is not considered done until a readback verifies it.
- A command that only prints a plan is not live support.
- A fake-token pass proves safety behavior, not provider correctness.
- Token values must never appear in evidence logs.
