---
name: template-provisioning
description: Guide secure setup of the idkWidk SaaS template across GitHub, Vercel, Convex, Clerk, and Codex.
---

# Template Provisioning

Use this skill when the user wants to install, clone, duplicate, provision, or
verify this SaaS template on any computer.

## Rules

- Do not ask the user to paste real secrets into chat.
- Do not print secret values.
- Do not store organization tokens in `.env.local`.
- Do not commit `.env.local` or `.idkwidk/provisioning/state.json`.
- Run the single front-door command first:

```bash
npm run setup:factory -- --project <project>
npm run setup:agent -- --profile <profile> --project <project>
npm --silent run setup:agent -- --profile <profile> --project <project> --json
npm run setup:bootstrap -- --project <project>
```

- `setup:factory` is the clearest new-project command. It runs the front-door
  engine with credential setup and read-only provider checks enabled. It still
  does not create provider resources unless the user later approves the guarded
  live commands.

- `setup:agent` is the safest control-center command for agents and plugins. It
  reads the setup state, chooses the next action, and reports whether user input
  is required. It does not create provider resources, call provider APIs, or
  print secrets.

- On a new computer or for a new user, use the onboarding shortcut. It runs the
  same front door with credential setup and read-only checks enabled:

```bash
npm run setup:onboard -- --project <project>
```

- `setup:bootstrap` is the easy-to-remember alias for the same front-door
  engine:

```bash
npm run setup:project -- --project <project>
```

- If a non-default profile is needed, pass it explicitly:

```bash
npm run setup:bootstrap -- --profile <profile> --project <project>
```

- Use the lower-level start command when you only need the setup guide:

```bash
npm run setup:start -- --profile <profile> --project <project>
```

- For the lowest-lift guided flow, use the walkthrough:

```bash
npm run setup:walkthrough -- --profile <profile> --project <project>
```

- If the user explicitly wants the agent to offer live provider setup steps one
  at a time, use:

```bash
npm run setup:walkthrough -- --profile <profile> --project <project> --live
```

- The front-door command can also launch credential setup, live guarded setup,
  and release verification:

```bash
npm run setup:bootstrap -- --profile <profile> --project <project> --credentials --check-access
npm run setup:factory -- --profile <profile> --project <project>
npm run setup:bootstrap -- --profile <profile> --project <project> --install --confirm-install
npm run setup:bootstrap -- --profile <profile> --project <project> --live
npm run setup:bootstrap -- --profile <profile> --project <project> --verify --fresh-clone
```

- If you need the lower-level guide, use:

```bash
npm run setup:guide -- --profile <profile> --project <project>
```

- If the profile or reusable provider access is missing, run the credential
  wizard:

```bash
npm run setup:credentials -- --profile <profile> --project <project>
npm run setup:credentials -- --profile <profile> --project <project> --verify
```

- If the user needs to know which provider tokens, metadata, or CLI login steps
  are needed, use the token checklist. Prefer `--json` for agent/plugin UI:

```bash
npm run setup:tokens -- --profile <profile>
npm --silent run setup:tokens -- --profile <profile> --json
```

- Use read-only checks before live provider creation:

```bash
npm run setup:bootstrap -- --profile <profile> --project <project> --check-access
npm run setup:walkthrough -- --profile <profile> --project <project> --check-access
```

- When the user asks what is next, use the short next-action command:

```bash
npm run setup:next -- --profile <profile> --project <project>
npm --silent run setup:next -- --profile <profile> --project <project> --json
```

- When another agent or plugin needs a stable setup snapshot, use the status
  command. Prefer `--json` for automation so the agent does not scrape prose:

```bash
npm run setup:status -- --profile <profile> --project <project>
npm --silent run setup:status -- --profile <profile> --project <project> --json
```

- When another agent or plugin needs one combined setup snapshot with local
  machine health, provider status, the setup plan, and the production checklist
  command, use:

```bash
npm run setup:snapshot -- --profile <profile> --project <project>
npm --silent run setup:snapshot -- --profile <profile> --project <project> --json
```

- When another agent or plugin needs the ordered provider action ladder, use
  the plan command:

```bash
npm run setup:plan -- --profile <profile> --project <project> --dry-run
npm --silent run setup:plan -- --profile <profile> --project <project> --dry-run --json
```

