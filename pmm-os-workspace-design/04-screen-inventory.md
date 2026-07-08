# Screen Inventory: PMM OS Research Workspace

The deduped master list from the Phase 3 flows. Each screen has exactly **one primary job** and one
primary action (Apple rule: one thing dominates). Near-duplicates that are really one screen in two
states (a full vs. empty database) are one entry with documented states.

| ID | Screen | Type | Primary job | Appears in flows |
|----|--------|------|-------------|------------------|
| S1 | Workspace shell | Hub / frame | Hold the three panes (tree · content · peek) and let the user move between pages | all |
| S2 | Home / Overview | Hub | See the strategy headline + project health and jump in | 1 |
| S3 | Desk page | Detail | Read one desk as a two-altitude, cited report | 2, 3, 6 |
| S4 | Finding page | Detail | Read one finding + what cites it (backlinks) | 4, 5 |
| S5 | Database view | List / feed | Slice Findings / Evidence / Events by filter | 4, 9 |
| S6 | Side peek | Modal / sheet | Inspect one record without leaving the page | 3, 4, 5, 6, 9 |
| S7 | Strategy / Story page | Detail | Read a positioning/messaging/narrative page whose claims @-link to findings | 5 |
| S8 | GTM readout | Detail | Get the GTM recommendation answer-first, evidence one tap away | 6 |
| S9 | Present mode | System / utility | Present the readout full-screen to stakeholders | 6 |
| S10 | Command palette | Modal / sheet | Jump or search to anywhere, keyboard-first | 7, entry to most |

**10 distinct screens.** Editing is a **mode** of S3/S4/S7 (not a separate screen). The boring-but-required
moments live as **states** on the screens above (documented per screen below), not as extra rows.

## Screen detail

### S1: Workspace shell  (Hub / frame)
- **Primary job:** be the calm frame — a left page tree, a wide reading column, a collapsible right peek — so content leads and chrome defers.
- **Content:** left rail = page tree (Project → Desks → finding pages) + pinned/favorites + Databases section + global search field; top = breadcrumb + view title + present button; center = the active page; right = peek (collapsed by default).
- **Actions:** expand/collapse tree nodes, reorder, pin, collapse sidebar, open palette, open present mode, resize/collapse peek.
- **Primary action:** open a page from the tree.
- **States:** empty (no research → tree shows one "Run a desk" prompt); sidebar-collapsed (focused reading width); peek-open (content reflows, never overlaps).
- **Entry points:** app open.

