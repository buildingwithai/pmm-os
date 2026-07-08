# Market Desk

**Lens:** market/category strategist. The job: situate the product in its category and
moment — the forces, the shifts, the why-now — so positioning and launch timing rest on
real market dynamics, not vibes.

**Inputs:** `{product}`, `{category}`, `{market}` (industry/geo), `{ICP/segment}`.

## Question set (the strategist's brief)

1. **Category** — what category is this, is it established or emerging, who defines it?
2. **Forces** (Porter) — buyer power, supplier power, substitutes, new entrants, rivalry?
3. **PESTEL** — regulatory/economic/tech shifts that change demand right now?
4. **Why-now** — what changed in the last 6–18 months that makes this urgent?
5. **Trends & momentum** — what's accelerating or dying in this space (last-30-days)?
6. **Whitespace** — gaps the incumbents leave open?
7. **TAM/segment signals** — how big/growing is the best-fit segment (directional)?

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1 category | read analyst posts / category-defining articles / G2 grid pages | topic `"{category}"` (how people frame it) |
| 2–3 forces/PESTEL | read industry reports, news, regulatory pages | topic `"{market} {regulation/shift}"` |
| 4–5 why-now/trends | search recent news + thought-leadership | topic `"{category} 2026 trends"`, `"future of {category}"` (engagement-ranked) |
| 6 whitespace | read incumbent gaps in reviews | topic `"{category} still missing"`, `"wish {category} could"` |

Run = **2–4 `last30days` topics + ~10–15 `agent-reach` reads**.

## Evidence target

`## Market & timing` in the ledger: sourced category dynamics, why-now signals, trend
direction, whitespace.

## Artifacts (the skill's real frameworks, hydrated)

1. **Market / category brief** — SWOT + Porter's Five Forces + PESTEL + the why-now, from
   [`library/strategic-thinking/core/02-strategic-analysis-frameworks.md`](../library/strategic-thinking/core/02-strategic-analysis-frameworks.md).
   Renders as a `v-market` view (SWOT grid + forces summary + why-now signals).
2. **Landscape map** — the competitive-landscape mapping from the same framework doc
   (axes + where players sit). Renders as a positioning/landscape table.

Methodology: [`library/strategic-thinking/core/02-strategic-analysis-frameworks.md`](../library/strategic-thinking/core/02-strategic-analysis-frameworks.md)
+ [`library/positioning/references/advanced/07-category-design-positioning.md`](../library/positioning/references/advanced/07-category-design-positioning.md).

## Flow

`{product}+{category}+{market}` → this question set → engine fan-out → `## Market & timing`
→ category brief + landscape map → feeds `pmm-positioning-exercise` (category choice),
`pmm-launch-brief` (timing), `pmm-aeo-geo`.
