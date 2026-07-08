# Kiranism Dashboard Cleanup Review

Date: 2026-05-20

## Scope

This review checks the current template state after moving feature flags into
`apps/dashboard` and parking the older `apps/website` feature-flag surface.

## Findings

| Check | Result | Evidence |
| --- | --- | --- |
| Dashboard local env is ignored | Pass | `git check-ignore -v apps/dashboard/.env.local` points to `apps/dashboard/.gitignore` |
| External reference repos are ignored | Pass | `.external-repos/` and `.um/` are ignored by root `.gitignore` |
| Dashboard build output is ignored | Pass | `apps/dashboard/.next` is ignored by `apps/dashboard/.gitignore` |
| Dashboard dependencies are ignored | Pass | `apps/dashboard/node_modules` is ignored by `apps/dashboard/.gitignore` |
| Obvious real secret scan | Pass | Only placeholders, blank env values, and test strings were found |
| Dashboard feature flag route | Pass | `http://localhost:3015/dashboard/feature-flags` returns `200 text/html` |
| Website feature flag route | Pass | `/app/feature-flags` is a handoff, not a duplicate admin UI |
| Website feature flag write API | Pass | `POST /api/feature-flags/toggle` returns `410 Gone` |
| Website links | Pass | Internal website links now use the dashboard app URL helper |
| Final build pass | Pass | `npm run dashboard:build` and `npm --prefix apps/website run build` passed on 2026-05-20 |

## Large Local Folders

These folders make the working copy look large but should not be committed:

| Folder | Reason |
| --- | --- |
| `apps/dashboard/node_modules` | Installed dependencies |
| `apps/dashboard/.next` | Local Next.js build output |

The cloned dashboard also includes `.agents` and `.claude` skill folders from
the starter. They are small compared with build output. Because the user asked
for the starter to be literally cloned before adapting, they were not deleted in
this pass.

## Dry-Run Staging Scope

Command:

```bash
git add -n apps/dashboard package.json docs README.md .gitignore apps/website
```

Result:

| Area | Files Git would stage | Notes |
| --- | ---: | --- |
| `apps/dashboard` | 610 | The cloned Kiranism dashboard app plus local template-mode edits |
| `apps/website` | 102 | Earlier website/template plumbing, docs routes, provider routes, Convex boundary, and feature-flag handoff |
| `docs` | 18 | Mission Control, verification, vendor provenance, and setup docs |
| Root files | 3 | `.gitignore`, `README.md`, and root `package.json` |
| Total | 733 | Dry-run only; no files were staged |

Important dashboard subfolders in the dry-run:

| Folder | Files | Decision |
| --- | ---: | --- |
| `apps/dashboard/src` | 280 | Keep; this is the actual dashboard app |
| `apps/dashboard/.agents` | 149 | Keep for now because it came with the literal starter clone |
| `apps/dashboard/.claude` | 141 | Keep for now because it came with the literal starter clone |

Ignored files that would not stage:

- `apps/dashboard/.env.local`
- `apps/dashboard/.DS_Store`
- `apps/dashboard/.next`
- `apps/dashboard/node_modules`
- `apps/dashboard/yarn.lock`
- `apps/dashboard/pnpm-lock.yaml`

## Still Left

- Real Convex persistence for feature flag overrides.
- Real Clerk permission checks around the feature flag admin route.
- A product decision on whether to keep or delete the legacy website handoff
  route after old external links no longer matter.
- The starter `.agents` and `.claude` folders are kept for now because this
  phase preserves the literal clone before deeper adaptation.
- A commit/staging pass after the user approves the current file scope.
