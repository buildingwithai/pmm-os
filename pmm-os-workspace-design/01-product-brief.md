# Product Brief: PMM OS Research Workspace (dashboard redesign)

> Redesign of the PMM OS launch-kit dashboard. Keeps the research → `report.json` → build
> pipeline that hydrates it; re-architects the front-end into a Notion-shaped workspace.

## What it is
A self-contained, OS-style HTML workspace where a product marketer reads, edits, and presents
a full research + GTM strategy — every claim traceable to its source. (Category: internal
research/GTM workspace; a generated single-file app with a Notion-style spine — page tree,
databases, side peek, backlinks, command palette, block editing, present mode.)

## Who it is for
- **Primary: the PMM author + presenter.** One person who runs the research, builds and edits
  the desks, then presents the strategy to stakeholders — from the *same* surface. Optimize for
  the maker who also presents; both the working altitude and the present altitude live in one app.
- Secondary (read-only beneficiary): stakeholders (founder, growth, eng) who get presented to and
  may click through to verify a source. Not editors.

## Platforms
Desktop web (a generated, self-contained HTML app; local editor server for saving). No mobile/native in this pass.

## Features

### 1. Workspace & nested page tree  (core)
- A user can: browse the project as a left-rail **tree** (Project → Desks → a finding's own page);
  expand/collapse, reorder, and search the tree; pin/favorite pages.
- So they can: navigate a large research base the way they think — hierarchy, not a flat list of views.

### 2. Research desk page — the two-altitude report  (core)
- A user can: read the **Briefing (BLUF + highlights)** first, then drop into the **Full report**
  (each finding = Insight → Evidence → Implication), reach the **Artifact** (matrix/table/etc.) and
  **Gaps** at the end; edit any block in place.
- So they can: get the headline in seconds *or* the full reasoning on demand — and trust it because
  the meat (findings + evidence) leads, with the template after.

### 3. Chain-of-evidence citations  (core)
- A user can: click any finding's quote to open its **real source** (side peek or new tab); see a
  source's credibility/channel/metric; see which findings a source backs.
- So they can: verify any claim themselves and defend the research to stakeholders.

### 4. Database views — Findings · Evidence · Events  (core)
- A user can: view each collection as **table / board / gallery**; **filter** (by desk, confidence,
  sourced vs. unsourced, segment, area/quarter for events), **sort**, **group**; open a row in side peek.
- So they can: slice research across desks — "all unsourced findings," "Q1 events in LA County,"
  "competitor claims by source."

### 5. Side peek panel  (core)
- A user can: open any record (finding, source, event, persona) in a **right-side peek**, read/edit it,
  jump to its full page, and close back to exactly where they were.
- So they can: inspect detail without losing their place in the desk.

### 6. Backlinks & mentions  (core)
- A user can: **@-mention** a finding inside a strategy/messaging/positioning claim; see a
  **"referenced by"** backlinks section on any page; follow the chain claim → finding → evidence.
- So they can: trace every strategic recommendation back to the evidence that justifies it (and spot
  claims with no support).

### 7. GTM readout & present mode  (core)
- A user can: open the **answer-first GTM readout** (SCQA → recommendation → plan → metrics → risks),
  enter **present/deck mode**, step through it, and drill into a desk or a citation mid-presentation.
- So they can: present the strategy to stakeholders from the same source of truth, answer-first, with
  the evidence one click away.

### 8. Command palette & global search  (core)
- A user can: open the **palette** to jump to any desk/finding/source, run a global **search**, or
  insert a block (slash) — all keyboard-first.
- So they can: move fast across a large workspace.

### 9. Overview / home  (secondary)
- A user can: land on an **Executive summary** (the findings that change the strategy) + project
  health (desk completion, citation coverage, what's thin/blocked) and jump in.
- So they can: orient instantly and know what's solid vs. needs verification.

## Constraints and notes
- **Keep the data spine:** research → evidence ledger → `report.json` → `report-to-kit.mjs` →
  `kit-content.json` → `build-kit.mjs`. This redesign is the *front-end* (reading/editing/presenting),
  not the engine.
- **Generated, self-contained:** one HTML file, zero-dependency Node build, templates + block registry
  load from the `pmm-launch-kit` skill. Databases are **client-rendered** from `kit-content.json` /
  `report.json` (not a live server DB); editing saves locally via the existing editor server.
- **Like:** Notion (page tree, databases, side peek, backlinks), Linear/Raycast (palette, speed,
  keyboard-first). **Unlike:** a live multi-user SaaS — this is a single-author generated artifact.
- The redesign must preserve the chain-of-evidence standard (claim → verbatim → clickable source) and
  the meat-first desk order codified in `research-presentation-standard.md`.

## Open questions
- **Workspace scope:** single project per app (one launch kit = one product, tree top = the project) —
  *assumed* — vs. a multi-project library later. Confirm single-project for this pass.
- **Database editing fidelity in v1:** are the databases fully editable, or filter/sort/read + edit via
  peek? (Leaning: read/filter + edit-via-peek to start.)
- **Product name:** "PMM OS Research Workspace" is provisional.
- Mobile read/present and multi-user: explicitly deferred — confirm that's fine.
