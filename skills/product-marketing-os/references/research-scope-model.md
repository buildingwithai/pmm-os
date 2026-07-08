# Research Scope Model — adaptive, per product + strategy

Scope is **not a fixed list of fields**. The *right* scope dimensions depend on the
product, the buyer, and the strategy — so the brief ([`pmm-research-brief`](../../pmm-research-brief/SKILL.md))
**reasons about which dimensions matter for this product**, sets them, and writes a
`## Scope` block the desks read and honor. There is no hardcoded geography or quarter;
there is a model for deciding them.

## Why adaptive

The same desk needs different scope for different products:

| Product | Geography that matters | Timeframe that matters | Exhaustiveness |
| --- | --- | --- | --- |
| A local med-spa | one county / metro | the local event calendar, year-round | every salon + every local fair |
| A US bootcamp | US metros with tech hiring | Q3 campus + Q1 cohort starts | every career fair in target metros |
| A global dev-tool SaaS | international, but events cluster by region (NA/EU/APAC) | the conference season per region | the full competitor set; flagship confs per region |
| A Chrome extension (PLG) | geography is weak for channels (online), but field/community events still cluster by city | launch window + always-on creator calendar | every relevant creator + community, not 5 |

So the brief asks: *for **this** product, which of these axes actually constrain the
research?* — and scopes only those, at the granularity that fits.

## The dimensions

For each desk, set as many of these as apply (skip the ones that don't):

1. **Subject** — `{product}`, `{ICP/segment}` (role · seniority · company type),
   `{market/category}`, and the **named entities** (candidate competitors, communities,
   events, creators). This is the "who/what."
2. **Geography** — pick the *granularity* deliberately:
   `county` → `metro` → `state/province` → `region (e.g. SoCal, DACH)` → `national` →
   `international`. Name the specific places when tight ("LA County, Long Beach, San
   Diego, + cities in between"). The desk **filters to in-geo and discards out-of-geo** —
   a national conference is noise for a one-county product, and vice-versa.
3. **Timeframe & seasonality** — two things:
   - the **launch window** (so deadlines/CFPs/buying cycles matter), and
   - the **calendar shape**: annual vs one-off; which **quarter(s)** carry the signal
     (Q3 campus recruiting, Q4 budget flush, Q1 kickoff, conference seasons). Only count
     items inside the window that fits; flag a great-fit item that falls outside it.
4. **Exhaustiveness target** — the *number* a good answer surfaces, per desk. Default
   floors: **events ≥ 12–15 in-scope**, **competitors = the full set (not top-3)**,
   **channels/communities ≥ 8–10**, **KOLs ≥ 10**. The recipe may raise these. Below the
   floor without a "sources exhausted" note ⇒ the desk isn't done.
5. **Constraints** — budget band, **B2C vs B2B** (changes the whole event/channel set),
   regulatory/NSFW/region limits, language.

## Where it lives

The brief writes a `## Scope` block into `.agents/research/brief.md`, e.g.:

```markdown
## Scope
- Geography: SoCal — LA County, Long Beach, San Diego + metros between. (granularity: metro)
- Timeframe: launch in Q3; events year-round, weight Q3 campus + Q4 hiring. Annual cadence.
- Exhaustiveness: events ≥ 15 in-geo; competitors = full set; channels ≥ 10; KOLs ≥ 10.
- Segments: high-volume applicants (B2C primary) + career coaches / bootcamps (B2B secondary).
- Constraints: bootstrapped (low budget band); online product so channels skew digital.
```

Each desk recipe's **Scope** section says which of these it consumes (the Events Desk
reads geography + seasonality + the ≥15 target hardest; the Competitive Desk reads the
full-set target; the Customer Desk reads segment + market). If a dimension is missing
from the brief, the desk asks for **only** the one it needs — it doesn't re-scope the
whole product.

## How a desk honors scope

1. **Filter** — drop out-of-scope hits (wrong geo, wrong quarter, wrong segment) instead
   of padding the artifact with them.
2. **Pursue the target** — keep fanning out (more searches, regional round-ups,
   per-quarter and per-city passes) until the exhaustiveness floor is met or the sources
   are demonstrably exhausted (note it).
3. **Show the boundary** — the dashboard view's first block is the Scope, so the reader
   knows what was included and what was deliberately excluded.
