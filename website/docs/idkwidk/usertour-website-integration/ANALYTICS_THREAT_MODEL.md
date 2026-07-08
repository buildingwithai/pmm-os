# Analytics Threat Model

## Assets

- Visitor/session analytics events.
- Replay snapshots.
- Convex deployment URL and local deployment state.
- Dashboard analytics pages.

## Trust Boundaries

- Browser clients are untrusted.
- Dashboard and marketing API routes are trusted server boundaries.
- Convex is the persistence boundary.
- `.env.local` remains ignored and must not be committed.

## Main Risks

- Sensitive user input accidentally captured in replay.
- Anonymous clients sending oversized or abusive analytics payloads.
- One customer viewing another customer's analytics in a future multi-tenant setup.
- Convex being unavailable while the UI claims live analytics are working.

## Current Mitigations

- Inputs store length only, not values.
- Replay payload event count and byte size are capped.
- Event strings are truncated before storage.
- Convex mode now returns `503` on write failure instead of pretending success.
- Live local writes were verified before claiming the feature works.

## Required Before Production

- Add rate limiting.
- Add site/project authorization.
- Add replay enable/disable controls.
- Add retention cleanup.
- Add consent copy for public visitors if replay is enabled.
