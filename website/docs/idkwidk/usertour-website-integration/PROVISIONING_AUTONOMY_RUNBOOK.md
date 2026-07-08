# Provisioning Autonomy Runbook

## Purpose

This is the continuation guide for agents working on provisioning automation.
Use it when the user says "continue" or asks to keep going until the template
can set itself up safely.

## Operating Rules

- Keep provider mutation behind explicit confirmation.
- Complete one provider boundary at a time.
- Preserve local/providerless template mode.
- Never print or write organization token values.
- Use fake tokens for safety tests.
- Use real provider tokens only when the user intentionally configures them in
  the local vault.
- Update Mission Control after each slice.
- Update the verification matrix after each slice.

## Next Safe Task Queue

1. Keep `setup:bootstrap`, `setup:next`, and `setup:status --json` accurate as
   provider state changes.
2. Resolve Clerk production through `npm run setup:production`, which stores
   `clerk.productionDomain`, runs Clerk's official production deploy, pulls
   live keys, and re-syncs Vercel env behind explicit confirmation flags.
3. Add verified Clerk application creation/configuration only if the official
   CLI/API can do it without unsafe hidden prompts.
4. Revisit Codex setup only after official support is confirmed.
5. Add destructive cleanup commands only with provider-specific confirmation,
   readback, and backup/export warnings.
6. Publish a distributable plugin only after local package, discovery,
   fresh-clone, and release verification continue to pass.

## Stop Conditions

Stop and ask the user before continuing when:

- The provider owner/team/org is ambiguous.
- A repository/project/app already exists and could be reused or overwritten.
- A command would create, delete, or mutate provider resources.
- Required provider scopes are unclear.
- A real token is needed and the user has not stored it in the vault.

## Completion Definition

The provisioning system is complete when:

- A fresh clone can run a setup doctor.
- A fresh clone can start with `npm run setup:bootstrap -- --project <slug>`.
- A user can configure provider profile metadata once.
- Organization tokens remain outside the repo.
- GitHub, Vercel, Convex, and Clerk can be planned, created or connected,
  verified, and rolled back.
- The generated project env files contain only project-specific values.
- Dashboard and marketing build and run after setup.
- Docs explain both human and agent flows.

## Resume Prompt

Continue provisioning automation from
`docs/idkwidk/usertour-website-integration/PROVISIONING_IMPLEMENTATION_PLAN.md`.
Start with the current `setup:status`, `setup:plan --dry-run --json`, and
`setup:next` output instead of stale phase names. Keep organization tokens
outside the repo, run dry-run before mutation, update the verification matrix,
and do not claim a provider is complete until readback verification passes.
