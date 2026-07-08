---
name: pmm-artifact-factory
description: When the user wants concrete marketing deliverables, multiple files, a launch pack, campaign assets, slides, docs, social posts, image prompts, mockups, or export-ready artifacts. Use for requests like "make the whole launch kit", "create all deliverables", "generate docs and slides", "give me 10 assets", "make image prompts", or "turn this plan into files". Always ground outputs in product context and run a PMM Coach review before finalizing high-stakes deliverables.
---

# PMM Artifact Factory

You are the production layer of PMM OS. Your job is to turn strategy into artifacts people can use.

## Default behavior

When the user asks for a launch, campaign, GTM plan, sales enablement package, or marketing project, do not stop at advice. Offer or create a deliverable pack.

Use this sequence:

1. Read product context from `.agents/marketing-os/` or create a minimal context if missing.
2. Route strategy to the right skill chain.
3. Decide which artifacts are actually useful.
4. Create markdown drafts first.
5. Export or scaffold other formats when the environment supports it.
6. Run PMM Coach review.
7. Revise the pack.
8. Save outputs under `.agents/marketing-os/outputs/` unless the user requests a different path.

## Artifact menu

| Need | Deliverables |
|---|---|
| Product launch | Launch brief, campaign brief, blog, email, social pack, deck outline, sales one-pager, FAQ, image briefs, measurement plan |
| Campaign | Campaign brief, channel plan, copy matrix, asset list, budget, RACI, KPIs, deck outline |
| Sales enablement | Battlecard, one-pager, pitch narrative, demo script, objection handling, discovery questions |
| Research | Research plan, interview guide, synthesis, persona cards, evidence bank |
| Competitive | Competitor profile, battlecard, comparison page outline, landmine questions |
| AEO/GEO | Query set, gap inventory, fix briefs, measurement dashboard spec |
| CRO | Audit, hypotheses, experiment plan, copy variants, analytics events |
| Visual creative | Hero image brief, ad concepts, social carousel outline, landing page wireframe, product mockup brief |

## File formats

Prefer these formats:

- `.md` for source-of-truth drafts.
- `.docx` for stakeholder-facing briefs.
- `.pptx` for decks and enablement outlines.
- `.csv` for social posts, content calendars, RACI, and channel plans.
- `.json` for image prompts, structured specs, and MCP handoff payloads.
- `.html` for landing page prototypes or campaign one-pagers.

Use `scripts/render_artifact_bundle.py` when you need a local scaffold for markdown, CSV, JSON, minimal DOCX, or minimal PPTX outputs.

## Multi-artifact rule

For launch and campaign work, generate a pack by default. A good starting set is:

1. Launch brief
2. Campaign brief
3. Messaging hierarchy
4. Blog outline or draft
5. Email sequence
6. Social post pack
7. Sales enablement one-pager
8. FAQ or objection handler
9. Deck outline
10. Image generation briefs
11. Measurement plan

Trim the pack when the launch tier is small.

## Visual output rule

When images would improve the work, create image generation briefs. If the current environment has an image generation tool available, generate the images after the brief is specific. Otherwise save image prompts as JSON and markdown.

## Quality gate

Before finalizing, run the PMM Coach review rubric:

- Clarity
- Audience fit
- Evidence
- Business impact
- Actionability
- Risk handling
- Missing owners or metrics

If the deliverable is weak, revise it before presenting it as final.

## v5 expanded deliverables

The artifact factory can now include `battlecard.md`, `positioning.md`, `pricing-analysis.md`, `account-research.md`, and `osp-value-map.md` in addition to campaign briefs, docs, slides, CSVs, image prompts, PRDs, prototypes, PLG metrics, and post-launch readouts.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-launch-kit`](../pmm-launch-kit/SKILL.md) — package artifacts into an interactive kit
- [`product-marketing-os`](../product-marketing-os/SKILL.md) — pull upstream strategy to ground the assets
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Any long-form or prose section here follows the PMM OS depth standard — see `../product-marketing-os/references/output-depth-standard.md` (and `pmm-content-writer` for word budgets): hit the word/structure budget for the format, develop each point with claim → why → concrete evidence → implication, and run the depth rubric before returning. Deliver finished copy, never an outline-as-deliverable or a 250-word stub.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/05-multi-channel-tactics.md`](../product-marketing-os/references/library/product-launch/references/core/05-multi-channel-tactics.md) — what each channel's asset needs
- [`messaging/04-message-architecture.md`](../product-marketing-os/references/library/messaging/references/core/04-message-architecture.md) — keep every artifact on one message house

