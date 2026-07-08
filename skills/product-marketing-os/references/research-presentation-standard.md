# Research Presentation Standard — what "good" looks like

The artifact is not the deliverable. A ranked table or a battlecard is the *end* of a
desk; the **meat** is the reasoning that produced it — the questions asked, the findings
that answer them, the evidence behind each. This standard defines the section set every
research surface must carry so the dashboard presents depth, not a summary + a template.

**The failure this prevents:** a desk view that is one callout + one table. That looks
done but answers nothing — the reader can't see what was asked, what was found, or why to
trust it.

---

## 0. The discipline, and its golden standards

Two different things ship from a research run, and they must not be confused:

- **Research reporting** — the *findings* and the *evidence* behind them. This is the meat.
- **Deliverables / artifacts** — the templates, frameworks, matrices, battlecards, scorecards
  that *act on* the findings. These come *after* the meat, not instead of it.

The recognized best practices we hold ourselves to:

- **Chain of evidence (traceability).** Every claim traces **claim → verbatim quote → clickable
  source**. A finding the reader can't click back to a Reddit thread / tweet / video / repo / page
  is, by this standard, *not yet a finding* — it's an assertion. Each desk run emits the source URL
  with every quote, and the dashboard renders it as a clickable citation (the `evidence` block).
- **Insight → Evidence → Implication.** A finding is not a quote; it's an *insight*, backed by
  *evidence*, with an explicit *so-what*. The "implication" line is mandatory — it's the bridge to
  strategy.
- **BLUF (bottom line up front) + two altitudes.** Each desk leads with a one-line bottom line and
  3–5 highlights (the **briefing**), then the **full research report** beneath it. Readers who want
  the headline get it; readers who want the report can read it. Don't make them choose.
- **Minto Pyramid Principle (answer-first) + SCQA** for the GTM readout (§3): lead with the
  recommendation, then the supporting arguments, then the evidence — opened with
  Situation · Complication · Question · Answer. This is how a PMM presents to stakeholders.

---

## 1. A single research desk (the two-altitude, cited view)

Every desk view in the dashboard renders in this order. (0)–(c) are the meat and should
be the bulk of the view; the artifact comes after.

| # | Section | What it contains |
| --- | --- | --- |
| 0 | **Briefing (BLUF)** | A one-line bottom line + 3–5 highlight bullets. The headline altitude. |
| a | **Scope** | Geography · timeframe/seasonality · exhaustiveness target · segment. So the reader trusts the boundary (what's in, what's deliberately out). |
| b | **Questions this desk answers** | The specialist's question set, shown as a list — the reader sees the *frame*. |
| c | **Full research report** | **Each finding as Insight → Evidence → Implication.** The evidence is a **cited `evidence` block** — verbatim quotes, each with its clickable source URL + engagement metric. Then a short Analysis. This is most of the view. |
| d | **Artifact** | The ranked table / matrix / battlecards / scorecard — built from the template, hydrated by (c). *After* the findings. |
| e | **Gaps & verify** | What was gated/unknown/blocked, what to confirm before acting. Honest, not padded. |

A desk that can't fill (b) and (c) hasn't done the research — it has a template. A desk whose
findings carry **no clickable sources** hasn't met the chain-of-evidence bar.

---

## 2. A full research readout (all desks together)

When the whole sweep is presented (the dashboard "Overview" + the desk views), it carries:

1. **Executive summary** — the 3–5 findings that change the strategy, each one-line + sourced.
2. **Scope & method** — what was researched, the geography/timeframe boundaries, which
   engines/sources ran, and **honesty about coverage** (what returned real data vs. thin/blocked).
3. **The desks** — each in the meat-first view above.
4. **Synthesis** — what the desks *together* imply: the wedge, the why-now, the risk.
5. **Evidence ledger** — the sourced backing (`.agents/research/evidence.md`), every claim a URL.
6. **Confidence & gaps** — what we're sure of, what's a hypothesis, what to verify next.

---

## 3. A go-to-market strategy / plan

Present it **answer-first (Minto)**, as a stakeholder readout. Open with **SCQA** —
*Situation* (the market reality), *Complication* (what changed / the problem), *Question*
(what should we do?), *Answer* (the recommended GTM, stated first) — then a one-screen
**recommendation**, then the supporting sections below, then the evidence appendix. A reader
should get the recommendation in the first ten seconds and be able to drill into the *why*.
This is the **GTM readout view** in the dashboard (`v-gtm-readout`), separate from the GTM desk.

