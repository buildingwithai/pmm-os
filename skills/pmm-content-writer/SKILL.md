---
name: pmm-content-writer
description: When the user wants a complete, deep piece of long-form content — a blog post, article, guide, pillar page, ebook chapter, thought-leadership/POV piece, comparison page, or customer story. Produces a finished, fully-drafted piece that hits an explicit word and depth budget, not an outline, summary, or 250-word stub. Also the depth standard other PMM OS content skills reference.
---

# PMM Content Writer

This skill exists because "write a blog post" too often returns a 250-word
outline with the headings filled in. That is not a blog post. **The job here is
a finished, deep, specific piece a real editor would accept** — drafted to a
budget, grounded in evidence, with every section developed.

If you are producing the content section of another deliverable (e.g. the blog
copy inside `pmm-feature-announcement`), apply this skill's budgets and rubric
to that section.

## The bar (read this first)

You are writing the whole thing, not describing it. Concretely:

- **Finished prose, not scaffolding.** No `## Section` headers left with a
  sentence under them. No "this section would cover…". If you write a
  placeholder, replace it with the real content before returning.
- **Hit the budget.** Every content type below has a word range and a structure
  floor. Under-writing is a failure, not concision.
- **One idea per section, fully developed.** Each H2 advances a single point
  through: claim → why it's true → a concrete example or data point →
  implication for the reader. A section that's only a claim is not done.
- **Specific beats generic, every time.** Name the tool, the number, the
  scenario, the role. "Teams struggle with onboarding" is filler;
  "a PLG team watching 60% of signups never reach the aha moment" is content.

## Length & depth budgets

Pick the row that matches the request. These are floors, not targets to dodge.

| Content type | Words | H2 sections | Examples | Data points | Other floors |
| --- | --- | --- | --- | --- | --- |
| Blog post / article | 1,200–1,800 | 4–7 | ≥2 | ≥1 | intro ≥120w; CTA |
| Pillar / ultimate guide | 2,200–3,500 | 6–10 | ≥4 | ≥3 | TOC; ≥1 table or list per major section |
| Thought-leadership / POV | 1,100–1,600 | 3–5 | ≥2 | ≥2 | one sharp thesis; a counter-argument addressed |
| Comparison / "vs" page | 1,000–1,600 | criteria-led | ≥2 | n/a | ≥1 comparison table; an honest "when to pick them" |
| Customer story / case study | 800–1,200 | problem→solution→result | ≥1 quote | ≥2 metrics | quantified outcome |
| Landing-page body | 600–1,000 | benefit-led | ≥1 | ≥1 | one CTA, repeated |
| Email (nurture/launch) | 120–250 | n/a | 1 specific | optional | short *by design* — but every line earns its place |
| Social post | platform norm | n/a | 1 hook | optional | one idea, no thread-padding |

**No section in a long-form piece may be under ~120 words.** If a point can't
carry 120 words, fold it into a neighbor or cut it.

## Workflow

1. **Lock the one idea and the angle.** What is the single thing the reader
   should believe or do after reading? Write it in one sentence. Everything
   serves it. If the request is broad, narrow it — a deep piece on one angle
   beats a shallow survey of five.
2. **Name the reader and their stage.** Role, what they're trying to get done
   (JTBD), and where they are (problem-aware vs solution-aware vs comparing).
   The depth and assumptions change with the stage.
3. **Gather the evidence before drafting.** Pull from product context,
   provided data, real examples, and credible sources. **If specifics are
   missing, ask for them or use concretely plausible ones — never paper over a
   gap with vague phrasing.** List the 4–8 evidence pieces you'll deploy.
4. **Outline to the budget.** Draft the H2s. Give each a one-line *promise*
   (what the reader gains) and note which evidence piece it carries. Confirm the
   count meets the budget's section floor.
5. **Draft section by section, to the floor.** Write each section in full using
   the section pattern below. Do not move on from a thin section.
