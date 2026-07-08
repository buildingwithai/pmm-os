# Battlecard — one screen a rep reads in 90 seconds

Crayon's number frames the whole problem: 79% of teams make battlecards, only 26% of reps use
them. Sayable language, per-section freshness dates, and zero-click delivery are what flip it. A
rough card that's four days old beats a beautiful one that's four months old.

- **When to use:** a competitor shows up in deals (pmm-battlecard output); one card per
  competitor. For the deep analysis behind it use pmm-competitive-intelligence; for a same-day
  reaction to a fresh move use pmm-adaptive-messaging.
- **Length rule:** one screen per competitor, no scrolling; readable end-to-end in under 90
  seconds; the right line findable in under 10 seconds mid-call; rebuttals are one sentence (the
  rep has ~40 seconds). Feature matrices, funding history, market context belong in the working
  doc, never on the card.
- **Lives where:** NOT a shared drive or Notion folder — embedded where reps work: the Salesforce
  deal record (auto-surfaced when a competitor is tagged), Slack, Gong, Highspot/Klue; tied into
  onboarding role-plays; measured by win-rate delta on deals where the card was opened.
- **Hydrating desks:** competitive (overview, weaknesses, moves) · customer (objections from real
  calls, switcher proof) · product (differentiator evidence).

## The nine sections are fixed — the ghost generates against them in order

1. Two sentences at top: "We win when… / We lose when…"
2. 3-line competitor overview (what they do, who they sell to, latest move)
3. Trigger scenarios: when they show up in deals
4. 3–5 differentiators — outcomes, not feature checkboxes
5. Their weaknesses, each with proof
6. 4–6 objections written in the prospect's voice + one-sentence sayable rebuttals (detail as
   backup below)
7. Landmine discovery questions to plant early
8. One proof point: a customer who evaluated both / switched, with the reason
9. "Last verified" date + source per section

## Sayable language and freshness dates are what flip the 26%

- Every rebuttal is a sentence a rep can read straight off the card mid-call — no talking-point
  abstractions.
- Objections are sourced and validated by frontline sales, not written by marketing.
- Per-section freshness dates: anything older than 90 days gets refreshed or cut.
- Zero-click accessibility (surfaced in the deal record) plus the win-rate feedback loop close the
  usage gap.

## The skeleton — win/lose first, one sentence per rebuttal

```markdown
# vs [Competitor]: we win when [condition]; we lose when [condition]
*Last verified: [date] · Owner: [name] · Win-rate vs them: [x% vs y% last qtr] — Source: [CRM, date]*

**We win when…** [deal shape, persona, requirement — one sentence]
**We lose when…** [the honest loss condition — one sentence] — Source: [win-loss data, date]

**Who they are (3 lines):** [what they do] · [who they sell to] · [latest move + date]
— Source: [link, date]

**They show up when:** [trigger scenarios — deal stage, persona, RFP language that signals them]

**Differentiators (3–5, outcomes not checkboxes):**
- [outcome differentiator, e.g. "5-min setup vs their 6-week services engagement"] — Source: [link, date]
- [differentiator] — Source: [link, date]

**Their weaknesses (each with proof):**
- [weakness] — proof: [review quote / churn story / benchmark w/ comparator] — Source: [link, date]

**Objections + sayable rebuttals (4–6, prospect's voice):**
1. "[objection verbatim]" → "[one-sentence rebuttal a rep can say aloud]" *(backup: [1-line detail])*
2. "[objection]" → "[rebuttal]"
— Source: [frontline calls, validated by [rep name], date]

**Landmines to plant early:** "[discovery question that exposes their weakness]" ·
"[second question]"

**Switcher proof:** [customer] evaluated both / switched from them because [reason] —
"[verbatim if available]" — Source: [call/case study, date]

**Ask:** [Verb-first — e.g. "Push this card into the [CRM] competitor field by [date] — owner:
[enablement]; refresh every section older than 90 days."]
```
