# Billing Contract

Date: 2026-05-20

## Goal
Keep Stripe, Clerk, and Convex responsibilities separate.

Stripe owns payment facts. Clerk owns who can access a workspace. Convex owns the app's local entitlement record.

## Data Shape

```ts
type BillingEntitlement = {
  organizationId: string;
  planId: "starter" | "pro" | "scale";
  source: "fallback" | "convex";
  status: "trialing" | "active" | "past_due" | "canceled";
};
```

## Route Boundaries

| Route | Purpose | Current state |
| --- | --- | --- |
| `GET /api/billing/checkout?plan=pro` | Start Stripe subscription checkout. | Setup/stub boundary. |
| `GET /api/billing/portal?organizationId=org_...` | Open Stripe customer portal. | Setup/stub boundary. |
| `POST /api/billing/webhook` | Verify Stripe event signatures. | Setup/stub boundary. |
| `GET /api/billing/entitlement?organizationId=org_...` | Read local plan access. | Setup/stub boundary. |

## Webhook Mapping Rule

Only verified Stripe events may create entitlement writes.

The mapper in `apps/website/app/lib/billing-events.ts` expects already-verified data and returns the Convex write shape. It does not verify signatures and does not write to the database.

`apps/website/app/lib/billing-webhook.ts` can extract a small entitlement event preview from a Stripe-shaped payload. That preview is not trusted until Stripe signature verification is implemented.

## Repository Boundary

`apps/website/app/lib/billing-entitlement-repository.ts` is the storage boundary.

It currently has two stubbed calls:

- `readBillingEntitlement(organizationId)`
- `writeBillingEntitlement(write)`

Those calls return setup errors or not-implemented errors today. Later, they should become the only place that imports Convex billing queries and mutations.

## Convex Record Target

The future Convex table should store one current entitlement per organization:

```ts
{
  organizationId: v.string(),
  planId: v.union(v.literal("starter"), v.literal("pro"), v.literal("scale")),
  status: v.union(v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled")),
  stripeCustomerId: v.optional(v.string()),
  stripeSubscriptionId: v.optional(v.string()),
  updatedAt: v.number(),
}
```

## Safety Rules

- Browser state never unlocks paid access by itself.
- Checkout success pages are not proof of entitlement.
- Webhooks must verify Stripe signatures before mapping events.
- Convex should store the app-owned entitlement after verification.
- Missing setup falls back to `starter` and `trialing`; it never claims paid access.
