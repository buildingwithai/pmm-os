# One-Pager Template Pack — the ghost-outline targets

Every deliverable in the [framework registry](../framework-registry.md) ships in two renders: the
**one-pager** (the page that circulates) and the working doc (the reasoning behind it). This pack
is the contract for the first render: **12 field-researched formats** — sections, length rules, and
the evidence for what makes each one get used instead of ignored. Source corpus:
[`docs/research/pmm-quality-research.json`](../../../../docs/research/pmm-quality-research.json)
→ `onePagerFormats`; rules from the [deliverable standard §2](../deliverable-standard.md).

## A one-pager is a decision document, not a summary

It is the render a PMM pastes into Confluence, hands to a rep, or reads to an exec — usable in 30
seconds with no author present. One page carries **one decision**; everything that doesn't support
that decision moves to the linked working doc. The sections in each template are **fixed by field
research** — the generator fills them, it never invents new ones or drops the hard ones (the
anti-ICP, the "we lose when", the "not changing" section are the parts that earn trust).

## The twelve rules every one-pager obeys (deliverable standard §2, distilled)

1. **Lead with the answer** — the headline is the recommendation as a full sentence.
2. **S-C-R structure** — most of the page is the Resolution.
3. **One page = one decision** — two decisions ⇒ two one-pagers.
4. **Bold-claim + bullet-evidence** — the bold lines alone tell the complete story.
5. **3–5 proof points max**, each a number *with a comparator* — a raw number is not insight.
6. **Every number has a source line**; estimates labeled; assumptions explicit.
7. **No process language** — never "we analyzed/researched/reviewed."
8. **Every claim passes so-what** — implication for the reader, not observation.
9. **End with an explicit ask** — verb-first, owner + date; never "align on next steps."
10. **Ruthless cut** — off-decision material goes to the working doc, linked.
11. **The standalone test** — works in 30 seconds, no author present.
12. **Hierarchy over density** — white space, one visual max; readability signals credibility.

The recurring field finding across all 12 formats: **specificity + scannability + proof +
freshness** (visible review dates) separates a used one-pager from an ignored one.

## The ghost gate generates against these templates

Pipeline gate 2 ([deliverable standard §5](../deliverable-standard.md#5-pipeline-gates-where-this-binds)):
no deliverable prose until the ghost outline validates. This pack is what the ghost targets:

1. **Pick the template** for the artifact; its section list is the ghost's spine — no additions,
   no silent omissions (a section with no evidence becomes a named gap, not a deletion).
2. **Turn each section into an action title** — a filled declarative sentence ("We lose when
   procurement demands SOC 2 — 32% of losses"), never the section label restated.
3. **Map desk evidence under every title** — each template names its hydrating desks; a title with
   no desk finding behind it fails the source gate before any prose exists.
4. **Validate horizontal logic** — the titles read end-to-end must tell the whole story; then show
   the ghost to the user (rework at 20 lines, not 20 pages).
5. **Enforce the length rule at ghost time** — caps (3 pillars, 8–15 criteria, one screen) are cut
   in the outline, not after drafting.

Every skeleton below already carries the non-negotiables: a **governing-thought first line**, a
**source line on every number slot**, and a **closing verb-first ask** with owner + date.

## The pack index

| Template | Artifact | Length rule | Primary desks |
|---|---|---|---|
| [positioning-one-pager.md](positioning-one-pager.md) | Dunford-style canvas | 1 pg, 2-col canvas; 2–3 value themes w/ proof | competitive · customer · market · product · pricing |
| [messaging-house-one-pager.md](messaging-house-one-pager.md) | Message house | 1 pg drawn as a house; roof ≤15 words; 3 pillars × 3–4 proofs | customer · product · competitive · analyst-influencer |
| [persona-card.md](persona-card.md) | Buyer persona card | 1 pg each; 2–4 personas max; 80% buying insight | customer · competitive · channels |
| [icp-one-pager.md](icp-one-pager.md) | ICP definition | 1 pg; 8–15 criteria with hard values | customer · market · gtm · product |
| [battlecard-one-pager.md](battlecard-one-pager.md) | Competitive battlecard | 1 screen, no scroll; 90-second read | competitive · customer · product |
| [launch-at-a-glance.md](launch-at-a-glance.md) | Launch brief | 1 pg; owners + dates on every line | product · customer · gtm · channels · events |
| [gtm-strategy-on-a-page.md](gtm-strategy-on-a-page.md) | GTM strategy | 1 printable pg | gtm · customer · market · channels · pricing · competitive |
| [pricing-one-pager.md](pricing-one-pager.md) | Pricing / deal-desk card | 1 pg tier grid + guardrails | pricing · competitive · product · customer |
| [campaign-brief-one-pager.md](campaign-brief-one-pager.md) | Campaign brief | 1 pg (2 max) | customer · channels · market · gtm |
| [sales-play-card.md](sales-play-card.md) | Sales play / talk track | 1 pg; findable in 10 s | customer · gtm · product · competitive |
| [content-strategy-one-pager.md](content-strategy-one-pager.md) | Content strategy | 1 pg; 3–4 pillars max | customer · channels · gtm · analyst-influencer |
| [winloss-readout.md](winloss-readout.md) | Win/loss readout | 10–15 slides + 1 pg/theme | customer · competitive · gtm · product |

Each template declares its hydrating [research desks](../research-desks/README.md) — the hard gate
holds here too: **no desk evidence ⇒ no deliverable**. Score every filled one-pager with the
[deliverable scorecard](../deliverable-standard.md#4-the-deliverable-scorecard-03-per-row-shippable--2433-no-row-below-2)
before it ships (≥24/33, no row below 2).
