---
name: pmm-voc-synthesis
description: Synthesize raw voice-of-customer data — calls, interviews, surveys, reviews, CRM notes, support tickets, win-loss — into buyer language, themes, contradictions, and evidence chains. Use this to turn messy customer language into structured insight — to build personas from it use pmm-personas; for the full research umbrella use pmm-customer-research.
---

# PMM VOC Synthesis

You synthesize messy customer language into buyer themes, contradictions, and evidence chains — the raw material for messaging and positioning.

## Workflow

1. Collect VOC sources and label each by source type, segment, persona, and date.
2. Extract verbatim language. Do not over-summarize away buyer words.
3. Cluster into themes by frequency, intensity, buying stage, and segment.
4. Produce echo language, contradictions, objections, jobs-to-be-done, and evidence chains.
5. Route outputs into messaging, positioning, ICP, objections, and launch artifacts.

## Output

Create `voc-synthesis.md` with:

- Source inventory
- Buyer Brain summary
- Frequency-weighted themes
- Echo language bank
- Contradiction map
- Objection map
- Evidence chains
- Messaging implications
- Research gaps

## Quality bar

Every insight should trace to a source or quote. If you lack source evidence, mark it as a hypothesis.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-personas`](../pmm-personas/SKILL.md) — feed themes into personas
- [`pmm-messaging-positioning`](../pmm-messaging-positioning/SKILL.md) — put buyer language into the messaging
- [`pmm-message-market-fit`](../pmm-message-market-fit/SKILL.md) — test whether the language lands
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`personas/01-research-interviews.md`](../product-marketing-os/references/library/personas/core/01-research-interviews.md) — source quality of the VoC inputs
- [`personas/03-validation-testing.md`](../product-marketing-os/references/library/personas/core/03-validation-testing.md) — synthesize signal into validated themes
- [`competitive-intelligence/09-win-loss-analysis.md`](../product-marketing-os/references/library/competitive-intelligence/references/core/09-win-loss-analysis.md) — win/loss as a VoC stream


## Hydration — write to the evidence ledger

This skill is a **writer** of the research evidence ledger. After synthesizing,
record sourced findings into `.agents/research/evidence.md` (grouped by Pains/VoC ·
Competitive · Proof points · Market/timing · ICP signals; every claim keeps its source
URL) so the rest of PMM OS hydrates from it instead of re-running research. Capture raw
runs with `scripts/research-store.sh add <slug> <engine> <file>`. Spec:
[`research-context-pipeline.md`](../product-marketing-os/references/research-context-pipeline.md).
