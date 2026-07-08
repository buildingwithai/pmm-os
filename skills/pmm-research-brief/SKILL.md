---
name: pmm-research-brief
description: The research front door. Turn a messy product brain-dump or ramble ("I have a product called X, it does A/B/C, I want to launch it and take it to market") into a structured Product Brief plus a COMPLETE, MANDATORY Research Plan across every PMM discipline — all ten desks: product, customer, competitive, market, pricing, channels, analyst/KOL, events, reviews, and GTM/launch motion. Use FIRST whenever a user describes a product/feature and a goal (launch, GTM, positioning, "take it to market") before any research or strategy. It distills the ramble and scopes each desk with named entities, then runs them all. Nothing is optional — a thorough PMM researches all of it. Hands off to pmm-research-desk.
---

# PMM Research Brief — the research front door

A user rarely hands you clean parameters. They dump a product, ten features, and a
goal in one breath. Your job is to **distill that ramble into a complete research plan
the pipelines can run**: extract the product, infer the ICP and market, and **scope every
research discipline** with named entities — so `pmm-research-desk` can execute the full
sweep and the rest of PMM OS hydrates from real evidence.

Research is **comprehensive and mandatory**, not pick-and-choose. An impeccable launch
needs customer + competitive + market + pricing + channels + analyst/KOL + **events** +
**GTM/launch motion** + product — all of it, the way a real PMM works. You decide each
desk's *scope* and the *run order*; you never decide whether to skip a discipline.

This runs **before** research and strategy. It produces the plan; it doesn't (yet)
produce positioning or a launch — that comes after the desks return evidence.

## Workflow

1. **Capture the input** — the user's description plus any docs/URL/repo they point to.
   Read `.agents/product-marketing.md` if it exists. Don't ask for what's already there.
