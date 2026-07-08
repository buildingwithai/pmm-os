# Product Desk

**Lens:** product marketer building the shared product brief. The job: nail down what the
product actually does, the jobs it serves, and its honest differentiators — mostly from
the team's *own* sources (docs, README, changelog, demos) plus how the market frames the
capability. This is the **foundation desk**: it seeds the context spine the rest read.

**Inputs:** `{product}`, `{repo / docs / site}` if available, `{ICP/segment}`.

## Question set (the PMM's brief)

1. **Capabilities** — what can the product actually do (features → capabilities)?
2. **Jobs** — what customer jobs do those capabilities serve (FCB: feature→capability→benefit)?
3. **Differentiators** — what's genuinely unique vs. the alternatives (honest, not aspirational)?
4. **Proof** — what evidence backs each claim (metrics, demos, customer facts)?
5. **Gaps & roadmap** — what it doesn't do yet (so messaging doesn't overpromise)?
6. **How the market describes this capability** — the words buyers use for it?
7. **Surfaces** — where the product lives (app, API, integrations, share points)?

**Platform matrix (walk every cell or log the skip):** first-party surfaces — site · docs · repo · changelog · store listing(s) · demo video; plus GitHub issues + the product's own reviews (via the Reviews Desk) for intent-vs-implementation gaps.

## Engine fan-out (decompose — mostly first-party)

**When a codebase or live app exists, the code IS the primary engine.** This desk starts from
`.agents/research/product-grounding.md` ([`pmm-product-context` Stage 0](../../../pmm-product-context/SKILL.md)):
the capability inventory sourced to `path:line`, each item **shipped / WIP / aspirational**,
gating as implemented, and the intent-vs-implementation gaps. Questions 1–2, 5, and 7 are
answered from the grounding file (claim type `fact (code — path:line)`); the web engines below
only fill what code can't (market language, competitor contrast). A Product Desk that
re-asserts capabilities the code contradicts is a failed desk.

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1–2 capabilities/jobs | **the grounding file first**, then the product's site, docs, README, changelog | — |
| 3 differentiators | fetch competitor pages to contrast (links to Competitive Desk) | — |
| 5 gaps | the grounding file's WIP/aspirational items + GitHub issues / roadmap | topic `"{product}"` (what users ask for) |
| 6 market language | read how the category is described | topic `"{capability}"` (the words people use) |

Run = **grounding file + `agent-reach` first-party reads + 1 `last30days` topic for market
language**. Prefer the code over the docs, the docs over guessing; capture unknowns as open
questions.

## Evidence target

Primarily the **context spine** (`.agents/product-marketing.md`) via `pmm-product-context`,
plus a `## Proof points` seed in the ledger.

## Artifacts (the skill's real templates, hydrated)

1. **Capability / JTBD map** — feature → capability → benefit, from the
   [`value-proposition-canvas`](../library/positioning/assets/value-proposition-canvas.md)
   (Customer Jobs/Pains/Gains ↔ Products/Pain-Relievers/Gain-Creators). Renders as a `v-product` view.
2. **Product context spine** — [`product-marketing-context-template.md`](../../assets/product-marketing-context-template.md)
   (product, audience, ICP, positioning seed, surfaces, metrics, open questions).

Methodology: [`library/positioning/references/core/01-positioning-foundation.md`](../library/positioning/references/core/01-positioning-foundation.md)
+ [`research-context-pipeline.md`](../research-context-pipeline.md).

## Flow

`{product}+{docs}` → this question set → first-party fan-out → context spine + capability map
→ **feeds every other desk and skill** (it's the foundation the chain reads from).
