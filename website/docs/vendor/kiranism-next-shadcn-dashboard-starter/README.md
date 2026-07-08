# Kiranism Dashboard Starter Vendored Source

Source: https://github.com/Kiranism/next-shadcn-dashboard-starter

License: MIT

Local fork source used for this slice:

- `.external-repos/next-shadcn-dashboard-starter`

Vendored/adapted files in this template:

- `apps/website/app/lib/vendor/kiranism/dashboard-foundation.ts`
- `apps/website/app/app/dashboard/page.tsx`

What changed:

- The starter was cloned locally instead of only referenced in planning notes.
- Its dashboard navigation model was adapted into this template's `/app/dashboard` foundation.
- Its Clerk/dashboard/product/admin concepts were mapped onto this template's Clerk, Convex, Stripe, provider, and feature-flag boundaries.
- The visual direction was tightened into a SaaS command-center layout with sidebar, top toolbar, table/list workspace, and right inspector.

What was not copied:

- Full shadcn component library, mock product APIs, chart routes, KBar implementation, Sentry setup, and route tree.

Why:

- The full starter uses its own dependency and route assumptions. This template already has Clerk, Convex, Stripe, SEO, provider adapters, and plugin docs.
- The foundation we need is the dashboard shell and navigation/product structure, not a second app pasted beside the current app.
