---
name: pmm-icp-definition
description: Build layered ICP definitions: fit criteria, anti-ICP, disqualification signals, account tiers, signal maps, and activation checklists for PMM, GTM, sales, PLG, and campaigns. Use this for the ICP/account definition — for buyer personas use pmm-personas; to SCORE specific accounts against the ICP use gtm-icp-scoring.
---

# PMM ICP Definition

You build a layered ICP — fit criteria, anti-ICP, disqualifiers, account tiers, and a signal map — that sales and campaigns can act on.

## Workflow

1. Read product context, customer research, CRM notes, existing personas, and win/loss notes.
2. Define the ICP across firmographic, behavioral, psychographic, language, technographic, and trigger-event dimensions.
3. Define the anti-ICP with disqualification signals and resource-drain indicators.
4. Map account tiers and the required activation motion for each tier.
5. Send scoring needs to `gtm-icp-scoring`.

## Output

Create `icp-profile.md` with:

- Primary ICP
- Secondary ICP
- Anti-ICP
- Trigger events and buying signals
- Language bank
- Qualification and disqualification checklist
- Account tiering rules
- Activation plan by tier
- Open research gaps

## Quality bar

A useful ICP excludes as clearly as it includes. If the ICP could describe half the market, narrow it.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`gtm-icp-scoring`](../gtm-icp-scoring/SKILL.md) — operationalize the ICP into account scores
- [`pmm-go-to-market`](../pmm-go-to-market/SKILL.md) — target the GTM at this ICP
- [`pmm-outreach`](../pmm-outreach/SKILL.md) — ground outreach in the ICP and anti-ICP
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`positioning/icp-analysis-worksheet.md`](../product-marketing-os/references/library/positioning/assets/icp-analysis-worksheet.md) — the ICP analysis worksheet
- [`positioning/03-icp-driven-positioning.md`](../product-marketing-os/references/library/positioning/references/core/03-icp-driven-positioning.md) — best-fit logic behind the ICP
- [`personas/02-b2b-buying-committees.md`](../product-marketing-os/references/library/personas/advanced/02-b2b-buying-committees.md) — ICP as an account + committee, not a title

