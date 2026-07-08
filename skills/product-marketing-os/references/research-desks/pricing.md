# Pricing Desk

**Lens:** pricing strategist. The job: find the value metric, benchmark the market, and
recommend packaging that captures value without taxing adoption — grounded in real
comparables and willingness-to-pay signals, not a number pulled from the air. Hard-gate
dependency for any pricing/packaging deliverable.

**Inputs:** `{product}`, `{ICP/segment}`, `{market}`, `{competitors}`, `{current pricing}` (if any).

## Question set (the pricing strategist's brief)

1. What's the right **value metric** — what scales with the value the customer gets?
2. How do **comparable products price** (model, tiers, value metric, what's gated)?
3. What's the **willingness-to-pay** signal (what do buyers say is too cheap / too expensive)?
4. **Packaging** — how are tiers/features split; what gates upgrades?
5. **Discounting & contracts** — annual vs monthly, enterprise norms in this market?
6. **Price perception** — where do buyers feel ripped off or under-charged (sentiment)?
7. **Monetization friction** — where does pricing block adoption (per-seat taxing collaboration, etc.)?

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 2 — comparables | fetch each competitor's pricing page; search `"{competitor} pricing tiers"` | topic `"{category} pricing"` (what people pay / gripes) |
| 3 — WTP | read pricing-discussion threads | topic `"{competitor} too expensive"`, `"is {category} worth it"` |
| 4 — packaging | read competitor tier pages + sales prospectuses | — |
| 5 — discounting | search `"{competitor} annual discount / enterprise pricing"` | — |
| 6 — perception | — | topic `"{competitor} pricing"` (sentiment) |

Run = **2–3 `last30days` topics + ~10–15 `agent-reach` fetches**. Pricing is often gated —
mark `unknown (gated)`, never invent a tier price.

## Evidence target

`## Proof points` (pricing comparables, WTP signals) + competitor pricing notes under
`## Competitive`, sourced.

## Artifacts (the skill's real templates, hydrated)

1. **Competitive pricing matrix** — [`library/pricing-packaging/templates/competitive-pricing-audit-template.md`](../library/pricing-packaging/templates/competitive-pricing-audit-template.md)
   (competitor × model × tiers × value metric × what's gated). Renders as a `v-pricing` comparison table; exports `pricing-comparables.csv`.
2. **Value-metric recommendation** — [`library/pricing-packaging/templates/value-metric-selection-worksheet.md`](../library/pricing-packaging/templates/value-metric-selection-worksheet.md)
   (options scored against the 4 criteria → the pick + why).
3. **Tier / packaging design** — [`library/pricing-packaging/templates/pricing-tier-comparison-matrix.md`](../library/pricing-packaging/templates/pricing-tier-comparison-matrix.md)
   + [`packaging-decision-framework.md`](../library/pricing-packaging/templates/packaging-decision-framework.md). Renders as the pricing tier matrix.

Methodology: [`library/pricing-packaging/references/core/05-selecting-value-metrics.md`](../library/pricing-packaging/references/core/05-selecting-value-metrics.md)
+ `02-willingness-to-pay-research.md`, `06-packaging-tier-design.md`.

## Flow

`{product}+{competitors}+{segment}` → this question set → engine fan-out → pricing
evidence (sourced) → comparables matrix + value-metric pick + tier design → feeds
`pmm-pricing-analysis`, `pmm-pricing-packaging`, the pricing view in the launch kit.
