# PMM OS — Research Desks

A **research desk** is a domain of PMM research, owned by a senior specialist's
head. Instead of "do some research," you **run a desk** — the Events Desk, the
Competitive Desk, the Customer Desk — each with a specialist's question set, an
engine fan-out plan, a sourced slice of the evidence ledger, and a **structured
artifact** that lands in the dashboard.

This is how research scales across product marketing: one product/feature, many
desks, one evidence base, many artifacts — and strategy is **gated** on the desks
that feed it (see *Hard gate* below).

**The front door is [`pmm-research-brief`](../../../pmm-research-brief/SKILL.md).** A user
rarely hands you clean parameters — they dump a product and a goal in one breath. The
brief skill distills that ramble into a Product Brief + a Research Plan and runs the desks
here. The plan is a **complete, mandatory sweep across all ten desks** — the brief sets
each desk's *scope* (named entities) and the *run order*, never whether to skip a
discipline. A thorough PMM researches all of it; that's the floor for an impeccable launch.

**Before any run, know what's live:** `bash scripts/verify-research.sh --smoke` reports
each engine's active sources and the free fixes to unlock more. The honest capability map
(keyless vs. needs-setup, per engine + platform) is in
[`../research-engines.md`](../research-engines.md). The keyless surface alone
(Reddit/HN/Polymarket/GitHub via last30days; GitHub/web/V2EX/RSS/YouTube via
`agent-reach/scripts/reach.sh`) does real work on a fresh install.

## Anatomy of a desk (every recipe declares these)

1. **Lens** — the senior specialist whose questions drive it (event marketing
   manager, competitive-intelligence analyst, customer researcher, …).
2. **Scope** — the parameters it's constrained to. **More than entities: a scope is
   adaptive and multi-dimensional**, and the brief sets it per product + strategy (see
   [`research-scope-model.md`](../research-scope-model.md)):
   - **Subject** — `{product}`, `{ICP/segment}`, `{market}`, the named entities
     (competitors, communities, candidate events).
   - **Geography** — at the right *granularity*: county → metro → state → region →
     national → international. A local service business is one county; a global SaaS is
     "international, but field events cluster by region." The desk filters to in-geo and
     *ignores* out-of-geo.
   - **Timeframe / seasonality** — the launch window **and** the calendar shape: is this
     annual? which quarters carry the events/buying cycle (Q3 campus recruiting, Q4
     budget, Q1 kickoff…)? The desk only counts items inside the window that fits.
   - **Exhaustiveness target** — *how many* in-scope items a good answer surfaces (e.g.
     "≥15 events across the metro," "the full competitor set, not the top 3"). A handful
     when the scope holds dozens is a **failure**, not a finding (see the rule below).
   - **Constraints** — budget band, B2C-vs-B2B, channel/regulatory limits.
   Research is *scoped*, never generic — but scope means *focused **and** complete within
   the focus*, not *thin*.
3. **Question set** — the canonical questions that specialist asks.
4. **Engine fan-out** — how each question decomposes into engine calls. Neither
   engine takes a batch of questions: `last30days` = one topic per run (deep
   multi-source fan-out within it; comparisons in one run); `agent-reach` = one
   query/URL per call (fire many). The desk runner turns the question set into
   ~15–30 calls, runs them in parallel, and aggregates. **That decomposition is the
   work** — see each recipe's "Engine fan-out" table. Every `last30days` call **selects
   its sources** (`--search=…`) to the ones that carry signal for that desk and is
   wrapped in an outer `timeout` — so one rate-limited source (YouTube transcripts are
   the usual culprit) can never hang the sweep. Every call is tagged to a leaf of
   `.agents/research/issue-tree.md` — the **Plan gate**: no engine call before
   `hypothesis.md` + `issue-tree.md` exist
   ([deliverable-standard §5](../deliverable-standard.md#5-pipeline-gates-where-this-binds)).
5. **Evidence target** — the `.agents/research/evidence.md` section(s) it writes,
   sourced (every claim keeps its URL). Write the **full findings** here — each question
   answered with its evidence — not a one-line summary; the dashboard hydrates from this,
   so thin evidence ⇒ a thin dashboard. See
   [`../research-context-pipeline.md`](../research-context-pipeline.md). Claims are typed
   (fact / estimate / assumption) and capture-dated; the structured shape they land in is
   the [report contract](../report-contract.md).
6. **Artifact** — the structured, ranked, exportable deliverable (a table + CSV, a
   matrix, a scorecard). Built from a template, hydrated by the evidence. **The artifact
   is the *end* of the desk, not the whole of it** (see Presentation).
7. **Presentation** — how the desk lands in the dashboard. Every desk view is
   **meat-first**, in this order (the standard:
   [`../research-presentation-standard.md`](../research-presentation-standard.md)):
   **(a) Scope** — what we constrained to (geo · timeframe · target) so the reader trusts
   the boundaries; **(b) Questions this desk answers** — the specialist's question set,
   shown; **(c) Findings** — each question answered *in depth*, every claim sourced (this
   is the meat — most of the view); **(d) the Artifact** — the ranked table / matrix /
   battlecards, *after* the findings; **(e) Gaps & verify** — what was gated/unknown.
   A view that is only the artifact + a callout is **incomplete** — that's the thinness
   this standard exists to prevent.

### The platform-coverage rule (no silent caps)

Each recipe declares a **platform matrix**: which platforms (Reddit · X · HN · GitHub ·
YouTube · TikTok · Instagram · web/SERP · review sites · …) × which query archetypes carry
signal for *that* desk. The default per desk class:

- **Text-pain desks** (customer, competitive, market, pricing, reviews): Reddit · X ·
  HN · GitHub · web/SERP · review sites — YouTube *search titles/comments* ok, transcripts
  excluded (rate-limit sink).
- **Creator/discovery desks** (channels, analyst-KOL, events, gtm): all of the above
  **plus** YouTube · TikTok (`tiktok-search`) · Instagram (`ig-search`) — creators and
  events live where the text desks don't look.
- **Product desk**: first-party surfaces (site, docs, repo, changelog, store listing).

The desk run **walks every cell of its matrix or logs why a cell was skipped** in the
Gaps block ("IG not signed in — one-time `ig-login` fix", "no TikTok signal for
enterprise-infra ICP — 2 probe searches empty"). An unexplained empty cell reads as
"covered" when it wasn't — that's the silent cap this rule exists to prevent.

### Desk sprints — sequence and carry forward

Desks run as **sprints, not one batch**: each desk opens with its own **mini-hypothesis**
(5 lines: likely answer + what would kill it — appended to
`.agents/research/hypothesis.md` under a `### Desk: {name}` heading) and closes by
appending a **carry-forward block** to `.agents/research/carry-forward.md`: the 3–5
findings that should **re-scope the next desks' queries** (product findings name the
category the market desk searches; customer verbatims become the exact phrases the
competitive/reviews desks grep for; competitive findings name the pricing pages). The
next desk **reads carry-forward at scope time** and adjusts its entities/queries — that
is what makes the sweep compound instead of nine parallel guesses.

### The exhaustiveness rule

Within scope, **be comprehensive**. If the scope is "career events across LA County +
Long Beach + San Diego, all quarters," surfacing five is a fail — push the engines (more
listicle reads, more `"<category> conferences <city> <year>"` searches, regional
round-ups, per-quarter sweeps) until you've found the in-scope set (target ≥ the recipe's
number) or can show you exhausted the sources. Breadth within the boundary is the job;
the boundary is what the scope gives you.

