# Pricing & Packaging — Plotline *(gold-standard example)*

*Sets the bar for `pmm-pricing-packaging` and `pmm-pricing-analysis`. A
recommendation = value metric + tiers + gating logic + migration risk, each
reasoned — not a number. Figures are illustrative.*

## Value metric: monthly tracked users (MTU), not seats

**Recommendation: price on MTU.** Reasoning:

- **Aligns price to value.** Plotline's value scales with how much product usage
  you're analyzing, which tracks MTU — not how many people log in.
- **Seats would fight the strategy.** Our core value (and our anti-shelfware
  story) depends on *the whole team* using it. Charging per seat taxes exactly the
  cross-team adoption we want; non-technical users would get cut to save money,
  killing the differentiator.
- **Predictable enough.** MTU is more stable/forecastable for the buyer than raw
  events (which spike unpredictably), so it beats event-based pricing on trust.
- **Rejected alternatives:** per-seat (penalizes adoption), per-event (volatile,
  scary bill), flat (leaves enterprise value uncaptured).

## Packaging — tiers gate on MTU + governance, never on seats

| Tier | Price (illustrative) | MTU | Gating logic |
| --- | --- | --- | --- |
| **Free** | $0 | 1 product, 10k MTU | Land non-technical users; prove time-to-answer. Unlimited seats — adoption is the goal. |
| **Team** | $X/mo | up to 100k MTU | Multiple products, shared metric catalog, saved dashboards. The PLG default. |
| **Business** | $$X/mo | up to 500k MTU | SSO, roles/permissions, data governance, audit. Gated on *security/governance*, not features people need to get value. |
| **Enterprise** | custom | 500k+ MTU | Volume MTU, SLA, onboarding, security review. |

**Gating principle:** never gate the thing that creates the value (asking
questions, inviting the team) — gate on *scale* (MTU) and *enterprise controls*
(SSO, governance). Seats are always unlimited; that's the strategy made visible.

## Expansion path

Free → Team when a second product or 10k MTU is hit (natural, usage-driven, not a
paywall on the core job). Team → Business on the first SSO/compliance ask. This
makes expansion a function of the customer's own growth, not artificial throttling.

## Migration risk (the part most pricing work skips)

- **Existing seat-based beta customers** will see winners and losers moving to
  MTU. *Mitigation:* model each account's old vs. new bill; grandfather or cap
  increases for 2 cycles; lead with "your whole team is now included."
- **MTU bill-shock on a usage spike.** *Mitigation:* soft limits + alerts before
  overage, monthly true-up not hard cutoff.
- **Free tier cannibalization.** *Mitigation:* 10k MTU is enough to prove value,
  not to run a real B2B product on — watch the free→Team conversion rate as the
  guardrail metric.

## What to measure after the change

Free→Team conversion, net revenue retention, % of accounts hitting the MTU
ceiling (is the metric calibrated?), and churn around the migration cohort. Hand
to `post-launch-learning-loop` to read these at 60–90 days.
