---
name: pmm-campaign-brief
description: When the user needs a campaign brief, marketing campaign plan, launch campaign, creative brief, channel plan, content deliverables, SMART objective, RACI, KPIs, or a .docx-ready stakeholder brief. Produces a 14-section campaign brief, catches common campaign-brief mistakes, and can hand off to pmm-artifact-factory for exportable files.
---

# PMM Campaign Brief

You create campaign briefs that are tight enough for execution and complete enough for stakeholder approval.

## Use when

- The user asks for a campaign brief.
- A launch requires a multi-channel campaign.
- A team needs a creative, lifecycle, paid, social, or field marketing brief.
- The user wants a Word-ready or export-ready campaign document.

## Workflow

1. Setup
   - Campaign name, campaign type, full or light brief, launch tier.

2. Strategy
   - Background, why now, business objective, audience, competitive context.
   - Convert the objective to SMART format.

3. Messaging
   - Key insight, positioning, key messages, single-minded proposition.
   - Reject SMPs that contain multiple ideas.

4. Execution
   - Channels, deliverables, timeline, budget, owners.

5. Governance
   - KPIs, RACI, approvals, risks.

6. Review and export
   - Run the quality checklist.
   - Hand off to pmm-artifact-factory for `.md`, `.docx`, `.pptx`, `.csv`, `.json`, or `.html` outputs.

## Brief structure

Use `skills/product-marketing-os/assets/campaign-brief-template.md`.

## Full vs light brief

Full brief is for major launches, cross-functional campaigns, competitive responses, or paid campaigns.

Light brief is for smaller feature updates, lifecycle campaigns, or narrow customer communications. It must still include background, objective, audience, key messages, deliverables, owner, and measurement.

## Quality checks

Do not mark the brief done if it has:

- More than one primary objective.
- A vague audience.
- No insight.
- An SMP with more than one idea.
- No success metrics.
- No competitive context when competition matters.
- No why now.
- No RACI or approval owner.

## Output

Produce a clear markdown brief first. Then, if requested, create the artifact bundle with pmm-artifact-factory.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — produce the campaign assets
- [`pmm-feature-announcement`](../pmm-feature-announcement/SKILL.md) — write the announcement
- [`post-launch-learning-loop`](../post-launch-learning-loop/SKILL.md) — read the results
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Any long-form or prose section here follows the PMM OS depth standard — see `../product-marketing-os/references/output-depth-standard.md` (and `pmm-content-writer` for word budgets): hit the word/structure budget for the format, develop each point with claim → why → concrete evidence → implication, and run the depth rubric before returning. Deliver finished copy, never an outline-as-deliverable or a 250-word stub.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/05-multi-channel-tactics.md`](../product-marketing-os/references/library/product-launch/references/core/05-multi-channel-tactics.md) — channel plan for the campaign
- [`rollout-and-launch/01-message-testing.md`](../product-marketing-os/references/library/rollout-and-launch/references/core/01-message-testing.md) — test the SMP before spending

