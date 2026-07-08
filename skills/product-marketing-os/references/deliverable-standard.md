# Deliverable Standard — the consulting-grade bar

The research side has its standard ([research-presentation-standard.md](research-presentation-standard.md)).
This is its twin for **deliverables** — the positioning one-pagers, messaging houses, persona cards,
battlecards, GTM plans, and everything else a PMM ships at work. The bar, set explicitly: **better
than hiring a consultancy** — the output must be usable inside a company workspace on Monday morning.

Distilled from the MBB (McKinsey/BCG/Bain) working canon: Minto's Pyramid Principle, action-title
discipline, ghost decks, MECE, hypothesis-driven research, and source discipline. Raw research in
[`docs/research/pmm-quality-research.json`](../../../docs/research/pmm-quality-research.json).

---

## 0. The two-product contract

Every engagement ships **two products**, and they are different documents:

1. **The research library** — the full notes. Two-altitude desks, Insight → Evidence → Implication,
   every claim traceable to a clickable source. The reader who wants everything can read everything.
2. **The deliverable suite** — the crafted artifacts, each in two renders:
   - **The one-pager** — the exec/sales-facing page (rules in §2). This is what circulates.
   - **The working doc** — the full reasoning behind it, claims `@`-linked to the findings that
     justify them (the backlinks chain: claim → finding → source).

A dashboard view is neither of these; it's the *container*. The deliverable suite is what a PMM
would paste into Confluence, hand to a rep, or print for an exec.

---

## 1. The ten principles (adopted, not admired)

| # | Principle | How the pipeline adopts it |
|---|---|---|
| 1 | **Pyramid / answer-first (Minto, SCQA)** | Every deliverable emits a one-sentence **governing thought** first; templates open with SCQA; chronological "here's what we researched" openings are rejected. |
| 2 | **Action titles — one message per section** | Every section heading is a complete declarative sentence stating the takeaway ("Costs grew 7%/yr, double revenue growth"), never a topic label ("Market overview"). Label headings are lint errors. Two messages ⇒ two sections. |
| 3 | **The so-what discipline** | Every finding carries an implication field: "…which means [persona] should [action] because [stake]." The reviewer asks: *would this change what the PMM does Monday morning?* Observation-only sections are demoted or cut. |
| 4 | **MECE decomposition** | The research plan decomposes the question into a 2–4-branch issue tree of testable open questions BEFORE searching; every engine call maps to exactly one leaf; empty leaves are named gaps, never silent. |
| 5 | **80/20 depth** | Branches are scored impact-on-answer × evidence-availability; depth goes where the recommendation is sensitive. De-scoped branches get an explicit "not investigated" note. |
| 6 | **Day-1 hypothesis** | Before any engine call: "Likely answer X, because A/B/C — and here's what would disprove it." Findings score supporting/refuting/neutral; hypothesis pivots are logged, and a running best-answer exists at every point. |
| 7 | **Ghost outline before drafting** | Between research and prose: the full skeleton — ordered action titles + intended evidence per section. The titles read end-to-end must already tell the story. This is the natural user-approval checkpoint (rework at 20 lines, not 20 pages). |
| 8 | **Source discipline** | Every claim is typed: **fact** (source + date + locator), **estimate** (method stated), or **assumption** (flagged). "If you cannot footnote it, don't cite it." Two-source rule for load-bearing numbers. Model knowledge that can't be sourced is re-searched or labeled unverified — never silently asserted. |
| 9 | **Executive summary craft (SCR)** | The exec summary compresses the storyline as Situation–Complication–Resolution, spends most of its space on the Resolution, and uses bold-claim + bullet-evidence where the bold text alone tells the story. |
| 10 | **Horizontal logic** | Read only the action titles of a deliverable end-to-end: they must form one coherent argument (the dot-dash storyline test). If the titles don't flow, the document is broken regardless of its body. |

---

## 2. One-pager rules (what makes it get USED)

