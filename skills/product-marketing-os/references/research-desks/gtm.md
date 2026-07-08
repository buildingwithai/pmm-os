# GTM & Launch Desk

**Lens:** go-to-market lead / launch strategist. The job: research what an **impeccable
launch and GTM motion** looks like for *this* product in *this* market — by studying how
comparable products actually launched, which tactics and channels worked, and what the
category's activation and pricing norms are — so the launch plan rests on evidence, not a
generic checklist.

**Inputs:** `{product}`, `{ICP/segment}`, `{market/category}`, `{competitors}`,
`{motion}` (PLG / sales-led / hybrid), `{launch window}`.

## Question set (the GTM strategist's brief)

1. **Comparable launches** — how did the closest products launch (Product Hunt, Show HN,
   waitlist, beta, design-partner), and how did each go?
2. **Channels that convert** — which launch channels drove signups/pipeline for this category?
3. **Motion** — is the category PLG, sales-led, or hybrid; what signals decide it here?
4. **Activation / aha** — what's the time-to-value moment comparable products optimize for?
5. **Sequencing & timing** — beta → GA cadence, launch-day playbook, seasonal timing?
6. **Pricing at launch** — free/trial/freemium norms; what competitors led with?
7. **What flopped** — failed or flat launches in the category and why (avoid the traps)?
8. **Field motion** — do these products win via events/community (hand to the Events Desk)?

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1 comparable launches | `reach.sh read` competitor launch posts, Product Hunt pages, "how we launched X" retros | topic `"{competitor} launch"` (how it landed) |
| 2 channels | read launch retrospectives + growth write-ups | topic `"how we got first 1000 users {category}"` |
| 3 motion | read PLG-vs-sales analyses for the category | topic `"{category} product-led vs sales"` |
| 4 activation | read onboarding/aha teardowns | topic `"{category} onboarding"` |
| 6 pricing-at-launch | fetch competitor launch pricing | topic `"{category} free vs paid"` |
| 7 flops | read post-mortems | topic `"{category} launch failed / flopped"` |

Run = **3–5 `last30days` topics + ~15–25 `agent-reach` reads**.

## Evidence target

`## GTM & launch motion` in `.agents/research/evidence.md`: comparable-launch teardowns,
channel ROI signals, motion read, activation norms, pricing-at-launch, traps — each sourced.

## Artifacts (the skill's real templates, hydrated)

1. **Launch-motion brief** — recommended motion + sequencing + launch-day plan, from
   [`../../assets/go-to-market-plan-template.md`](../../assets/go-to-market-plan-template.md)
   + [`library/product-launch/references/core/01-launch-tier-framework.md`](../library/product-launch/references/core/01-launch-tier-framework.md).
2. **Launch-tactics map** — a ranked table of tactics/channels (fit × evidence of ROI ×
   effort) with the comparable launch that proves each. Renders as a `v-gtm` view; exports `launch-tactics.csv`.
3. **Comparable-launch teardowns** — 2–3 short "how {competitor} launched + what worked".

Methodology: [`library/product-launch/references/core/03-gtm-strategy.md`](../library/product-launch/references/core/03-gtm-strategy.md)
+ `05-multi-channel-tactics.md`, `08-iteration-retrospective.md`.

## Flow

`{product}+{competitors}+{motion}` → this question set → engine fan-out → `## GTM & launch
motion` evidence → launch-motion brief + tactics map → feeds `pmm-go-to-market`,
`pmm-launch-brief`, `pmm-campaign-brief`, the Events + Channels desks.
