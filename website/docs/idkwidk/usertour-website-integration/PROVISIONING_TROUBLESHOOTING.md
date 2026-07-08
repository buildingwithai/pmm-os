# Provisioning Troubleshooting

Use this when `setup:start`, provider checks, or final verification does not
look right. The goal is to understand the failing boundary without leaking
tokens or making hidden provider changes.

## First Rule

Do not paste real tokens into chat. Do not add organization tokens to
`.env.local`. Secrets belong in the OS keychain through `npm run vault:set`.

## Start Command Says The Profile Is Missing

What it means:

- This computer has not been prepared for this template yet.
- That is normal on a fresh clone or a new machine.

Safe fix:

```bash
npm run setup:credentials -- --profile personal --project <project-slug>
```

Then run:

```bash
npm run setup:bootstrap -- --profile personal --project <project-slug> --check-access
```

## GitHub Says The Repository Already Exists

What it means:

- The project slug is already used under the selected GitHub owner.
- This can be okay if you are connecting an existing repo.

Safe next step:

```bash
npm run vault:github -- --profile personal --project <project-slug> --dry-run --check-existing
```

Then choose one path:

- Use a different project slug.
- Connect the existing repo with the guarded connect command printed by the
  guide.

Do not force-push over an existing repo unless the user explicitly asks for
that and the branch state has been checked.

## Vercel Token Works But Project Env Looks Wrong

What it means:

- The Vercel project may exist, but its env keys may not match the current
  template state.
- Env key names can be verified without printing secret values.

Safe checks:

```bash
npm run vault:verify -- --profile personal --project <project-slug>
npm run vault:vercel -- --profile personal --project <project-slug> --plan-env
npm run vault:vercel-dashboard -- --profile personal --project <project-slug> --plan-env
```

Only write env values after the user approves:

```bash
npm run vault:vercel -- --profile personal --project <project-slug> --set-env --confirm-env
npm run vault:vercel-dashboard -- --profile personal --project <project-slug> --set-env --confirm-env
```

## Convex Team ID Or Token Fails

What it means:

- The Convex team access token may be missing, expired, scoped to another team,
  or paired with the wrong team ID.

Safe check:

```bash
npm run vault:convex -- --profile personal --project <project-slug> --dry-run --check-access
```

Expected healthy result:

- Team access token is stored.
- Management API check passes.
- The target project is found or safely reported as missing.

If the team ID looks wrong, store the plain numeric team ID again:

```bash
npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>
```

Use the real number only, for example `--value 391508`. The vault command will
normalize pasted labels like `Team ID: 391508`, accidental trailing brackets
like `Team ID: 391508>`, and bracketed real values like `<391508>`, but it
refuses placeholders like `<team-id>`.

To verify that metadata normalization is working without touching any provider:

```bash
npm run setup:vault-metadata:verify
```

## Clerk Production Is Blocked

What it means:

- Local/development Clerk can work while production Clerk is still not ready.
- Production needs a real domain, DNS access, and sometimes production OAuth
  provider settings.
- The setup agent should not guess this domain. It must be a domain the user
  owns and can edit DNS records for.

Safe checks:

```bash
npm run setup:production -- --profile personal --project <project-slug>
npm run vault:readiness -- --profile personal --project <project-slug>
```

Store `clerk.productionDomain` before starting Clerk production deploy:

```bash
npm run setup:production -- --profile personal --project <project-slug> --domain <your-production-domain>
```

Only start the production flow when the domain is known:

```bash
npm run setup:production -- --profile personal --project <project-slug> --deploy-prod --confirm-prod-deploy
```

If you intentionally want Clerk to ask for the domain live, add
`--allow-domain-prompt`. This is useful for a human at a terminal, but weaker
for an autonomous agent because the agent cannot know which DNS records you can
control.

Production is not ready until live `pk_live` and `sk_live` keys are pulled into
the vault and Vercel env is re-synced.

## Dashboard Auth Bypass Is Still On

What it means:

- The template is still in local/dev setup mode.
- This is okay for local testing.
- It is not okay to treat the dashboard as a production admin surface.

Safe next step:

```bash
npm run vault:readiness -- --profile personal --project <project-slug>
```

If readiness says Clerk production auth is blocked, resolve Clerk production
before disabling bypass for production.

## Preview Ports Are Busy

What it means:

- Another dashboard or marketing server is already listening on `3015` or
  `3020`.

Safe checks:

```bash
lsof -iTCP:3015 -sTCP:LISTEN -n -P
lsof -iTCP:3020 -sTCP:LISTEN -n -P
```

Stop only the process you started for this template. Do not kill unrelated
processes just because they use Node.

## Verification Fails After A Partial Provider Setup

What it means:

- Some provider resource may have been created, but a later step failed.
- The local state file can show non-secret evidence of what happened.

Safe checks:

```bash
npm run vault:state -- --project <project-slug>
npm run vault:rollback -- --profile personal --project <project-slug> --dry-run
```

The rollback command is intentionally non-destructive. It prints cleanup
guidance without deleting repositories, Vercel projects, Convex deployments,
Clerk apps, env vars, or keychain entries.

## Final Proof Commands

Use these before claiming the template is ready for another user:

```bash
npm run setup:release:verify -- --profile personal --project <project-slug>
npm run setup:release:verify -- --profile personal --project <project-slug> --fresh-clone
```

Use these when you also need build and route proof:

```bash
npm run setup:release:verify -- --profile personal --project <project-slug> --build
npm run preview
npm run setup:release:verify -- --profile personal --project <project-slug> --preview
```

Stop preview servers after route verification so they do not keep using memory.
