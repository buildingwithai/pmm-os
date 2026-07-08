# ICP One-Pager — hard values any two people can apply identically

The operational definition of who we sell to — and, just as load-bearing, who we walk away from.
The test is operational: any two people qualify the same live account identically in under 2
minutes.

- **When to use:** defining or tightening the ICP (pmm-icp-definition output); before any
  scoring model, outbound list, or routing rule gets built on top of it.
- **Length rule:** one page, 8–15 specific criteria with defined values/ranges (not aspirations);
  should describe 10–20% of TAM, not 40%.
- **Lives where:** wiki page signed off by sales, marketing, product, and CS; operationalized into
  CRM filters, lead scoring, and routing rules; revisited quarterly against closed-won/churned
  data.
- **Hydrating desks:** customer (pains in their words, success criteria, closed-won evidence) ·
  market (firmographics, TAM share) · gtm (buying committee, triggers, scoring signals) · product
  (technographics, required stack).

## The ten sections are fixed — the ghost generates against them in order

1. One-line ICP sentence: "We sell to [company type] in [vertical] at [size] when [trigger], who
   want [outcome] without [pain]"
2. Firmographics: industry, headcount band, revenue/ARR band, geography, funding stage
3. Technographics: required stack + deal-killer tools
4. Buying committee: champion, economic buyer, blockers (roles + titles)
5. Trigger events that create urgency
6. Primary pains in the customer's own words
7. Success criteria / time-to-value expectation
8. Anti-ICP / hard disqualifiers ("do not pursue" list)
9. Scoring signals (5–8) with points and data source
10. 3 named example customers

## The disqualifier section is the differentiator

- Anti-ICP gives reps explicit permission to walk away — that permission is the page's real value.
- Hard values are built from closed-won evidence, not logo wishes.
- Each trigger maps to an outbound angle, so the page feeds sequences directly.
- It gets ignored when it says "mid-market companies that value innovation" — a two-year-old slide
  nobody can apply on a Tuesday morning.

## The skeleton — every criterion gets a hard value, every signal a source

```markdown
# ICP: we sell to [company type] in [vertical] at [size] when [trigger], who want [outcome] without [pain]
*Last reviewed: [date] · Owner: [name] · Signed off: sales [name] · mktg [name] · product [name] · CS [name]*

**Firmographics:** industry: [list] · headcount: [band, e.g. 200–2,000] · revenue/ARR:
[band] · geography: [regions] · funding stage: [range] — Source: [closed-won analysis, date]

**Technographics:** required stack: [tools that must be present] · deal-killers: [tools whose
presence disqualifies, e.g. "committed to [incumbent suite] enterprise agreement"]

**Buying committee:** champion: [role/title] · economic buyer: [role/title] · blockers:
[roles/titles + what they block on]

**Trigger events (each maps to an outbound angle):**
- [trigger, e.g. "new VP Eng hired"] → angle: [one line]
- [trigger, e.g. "post-incident postmortem published"] → angle: [one line]

**Primary pains (customer's own words):**
- "[verbatim pain]" — Source: [call/win-loss, date]
- "[verbatim pain]" — Source: [call/review, date]

**Success criteria / time-to-value:** [what they must see, by when — e.g. "first alert routed
in < 14 days"] — Source: [closed-won onboarding data, date]

**Anti-ICP — do not pursue:**
- [hard disqualifier, e.g. "< 50 employees (no on-call rotation to sell into)"]
- [hard disqualifier — regulatory, stack, motion mismatch]

**Scoring signals (5–8):**
| Signal | Points | Data source |
|---|---|---|
| [signal w/ hard value] | [+/- n] | [CRM field / enrichment tool] |
| [signal] | [n] | [source] |

**Named example customers:** [customer 1] · [customer 2] · [customer 3] — Source: [CRM, date]

**Ask:** [Verb-first — e.g. "Approve this ICP and load the scoring signals into [CRM] by [date]
— owner: [ops name]; quarterly recalibration against closed-won/churn booked for [date]."]
```
