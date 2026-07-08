# Events Desk

**Lens:** senior event marketing manager taking a product to market through field
marketing. The job: find the events/conferences where the ICP actually is, rank them
by pipeline potential vs. cost, and recommend a motion (sponsor / speak / booth /
side-event) for each — with sources, not vibes.

**Scope (reads the brief's `## Scope` — geo + seasonality + target drive this desk most):**
- `{product}`, `{ICP/segment}` (role + seniority + company type), `{competitors}` (to
  detect presence), `{budget band}` (optional).
- **Geography — at granularity.** Not "industry/geo" in the abstract: the *specific* places
  and level (e.g. "SoCal — LA County, Long Beach, San Diego + metros between"). **Filter to
  in-geo; discard national/out-of-region events** (and vice-versa for a national product).
  If geo is missing from the brief, ask: "Which county/metro/region/country should events
  cover?"
- **Timeframe & seasonality.** The `{launch window}` **and** the calendar shape: which
  **quarters** carry the events (Q3 campus-recruiting fairs, Q4 hiring pushes, conference
  seasons)? Annual cadence? Only count events inside the window that fits; flag a great-fit
  event just outside it.
- **Exhaustiveness target — ≥ 12–15 in-geo events** (raise for a dense metro). Five is a
  fail. Keep searching (per-city, per-quarter, regional round-ups) until you hit the target
  or can show the sources are exhausted.

## Question set (the senior event marketer's brief)

1. Which conferences/events does our **ICP actually attend** (by role, seniority, market)?
2. Which have a **real pipeline / MQL track record** for our category (sponsor ROI)?
3. **Format fit & motion:** sponsor vs. speak vs. booth vs. side-event/dinner — best ROI per event?
4. **Audience:** size, seniority, buyer-vs-practitioner mix, geographic fit?
5. **Timing:** dates, location, and CFP / sponsorship / early-bird **deadlines** vs. our launch window?
6. **Cost:** sponsorship tiers, booth, travel — what cost band?
7. **Competitive presence:** which competitors already sponsor/speak (defensive or offensive angle)?
8. **Momentum:** is the event growing or declining, and what do attendees actually say about it?

## Engine fan-out (how each question becomes calls — run in parallel)

| Question | `agent-reach` calls | `last30days` runs |
| --- | --- | --- |
| 1 — which events | **sweep for exhaustiveness — one search per city × per event-type:** `"{category} conferences {year}"`, `"job/career fairs {city} {year}"` for **each** in-geo city, `"{ICP role} meetups {metro}"`, `"{category} events {region} {quarter}"`; read **every** listicle/round-up + each city's convention-center / Eventbrite / university calendar until the ≥15 target is met | topic `"{category} conferences {region}"` (what people recommend/attend) |
| 2 — pipeline/ROI | per candidate: search `"{event} sponsor ROI / lead gen"`; read sponsor prospectus page | topic `"is {event} worth sponsoring"` (per top 2–3) |
| 3 — motion | read each event's sponsor / speaker / agenda pages | — |
| 4 — audience | fetch each event's "about / attendees / who attends" page | — |
| 5 — timing | fetch event site (dates/location); web search `"{event} {year} CFP sponsorship deadline"` | — |
| 6 — cost | read sponsor prospectus / pricing page (or search `"{event} sponsorship cost"`) | — |
| 7 — competitors | fetch sponsor lists; search `"{competitor} sponsor {event}"` | — |
| 8 — momentum | — | topic `"{event}"` (sentiment, growing/declining) for the shortlist |

A typical run = **3–5 `last30days` topics + ~15–30 `agent-reach` calls** — but a **dense
metro scales it up**: one `agent-reach` search per city × event-type is how you reach 15+,
so expect more calls for a tight, multi-city geo. Capture each to
`.agents/research/runs/<date>-events-<engine>.md`; every fact in the artifact keeps its
source URL. (`last30days` events topics use `--search=reddit,web` and `timeout` — no
YouTube transcripts needed here.)

## Evidence target

Write `## Events & field marketing` in `.agents/research/evidence.md`: one sourced entry
per candidate event (attendance fit, ROI signal, deadlines, cost, competitors present,
momentum), plus an `Open questions` note for anything a site didn't disclose (cost is
often gated — mark it, don't invent a number).

## Artifact — ranked events table (+ `events.csv`)

Built from [`../../assets/events-table-template.md`](../../assets/events-table-template.md),
rendered as an `events` view in the launch-kit dashboard, exportable as `events.csv`.

Columns: **Rank · Event · URL · Date(s) · Location · Format · Audience (size · seniority ·
ICP-fit) · Relevance · Est. pipeline/MQL potential · Recommended motion · Cost band · Key
deadlines · Competitors present · Source(s)**.

**Relevance score (0–100)** — transparent weighting so the ranking is defensible:

```
relevance = 0.30·ICP_fit + 0.25·pipeline_track_record + 0.15·audience_size
          + 0.15·timing_fit(vs launch window) + 0.10·cost_efficiency
          + 0.05·competitor_presence(offensive/defensive value)
```

Each sub-score 0–100, judged from the evidence; show the 1–2 factors that drove each
event's rank in a "why" note. Rank descending. Flag any event where a key column is
`unknown (gated)` so the user knows what to verify before committing budget.

## Presentation (meat-first — see [`../research-presentation-standard.md`](../research-presentation-standard.md))

The dashboard `events` view is **not** just the table. Render, in order: **(a) Scope** —
the geography + quarters + the ≥15 target, so the reader sees the boundary; **(b) Questions
this desk answers** — the 8 above; **(c) Findings** — each question answered (which events
the ICP attends, ROI signals, deadlines vs. the window, costs, competitor presence,
momentum), sourced; **(d) the ranked events table**; **(e) Gaps** — gated costs / events to
confirm. The table comes *after* the findings.

## Flow

`{product}+{ICP}+{scope:geo+seasonality+target}` (context spine + brief `## Scope`) → this
question set → engine fan-out (exhaustive within geo) → `## Events` evidence (sourced, full
findings) → meat-first dashboard `events` view + ranked `events.csv` → feeds
`pmm-go-to-market` / `pmm-campaign-brief` (the field-marketing motion).
