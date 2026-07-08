---
name: sales-enablement
description: Build sales enablement programs and artifacts — objection-handling cards (VARS), talk tracks and sales plays, sales-methodology implementation (MEDDIC/MEDDPICC, Challenger, Command of the Message, Sandler, SPIN, BANT, Gap Selling), sales playbooks, onboarding and ramp plans, the enablement charter/business case/metrics, and demo narratives. Use this to equip the sales team with what to say and run — for the one-page card against a specific competitor use pmm-battlecard; for the pitch-deck story arc and slide-by-slide narrative use pmm-sales-narrative.
---

# Sales Enablement

You equip reps with words they can say and plays they can run — and the program that keeps both fresh. 79% of teams make enablement content; only 26% of reps use it. You build for the 26%: sayable, findable, sourced, dated.

## When to use

Other skills route here on purpose: `pmm-go-to-market` for the channel-enablement workstream, `pmm-messaging-positioning` for downstream sales copy, `post-launch-learning-loop` when sales feedback is weak, `pmm-coach` when the sales handoff is the weakest row. Take the handoff and produce the enablement artifact or program plan — don't bounce it back as advice. Two boundaries: a card scoped to one competitor is `pmm-battlecard`; the pitch story arc itself is `pmm-sales-narrative` — this skill arms both.

## Workflow

1. Read product context (`.agents/product-marketing.md`), current positioning, and the research evidence ledger (`.agents/research/evidence.md`). Never invent product facts or buyer objections.
2. Identify what's being asked for: an **artifact** (objection cards, talk track, sales play, playbook, demo narrative) or a **program** (charter, business case, team structure, onboarding/ramp, metrics). Read the matching library chapters below before producing anything.
3. Ground every talk track and objection response in sourced VoC — buyer verbatims from the ledger, call notes, win/loss reads. An objection with no source gets a `Needs research` flag, never an invented rebuttal.
4. Handle every objection with **VARS**, the house framework — Validate → Acknowledge → Reframe → Specify, exactly:
   - **Validate** — affirm the concern is legitimate ("That's a fair question"). Never follow with "but".
   - **Acknowledge** — restate the underlying issue in your own words; surface the real objection behind the stated one.
   - **Reframe** — shift the evaluation lens (the criteria, the comparison set, or the time horizon — e.g. cost of inaction) to the ground where your differentiation wins.
   - **Specify** — answer with ONE concrete proof point (a number, a named-customer story, a benchmark) tied to the reframed issue, then propose a specific next step.
   Per objection, document: the validate phrase, the acknowledge probe, 2–3 reframes, and the specific proof.
5. For methodology work (MEDDIC/MEDDPICC, Challenger, Command of the Message, Sandler, SPIN, BANT, Gap Selling, Miller Heiman), work from the methodologies chapter and adapt the chosen methodology to this product's deal motion, personas, and proof — never a generic textbook summary.
6. Render every deliverable as a one-pager per the [deliverable standard](../product-marketing-os/references/deliverable-standard.md): action-title headings, answer first, word-for-word sayable language, one page per play, the right line findable in 10 seconds, owner + last-verified date on every card.
7. Run `pmm-coach` review before anything ships to sales leadership or the field.

## Output

Save the artifact the request calls for (one page each, per the deliverable standard):

- `objection-cards-[topic].md` — one card per objection: the objection in the buyer's own voice, then the VARS response (validate phrase, acknowledge probe, 2–3 reframes, one proof, next step)
- `talk-track-[moment].md` — trigger/when to use, opener in buyer language, 2–3 core points mapped to message pillars, one proof per claim, a check question to hand the mic back, objection pivots, the CTA — per the talk-track template
- `sales-play-[name].md` — objective, trigger conditions (stage, persona, signal), word-for-word script with variants, real call/email examples, red flags, follow-up content
- `demo-narrative-[product].md` — Tell-Show-Tell segments tied to persona pains and business outcomes
- `sales-playbook-[segment].md`, `enablement-charter.md`, `enablement-business-case.md`, `onboarding-ramp-plan.md`, `enablement-metrics.md` — per the matching library chapters
- `methodology-rollout-[name].md` — the chosen methodology mapped to this product's fields, questions, and exit criteria, with the adoption plan

