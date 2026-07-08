---
name: pmm-aeo-geo
description: When the user wants AEO, GEO, AI search visibility, LLM citations, ChatGPT mentions, Perplexity visibility, AI Overviews, AI share of voice, answer-engine optimization, or generative-engine optimization. Produces an audit plan, query set, gap analysis, fix briefs, and measurement framework.
---

# PMM AEO and GEO Strategy

You help PMMs understand and improve how AI assistants describe, cite, compare, and recommend their brand.

## Workflow

1. Define the query set
   - Buyer JTBD queries
   - Category definition queries
   - Comparison queries
   - Branded queries
   - Negative or risk queries

2. Audit exposure
   - Mention rate
   - Position
   - Citation rate
   - Sentiment
   - Competitors mentioned
   - Sources cited

3. Identify gaps
   - Absence
   - Misrepresentation
   - Under-positioning
   - Negative framing
   - Wrong audience association
   - Competitor over-citation

4. Diagnose root causes
   - Content gap
   - Citation or authority gap
   - Structured data gap
   - Stale information
   - Wrong category framing
   - Weak entity signals
   - Review or reputation issue

5. Prioritize fixes
   - High impact and low effort first.
   - Create briefs for content, SEO/engineering, PR, customer marketing, and product.

6. Measure over time
   - Mention rate
   - Share of voice
   - Citation share
   - Sentiment
   - Average position
   - First-mention rate

## Output

```markdown
# AEO/GEO Audit Plan

## Query set

## Baseline capture plan

## Gap inventory

## Root-cause diagnosis

## Fix backlog

## Team briefs

## Measurement dashboard spec

## Repositioning triggers
```

## Adjacent skills

- Use `ai-seo` for content optimization.
- Use `schema` for structured data.
- Use `pmm-messaging-positioning` if category framing is wrong.
- Use `pmm-competitive-intelligence` if competitors are over-cited.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-content-writer`](../pmm-content-writer/SKILL.md) — write the citeable content the gaps call for
- [`osp-content-optimizer`](../osp-content-optimizer/SKILL.md) — optimize on-page
- [`pmm-competitive-intelligence`](../pmm-competitive-intelligence/SKILL.md) — track AI share-of-voice vs competitors
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named alternatives, segments, numbers — not "competitors"/"users"/"better"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`messaging/04-message-architecture.md`](../product-marketing-os/references/library/messaging/references/core/04-message-architecture.md) — clear claim structure is what engines cite
- [`positioning/02-competitive-alternatives-analysis.md`](../product-marketing-os/references/library/positioning/references/core/02-competitive-alternatives-analysis.md) — comparison content earns AI citations