- Before live provider work, check the local machine, CLIs, keychain, and ignore
  rules:

```bash
npm run setup:doctor -- --profile <profile>
npm --silent run setup:doctor -- --profile <profile> --json
```

- When the user asks where credentials live or how the setup works across
  computers, use:

```bash
npm run setup:locations
```

- When the user asks whether setup is complete, use:

```bash
npm run setup:audit -- --profile <profile> --project <project>
```

- When the user asks what remains from the implementation plan or technical
  spec, use the completion checklist. Prefer JSON for agent/plugin UI:

```bash
npm run setup:completion -- --profile <profile> --project <project>
npm --silent run setup:completion -- --profile <profile> --project <project> --json
```

- Before handing the plugin to another user or a future marketplace flow, run
  the metadata and non-publishing package checks:

```bash
npm run setup:vault-metadata:verify
npm run setup:plugin:package -- --check
```

- When the user asks to finish production auth, dashboard protection, or the
  final production blockers, use:

```bash
npm run setup:production -- --profile <profile> --project <project>
npm --silent run setup:production -- --profile <profile> --project <project> --json
```

- Ask for explicit user approval before any command with `--confirm-create`,
  `--confirm-connect`, `--confirm-push`, `--confirm-env`,
  `--confirm-settings`, `--confirm-dev-env`, `--confirm-prod-deploy`, or
  `--confirm-prod-env`.
- Run one live provider mutation at a time, then verify it.

## Provider Order

1. GitHub repository.
2. Vercel project and env.
3. Vercel dashboard service and env.
4. Convex project, deployment, and deploy key.
5. Clerk app, production instance, and auth env.
6. Codex/OpenAI official setup flow.
7. End-to-end build, route, provider, and secret verification.

## Clerk Development

After the user logs in with Clerk CLI and creates or selects a Clerk app, prefer
the guarded dev env pull instead of asking the user to paste keys into chat:

```bash
npm run vault:metadata -- --profile <profile> --provider clerk --key applicationId --value <app-id>
npm run vault:clerk -- --profile <profile> --project <project> --pull-dev-env --confirm-dev-env
```

If the app name exactly matches the project slug, the command can discover the
application ID through the Clerk CLI.

## Clerk Production

Clerk production setup is partly interactive because it needs a real production
domain, DNS access, and sometimes production OAuth credentials.

Use this order:

```bash
npm run setup:production -- --profile <profile> --project <project>
npm --silent run setup:production -- --profile <profile> --project <project> --json
npm run setup:production -- --profile <profile> --project <project> --domain <your-production-domain>
npm run setup:production -- --profile <profile> --project <project> --deploy-prod --confirm-prod-deploy
npm run setup:production -- --profile <profile> --project <project> --pull-prod-env --confirm-prod-env
npm run setup:production -- --profile <profile> --project <project> --sync-vercel-env --confirm-env
```

Do not invent the production domain. It must be a real domain the user owns and
can edit DNS records for. If the human wants Clerk to ask for the domain in the
terminal, they can add `--allow-domain-prompt`, but the safer agent path is to
store `clerk.productionDomain` first.

Only treat Clerk production auth as ready after live Clerk keys are stored in
the vault. A production instance existing by itself is not enough.

## Final Verification

Run:

```bash
npm run setup:bootstrap -- --profile <profile> --project <project> --check-access --verify
npm run setup:vault-metadata:verify
npm run setup:plugin:package -- --check
npm run vault:readiness -- --profile <profile> --project <project>
npm run setup:completion -- --profile <profile> --project <project>
npm run vault:verify -- --profile <profile> --project <project>
npm run analytics:convex:verify -- --profile <profile> --project <project>
npm run setup:plugin:verify
npm run setup:plugin-discovery:verify
npm run setup:fresh-clone:verify
npm run setup:release:verify -- --profile <profile> --project <project>
npm run secret:scan
npm run dashboard:test
npm run dashboard:build
npm run marketing:typecheck
npm run marketing:build
```

Only claim production readiness when the readiness report has no blocked items
and the app has been verified with real provider readbacks.

## Troubleshooting

If setup fails, read:

```text
docs/idkwidk/usertour-website-integration/PROVISIONING_TROUBLESHOOTING.md
```

Use the troubleshooting guide before inventing a workaround or retrying with
broader provider permissions.
