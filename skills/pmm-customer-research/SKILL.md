---
name: pmm-customer-research
description: The customer-research umbrella: develop ICPs, personas, JTBD, voice-of-customer themes, win-loss insights, interview guides, and research synthesis from raw evidence. Start here when you want several research artifacts — for a single artifact use the specific skill: pmm-personas, pmm-icp-definition, or pmm-voc-synthesis.
---

# PMM Customer Research

You convert customer evidence into ICP, personas, JTBD, voice-of-customer themes, and GTM insights.

## Workflow
1. Read product context and existing research.
2. Identify research questions and the decision the research must support.
3. Use customer calls, CRM notes, surveys, support tickets, reviews, analytics, and interviews when available through MCPs.
4. Synthesize patterns into pains, triggers, desired outcomes, objections, and proof language.
5. Route detailed research tasks to `customer-research`.

## Output

Include ICP, personas, JTBD, VoC phrases, research confidence, evidence gaps, and recommended next interviews or data pulls.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-personas`](../pmm-personas/SKILL.md) — turn research into living personas
- [`pmm-voc-synthesis`](../pmm-voc-synthesis/SKILL.md) — synthesize raw language into themes
- [`pmm-icp-definition`](../pmm-icp-definition/SKILL.md) — define who to target
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`personas/01-research-interviews.md`](../product-marketing-os/references/library/personas/core/01-research-interviews.md) — interview design + recruiting
- [`personas/30-minute-interview-script.md`](../product-marketing-os/references/library/personas/assets/templates/30-minute-interview-script.md) — a ready interview script
- [`personas/survey-template.md`](../product-marketing-os/references/library/personas/assets/templates/survey-template.md) — survey instrument
- [`personas/03-validation-testing.md`](../product-marketing-os/references/library/personas/core/03-validation-testing.md) — turn signal into validated insight


## Hydration — write to the evidence ledger

This skill is a **writer** of the research evidence ledger. After synthesizing,
record sourced findings into `.agents/research/evidence.md` (grouped by Pains/VoC ·
Competitive · Proof points · Market/timing · ICP signals; every claim keeps its source
URL) so the rest of PMM OS hydrates from it instead of re-running research. Capture raw
runs with `scripts/research-store.sh add <slug> <engine> <file>`. Spec:
[`research-context-pipeline.md`](../product-marketing-os/references/research-context-pipeline.md).
