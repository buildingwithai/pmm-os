---
name: pmm-launch-brief
description: Generate a tiered launch brief — launch tier, workstreams, timeline, messaging, success metrics, risks, approvals — for a product launch, feature release, rollout, or beta-to-GA. Use this for the scoping/brief doc — for the full GTM motion (channels, comms, enablement, measurement, launch kit) use pmm-go-to-market.
---

# PMM Launch Brief

You scope a release into a tiered launch brief: workstreams, timeline, messaging, metrics, risks, and approvals sized to how big the launch actually is.

## Workflow

1. Read product context, positioning, persona, rollout, and launch tier references.
2. Classify launch tier. Use Small, Medium, Large or Tier 1, Tier 2, Tier 3, but normalize the result for the user.
3. Build the launch brief around what is launching, why now, who it is for, messaging, activities, timeline, metrics, risks, and approvals.
4. Create downstream deliverables when useful: campaign brief, launch blog, email, social pack, sales enablement, deck outline, image prompt pack, measurement plan.

## Output

Create `launch-brief-[product].md` with:

- Executive summary
- Strategic context and why now
- Launch tier and rationale
- Target audience and customer impact
- Positioning and messaging
- Workstream checklist: PMM, content, social, sales, product, CS, growth, comms
- Backward timeline
- Success metrics
- Risks and mitigations
- Approvals and RACI
- Next artifacts to generate

## Quality bar

Do not over-launch minor updates. Do not under-launch strategic releases. Every activity should have an owner or `TBD owner`. Every metric should be measurable.

## Worked example

Match this bar. See the gold-standard worked example [`examples/04-launch-brief.md`](../product-marketing-os/references/examples/04-launch-brief.md) — a tiered brief with owners, dates, metrics, and risks sized to the launch. Hit that level of specificity, reasoning, and proof; don't copy its content.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-go-to-market`](../pmm-go-to-market/SKILL.md) — expand the brief into a full GTM plan
- [`pmm-campaign-brief`](../pmm-campaign-brief/SKILL.md) — brief the launch campaign
- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — produce the launch assets
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/01-launch-tier-framework.md`](../product-marketing-os/references/library/product-launch/references/core/01-launch-tier-framework.md) — size the launch (tier) correctly
- [`product-launch/02-90-day-roadmap.md`](../product-marketing-os/references/library/product-launch/references/core/02-90-day-roadmap.md) — the 90-day plan structure
- [`product-launch/03-gtm-strategy.md`](../product-marketing-os/references/library/product-launch/references/core/03-gtm-strategy.md) — the GTM the brief commits to
- [`product-launch/04-cross-functional-coordination.md`](../product-marketing-os/references/library/product-launch/references/core/04-cross-functional-coordination.md) — owners + RACI across teams
- [`product-launch/launch-tier-assessment.md`](../product-marketing-os/references/library/product-launch/assets/templates/launch-tier-assessment.md) — tier assessment worksheet
- [`product-launch/raci-matrix.md`](../product-marketing-os/references/library/product-launch/assets/templates/raci-matrix.md) — RACI template