6. **Write the intro and CTA last.** The intro earns the read (problem →
   stakes → specific promise). The CTA is one concrete next step, not "learn
   more."
7. **Run the depth rubric.** Expand anything that fails. Only then return.

## Section pattern (use for every body H2)

- **Claim** — the point of this section, stated plainly.
- **Why** — the mechanism or reason it's true.
- **Evidence** — a concrete example, scenario, number, or quote. Always present.
- **Implication** — what it means for *this reader*, now.

Transitions carry a thread: end a section by setting up the next. The "so what?"
test applies to every paragraph — if a paragraph survives without changing what
the reader thinks or does, cut it.

## Intro patterns

- **Problem → stakes → promise:** name the reader's real problem in their words,
  show what it costs, then promise the specific payoff of reading on.
- **Contrarian:** state the common belief, then the sharper truth.
- **Lead question:** a question the reader is already asking, answered by the piece.

Never open with "In today's fast-paced world", "We're excited", or a dictionary
definition.

## Depth rubric (self-check before returning)

Pass all of these. If any fail, expand — don't ship.

- [ ] Total word count is inside the budget range (not under).
- [ ] Section count meets the floor; **no section under ~120 words**.
- [ ] Every H2 develops one idea through claim → why → evidence → implication.
- [ ] Example and data-point floors are met, and they're *specific* (named).
- [ ] Intro earns the read; CTA is one concrete action.
- [ ] No filler phrases, no restated headings, no "this section covers".
- [ ] Voice and reading level are consistent throughout.
- [ ] A skeptical editor couldn't say "this is surface-level."

## Worked example — shallow vs deep

**Shallow (what to avoid):**

> ## Personalize onboarding
> Personalizing onboarding helps users get value faster. Tailor the experience
> to each user's role and needs for better activation.

That's 28 words, one unsupported claim, zero specifics. Not done.

**Deep (the bar):**

> ## Personalize onboarding to the job, not the persona
> Generic onboarding optimizes for the average user, who doesn't exist. A
> 5-step "welcome tour" that's right for an admin is noise for an end user who
> just wants to send their first message — and noise is the fastest way to lose
> someone in the first session, where most activation is won or lost.
>
> The move is to branch on the job-to-be-done, not the persona label. When a
> new user signs up, you usually know one high-signal thing: the action they
> took to get here, or the plan they chose. Use it. A user who connected an
> integration on signup should land in a flow about automating their first
> workflow; a user who invited a teammate should land in one about shared
> setup. Same product, two paths, each removing steps the other would have
> wasted.
>
> Concretely: define 2–4 entry intents, map each to the single next action that
> reaches the aha moment fastest, and measure time-to-first-value per intent
> rather than a blended average. Teams that do this routinely see first-session
> activation move because they stopped asking everyone to walk the same hallway.

Same heading. ~190 words, a claim, a mechanism, a concrete scenario, a number,
and a clear implication. That's the difference the budget enforces.

## Anti-patterns

- Returning an outline and calling it a draft.
- Padding word count with filler instead of evidence.
- Five shallow sections instead of three deep ones.
- Generic claims with no named example, number, or scenario.
- A vague "learn more" CTA.
- Hedging every sentence until the piece says nothing.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`osp-content-optimizer`](../osp-content-optimizer/SKILL.md) — tighten and optimize the draft
- [`pmm-aeo-geo`](../pmm-aeo-geo/SKILL.md) — make it citeable by AI engines
- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — publish and package it
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.

## Frameworks & deep references

Read and apply the deep frameworks below before you produce output — they carry the methodology, templates, and worked examples behind this skill (from the PMM OS framework library). Read the ones relevant to the request and *apply* them; don't paste them verbatim.

- [`messaging/storytelling-frameworks.md`](../product-marketing-os/references/library/messaging/references/advanced/storytelling-frameworks.md) — narrative frameworks for long-form
- [`messaging/04-message-architecture.md`](../product-marketing-os/references/library/messaging/references/core/04-message-architecture.md) — anchor the piece to the message house

