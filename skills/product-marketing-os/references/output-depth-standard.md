# PMM OS — Output Depth Standard

The canonical depth bar for **every** PMM OS deliverable and **every section
within it**. The `user_prompt_submit` hook injects a short version of this on
every PMM request; this is the full reference. Skills should point here rather
than re-explaining depth.

## The failure mode this prevents

The default failure is **bare-minimum output**: a section reduced to one generic
line, or a heading with a single sentence under it. A positioning "statement"
that's just a tagline. A value prop with no proof. A persona that's a label.
That output technically fills the template and is useless.

## The bar — every section must be

- **Specific.** Name the actual alternatives, segments, numbers, and scenarios.
  Never "competitors", "users", "teams", or "better" — say *which*, *who*,
  *how much*. "Faster onboarding" is filler; "cuts time-to-first-value from
  ~6 steps to 2 for self-serve users" is content.
- **Complete.** Cover the real dimensions of the section, not just the first.
  Positioning is alternatives + unique attributes + value + segment + category —
  each reasoned — not a tagline. A pricing recommendation is the value metric +
  the tiers + the gating logic + the migration risk, not a number.
- **Reasoned.** Show the thinking: the *why*, the trade-off, the alternative you
  considered and rejected. A conclusion with no reasoning is an assertion.
- **Evidenced.** Every claim carries a proof, an example, or a source. If you
  don't have one, **name the proof that's needed** so it can be sourced — don't
  paper over the gap with confident vagueness.
- **Decision-useful.** Someone could act on it tomorrow.

## Depth is not length

This is the important nuance. A positioning statement is two sentences; a value
prop is one; a tagline is five words. **Do not pad to hit a word count.** But
within whatever length a section deserves, it must be specific, complete,
reasoned, and evidenced. The test isn't "is it long" — it's *"could a skeptical
PMM say this is surface-level?"* If yes, the thinking is thin; go deeper.

(For genuinely long-form deliverables — blog posts, guides, articles — see
`pmm-content-writer`, which adds explicit word and structure budgets on top of
this bar.)

## The one-line test

If any section is a single generic line, it is not done. Either expand it with
specifics, reasoning, and proof, or fold it into a section that can carry it.

## Worked example — bare-minimum vs substantive (a positioning section)

**Bare-minimum (what to avoid):**

> **Differentiator:** We're easier to use and more affordable than competitors.

Three vague claims, zero specifics, no proof, no named alternative. Useless.

**Substantive (the bar):**

> **Unique attributes vs. the real alternatives.** Buyers in this segment weigh
> three options: an enterprise suite (Acme), a point tool (Beam), and "keep
> doing it in a spreadsheet." Against Acme, our edge is *time-to-value* — a team
> ships their first workflow in an afternoon vs. a multi-week onboarding,
> because there's no implementation project (proof: median first-value is day 1
> in our onboarding data). Against Beam, it's *breadth* — we cover the next three
> steps Beam punts to other tools, so the team doesn't stitch five products
> together. Against the spreadsheet, it's *not losing the work when someone
> leaves* — the spreadsheet's "free" hides a real maintenance and key-person
> cost. We are NOT cheaper than Beam, and we shouldn't claim to be; we win on
> consolidation, not price.

Same job, real depth: named alternatives, a specific edge per alternative, proof
or a named proof-gap, and an honest "where we don't win."

## Self-check before returning

Run this on the whole deliverable:

- [ ] Every section is specific (named examples/numbers), not generic.
- [ ] Every section is complete (covers the real dimensions, not the first).
- [ ] Every claim is reasoned and carries a proof or a named proof-gap.
- [ ] No section is a one-line stub; nothing is padded either.
- [ ] A skeptical senior PMM couldn't call it surface-level.

If any fail, expand the thin sections — don't ship the bare minimum.
