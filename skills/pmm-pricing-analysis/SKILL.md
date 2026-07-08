---
name: pmm-pricing-analysis
description: ANALYZE and benchmark pricing: competitive pricing analysis, value-metric analysis, feature-gating matrices, packaging review, tier-strategy recommendations, and pricing-page guidance. Use this to diagnose or benchmark current and competitor pricing — to DESIGN a new pricing model, tiers, and rollout use pmm-pricing-packaging.
---

# PMM Pricing Analysis

You produce competitive pricing analysis, packaging reviews, value-metric analysis, and tier recommendations grounded in willingness to pay.

## Workflow

1. Identify the market, product, segment, and competitors.
2. Gather public pricing data, or mark missing data as `Needs research`.
3. Analyze pricing models, value metrics, tier structures, packaging strategies, free or trial motion, enterprise gates, and add-ons.
4. Recommend a pricing and packaging approach grounded in segment value and competitive expectations.
5. Route to `plg-gtm-strategy` if trial, free tier, usage limit, PQL, PQA, or activation model is central.

## Output

Create `pricing-analysis-[market].md` with:

- Pricing landscape table
- Value metric distribution
- Packaging strategy breakdown
- Feature gating matrix
- Competitor deep dives
- Price positioning map
- Recommendations by model, tier, gate, and page messaging
- Data confidence and last verified dates

## Quality bar

Do not invent prices. If pricing is not public, say so. Recommendations should name the segment, value metric, package boundary, risk, and validation experiment.

## Worked example

Match this bar. See the gold-standard worked example [`examples/05-pricing-packaging.md`](../product-marketing-os/references/examples/05-pricing-packaging.md) — pricing reasoning that names rejected alternatives and migration risk. Hit that level of specificity, reasoning, and proof; don't copy its content.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-pricing-packaging`](../pmm-pricing-packaging/SKILL.md) — turn analysis into packaging and tiers
- [`pmm-go-to-market`](../pmm-go-to-market/SKILL.md) — plan the pricing rollout
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`pricing-packaging/02-willingness-to-pay-research.md`](../product-marketing-os/references/library/pricing-packaging/references/core/02-willingness-to-pay-research.md) — WTP research methods (VanWestendorp etc.)
- [`pricing-packaging/03-competitive-market-analysis.md`](../product-marketing-os/references/library/pricing-packaging/references/core/03-competitive-market-analysis.md) — competitive pricing analysis
- [`pricing-packaging/09-pricing-experimentation-testing.md`](../product-marketing-os/references/library/pricing-packaging/references/core/09-pricing-experimentation-testing.md) — test pricing changes safely
- [`pricing-packaging/12-monitoring-optimization-metrics.md`](../product-marketing-os/references/library/pricing-packaging/references/core/12-monitoring-optimization-metrics.md) — the metrics to watch
- [`pricing-packaging/competitive-pricing-audit-template.md`](../product-marketing-os/references/library/pricing-packaging/templates/competitive-pricing-audit-template.md) — competitive audit template

