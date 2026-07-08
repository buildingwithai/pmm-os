# Organization Provisioning Threat Model

## Assets

- Organization-level tokens for GitHub, Vercel, Convex, Clerk, and Codex.
- Provider project keys generated from organization tokens.
- Local `.env.local` files.
- The user's provider organizations and workspaces.

## Trust Boundaries

- The cloned template repo is not trusted to hold organization secrets.
- The OS keychain is trusted for local secret storage.
- Provider APIs are trusted only over official HTTPS APIs and CLIs.
- Generated `.env.local` files are local-only and gitignored.

## Main Risks

- Organization tokens accidentally committed to Git.
- A cloned template carrying the original user's keys.
- A script printing tokens to terminal logs.
- A user passing tokens as command-line arguments and saving them in shell history.
- A provisioning script creating resources in the wrong organization.
- A future adapter giving overly broad access to Codex or another agent.

## Current Mitigations

- Secrets are stored outside the repo.
- On macOS, secrets are stored in Keychain through `security add-generic-password`.
- The vault CLI refuses plaintext secret storage by default.
- The profile file stores metadata only and is created with `0600` permissions.
- Generated `.env.local` files are gitignored.
- The generated env file contains comments that tokens are stored in the keychain,
  not token values.
- Env generation supports `--dry-run` so users can inspect changes first.
- Env generation refuses to replace existing `.env.local` files unless `--force`
  is passed.
- Existing env files are backed up before replacement.
- `vault:doctor` checks Keychain availability, Git env ignore behavior, Node
  version, profile existence, and token presence.
- `vault:rotate` supports replacing a stored token without changing repo files.
- `vault:delete` supports removing one stored secret or the whole local profile.
- `npm run setup -- --dry-run` runs a non-mutating setup pass for agents and
  humans.

## Required Before Full Automation

- Add provider-specific scopes documentation.
- Add dry-run output for every provider action.
- Add explicit organization/project confirmation before mutating provider state.
- Add least-privilege token guidance.
- Add audit logging that records resource names, not token values.
- Add cleanup commands for failed provisioning attempts.
