# User Signal Brief: Full Provisioning Automation

## Raw Request

The user wants the full plan for finishing credential-safe provider
provisioning, including the implementation plan, technical specification sheet,
and any durable documents needed so Codex can keep working autonomously until
the system is complete.

## User-Level Goal

Make the SaaS template easy and safe for the user or another person to clone,
connect organization-level provider access once, and have an agent set up a new
project from zero to one without leaking personal credentials.

## Proven Facts

- The repo has a local vault CLI in `scripts/template-vault.mjs`.
- Secrets are stored outside the repo in the OS keychain.
- Non-secret profile metadata is stored outside the repo in the local
  `idkwidk-template` config directory.
- Env generation has dry-run and overwrite protection.
- GitHub, Vercel, and Convex have guarded live setup paths with provider
  readback evidence.
- The template provisioner plugin is a wrapper around normal scripts, not a
  second provisioning engine.
- Fresh-clone verification proves env files, local provisioning state, and the
  original user's profile are not shipped with the repo.

## Hypotheses

- Every live provider adapter should require a prior dry-run and read-only check.
- Agents need machine-readable state and human-readable runbooks to avoid
  guessing or repeating dangerous steps.
- Clerk production remains the main blocker because it needs a real production
  domain, DNS access, and live production keys.

## Fears And Constraints

- Do not leak organization tokens.
- Do not put organization tokens in `.env.local`.
- Do not create provider resources accidentally.
- Do not claim live provider support before it is verified with real provider
  responses.
- Keep local/providerless template mode working.
- Make the setup easy for non-technical users.

## Engineering Prompt

Create a complete provisioning architecture and implementation plan for this
template. The plan must define provider boundaries, credential storage,
state/evidence tracking, live mutation gates, rollback behavior, verification
requirements, and an autonomous implementation sequence.
