# User Stories: PMM OS Research Workspace

The unit everything downstream builds from. One Must story → one flow → a set of screens.
User types: **PMM** (author + presenter, the primary), **Presenter** (the PMM in front of
stakeholders), **Stakeholder** (read-only beneficiary).

## 1. Workspace & nested page tree
- **[Must]** As a PMM, I want to browse the project as a collapsible tree (Project → Desks → a finding's own page), so that I can navigate the whole research base by hierarchy instead of a flat list.
  - Done when: expanding a desk reveals its findings as sub-pages; clicking any node opens that page in the workspace.
- **[Should]** As a PMM, I want to filter the tree by typing, so that I can reach a page without scrolling a long list.
- **[Should]** As a PMM, I want to pin/favorite the desks I use most, so that they stay at the top of the rail.
- **[Could]** As a PMM, I want to collapse the sidebar entirely, so that I get a focused reading/presenting width.

## 2. Research desk page — the two-altitude report
- **[Must]** As a PMM, I want each desk to open with a Briefing (one-line BLUF + 3–5 highlights), so that I get the bottom line before the detail.
  - Done when: the desk's first section shows the BLUF + highlights above the full report.
- **[Must]** As a PMM, I want the full report to present each finding as Insight → Evidence → Implication, so that I see the reasoning, not just headlines.
  - Done when: each finding renders an insight line, a cited evidence block, and an implication ("so-what") line.
- **[Must]** As a PMM, I want the artifact (matrix/table/personas) after the findings and the gaps at the very end, so that the meat leads and the template follows.
  - Done when: the page order is Briefing → Full report → Artifact → Gaps & verify.
- **[Should]** As a PMM, I want to collapse a desk to just its briefing, so that I can skim every desk quickly.
- **[Should]** As a PMM, I want to edit any block in place (slash-insert, turn-into, drag-reorder), so that I can refine the research without leaving the page.

## 3. Chain-of-evidence citations
- **[Must]** As a PMM, I want to click a finding's quote to open its real source, so that I can verify the claim myself.
  - Done when: clicking a citation opens the source URL (in side peek or a new tab).
- **[Must]** As a presenter, I want each finding's evidence to show the verbatim quote + who + channel + metric inline, so that a stakeholder trusts it on sight.
  - Done when: every evidence item renders quote, attribution, source label, engagement metric, and (if present) a link.
- **[Should]** As a PMM, I want inferred/unsourced findings clearly flagged, so that I know exactly what still needs verification.
- **[Should]** As a PMM, I want to see which findings a given source backs, so that I can judge how much weight a source carries.

## 4. Database views — Findings · Evidence · Events
- **[Must]** As a PMM, I want to view Findings, Evidence, and Events as a filterable, sortable table, so that I can slice the research across desks.
  - Done when: each collection renders as a table; applying a filter or sort updates the rows live.
- **[Must]** As a PMM, I want to filter findings by sourced vs. unsourced (and by desk and confidence), so that I can find the weak spots fast.
  - Done when: toggling "unsourced only" narrows the table to findings with no citation.
- **[Should]** As a PMM, I want to switch a collection between table / board / gallery, so that I can see it the way that fits the question.
- **[Should]** As a PMM, I want to filter events by area and quarter, so that I can plan field marketing by region and timing.
- **[Could]** As a PMM, I want to group a database (e.g., findings by desk), so that I can scan section by section.

## 5. Side peek panel
- **[Must]** As a PMM, I want to open any record (finding, source, event, persona) in a right-side peek, so that I can inspect it without losing my place.
  - Done when: clicking a row or citation opens a peek; closing it returns me to the same scroll position.
- **[Should]** As a PMM, I want to edit a record inside the peek and jump to its full page, so that I can act on it in context.

## 6. Backlinks & mentions
- **[Must]** As a PMM, I want to @-mention a finding inside a strategy/positioning/messaging claim, so that the claim links to the evidence that supports it.
  - Done when: an @-mention renders as a link that navigates to the finding's page.
- **[Must]** As a PMM, I want each page to show a "referenced by" backlinks section, so that I can trace what cites it.
  - Done when: a finding's page lists every page that @-mentions it.
- **[Should]** As a PMM, I want to spot strategy claims with no linked finding, so that I can flag unsupported recommendations before presenting.

## 7. GTM readout & present mode
- **[Must]** As a presenter, I want an answer-first GTM readout (recommendation → SCQA → plan → metrics → risks), so that stakeholders get the recommendation first and the support after.
  - Done when: the readout opens with the recommendation, then SCQA, then supporting sections in order.
- **[Must]** As a presenter, I want a present/deck mode that steps through the readout full-screen, so that I can present to stakeholders from the same source of truth.
  - Done when: present mode shows one section full-screen with next/prev and an exit.
- **[Should]** As a presenter, I want to drill into a desk or a citation mid-presentation, so that I can answer a "how do you know?" live and return to the deck.

## 8. Command palette & search
- **[Must]** As a PMM, I want a command palette (keyboard shortcut) to jump to any desk/finding/source, so that I can move without the mouse.
  - Done when: a shortcut opens the palette; typing filters destinations; Enter navigates.
- **[Should]** As a PMM, I want global search across all content, so that I can find a quote, entity, or source anywhere.
- **[Should]** As a PMM, I want slash-insert in the editor, so that I can add a block by type quickly.

## 9. Overview / home
- **[Should]** As a PMM, I want a home with the executive summary (the findings that change the strategy), so that I orient in seconds.
- **[Should]** As a PMM, I want project health on the home (desk completion, citation coverage, what's thin/blocked), so that I know what's solid vs. needs verification.

## Cross-cutting (generated local app — adapted, no sign-up)
- **[Must]** As a PMM, I want my block edits to persist (via the local editor server), so that my changes survive a reload.
  - Done when: editing a block and reloading shows the change.
- **[Must]** As a PMM, I want the workspace to be a single self-contained file I can share or archive, so that the research travels without a server.
- **[Must]** As a PMM, I want every surface to handle empty / thin / unsourced states honestly (a desk with no findings, a database with no rows, an inferred finding), so that the app is never blank-broken or misleadingly confident.
- **[Should]** As a presenter, I want to export the readout (PDF / deck / markdown), so that I can share it where stakeholders already are.
- **[Should]** As a new user, I want light inline help (what a desk is, how citations work), so that I can use it without a manual.

## Priority summary
- **Musts (version one): 17.**
  1. Browse the project as a tree
  2. Desk opens with a Briefing (BLUF + highlights)
  3. Full report = Insight → Evidence → Implication
  4. Desk order: Briefing → Full report → Artifact → Gaps
  5. Click a quote → open its real source
  6. Evidence shows quote + who + channel + metric inline
  7. Findings/Evidence/Events as a filterable table
  8. Filter findings by sourced vs. unsourced
  9. Open any record in a side peek
  10. @-mention a finding in a claim
  11. "Referenced by" backlinks on every page
  12. Answer-first GTM readout
  13. Present/deck mode
  14. Command palette to jump anywhere
  15. Edits persist (local save)
  16. Single self-contained file
  17. Empty / thin / unsourced states designed
- **Shoulds:** 13 · **Coulds:** 3
