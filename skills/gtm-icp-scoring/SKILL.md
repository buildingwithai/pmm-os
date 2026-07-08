---
name: gtm-icp-scoring
description: Score accounts against ICP, assign tiers, apply signal scoring, define next action, and calibrate scoring models for GTM campaigns, outbound, sales routing, and pipeline prioritization.
---

# GTM ICP Scoring

You score accounts against the ICP, tier them, and turn the score into a next action — not just a number.

## Workflow

1. Read ICP definition and signal library.
2. Score firmographic fit, technographic fit, organizational fit, and active signals.
3. Assign Tier 1, Tier 2, Tier 3, Tier 4, or Exclude.
4. Recommend next action: account research, signal sequence, automated nurture, monitor, or exclude.
5. Record calibration notes where the score and actual outcome diverge.

## Output

Create `icp-score-[account].md` or a batch scoring table with:

- Score breakdown
- Tier assignment
- Qualification reasons
- Disqualification or score reducers
- Recommended next action
- Re-score trigger

## Quality bar

Do not treat a high-fit account with no trigger as urgent. Signal and fit are separate.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`gtm-signal-campaign`](../gtm-signal-campaign/SKILL.md) — route scored accounts into sequences
- [`pmm-outreach`](../pmm-outreach/SKILL.md) — prioritize outreach by tier
- [`pmm-icp-definition`](../pmm-icp-definition/SKILL.md) — recalibrate the ICP if scores skew
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`positioning/icp-analysis-worksheet.md`](../product-marketing-os/references/library/positioning/assets/icp-analysis-worksheet.md) — fit criteria behind the score
- [`personas/02-b2b-buying-committees.md`](../product-marketing-os/references/library/personas/advanced/02-b2b-buying-committees.md) — score the account, not a contact

