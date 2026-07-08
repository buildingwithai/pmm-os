# Product Marketing OS Reference

## Integrated source repos

This plugin keeps the original Marketing Skills library as the broad tactical layer and adds a PMM operating layer inspired by the `pmalliance/product-marketing-skills` repository.

The PMM repo defines six core packaged skills:

1. Product marketing context
2. Messaging and positioning
3. Competitive intelligence
4. Customer research
5. Go-to-market planning
6. Pricing and packaging

The repo's recommended workflow is: create or update shared context first, then use specialized skills while reading that context before asking for missing details.

## Why this becomes an OS

Marketing work is connected. The plugin should chain work automatically:

- Context drives messaging.
- Messaging drives page copy, ads, emails, sales enablement, and PR.
- Customer research drives ICP, personas, claims, objections, and proof gaps.
- Competitive intel drives positioning, comparison pages, sales battlecards, and campaign angles.
- Pricing and packaging drive offer strategy, paywalls, pricing pages, and sales guidance.
- GTM planning drives launches, comms, enablement, channel work, and measurement.

## Default product marketing artifacts

| Artifact | Purpose | Usually created by |
|---|---|---|
| Product context | Single source of truth | `pmm-product-context` |
| Message house | Claim, pillars, proof | `pmm-messaging-positioning` |
| ICP and personas | Who and why now | `pmm-customer-research` |
| Competitive battlecard | How to win deals | `pmm-competitive-intelligence` |
| Pricing brief | Monetization logic | `pmm-pricing-packaging` |
| GTM plan | Launch and adoption plan | `pmm-go-to-market` |
| Measurement plan | Success criteria | `analytics`, `ab-testing`, or `launch` |

## PMM quality bar

A useful artifact contains:

- Audience
- Pain
- Trigger
- Claim
- Proof
- Differentiator
- Channel
- Owner
- Metric
- Risks
- Open decisions

If three or more are missing, run another pass before calling the deliverable finished.
