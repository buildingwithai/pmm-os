# Navigation: PMM OS Research Workspace

Platform = **desktop web** (mobile read/present companion deferred, sketched at the end). The card
sort gave two zones + two answer-first destinations on top, with sub-grouping under each — that's a
**sidebar navigator**, not a top nav bar (Hick's Law: keep the top small via zones; Jakob's Law: the
PMM already navigates Notion/Linear this way).

## Web (the target) — Sidebar navigator

**Pattern:** persistent left sidebar with a search field, two answer-first items on top, then two
collapsible **zone groups** (Notion-style section headers). One disclosure level inside (Desks → a
desk → its findings). Detours never live in the sidebar.

```
┌ Sidebar ───────────────┐  ┌ Top bar ───────────────────────────────────┐
│ ⌕ Search (⌘K)          │  │ Zone › Desk › Finding        [ Present ▸ ]   │
│                        │  └─────────────────────────────────────────────┘
│ Overview               │  ┌ Main workspace ────────────┐ ┌ Side peek ──┐
│ GTM readout            │  │ the active page             │ │ record      │
│                        │  │ (Briefing → Full report →   │ │ (source /   │
│ RESEARCH               │  │  Artifact → Gaps)           │ │  finding /  │
│  ▸ Desks               │  │                             │ │  event)     │
│  ▸ Databases           │  │                             │ │  collapsed  │
│                        │  │                             │ │  by default │
│ STRATEGY               │  └─────────────────────────────┘ └─────────────┘
│   Positioning          │
│   Messaging            │
│   Narrative            │
│   Campaign             │
│   Coach review         │
│ ───────────            │
│ ◐ theme · ● editor     │  (footer: theme toggle + editor-server status)
└────────────────────────┘
```

- **Top (ungrouped, answer-first):** `Overview` · `GTM readout`. The recommendation sits above the
  research that justifies it — the menu mirrors Minto.
- **Zone RESEARCH** (collapsible header):
  - `Desks` → disclosure to the 9 desks → each **drills** (list → detail) to its finding pages.
  - `Databases` → `Findings` · `Evidence / Sources` · `Events` (each opens a Database view).
- **Zone STRATEGY** (collapsible header): `Positioning` · `Messaging` · `Narrative` · `Campaign` ·
  `Coach review` (each a page; claims drill to the findings they @-mention).
- **Drill-down** happens in the main workspace (Desk → Finding; Database row → record page). Active
  item highlighted; breadcrumb in the top bar answers "where am I"; deep-linkable `#v-<page>` + browser
  back answers "how do I get back."
- **Detours (modals/sheets, never destinations):**
  - **Command palette** — `⌘K` overlay: jump / search / insert. The fast path to anywhere.
  - **Side peek** — right sheet: open a source/finding/event without leaving the page; close returns to scroll position.
  - **Present mode** — full-screen overlay over the GTM readout; obvious exit (Esc / ✕).
  - **Slash menu** — inline popover for block insert while editing.
  - **Filter bar** — inline on Database views (not a detour).
- **Global elements:** search = the palette (`⌘K`) + the sidebar search field; settings = the sidebar
  footer (theme toggle + editor-server status — there's no account/billing); **primary action = `Present`**
  (top-right) for the presenter, or a single `Run a desk` CTA in the empty state.

## Menu labels (the user's words, from the card sort)
| Label | Leads to |
| --- | --- |
| Overview | Home (exec summary + project health) |
| GTM readout | Answer-first readout → Present mode |
| **Research** (zone) | — |
| Desks | the 9 desks → findings |
| Databases | Findings · Evidence/Sources · Events |
| **Strategy** (zone) | — |
| Positioning / Messaging / Narrative / Campaign / Coach review | the strategy pages |

## Mobile — DEFERRED (sketch only)
If a read/present companion ships later: bottom **tab bar** — `Overview` · `Desks` · `Readout` ·
`Search`. Databases become filtered lists inside Desks/Search; the side-peek becomes a full-screen
**sheet** (no room for a side panel); **Present mode is the killer mobile use** (present from a phone).
Same labels/zones, different surface. Do not build in v1.

## Rationale
- **Sidebar over top-nav:** 9 desks + 3 databases + 5 strategy pages won't fit a 3–5 item tab bar;
  the sidebar holds them with one disclosure level and the two zone headers keep the top scannable.
- **Answer-first ordering:** Overview + GTM readout above the zones puts the conclusion first, then the
  evidence — the same Minto shape as the readout content.
- **Side-peek over full navigation for records:** verifying a source mid-read shouldn't cost your place;
  the peek is the Notion behavior the user asked to keep.
- **Palette as the speed layer:** keyboard-first jump/search for a power user who lives in this all day.

## Then
Labels match the card sort. Next: **Phase 8 (wireframing)** lays out each screen inside this navigation,
starting with the four highest-traffic — Workspace shell, Desk page, Database view, Side peek — at
Apple-grade, grayscale first.