Every artifact carries an owner and a last-verified date, and flags every unsourced claim.

## Quality bar

The failure mode is the graveyard library — content reps never open. Everything must be **sayable** (a rep can read it aloud mid-call; rebuttals are one sentence), **findable** (one page per play; the right line in under 10 seconds), **sourced** (objections from real calls and the ledger, never imagined; every claim has a proof point or a `Needs research` flag), and **fresh** (owner + date; stale plays get killed, not kept). Program docs (charter, business case, metrics) must carry numbers a CFO would check, not aspiration.

## Worked example

No dedicated sales-enablement gold example ships yet — match the bar of [`examples/03-battlecard.md`](../product-marketing-os/references/examples/03-battlecard.md): that is the sayability, honesty-about-losses, and proof level every objection card and talk track must hit. Match the standard, don't copy the content.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-battlecard`](../pmm-battlecard/SKILL.md) — the competitor-specific card, armed with these objection responses
- [`pmm-sales-narrative`](../pmm-sales-narrative/SKILL.md) — fold the talk tracks into the pitch arc and deck
- [`pmm-outreach`](../pmm-outreach/SKILL.md) — seed the plays and objection handling into outbound
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Depth

Apply the [PMM OS output-depth standard](../product-marketing-os/references/output-depth-standard.md): every section must be **specific** (named personas, real objections, numbers — not "buyers"/"concerns"/"value"), **complete** (the real dimensions, not just the first), **reasoned** (the why and the trade-off), and **evidenced** (a proof or a named proof-gap). Depth is not length — do not pad, but never reduce a section to one generic line. Self-check each section before returning.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`sales-enablement/01-sales-enablement-foundations.md`](../product-marketing-os/references/library/sales-enablement/references/core/01-sales-enablement-foundations.md) — what enablement is, maturity models, business-impact benchmarks
- [`sales-enablement/02-building-business-case.md`](../product-marketing-os/references/library/sales-enablement/references/core/02-building-business-case.md) — the business case that funds the program
- [`sales-enablement/03-enablement-charter.md`](../product-marketing-os/references/library/sales-enablement/references/core/03-enablement-charter.md) — the charter: mission, scope, governance
- [`sales-enablement/04-team-structure-roles.md`](../product-marketing-os/references/library/sales-enablement/references/core/04-team-structure-roles.md) — team structure and roles
- [`sales-enablement/05-objection-handling-vars.md`](../product-marketing-os/references/library/sales-enablement/references/core/05-objection-handling-vars.md) — VARS + LAER/LAARC: the house objection frameworks in full
- [`sales-enablement/06-sales-playbooks.md`](../product-marketing-os/references/library/sales-enablement/references/core/06-sales-playbooks.md) — playbook structure
- [`sales-enablement/07-battle-cards-competitive-intelligence.md`](../product-marketing-os/references/library/sales-enablement/references/core/07-battle-cards-competitive-intelligence.md) — making battlecards sales-usable
- [`sales-enablement/09-sales-methodologies.md`](../product-marketing-os/references/library/sales-enablement/references/core/09-sales-methodologies.md) — the 1,010-line methodologies chapter: MEDDIC/MEDDPICC, Challenger, Command of the Message, Sandler, SPIN, BANT, Gap Selling, Miller Heiman
- [`sales-enablement/11-sales-onboarding-ramp-up.md`](../product-marketing-os/references/library/sales-enablement/references/core/11-sales-onboarding-ramp-up.md) — onboarding and ramp acceleration
- [`sales-enablement/18-enablement-metrics-kpis.md`](../product-marketing-os/references/library/sales-enablement/references/core/18-enablement-metrics-kpis.md) — enablement metrics, KPIs, and ROI reporting
- [`sales-enablement/talk-track-card-template.md`](../product-marketing-os/references/library/sales-enablement/assets/templates/talk-track-card-template.md) — the standalone talk-track template to fill
