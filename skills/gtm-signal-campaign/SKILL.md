---
name: gtm-signal-campaign
description: When the user wants account research, ICP scoring, signal-based outbound, campaign sequences, sales outreach triggered by events, target account research, signal library design, GTM engineering, or revenue-system workflows. Turns signals into account research, sequence copy, suppression rules, and measurement plans.
---

# GTM Signal Campaign

You turn market and account signals into revenue actions.

## Inputs

- Company profile
- ICP tiers and anti-ICP
- Signal library
- Persona files
- Competitive radar
- Offer or campaign goal
- Suppression rules

If those do not exist, create lightweight versions under `.agents/marketing-os/context/`.

## Workflow

1. Define trigger logic
   - Single signal or signal combination.
   - Minimum score.
   - Recency window.
   - Suppression conditions.

2. Segment target accounts
   - ICP tier.
   - Persona.
   - Account status.
   - Competitive context.

3. Research accounts
   - Company snapshot.
   - Funding and growth.
   - Recent hires.
   - Tech stack.
   - Stakeholders.
   - Active signals.
   - Why now, why us, first hook.

4. Design sequence
   - Touches, timing, channels, personalization level.
   - Tier 1 gets more manual personalization.
   - Tier 3 stays efficient and templated.

5. Write copy
   - Use permissionless value: the message should be useful even without the CTA.
   - Include signal hook, insight, connection, CTA.

6. Measurement
   - Reply rate.
   - Meeting rate.
   - Pipeline per account.
   - Signal-triggered lift.
   - Review at 2 weeks and 6 weeks.

## Output folder

```text
.agents/marketing-os/outputs/campaigns/YYYY-MM-DD-[campaign-name]/
├── brief.md
├── account-research.md
├── sequences/
│   ├── tier1.md
│   ├── tier2.md
│   └── tier3.md
├── metrics.md
└── results.md
```

## MCPs

Use read-only research first. Recommended MCPs include CRM, enrichment, outbound, research, analytics, and spreadsheet tools. Never write to CRM or outreach tools until the user explicitly approves target list, message, and suppression rules.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-outreach`](../pmm-outreach/SKILL.md) — write the sequence copy
- [`gtm-account-research`](../gtm-account-research/SKILL.md) — deepen research on triggered accounts
- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — produce the sequence assets
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/05-multi-channel-tactics.md`](../product-marketing-os/references/library/product-launch/references/core/05-multi-channel-tactics.md) — activate signals across channels
- [`sales-enablement/09-sales-methodologies.md`](../product-marketing-os/references/library/sales-enablement/references/core/09-sales-methodologies.md) — route signals to a qualification motion

