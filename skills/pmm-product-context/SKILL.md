---
name: pmm-product-context
description: Create and maintain shared product marketing context for PMM, GTM, launch, pricing, messaging, and growth work.
---

# PMM Product Context

You create and maintain the shared product marketing context — the spine **and** the
research evidence that every other skill hydrates from. Use this before any PMM, GTM,
launch, messaging, pricing, competitive, CRO, ads, or lifecycle work when context is
missing or stale, and after any research run to fold the findings into durable context.

## Workflow
1. Look for `.agents/product-marketing.md` or `.agents/product-marketing-context.md`.
2. If present, read it and identify gaps.
3. If missing, create `.agents/product-marketing.md` using `../product-marketing-os/assets/product-marketing-context-template.md`.
4. Do not ask for information that already exists in the repo, docs, README, analytics notes, prior `.agents` artifacts, or **the research evidence ledger** (step 6).
5. Capture unknowns as explicit open questions.

### Stage 0 — Product grounding (when the definition is fuzzy or a codebase exists)

The most common failure in a full run is researching a product that doesn't match reality —
a founder-asserted capability list drifts, and every downstream deliverable inherits the drift.
So when the product **has a codebase, a live app, or founder artifacts**, ground FIRST, before
any brief, hypothesis, or engine call. Truth order:

1. **The code / live product** (highest) — read the repo(s): manifests, routes, content
   scripts, data models, billing/gating code. Every capability claim carries a `path:line`.
2. **Founder artifacts** — demo scripts, decks, launch docs, planning sheets. These carry
   *intent*; label them so.
3. **The founder's description** (lowest) — the ramble that started the engagement.

Emit **`.agents/research/product-grounding.md`**: the capability inventory with each item
classified **shipped / WIP / aspirational** (code vs demo-script-only), free-vs-paid gating
as implemented, the data model in one paragraph, and an explicit **intent-vs-implementation
gaps** section. Product facts sourced to code use the claim type `fact (code — path:line)` in
the [report contract](../product-marketing-os/references/report-contract.md). The Plan gate's
day-1 hypothesis (pmm-research-brief) must be written **about the grounded product**, and the
Product Desk cites this file instead of re-asserting capabilities. If there is no code and no
artifacts, say so in the grounding file — "founder-asserted only" is itself a finding that
downstream deliverables must flag.
6. **Maintain the research evidence ledger** — the hydration layer the rest of PMM OS
   reads. After research runs (`last30days`, `agent-reach`), make sure each run is
   captured under `.agents/research/runs/` and distilled into
   `.agents/research/evidence.md` (create it from
   `../product-marketing-os/assets/research-evidence-template.md`). Keep the source URL
   on every claim; tag each with what it `feeds`. Then reconcile the spine
   (`product-marketing.md`) against the ledger so the brief and the evidence agree.
   Full spec: [`research-context-pipeline.md`](../product-marketing-os/references/research-context-pipeline.md).

## Output

Produce or update (a) the markdown context spine — product, audience, ICP, positioning,
customer language, competitive context, GTM motion, metrics, open questions — and
(b) the **research evidence ledger** (`.agents/research/evidence.md`): distilled, sourced
research grouped by what downstream skills need (Pains/VoC · Competitive · Proof points ·
Market/timing · ICP signals), every claim citeable. The ledger is what makes the other
skills' output *evidenced* instead of invented.

## Worked example

Match this bar. See the gold-standard worked example [`examples/00-product-context.md`](../product-marketing-os/references/examples/00-product-context.md) — the shared context other deliverables read. Hit that level of specificity, reasoning, and proof; don't copy its content.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-customer-research`](../pmm-customer-research/SKILL.md) — ground the context in real customer evidence
- [`pmm-positioning-exercise`](../pmm-positioning-exercise/SKILL.md) — the positioning this context feeds
- [`product-marketing-os`](../product-marketing-os/SKILL.md) — sequence the full workflow from here
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`positioning/01-positioning-foundation.md`](../product-marketing-os/references/library/positioning/references/core/01-positioning-foundation.md) — the context positioning needs
- [`personas/01-research-interviews.md`](../product-marketing-os/references/library/personas/core/01-research-interviews.md) — customer context inputs

