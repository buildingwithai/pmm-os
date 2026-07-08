# Voice & Tone Template

**Purpose:** Make the product sound like one person everywhere (voice) while flexing appropriately to the moment (tone). Voice is constant; tone moves with context — the same brand should not sound identical in a celebration and an error message.

**When to use:** Once per brand/product, after the [message house](message-house-template.md) exists (voice expresses the messaging; it doesn't replace it). Revisit when new surfaces appear (support, social, in-product) or when copy from different teams stops sounding like the same company. This is the "walls" layer of the message house.

**Time to complete:** 2-4 hours for the first pass; the do/don't pairs are the slow, valuable part.

**Framework:** 3-4 voice attributes with "we are / we are not" definitions and do/don't pairs (the Mailchimp-style guide), plus the NN/g four tone dimensions (funny↔serious · formal↔casual · respectful↔irreverent · enthusiastic↔matter-of-fact) mapped per context.

## Instructions

1. Derive attributes from positioning, not aspiration. "Bold" and "human" are what every brand writes; ask instead: *what must we sound like for our specific claim to be believed?*
2. Give every attribute a "we are not" twin. An attribute without a named failure mode ("confident, not arrogant") cannot be enforced.
3. Write real do/don't pairs — actual sentences from your surfaces, not invented strawmen. The don'ts teach more than the dos.
4. Place the brand on all four NN/g dimensions, then build the tone map: the 4-6 recurring contexts where tone must shift, with a rewritten example each.
5. List vocabulary: words we use, words we never use — with reasons. Include claim-discipline words (superlatives you haven't earned yet).
6. Enforce it in the [messaging audit](messaging-audit-checklist.md); an unenforced voice guide is decoration.

---

## The Framework

### Voice attributes (3-4)

**Attribute 1: [Name]**
- **We are:** [definition in one sentence]
- **We are not:** [the adjacent failure mode]
- **Do:** "[real example sentence]"
- **Don't:** "[real counter-example]" — [why it fails]

**Attribute 2-4:** [same structure]

### Tone dimensions (NN/g) — where the brand sits

| Dimension | Position (mark it) | Rationale |
|---|---|---|
| Funny ↔ Serious | [e.g., serious, warm edges] | [...] |
| Formal ↔ Casual | [...] | [...] |
| Respectful ↔ Irreverent | [...] | [...] |
| Enthusiastic ↔ Matter-of-fact | [...] | [...] |

### Tone map by context

| Context | Tone shift | Example (rewritten in that tone) |
|---|---|---|
| [Moment 1 — e.g., success/celebration] | [...] | "[...]" |
| [Moment 2 — e.g., error message] | [...] | "[...]" |
| [Moment 3 — e.g., pricing/upgrade] | [...] | "[...]" |
| [Moment 4 — e.g., sensitive/bad news] | [...] | "[...]" |

### Vocabulary

**Words we use (and why):** [...]
**Words we never use (and why):** [...]
**Naming & capitalization:** [product/feature casing rules]

### Grammar & mechanics

- [Sentence case vs title case; contractions; exclamation policy; emoji policy; number formatting]

---

## Filled example — Plotline

*Voice derived from the trust problem (a plain-English answer is only valuable if it's believed — the top objection in every call is "can it be trusted?") and the ICP's emotional state (blocked, tired of waiting on the queue, tired of arguing about whose number is right). That combination, not brand taste, dictates everything below.*

### Voice attributes

**Attribute 1: Transparent, not magic**
- **We are:** the tool that shows its work — every answer carries the generated query and the metric definition it used.
- **We are not:** AI-magic vague; a black box asking to be trusted.
- **Do:** "Here's the funnel — and the exact query and the definition of 'activated' behind it."
- **Don't:** "Our AI-powered engine instantly surfaces game-changing insights." — zero checkable facts; could be any tool (fails the competitor swap) and feeds the exact distrust objection we face.

**Attribute 2: On the asker's side — never against the data team**
- **We are:** on the side of the person with the question; we validate the "everything is a ticket" frustration and remove a cause of it. The villain is the queue, not the people in it.
- **We are not:** data-team-bashing. Sam (Head of Data) is a blocker we convert into a champion — "Plotline takes the self-serve 'why' questions off your queue" — never a target.
- **Do:** "The common 'why' questions come off the data team's queue — so they do the modeling only they can."
- **Don't:** "Stop waiting on your data team — cut out the bottleneck." — turns a convertible stakeholder into an enemy, and overclaims (we don't replace the warehouse).

**Attribute 3: Plain-spoken and concrete**
- **We are:** specific to the answer — metric names, minutes, definitions. The interface language IS the marketing language.
- **We are not:** category-buzzword hollow. No "revolutionize your analytics workflow," no "democratize data" without a number attached.
- **Do:** "Median first answer in beta: 4 minutes. 71% of active users write no SQL."
- **Don't:** "Empower every team member with actionable, democratized analytics." — could have headlined any analytics homepage in the last decade (fails the competitor swap).

**Attribute 4: Honest about limits**
- **We are:** careful with claims — Ask covers the common question types (funnels, cohorts, retention, segmentation); deep, novel modeling still belongs to the data team, and we say so. Superlatives ship only with verification in hand.
- **We are not:** outcome-promising or prematurely superlative — "the only analytics tool that…" is banned copy until the rival AI-feature sweep closes (per the research gate), and "ask anything" is banned until the accuracy guardrail extends past the common types.
- **Do:** "For warehouse-deep modeling you still want your data team. Plotline clears their queue of everything else."
- **Don't:** "The only tool that answers any question about your product — guaranteed." — unverified "only" + unscoped accuracy + an outcome we don't control.

### Tone dimensions

| Dimension | Position | Rationale |
|---|---|---|
| Funny ↔ Serious | Serious, warm edges | The subject is workplace credibility — someone will cite our number in a QBR. Jokes cost trust; dry warmth ("that's one ticket you didn't file") is the ceiling. |
| Formal ↔ Casual | Casual-professional | The ICP lives in Slack and r/ProductManagement; formal reads like the enterprise suite that became shelfware. |
| Respectful ↔ Irreverent | Respectful toward users and data teams; mildly irreverent toward the ticket queue | Punch at the queue and at shelfware suites, never at analysts — the Head of Data has veto power in the deal. |
| Enthusiastic ↔ Matter-of-fact | Matter-of-fact | The product's value IS calm certainty about a number. Enthusiasm belongs in the community, not the answer panel. |

### Tone map by context

| Context | Tone shift | Example |
|---|---|---|
| **Answer returned** | Confident, show the work, zero flourish — the answer may be bad news about their metric | "Trial→invite conversion dropped 18% after the pricing change. Query and definitions below." *(never: "🎉 Insight unlocked!")* |
| **Low-confidence / can't answer** | Own it plainly — protecting trust in every other answer is worth more than faking this one | "This one needs real modeling — Ask can't answer it reliably. Here's what to hand your data team." |
| **Empty state (no events yet)** | Encouraging, practical, no false cheer | "No events yet. Install the SDK — instrumentation is automatic from here, no tickets." |
| **Upgrade prompt (MTU ceiling)** | Matter-of-fact, pitched on a growth moment — never mid-question | "You're tracking 10k users now — that's the Free ceiling. Team scales with usage; seats stay unlimited." *(never gate an in-flight answer)* |
| **Error / query failed** | Own it plainly, protect trust in the data | "That query failed on our side. Your data's fine — try again, or here's the generated SQL to run yourself." |
| **Community / social seeding** | Native to the venue — the tactic, not the sponsor | A genuine "how we stopped filing analytics tickets" write-up in r/ProductManagement — Plotline appears as the how, one link, no ad read. |

### Vocabulary

**We use:** ask · answer · the queue · four minutes · one set of numbers · show the query · monthly tracked users (MTU) · "activated" (in quotes, as a defined catalog term).
**We never use:** "insights" unqualified (every rival's word; says nothing) · "AI-powered" as a lead (feeds the distrust objection — the transparency is the counter, not the buzzword) · "self-service BI" (invites the warehouse comparison we lose, per positioning) · "replace your data team" (false, and weaponizes the blocker) · "only / first / #1" (banned until the rival AI-feature sweep lands) · "ask anything" (unscoped accuracy claim).
**Naming:** Plotline (one word, capital P) · Ask (capital A when naming the feature; lowercase "ask a question" in prose) · tiers are Free / Team / Business (never Pro, Plus, or Premium) · MTU spelled out on first use per surface.

### Grammar & mechanics

- Sentence case everywhere, including buttons ("Show the query", not "Show The Query").
- Contractions yes ("don't", "you've") — matches the casual-professional position.
- **No exclamation marks in any answer panel** — the value is calm certainty. One "!" allowed per celebration surface, max.
- Emoji: never in-product; allowed in community posts only when the venue's format calls for it.
- Numbers as numerals with a comparator ("4 minutes, not 2 days") — a number with nothing to compare against is trivia; concreteness is attribute 3 at the mechanics level.

---

## Related

- **The walls of:** [message-house-template.md](message-house-template.md) — voice/tone is the house's optional walls layer, made real
- **Enforced by:** [messaging-audit-checklist.md](messaging-audit-checklist.md) (log violations per surface)
- **Feeds:** every channel expression in the [messaging canvas](messaging-canvas-template.md), the community briefs in the [persona matrix](persona-matrix-template.md)
- **Registry entry:** [framework registry — Voice & Tone Framework](../../../../framework-registry.md) (this template closes the registry's named gap)
