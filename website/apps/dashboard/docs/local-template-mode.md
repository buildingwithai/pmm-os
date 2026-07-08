# Local Template Mode

This fork can run the dashboard before Clerk or backend storage is configured.

## Start Without Clerk

1. Copy the example environment file:

```bash
cp env.example.txt .env.local
```

2. Keep local template mode enabled:

```bash
NEXT_PUBLIC_AUTH_BYPASS=true
```

3. Install dependencies and run the app:

```bash
npm install
npm run dev -- --port 3015
```

4. Open:

```text
http://localhost:3015/dashboard/overview
```

In this mode:

- `/auth/sign-in` redirects to `/dashboard/overview`.
- `/auth/sign-up` redirects to `/dashboard/overview`.
- Dashboard routes are not protected by Clerk middleware.
- Workspace, billing, team, profile and plan-gated pages use local template placeholders.
- Convex is not required because this clone does not use Convex yet.

## Turn Real Clerk Back On

When you are ready to use real authentication:

```bash
NEXT_PUBLIC_AUTH_BYPASS=false
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>
CLERK_SECRET_KEY=<clerk_secret_key>
```

Then configure Clerk Organizations and Billing if you want the original workspace,
team, pricing and plan-gated pages to use Clerk.