### S2: Home / Overview  (Hub)
- **Primary job:** orient in seconds — the findings that change the strategy, plus what's solid vs. thin.
- **Content:** executive summary (3–5 strategy-changing findings, each one line + sourced); project health (desk completion, citation coverage %, count of unsourced/inferred findings, what's blocked); recently edited; jump-in links.
- **Actions:** open a desk, open the GTM readout, jump to unsourced-findings filter, resume last page.
- **Primary action:** open the highest-leverage desk / the readout.
- **States:** empty (no research yet → single primary "Run the first desk" with the command); thin (some desks unrun → health shows the gaps honestly).
- **Entry points:** app open, Home in tree, logo.

### S3: Desk page  (Detail) — the heart of the product
- **Primary job:** read one research desk at the altitude you want, every claim traceable.
- **Content, in order (meat-first):** Briefing (one-line BLUF + 3–5 highlights) → Full research report (each finding = Insight → Evidence [cited block: quote + who + channel + metric + source link] → Implication) → Analysis → Artifact (matrix/table/personas) → Gaps & verify.
- **Actions:** collapse to briefing-only, click a citation (→ S6 peek or external), @-mention/jump, edit blocks (mode), open the desk's database, copy a quote.
- **Primary action:** read the full report (and click through to a source).
- **States:** thin (desk not run → "Not yet researched — run this desk" + command); finding unsourced (inline "inferred — verify" flag); loading (skeleton while report.json hydrates); editing (modeless).
- **Entry points:** tree, palette, Home, a backlink, present-mode drill.

### S4: Finding page  (Detail)
- **Primary job:** see one finding in full and everything that cites it.
- **Content:** the insight; its evidence block (all quotes + sources); the implication; "Referenced by" backlinks (which strategy claims @-link this finding); desk + confidence + sourced/inferred badge.
- **Actions:** click a source (→ S6), follow a backlink (→ S7), edit, copy.
- **Primary action:** verify the evidence / follow the chain.
- **States:** unsourced (prominent "inferred — verify" + suggested run); no-backlinks ("not yet cited by any strategy claim").
- **Entry points:** Database row, an @-mention, a desk finding's "open as page."

### S5: Database view  (List / feed)
- **Primary job:** slice a collection (Findings · Evidence · Events) to answer a question.
- **Content:** a collection as table (default) / board / gallery; columns per collection (Findings: finding · desk · sourced? · confidence · implication; Events: event · area · when/quarter · audience · fit · source); filter + sort + group bar; result count.
- **Actions:** switch view mode, filter (e.g. unsourced only; area + quarter), sort, group, open a row (→ S6), reset filters.
- **Primary action:** apply the filter that answers the question.
- **States:** empty-filter ("no rows match — reset"); empty-collection ("no events yet"); loading.
- **Entry points:** tree (Databases section), palette, Home health links.

### S6: Side peek  (Modal / sheet — right panel)
- **Primary job:** inspect one record (source, finding, event, persona) without losing your place.
- **Content:** record header + fields; for a source: quote, channel, metric, "backs these findings," open-original; for an event: host, area, when, audience, fit, source listing.
- **Actions:** open original (new tab), jump to full page, edit, close (returns to exact scroll).
- **Primary action:** open the original / jump to full page.
- **States:** no-URL source ("captured at channel level only — not linkable," honest); editing.
- **Entry points:** a citation tap, a database row, a backlink hover-open.

### S7: Strategy / Story page  (Detail)
- **Primary job:** read a strategy page (positioning, messaging, narrative, campaign) whose claims link to their evidence.
- **Content:** the strategy content in blocks; claims carry @-mentions of findings; a "supported by / unsupported" indicator per claim.
- **Actions:** follow an @-mention (→ S4), see unsupported claims, edit, present.
- **Primary action:** trace a claim to its finding.
- **States:** unsupported-claim flag (claim with no linked finding); editing.
- **Entry points:** tree, palette, GTM readout links.

### S8: GTM readout  (Detail)
- **Primary job:** deliver the GTM recommendation answer-first, with the support and evidence behind it.
- **Content:** Recommendation (BLUF) → SCQA → segmentation → positioning + motion → plan (pre/launch/post) → metrics → risks → asks; each section can drill to its backing desk/finding.
- **Actions:** enter present mode, drill to a desk/source, edit, export.
- **Primary action:** enter present mode / read the recommendation.
- **States:** not-ready ("run the desks to generate the readout"); editing.
- **Entry points:** tree, palette, Home.

### S9: Present mode  (System / utility)
- **Primary job:** present the readout full-screen to stakeholders.
- **Content:** one section full-screen, large type; progress indicator; next/prev; the recommendation slide first.
- **Actions:** next/prev, drill to a desk/source mid-present and return to the same slide, exit.
- **Primary action:** advance the presentation.
- **States:** start, mid-drill (overlay or quick page then back), end.
- **Entry points:** GTM readout (and any page's "present").

### S10: Command palette  (Modal / sheet)
- **Primary job:** get anywhere (or search everything) without the mouse.
- **Content:** search field; ranked destinations (desks, findings, sources, databases, commands); recent.
- **Actions:** type to filter, Enter to navigate, run a command (insert block, toggle view), fall through to full-text search.
- **Primary action:** navigate to the top result.
- **States:** no-match ("no matches — search full text?"); empty (recents).
- **Entry points:** keyboard shortcut from anywhere.

## Cross-cutting states (designed on the screens above)
- **Empty** — no research yet (S1/S2 lead with one "run a desk" action).
- **Thin** — a desk not yet run (S3) / a collection with no rows (S5).
- **Unsourced / inferred** — a finding without a citation, flagged honestly (S3/S4) — the trust state.
- **Empty-filter** — a filter that matches nothing (S5), one tap to reset.
- **Loading** — report.json hydration skeletons (S2/S3/S5).
- **Offline / no editor server** — edits held, banner to start the server (S3/S4/S7).

## Sanity checks
- Every Must story's flow is covered: navigate (S1/S10), read desk (S3), verify (S3→S6), slice (S5→S6), trace (S7→S4→S6), present (S8→S9), edit/persist (S3 mode + offline state), events (S5→S6). ✓
- Every screen has exactly one primary job. ✓
- The boring screens/states are present (empty, thin, unsourced, empty-filter, loading, offline). ✓

## Total & traffic
**10 screens.** Highest-traffic (most flows) and most design care: **S6 Side peek** (5 flows), **S3 Desk
page** (3 + the core read), **S5 Database view** (2), **S1 Workspace shell** (the frame for all), **S10
Command palette** (entry to most). These are the wireframe priorities in Phase 8.
