# PMM OS — Research → Context Hydration Pipeline

How research becomes durable, sourced context that **hydrates every other skill**.
Without this, a research run is a throwaway chat reply; with it, the same run
feeds positioning, messaging, personas, competitive, pricing, and launch work —
with real citations, not invented facts.

## The store (lives in the user's project, under `.agents/`)

```
.agents/
  product-marketing.md            ← shared context spine (pmm-product-context) — the human brief
  research/
    evidence.md                   ← THE EVIDENCE LEDGER — distilled, sourced, the hydration layer
    runs/
      2026-06-20-acme-last30days.md   ← raw run output, captured verbatim (durable, citeable)
      2026-06-20-acme-agent-reach.md
```

`.agents/` is the existing PMM OS context convention (the grounding hook and
`pmm-product-context` already read `.agents/product-marketing.md`). Research nests
under it so the same rails carry it. The engines also keep their own raw output
(last30days → `LAST30DAYS_MEMORY_DIR`); CAPTURE copies the relevant run into the
project store so it travels with the repo and the skills can find it.

## The pipeline

1. **Research** — run `last30days` and/or `agent-reach` (run BOTH for broad tasks;
   two independent source pools).
2. **Capture** — save each run's output to
   `.agents/research/runs/<YYYY-MM-DD>-<slug>-<engine>.md` (verbatim or lightly
   trimmed). Nothing is lost to the chat scrollback. Use
   `scripts/research-store.sh add <slug> <engine> <file>` to do this consistently.
3. **Distill** — synthesize the run(s) into `.agents/research/evidence.md` (the
   ledger): dedupe across sources, keep the **source URL** on every claim, tag each
   entry with which skills it `feeds`. This is the `pmm-product-context` /
   `pmm-voc-synthesis` job. Cross-source corroboration (a claim seen in both engines)
   is the strongest signal — note it.
4. **Hydrate** — update the context spine (`product-marketing.md`) from the ledger,
   and every downstream skill **reads the ledger and cites it**. The grounding hook
   points all skills here.
5. **Cite** — in deliverables, a claim that came from research carries its source
   (`per [r/saas](url)`, `per [@handle](url)`). This is how research closes the
   depth standard's *evidenced* bar and the *proof-gap* requirement.

## The Evidence Ledger format (`.agents/research/evidence.md`)

Grouped by **what downstream skills need**, so hydration is a lookup, not a re-read
of raw dumps. Every entry: a specific claim + a source + a `feeds:` tag.

| Section | What goes here | Primarily feeds |
| --- | --- | --- |
| **Pains & VoC** | top pains in buyer language, verbatim quotes, jobs-to-be-done | personas, messaging, positioning, content, message-market-fit |
| **Competitive** | named competitors, their claims, gaps, win/loss signals, comparison language | competitive-intelligence, battlecard, competitive-landing-page, positioning, adaptive-messaging |
| **Proof points** | stats, named customers, benchmarks, social proof, third-party validation | messaging value props, feature-announcement, sales-narrative (**closes proof-gaps**) |
| **Market & timing** | what's trending, why-now, shifts, sentiment swings | launch-brief, campaign-brief, go-to-market, aeo-geo |
| **ICP signals** | who's engaging, segments, where they gather, hiring/intent signals | icp-definition, personas, gtm-icp-scoring, gtm-account-research, outreach |

**Entry shape:**

```markdown
- **{specific claim in plain/buyer language}** — {source name}: {url}
  · seen in: {last30days | agent-reach | both} · {date} · {confidence: strong/single-source}
  · feeds: positioning, messaging
```

A claim with no source is not evidence — either source it or move it to an
`## Open questions / unverified` block so a skill doesn't cite it as fact.

## Who writes vs. who reads

- **Writers** (research → ledger): `pmm-product-context` (the hub), `pmm-voc-synthesis`,
  `pmm-customer-research`, and the capture step right after the engines run.
- **Readers** (ledger → deliverable): every deliverable skill — positioning, messaging,
  personas, competitive, pricing, launch, content, GTM. They hydrate via the grounding
  hook; they don't need to re-run research if the ledger already answers the question.

## The one rule

**If `.agents/research/evidence.md` exists, read it before generating, use what it
answers, and cite it. Do not invent a fact the research already settled, and do not
re-ask the user for something the ledger holds.** Missing evidence → run research (or
name it as a proof-gap), never paper over with generic filler.