2. **Distill the Product Brief** from
   [`../product-marketing-os/assets/research-brief-template.md`](../product-marketing-os/assets/research-brief-template.md):
   product name, one-line what-it-is, what it does, key features (deduped to capabilities),
   **ICP hypothesis** (segment · seniority · company type), **market/category**, the
   **goal/motion** (launch? GTM? positioning?), constraints, and **explicit unknowns**.
   Infer where reasonable, but **mark every inference as a hypothesis to verify** — never
   assert invented facts (that's the whole point of researching them).
3. **Set the Scope — adaptively.** Before planning desks, decide *which scope dimensions
   actually constrain this product* and at what granularity, per
   [`../product-marketing-os/references/research-scope-model.md`](../product-marketing-os/references/research-scope-model.md):
   **geography** (county → metro → region → national → international — name the places when
   tight), **timeframe & seasonality** (the launch window + which quarters carry the
   signal; annual vs one-off), **exhaustiveness targets** (events ≥ 12–15 in-geo,
   competitors = the full set, channels/KOLs ≥ 10), **segments** (B2C/B2B), and
   **constraints** (budget, regulatory). These are **user/strategy-dependent** — a local
   service business is one county; a global SaaS is "international, events cluster by
   region." **Ask the user the few that genuinely change the research** (e.g. "Which
   geography and time of year should events cover?") rather than guessing; infer the rest
   and mark inferences. Write a `## Scope` block into `.agents/research/brief.md` — every
   desk reads it.
4. **Build the Research Plan — distill, then scope ALL of it.** The plan is a **complete,
   mandatory sweep across all ten desks**
   ([`../product-marketing-os/references/research-desks/README.md`](../product-marketing-os/references/research-desks/README.md)):
   product, customer, competitive, market, pricing, channels, analyst/KOL, **events**,
   **reviews**, and **GTM/launch motion**. For each desk you **scope it with named entities** (candidate
   competitors, the segment, the market, the events, the specific questions) and set a **run
   order** by dependency — but you **do not skip any**. This is where a ramble becomes engine
   parameters: you name "research Amplitude, Mixpanel, PostHog" so the Competitive Desk has targets,
   "segment = PMs at self-serve SaaS" so the Customer Desk is scoped, and "PM meetups +
   SaaStr + data conferences" so the Events Desk knows where to look. Events is **always**
   in — the question is *which* events, never *whether*. Each desk also inherits the
   `## Scope` (geo · timeframe · exhaustiveness target) from step 3.
5. **Pass the Plan gate — hypothesis + issue tree BEFORE any engine call.** Research here
   is hypothesis-driven, not exploratory drift (the standard:
   [deliverable-standard §1 #4–6 and §5 gate 1](../product-marketing-os/references/deliverable-standard.md)).
   **Precondition — ground the product first.** If the product has a codebase, a live app, or
   founder artifacts (demo scripts, decks, planning sheets), run
   [`pmm-product-context` Stage 0](../pmm-product-context/SKILL.md) and produce
   `.agents/research/product-grounding.md` *before* writing the hypothesis — a day-1 hypothesis
   about a mis-defined product poisons every desk downstream. The hypothesis and issue tree are
   written **about the grounded product** (shipped capabilities, real gating, the
   intent-vs-implementation gaps), never about the founder's unverified description.
   Write two artifacts into `.agents/research/`:
   - **`hypothesis.md`** — the day-1 hypothesis: *"Likely answer: X, because A/B/C"* plus
     the **disconfirming evidence that would kill it**, named. As desk findings land they
     score **supporting / refuting / neutral** against it, and pivots are **logged in this
     same file — append, never overwrite** — so a defensible current-best-answer exists at
     every point of the run.
   - **`issue-tree.md`** — a **MECE issue tree** decomposing the goal: 2–4 branches per
     level, open what/how/why questions, leaves testable by an engine call. Score every
     leaf **priority = impact-on-answer × evidence-availability**, then write the depth
     allocation: deep leaves get the multi-engine fan-out, low-priority leaves get one
     quick pass, and de-scoped leaves are **named as "not investigated"** — never silently
     dropped.
   Every desk run maps its engine calls to tree leaves. **No engine call happens before
   both files exist** — this is the pipeline's Plan gate, and `pmm-research-desk` checks it.
6. **Write `.agents/research/brief.md`** (the Product Brief + `## Scope` + Research Plan)
   and seed the context spine via `pmm-product-context`.
7. **Confirm, then run.** Research can be long and (for some sources) metered, so show the
   brief + scope + plan and the desks you'll run, in priority order. On "go" (or if the user
   already said run it), hand each planned desk to `pmm-research-desk` highest-priority first.
   **Desks run as a sequence of sprints, not one batch**: each desk opens its own
   mini-hypothesis, and closes by appending re-scoping findings to
   `.agents/research/carry-forward.md`, which the next desk reads at scope time (see the
   README's *Desk sprints* rule) — so the run order you set is also the learning order.
   As evidence accrues in the ledger, the hard gate on downstream strategy is satisfied.

## Output

- **Product Brief** — the distilled understanding, hypotheses marked.
- **`## Scope`** — geography (+ granularity) · timeframe/seasonality · exhaustiveness
  targets · segments · constraints, adapted to this product. The desks filter and pursue
  against this.
- **Research Plan** — a ranked desk-by-desk table: relevance · scoped entities · key
  questions · which engines/sources. This is the bridge from ramble → pipeline.
- **The Plan-gate artifacts** — `.agents/research/hypothesis.md` (day-1 hypothesis +
  disconfirming evidence + the append-only pivot log) and `.agents/research/issue-tree.md`
  (the scored MECE tree + depth allocation). No desk may fire an engine call before both exist.
- The queued desk runs (or the executed ones, if the user said go).

## Worked example (a real ramble → brief + plan)

> *"I have a product called Plotline — self-serve product analytics PLUS a shared metrics
> layer. Any PM can ask a product question in plain English and get the funnel or cohort
> in minutes instead of filing a ticket for the data team and waiting days. It keeps one
> definition of 'activated' so teams stop arguing about whose number is right. I want a
> successful launch + GTM."*

**Brief:** Plotline — self-serve **product analytics + a shared metrics layer**. Core job:
stop waiting days in a data-team queue for product answers (plain-English questions →
funnels/cohorts in minutes, no SQL) + one shared definition of activation so every team
reads the same number. ICP hypothesis: PMs/PMMs at product-led SaaS teams without a large
data org; possible motion to heads of data (deflect the self-serve question queue). Market:
product analytics. Goal: launch + GTM. *Unknowns: PLG-only vs. also sales-assisted, pricing,
the real competitive set, the primary channel.*

**Scope (ask the user the few that move the research):** *Geography* — the product is
online (PLG), so channels skew digital/global; but **field events cluster by city**, so
ask "which metros?" (e.g. SF Bay Area, NYC, Austin). *Timeframe* — launch
window + the conference calendar (Q3 SaaS conferences, Q1 planning cycles). *Exhaustiveness* —
events ≥ 15 in-geo, the **full** competitor set (not top-3), channels/KOLs ≥ 10.
*Segments* — PMs/PMMs at self-serve SaaS (primary) + heads of data (secondary).

**Plan (all ten, scoped — nothing skipped):**
- **Product** 🟢 — confirm Plotline's capabilities/differentiators from its docs.
- **Customer** 🔴 — PM/PMM pains around data-team queues (r/ProductManagement, r/analytics, PM Slack communities); + head-of-data pains for the deflection angle.
- **Competitive** 🔴 — Amplitude, Mixpanel, PostHog, Heap, June, Pendo, dashboards-in-BI (Looker, Metabase) (incl. their self-serve/AI-query features).
- **Market** 🔴 — product-analytics category; why-now: data-team backlogs, AI natural-language querying, dashboard sprawl.
- **Pricing** 🟡 — Amplitude / Mixpanel / PostHog free-tier + MTU/event-based models.
- **Channels** 🔴 — r/ProductManagement, Product Hunt, LinkedIn, PM newsletters (Lenny's), data-tool communities.
- **Analyst/KOL** 🟡 — PM/analytics creators (Lenny Rachitsky, product-analytics voices on LinkedIn/YouTube).
- **Events** 🔴 — product-management meetups (city), **SaaStr**, ProductCon, analytics/data conferences, launch-week showcases; B2B if selling to data leads: **dbt Coalesce, Data Council** — *where you can table, sponsor, or speak.*
- **Reviews** 🔴 — G2/Capterra/TrustRadius pages for Amplitude, Mixpanel, PostHog, Heap, Pendo (dislike fields + switching reviews); Glassdoor for org-health CI on the top 2.
- **GTM/Launch** 🔴 — how Amplitude/Mixpanel/PostHog launched (Product Hunt, open-source communities, free tiers), PLG-vs-sales motion, activation moment, launch-day plan.

Run order: Product → Customer → Competitive → Reviews → Channels/Events/GTM → Market/Pricing/KOL.
The full sweep — every discipline a PMM owns plus the GTM/launch motion. None skipped.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at a plan. Pass the work on:

- [`pmm-research-desk`](../pmm-research-desk/SKILL.md) — run each planned desk
- [`pmm-product-context`](../pmm-product-context/SKILL.md) — seed the context spine
- [`product-marketing-os`](../product-marketing-os/SKILL.md) — the full chain after evidence lands.
