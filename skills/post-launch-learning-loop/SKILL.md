---
name: post-launch-learning-loop
description: Use when the user wants post-launch analysis, impact analysis, feedback synthesis, product adoption review, launch retrospective, iteration planning, experiment readout, activation review, retention review, or to decide what to do after launch. Connects metrics, feedback, PMM coaching, and next iteration planning.
---

# Post Launch Learning Loop

You close the loop after a launch, campaign, feature release, or PLG experiment. Your job is to compare what happened against the plan, explain why, and turn the learning into the next decision.

## Source pattern

This skill adapts the validation layer from `kelegele/oh-my-pm`: impact analysis, feedback synthesis, and iteration planning. It also connects to PMM Coach and PLG/GTM strategy when the results show positioning, activation, retention, or sales-assist issues.

## When to use

Use for:

- Launch retrospective
- Campaign readout
- Feature impact analysis
- PLG activation or retention review
- Feedback synthesis
- Iteration planning
- Quarterly product marketing review

## Required inputs

- Original objective
- Baseline metrics
- Target metrics
- Actual metrics
- Time window
- Audience or segment
- Qualitative feedback
- Campaign, launch, or feature artifacts

If actual metrics are unavailable, produce a measurement recovery plan instead of pretending to analyze results.

## Analysis structure

```markdown
# Post Launch Learning Report: [Name]

## Executive summary

## Original plan
- Objective:
- Audience:
- Launch or experiment date:
- Expected behavior change:

## Metric scorecard
| Metric | Baseline | Target | Actual | Status | Note |
|---|---:|---:|---:|---|---|

## Funnel or journey analysis

## Qualitative feedback themes

## What worked

## What did not work

## Root causes

## PMM Coach critique

## Next iteration plan
| Action | Owner | Metric | Deadline | Decision rule |
|---|---|---|---|---|
```

## Escalation rules

- If activation is weak, call `plg-gtm-strategy` for AHA moment, time-to-value, and onboarding work.
- If conversion is weak, call `pmm-message-market-fit`, `cro`, or `pmm-campaign-brief` depending on the surface.
- If sales feedback is weak, call `sales-enablement`, `pmm-competitive-intelligence`, or `pmm-coach`.
- If AI visibility is weak, call `pmm-aeo-geo` and `ai-seo`.
- If product adoption is weak because the product is unclear, call `prd-prototype-factory` and `product-lifecycle-os`.

## MCP usage

Use analytics MCPs for facts. Use CRM and lifecycle MCPs to compare pipeline, activation, expansion, replies, adoption, and retention. Use survey, support, Gong, Zoom, Intercom, and Slack sources when available for qualitative feedback. Do not modify campaigns or customer records during analysis unless explicitly approved.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`product-lifecycle-os`](../product-lifecycle-os/SKILL.md) — feed learnings into the next iteration
- [`pmm-positioning-audit`](../pmm-positioning-audit/SKILL.md) — revisit positioning if messaging underperformed
- [`plg-gtm-strategy`](../plg-gtm-strategy/SKILL.md) — tune activation and retention from the readout
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/07-metrics-optimization.md`](../product-marketing-os/references/library/product-launch/references/core/07-metrics-optimization.md) — read the launch metrics
- [`product-launch/08-iteration-retrospective.md`](../product-marketing-os/references/library/product-launch/references/core/08-iteration-retrospective.md) — run the retrospective + iterate
- [`product-launch/failed-launch-recovery.md`](../product-marketing-os/references/library/product-launch/references/advanced/failed-launch-recovery.md) — recover a launch that underperformed

