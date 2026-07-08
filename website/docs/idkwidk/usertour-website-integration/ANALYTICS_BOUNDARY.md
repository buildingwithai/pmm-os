# Analytics Boundary

## Goal

The template needs a place where the owner can see website visitors without
requiring provider credentials during local setup.

## Current Mode

- Marketing app sends page-view events to `/api/analytics/events`.
- The endpoint accepts events and returns success in local-template mode.
- Dashboard app shows `/dashboard/analytics` with realistic mock traffic data.
- No real visitor identity, cookies, provider keys, or external analytics
  database is required.

## Provider Shape

The dashboard reads through `apps/dashboard/src/lib/analytics/provider.ts`.
That file is the boundary. Later, the template owner can set:

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=umami
```

Supported placeholder values:

- `local-template`
- `umami`
- `rybbit`
- `openpanel`
- `plausible`

## Why Not Vendor The Full Analytics Product Yet

Plausible, Rybbit, OpenPanel, and Matomo are full applications. Some are also
copyleft licensed. The safer template move is to own the app-facing analytics
contract first, then connect or self-host one provider as a separate service.

## Next Production Step

Pick one provider for the first real adapter. Umami is the lowest-friction
candidate to inspect next because it is lighter than a full product analytics
suite and fits the website-visitor use case.