The supporting sections it answers:

1. **Objective & non-goals** — the one measurable outcome; what we're explicitly *not* doing.
2. **Market & timing** — why now; the category; the wedge (from the Market + Competitive desks).
3. **ICP & segments** — primary/secondary, with the buying trigger and the JTBD (Customer desk).
4. **Positioning & message** — the one-line position + the message that travels (links the
   Positioning/Messaging work — not re-derived here).
5. **Motion** — the *how*: PLG vs sales-led vs community-led vs field; why this motion fits
   this buyer; the **land → expand** path.
6. **Channels & sequence** — ranked channels (Channels desk), what runs when, owned/earned/paid mix.
7. **Funnel & conversion** — the stages, the activation/aha moment, the metric at each stage.
8. **Pricing & packaging** — tiers, the value metric, the free→paid trigger (Pricing desk).
9. **Field & events** — the event motion, ranked (Events desk), tied to the calendar.
10. **KOLs & community** — who amplifies, the seeding plan (Analyst/KOL desk).
11. **Launch tie-in** — the launch moment as the spike inside the always-on motion.
12. **Metrics & targets** — the leading + lagging indicators, with numbers.
13. **Risks & dependencies** — what breaks it; what must be true.
14. **Timeline & owners** — phased, with who/when.

Each section **hydrates from a desk** — that's the point of the desks. A GTM with no
Channels/Events/Pricing evidence behind it is a guess.

---

## 4. A launch plan

The launch is the time-boxed event inside the GTM. Sections:

1. **Launch tier & goal** — tier (1/2/3) and the single success metric (see
   [`marketing-launch-tiers.md`](marketing-launch-tiers.md)).
2. **Narrative & angle** — the story the launch tells (the villain, the change, the promise).
3. **Audiences & messages** — per-segment message + proof.
4. **Channel plan by phase** — pre-launch (T-N) → launch day (T-0) → post-launch (T+N),
   each channel with its asset and timing.
5. **Asset checklist** — every asset (landing page, demo video, PH assets, posts, email,
   FAQ, press) with an owner and a due date.
6. **Sequence / runbook** — the day-by-day (or hour-by-hour for T-0) plan.
7. **Activation & onboarding** — what a new user must reach to be activated; how the
   launch funnels to it.
8. **Field & community moments** — events/creator drops timed to the window (Events + KOL desks).
9. **Metrics & instrumentation** — what's tracked, the activation event, the dashboards.
10. **Risks & rollback** — what could go wrong; the contingency.
11. **Post-launch loop** — how learnings feed the next cycle (post-launch-learning-loop).

---

## How this binds to the build (the hydration pipeline)

The chain-of-evidence standard is only real if the source URL survives every hop from
engine → ledger → dashboard. The deterministic pipeline:

1. **Engines emit URLs.** `last30days` already prints `URL:` per item; `reach.sh`
   `tiktok-search`/`ig-search` emit a per-post `URL:` too. Never drop them.
2. **The runner** ([`pmm-research-desk`](../../pmm-research-desk/SKILL.md)) writes the full
   findings into the ledger **and** emits a structured `report.json` at
   `.agents/research/report.json` — per desk: `objective`, `method`, `briefingBluf`,
   `highlights`, `findings[]` (each `insight` + `evidence[]{q,who,src,url,metric}` +
   `implication`), `analysis`, `gaps`; plus `events[]`, a `gtm` readout object, and a
   citation `verify` result. Quotes are verbatim; URLs are only ones that literally appeared
   in a run file (never invented).
3. **The generator** [`report-to-kit.mjs`](../../pmm-launch-kit/scripts/report-to-kit.mjs)
   turns `report.json` into the two-altitude desk views (Briefing + Full report + preserved
   Artifact), the **GTM readout** (`v-gtm-readout`), and the **Evidence appendix**
   (`v-evidence`) — using the `evidence` block so every citation is clickable.
4. **The launch kit** ([`pmm-launch-kit`](../../pmm-launch-kit/SKILL.md)) `build-kit.mjs`
   renders it; the `evidence` block (claim → verbatim → clickable source) is a first-class
   block type in the registry.
5. **The hard gate** stays: a GTM/launch deliverable can't be built until the desks that
   feed its sections (above) have run and the ledger holds their findings.

A desk view that shows highlights but no clickable evidence, or a GTM that isn't answer-first,
fails this standard — that's the thinness it exists to prevent.
