# Pricing One-Pager — a rep knows in seconds what they can offer

The deal-desk card: tier grid plus guardrail tables. Reps only use it if it answers a live quoting
question faster than Slacking their manager. The strategy rationale and pricing-council analysis
live in a separate deck, never on this page.

- **When to use:** pricing or packaging changes ship (pmm-pricing-packaging output), or reps are
  improvising discounts because no guardrails exist. For benchmarking competitor pricing use
  pmm-pricing-analysis.
- **Length rule:** one page: a tier grid plus rubric tables — a rep must know within seconds what
  they can offer and at what point they need approval.
- **Lives where:** deal-desk wiki page and enablement tool (Highspot/Seismic), mirrored in CPQ;
  list price and cost cells locked; version-controlled with a revision log; refreshed quarterly or
  on any packaging change and re-shared with sales.
- **Hydrating desks:** pricing (tiers, metrics, guardrails) · competitive (price posture, TCO
  story) · product (feature gates) · customer (per-tier value story, ROI proof).

## The seven sections are fixed — the ghost generates against them in order

1. Packaging matrix: tier × who it's for × price metric × key feature gates × price
2. One-line value story + ROI proof point per tier (why this tier exists)
3. Discount guardrails table: term and volume caps by segment, stacked-discount ceiling, named
   approver per threshold
4. Floors / walk-away rules
5. Add-on, bundle, and exception rules
6. Competitive price posture (how to talk TCO vs the 40%-cheaper competitor)
7. What changed + effective date + version

## Named approvers and explicit numbers replace "use judgment"

- "≤15% without VP sign-off" beats "use judgment" every time — every threshold has a number and a
  named approver.
- Give-get equivalencies (12-month term = X%) turn every discount into a trade, not a gift.
- A visible effective date means reps never quote the old tier.
- It gets ignored when it's packaging-philosophy prose instead of quoting answers.

## The skeleton — grid, guardrails, and a visible effective date

```markdown
# Pricing [vX.Y]: [governing thought — e.g. "three tiers on a per-seat metric; nothing below $[floor] without [approver]"]
*Effective: [date] · Version: [vX.Y] · Owner: [name] · Revision log: [link]*

**Packaging matrix:**
| Tier | Who it's for | Price metric | Key feature gates | Price |
|---|---|---|---|---|
| [Starter] | [buyer] | [per seat/mo] | [gates] | $[n] |
| [Growth] | [buyer] | [metric] | [gates] | $[n] |
| [Enterprise] | [buyer] | [metric] | [gates] | [custom, floor $[n]] |

**Why each tier exists:**
- [Starter]: [one-line value story] — ROI proof: [number w/ comparator] — Source: [case/study, date]
- [Growth]: [value story] — ROI proof: [number] — Source: [link, date]
- [Enterprise]: [value story] — ROI proof: [number] — Source: [link, date]

**Discount guardrails:**
| Segment | Term cap | Volume cap | Stacked ceiling | Approver above |
|---|---|---|---|---|
| [SMB] | [≤n% for 12-mo] | [≤n%] | [n%] | [name/role] |
| [ENT] | [≤n%] | [≤n%] | [n%] | [name/role] |

Give-gets: [12-month prepay = n%] · [case study rights = n%] · [logo use = n%]

**Floors / walk-away:** never below $[n] per [metric]; walk when [condition].

**Add-ons / bundles / exceptions:** [add-on: price + rule] · exceptions route to [deal desk
alias] with [SLA].

**Competitive posture:** vs [40%-cheaper competitor]: [the TCO sentence a rep says —
"list is lower; at [n] seats their [services/overage] puts 3-yr TCO [n]% higher"] —
Source: [analysis, date]

**What changed in [vX.Y]:** [change 1] · [change 2] — effective [date].

**Ask:** [Verb-first — e.g. "Load these guardrails into CPQ and re-share with sales by [date] —
owner: [deal desk]; quarterly refresh booked [date]."]
```