## The desks

All ten desks ship as full recipes and are **mandatory** in a research plan — the brief
scopes each, it doesn't skip any. Each artifact is built from a **real template the skills
already carry** (linked in each recipe), hydrated by the evidence ledger.

| Desk | Lens | Evidence section | Artifact (built from template) |
| --- | --- | --- | --- |
| [**product**](product.md) ✅ | PMM | context spine · `## Proof points` | capability / JTBD map (`value-proposition-canvas`, `product-marketing-context-template`) |
| [**customer**](customer.md) ✅ | customer researcher | `## Pains & VoC` · `## ICP signals` | persona one-pagers + ICP + pain board (`persona-one-pager`, `icp-analysis-worksheet`) |
| [**competitive**](competitive.md) ✅ | CI analyst | `## Competitive` | competitor matrix + battlecards (`battlecard-template`, `competitor-profile-template`) |
| [**market**](market.md) ✅ | strategist | `## Market & timing` | category brief: SWOT · Porter · PESTEL (`strategic-analysis-frameworks`) |
| [**pricing**](pricing.md) ✅ | pricing strategist | `## Proof points` (+ competitive) | comparables matrix + value-metric + tiers (`pricing-tier-comparison-matrix`, `value-metric-selection-worksheet`) |
| [**channels**](channels.md) ✅ | demand-gen lead | `## ICP signals` · `## Channels & KOLs` | ranked channel / community map (`account-research-template` + GTM signals) |
| [**analyst-influencer**](analyst-influencer.md) ✅ | AR / community | `## Channels & KOLs` | ranked KOL / influence map |
| [**events**](events.md) ✅ | event marketing manager | `## Events & field marketing` | ranked events table + `events.csv` (`events-table-template`) |
| [**gtm**](gtm.md) ✅ | GTM / launch strategist | `## GTM & launch motion` | launch-motion brief + tactics map (`go-to-market-plan-template`, `launch-tier-framework`) |
| [**reviews**](reviews.md) ✅ | review-mining analyst | `## Reviews & ratings` (→ VoC + competitive) | objection bank + ratings comparison table + switching-language board |

Adding the next desk is **one recipe file**, not a new system — that's the point of the
desk model. The `pmm-research-desk` runner, the ledger, the hard gate, and the launch-kit
rendering already exist.

## Artifacts are produced from the skills' own templates

A desk's artifact is not invented — it's generated from a **template the skills
already reference**, hydrated by the evidence ledger. The plugin already carries 38
such templates (battlecards, positioning/value-prop canvases, persona one-pagers,
pricing matrices, RACI, launch-deliverable matrix, …). The desks feed them; the
skills fill them; the launch-kit renders them. The events table template lives at
[`../../assets/events-table-template.md`](../../assets/events-table-template.md).

## Hard gate (research-first)

A strategy/GTM/launch deliverable may not be produced until the desks that feed it
have run and the evidence ledger holds their sections. Concretely:

- **GTM / launch plan** requires the **comprehensive sweep**: `## Pains & VoC` +
  `## Competitive` + `## Market & timing` + `## Channels & KOLs` + `## Events & field
  marketing` + `## GTM & launch motion`. An impeccable launch is built on all of it — a
  partial ledger blocks.
- **Positioning / messaging** requires `## Pains & VoC` + `## Competitive` + `## Market & timing`.
- **Pricing** requires `## Proof points` / competitive pricing evidence.

If a required section is missing, **stop and run the desk first** (or the whole sweep via
`pmm-research-brief`) — don't build the deliverable on guesses. The `stop_quality_gate`
hook enforces this; the `user_prompt_submit` hook reminds upstream. Override only on an
explicit user "proceed without research."
