# Positioning One-Pager — the Dunford-style canvas

The source-of-truth page every downstream artifact inherits from — messaging, battlecards,
campaigns, sales narrative all trace back here. A new hire must understand the positioning from
this single doc with no walkthrough.

- **When to use:** positioning is being created or revised (pmm-positioning-exercise output), or
  any downstream deliverable finds no current positioning page to inherit from.
- **Length rule:** one page, usually a two-column canvas table — one row per component; value
  themes limited to 2–3 with one proof each.
- **Lives where:** source-of-truth page in Notion/Confluence/Coda; walked through in new-hire
  onboarding; linked from every launch brief.
- **Hydrating desks:** competitive (alternatives, competitive frame) · customer (best-fit,
  triggers) · market (category, why-now) · product (description, unique attributes) · pricing
  (posture).

## The eleven sections are fixed — the ghost generates against them in order

1. Product description (1–2 sentences) + last-reviewed date
2. Competitive alternatives (what buyers would do without you, 3–5)
3. Unique attributes / capabilities alternatives lack
4. Value themes (2–3), each with a proof point
5. Best-fit customers: role at company type + trigger
6. Market category + why-now trends
7. Positioning statement (For X, [product] is the [category] that Y, unlike Z)
8. Wedge use case / sales narrative arc (problem → old way → why now → new way → proof)
9. Common misuses / what we do NOT solve
10. Competitive frame: 1 sentence vs each of top 2–3 alternatives
11. Pricing posture (model + rough range)

## Traceability and freshness decide whether it gets used

- Every value theme traces to a unique attribute that maps to a named alternative's weakness — the
  chain alternative → attribute → theme is the whole argument.
- A visible review date: markets change, and stale positioning kills trust in the page.
- The positioning statement is immediately usable by sales verbatim.
- The anti-scope ("common misuses") is what stops late-stage deals blowing up.
- It gets ignored when it's aspirational adjectives with no competitive alternatives named.

## The skeleton — copy, fill, keep the canvas to one page

```markdown
# [Product] positioning: for [best-fit role], the only [category] that [key value]
*Last reviewed: [date] · Owner: [PMM name] · Sign-off: [sales lead], [product lead]*

**Product:** [1–2 plain sentences — what it is, what it does. No adjectives yet.]

| Component | Answer |
|---|---|
| **Competitive alternatives** | [3–5 things buyers actually do without us — include the non-vendor option, e.g. "spreadsheet + weekly standup"] |
| **Unique attributes** | [capabilities the alternatives lack — each must map to a named alternative's weakness] |
| **Value theme 1** | [theme in outcome language] — proof: [number w/ comparator, e.g. "cut alert triage 41% vs prior tool"] — Source: [link, date] |
| **Value theme 2** | [theme] — proof: [number w/ comparator] — Source: [link, date] |
| **Value theme 3 (optional — max 3)** | [theme] — proof: [number w/ comparator] — Source: [link, date] |
| **Best-fit customers** | [role] at [company type] when [trigger event, e.g. "after their second SEV-1 postmortem"] |
| **Market category** | [category] — why now: [1–2 trends] — Source: [link, date] |
| **Positioning statement** | For [X], [product] is the [category] that [Y], unlike [Z] |
| **Wedge / narrative arc** | [problem] → [old way] → [why now] → [new way] → [proof] |
| **What we do NOT solve** | [common misuses / anti-scope — name the late-stage deal-killers explicitly] |
| **Competitive frame** | vs [alt 1]: [one sentence] · vs [alt 2]: [one sentence] · vs [alt 3]: [one sentence] |
| **Pricing posture** | [model + rough range, e.g. "per-seat SaaS, $40–80/seat/mo"] |

**Ask:** [Verb-first — e.g. "Sign off this canvas as positioning source of truth by [date] — approvers: [names]. All downstream messaging regenerates from it."]
```
