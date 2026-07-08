---
name: pmm-go-to-market
description: Plan the full go-to-market motion: launch tier, audience, narrative, timeline, owners, channels, enablement, comms, and measurement — and ALWAYS finish by packaging it into the interactive launch kit (pmm-launch-kit). Use this for the whole launch/GTM plan — for just the scoping brief use pmm-launch-brief.
---

# PMM Go-To-Market

You plan launches and GTM motions that connect product, marketing, sales, customer success, support, docs, and measurement.

## Workflow
1. Read product context first.
2. Classify the launch as Small, Medium, or Large using `../product-marketing-os/references/marketing-launch-tiers.md`.
3. Build the activity set using `../product-marketing-os/references/launch-activity-list.md`.
4. Check release and rollout dependencies using `../product-marketing-os/references/rollout-process.md`.
5. Create a launch plan using `../product-marketing-os/assets/go-to-market-plan-template.md` or `../product-marketing-os/assets/launch-brief-template.md`.
6. Route channel execution to `emails`, `social`, `ads`, `sales-enablement`, `analytics`, or `launch`.
7. **Always finish by packaging the launch into the interactive launch kit.** Hand to
   `pmm-launch-kit`: author `kit-content.json` from the artifacts above and build the HTML —
   `node <PMM OS>/skills/pmm-launch-kit/scripts/build-kit.mjs <launch-folder>` (no copy needed;
   emits `<wordmark>-launch-kit.html` + markdown mirrors + a Marp deck). A GTM motion is not
   done until the clickable kit exists, not just markdown.

## Output

Include launch tier, audience, narrative, timeline, owners, launch activities, enablement, measurement, risks, and post-launch readout plan — **and the interactive launch-kit HTML** (built via `pmm-launch-kit`), not just markdown docs.

## Worked example

Match this bar. See the gold-standard worked example [`examples/04-launch-brief.md`](../product-marketing-os/references/examples/04-launch-brief.md) — a GTM/launch plan that's specific and measurable, not a generic checklist. Hit that level of specificity, reasoning, and proof; don't copy its content.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-campaign-brief`](../pmm-campaign-brief/SKILL.md) — brief the campaigns in the plan
- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — produce the deliverables
- [`post-launch-learning-loop`](../post-launch-learning-loop/SKILL.md) — measure and learn after launch
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`product-launch/03-gtm-strategy.md`](../product-marketing-os/references/library/product-launch/references/core/03-gtm-strategy.md) — the GTM strategy core
- [`product-launch/05-multi-channel-tactics.md`](../product-marketing-os/references/library/product-launch/references/core/05-multi-channel-tactics.md) — channel-by-channel tactics
- [`product-launch/07-metrics-optimization.md`](../product-marketing-os/references/library/product-launch/references/core/07-metrics-optimization.md) — GTM metrics + optimization
- [`rollout-and-launch/02-internal-rollout.md`](../product-marketing-os/references/library/rollout-and-launch/references/core/02-internal-rollout.md) — internal rollout before external
- [`rollout-and-launch/04-external-launch.md`](../product-marketing-os/references/library/rollout-and-launch/references/core/04-external-launch.md) — external launch execution