1. **Lead with the answer** — the headline is the recommendation as a full sentence.
2. **Structure as S-C-R**; most of the page is the Resolution.
3. **One page = one decision.** Two decisions ⇒ two one-pagers.
4. **Bold-claim + bullet-evidence**: the bold lines alone tell the complete story.
5. **3–5 proof points max**, each a decision-grade number *with a comparator* (vs. benchmark / last period) — a raw number is not insight.
6. **Every number has a source line**; estimates labeled; assumptions explicit.
7. **No process language** — never "we analyzed/researched/reviewed."
8. **Every claim passes so-what** — implication for the reader, not observation.
9. **End with an explicit ask** — verb-first, owner + date ("Approve X by Friday"), never "align on next steps."
10. **Ruthless cut** — anything not supporting the recommendation moves to the linked working doc.
11. **The standalone test** — works in 30 seconds with no author present.
12. **Hierarchy over density** — white space, one visual max; readability signals credibility.

Plus the field evidence for each artifact type (sections, length, circulation) — codified per
framework in the [framework registry](framework-registry.md). The recurring theme across all 12
researched formats: **specificity + scannability + proof + freshness** (visible review dates) is
what separates a used one-pager from an ignored one. Crayon's battlecard number frames the stakes:
79% of teams make battlecards; only 26% of reps use them — sayable language and 90-second
readability flip that.

---

## 3. Research rigor rules (the input side)

1. Day-1 hypothesis, written and stored, with its disconfirming evidence named.
2. MECE issue tree before searching; every call tagged to one leaf.
3. 80/20 depth by branch priority; de-scoped branches named.
4. Before any analysis: what will it answer, and could the result change the recommendation? If not, don't run it.
5. Synthesize continuously — a defensible current-best-answer at every point.
6. Every claim typed and traceable (fact / estimate / assumption).
7. **Two-source rule** for load-bearing numbers; conflicts surfaced, not averaged.
8. **Adversarial pass**: search for evidence AGAINST the hypothesis before finalizing; log pivots.
9. Closed loop: claim → section evidence → source URL, traversable with zero dead ends.
10. Numbers get context (benchmark/trend/peer) before implications are drawn.
11. Say "we don't know" — gaps stated, never padded over.
12. Point vs. proof separation: the deliverable carries decision-driving evidence; everything else lives in the appendix/working doc.

---

## 4. The deliverable scorecard (0–3 per row; shippable ≥ 24/33, no row below 2)

Mirrors the Apple design scorecard — score it, fix the weakest row first, never one-shot.

| # | Criterion | A 3 looks like |
|---|---|---|
| 1 | Answer-first | Recommendation in the first sentence; SCQA opening; titles-only read tells the story. |
| 2 | Action titles | Every heading a declarative takeaway; zero topic labels. |
| 3 | So-what density | Every section ends in an implication that would change a decision. |
| 4 | Evidence & sourcing | Every number sourced + dated; claims typed; load-bearing figures two-sourced. |
| 5 | Specificity | Named segments, real quotes, decision-grade numbers with comparators — nothing generic. |
| 6 | Framework fidelity | The artifact follows its registry template's real sections (not a loose paraphrase). |
| 7 | Honesty | Gaps/confidence stated; inferred claims flagged; no padded certainty. |
| 8 | The ask | Ends with verb-first, owned, dated next steps. |
| 9 | Standalone | Passes the 30-second no-author test. |
| 10 | Cut discipline | One decision per page; everything else linked, not crammed. |
| 11 | Traceability | One-pager claims `@`-link to findings; findings cite sources (the closed loop). |

---

## 5. Pipeline gates (where this binds)

1. **Plan gate** — no engine calls until the day-1 hypothesis + MECE tree exist as
   `.agents/research/hypothesis.md` + `.agents/research/issue-tree.md` (pmm-research-brief
   writes them; schema of what the run then emits: [report-contract.md](report-contract.md)).
2. **Ghost gate** — no deliverable prose until the ghost outline (action titles + mapped evidence)
   validates: titles read as one argument, every title has evidence. Show the user the ghost.
3. **So-what gate** — findings without implications don't enter deliverables.
4. **Source gate** — untyped/unsourced claims can't enter a one-pager (they go to the working doc
   flagged, or die).
5. **Score gate** — a deliverable ships at ≥24/33 with no row below 2; the coach
   (pmm-coach) scores it and the weakest row is fixed first.
