# Analytics Runbook

## Local Live Analytics

1. Start Convex from the dashboard app:

```bash
cd apps/dashboard
npm run convex:dev
```

2. Start the app surfaces from the repo root:

```bash
npm run dev
```

3. Open:

- Dashboard: `http://localhost:3015`
- Marketing: `http://localhost:3020`

## Required Local Env

`apps/dashboard/.env.local` must include:

```text
NEXT_PUBLIC_ANALYTICS_PROVIDER=convex
NEXT_PUBLIC_CONVEX_URL=<local or cloud Convex URL>
CONVEX_DEPLOYMENT=<local or cloud deployment>
```

`apps/marketing/.env.local` must include:

```text
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3015
```

## Verification Commands

Post a real pageview:

```bash
curl -X POST http://localhost:3015/api/analytics/events \
  -H 'Content-Type: application/json' \
  -d '{"type":"pageview","siteId":"default","path":"/live-verification","title":"Live Verification","sessionId":"manual-session"}'
```

Post a real replay snapshot:

```bash
curl -X POST http://localhost:3015/api/analytics/replay \
  -H 'Content-Type: application/json' \
  -d '{"siteId":"default","sessionId":"manual-session","pageUrl":"/live-verification","screenWidth":1440,"screenHeight":900,"duration":1200,"events":[{"type":"pageview","timestamp":0,"data":{"path":"/live-verification"}}]}'
```

Then check:

- `http://localhost:3015/dashboard/analytics/pages`
- `http://localhost:3015/dashboard/analytics/events`
- `http://localhost:3015/dashboard/analytics/performance`
- `http://localhost:3015/dashboard/analytics/replay/manual-session`

## Rollback / Kill Switch

Set:

```text
NEXT_PUBLIC_ANALYTICS_PROVIDER=local-template
```

Then restart the dashboard and marketing dev servers.
