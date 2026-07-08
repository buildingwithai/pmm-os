# GitHub Provider Adapter

## Current Status

The GitHub adapter is dry-run only. By default, it does not call the GitHub API
and does not create repositories.

When `--check-existing` is passed, it performs a read-only repository existence
check through the GitHub CLI using the token stored in the OS keychain. It still
does not create repositories, push code, write secrets, or mutate GitHub state.

## Command

```bash
npm run vault:github -- --profile personal --project my-saas --dry-run
```

Read-only repository existence check:

```bash
npm run vault:github -- --profile personal --project my-saas --dry-run --check-existing
```

Live repository creation after a successful `not-found` read check:

```bash
npm run vault:github -- --profile personal --project my-saas --create --confirm-create --visibility private
```

Connect a verified existing repository as `origin`:

```bash
npm run vault:github -- --profile personal --project my-saas --connect-existing --confirm-connect --remote template
```

Push the current clean branch after the repository is connected:

```bash
npm run vault:github -- --profile personal --project my-saas --push-initial --confirm-push
```

## Required Local State

The profile must exist:

```bash
npm run vault:init -- --profile personal
```

The profile must include non-secret GitHub owner metadata:

```bash
npm run vault:metadata -- --profile personal --provider github --key owner --value your-org
```

For future live setup, the profile should also have a GitHub organization token
stored in the OS keychain:

```bash
npm run vault:set -- --profile personal --provider github --key organizationToken
```

## What The Dry Run Checks

- The profile exists.
- `github.owner` metadata exists.
- The project slug contains only safe repository-name characters.
- A GitHub organization token is or is not stored.
- The GitHub CLI is or is not available.
- If `--check-existing` is passed, whether `owner/project` already exists.

## What It Prints

- Target owner.
- Target repository.
- Planned repository URL.
- The exact safe order of future GitHub actions.
- Read-only existence result when requested.

## What It Does Not Do

- By default, it does not call GitHub.
- It does not create a repository.
- It does not push code.
- It does not write secrets.
- It does not print token values.
- Live creation, connect, and push all require separate confirmation flags.
- Connect defaults to a `template` remote so it does not overwrite an existing
  `origin`.

## Next Adapter Step

Live GitHub creation/connect/push boundaries are implemented but not
live-verified with real credentials. Next step is real-token verification using
a disposable repository name.
