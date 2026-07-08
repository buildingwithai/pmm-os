---
name: pmm-launch-kit
description: Turn product-marketing artifacts into an interactive, OS-style HTML launch kit — a single self-contained app with a left sidebar, a main workspace, and a right inspector panel (Linear/Notion/Raycast feel), plus a command palette, present/deck mode, status tracking, resizable/collapsible panels, and a one-click local editor (TipTap rich text, bubble toolbar, "/" slash-insert, drag-reorder blocks) for live bidirectional editing. Use when the user wants an interactive HTML launch kit, a clickable PMM/GTM dashboard, a shareable strategy hub, or to package launch docs into one app-like file. Generates from a single kit-content.json source and also emits markdown mirrors. Also use when the user asks to "process the generation queue" — fulfilling the kit editor's queued /generate and regenerate-from-evidence requests (generate-queue.json).
---

# PMM Launch Kit builder

Packages PMM/GTM work into one **self-contained, offline HTML app** (no dependencies, no card-soup — an app shell: sidebar · main · inspector) and, optionally, a tiny local server for **live editing that writes back to the source**.

## Architecture (single source of truth → generated outputs)
```
kit-content.json   ← the editable source of truth (content + structure)
block-registry.mjs ← uniform block model: each type declares render + markdown
build-kit.mjs      ← zero-dep generator (dispatches blocks through the registry)
migrate-kit.mjs    ← one-time codemod: stamps every block with id + type (schemaVersion)
.kit-style.css     ← app-shell styling      ┐ template (siblings of build-kit.mjs)
.kit-app.js        ← behavior               ┘
       │  node build-kit.mjs [target-folder]
       ▼
<wordmark>-launch-kit.html   ← interactive app (sidebar/main/inspector, ⌘K palette,
                          present mode, status badges, resizable panels, modeless editing)
generated-docs/*.md    ← markdown mirror of every section
deck.md                ← Marp slide deck (one slide per section) → pptx/pdf via
                          `npx @marp-team/marp-cli deck.md --pptx` (proves the
                          fan-out: a new export target = one serializer over the registry)
kit-server.mjs     ← live-editor server: edits POST to /api/save|/api/save-full|/api/comments,
                      rebuild kit-content.json + mirrors, live-reload
start-editor.command / .sh / .cmd  ← ONE double-click launches the editor (no terminal)
       Editor: MODELESS — every block is inline-editable (no Edit button); TipTap notebook
       (CDN, contenteditable fallback), bubble toolbar on highlight, "/" slash-insert (menu
       is registry-driven), ⠿ drag-reorder, autosave on blur, and 💬 highlight→comment
       (Comments tab + notebook feed, anchored to the block id, persisted to kit-content.json).
       Per-block ⋯ menu: Turn into (registry transform graph) · Move to section · Duplicate ·
       Delete. Nesting via the `toggle` block (collapsible, editable children).

Blocks are `{ id, type, …fields }`. The registry is the one place a type defines how it
renders to HTML + markdown (and, later, how it edits/transforms), so new block types and
new export targets are additive. Run `node migrate-kit.mjs` once to stamp legacy blocks.
```

## How to use
1. **Gather content.** Use existing PMM artifacts (from `product-marketing-os`, `pmm-messaging-positioning`, `pmm-personas`, `pmm-competitive-intelligence`, `pmm-pricing-packaging`, `pmm-go-to-market`, `pmm-coach`, etc.) or the user's docs.
2. **Author `kit-content.json`.** Mirror the worked example in `scripts/kit-content.example.json`. It has four parts:
   - `meta` — title + wordmark.
   - `sidebar` — grouped nav: `[{group, items:[[index,label,viewId]]}]`.
   - `views` — one per section: `{eyebrow,title,h1,sub,blocks:[…]}`.
   - `data` — widget data (stats, taglines, pricing, scorecard, gallery, checklists, palette, exports) + `intro` panels.
   - `details` — inspector detail records keyed by id (`{eye,title,blocks}`), referenced by row `detail` ids.
3. **Build — no copy needed.** Put `kit-content.json` in your launch folder and run the
   generator against it: `node <this-skill>/scripts/build-kit.mjs <your-launch-folder>`
   (templates + registry load from the skill; only `kit-content.json` needs to be in your
   folder). Emits `<wordmark>-launch-kit.html` + `generated-docs/*.md` + `deck.md` there.
   The HTML name is derived from `meta.wordmark` (e.g. `plotline-launch-kit.html`).
4. **To live-edit** (optional): copy the editor scripts (`build-kit.mjs`, `block-registry.mjs`,
   `.kit-style.css`, `.kit-app.js`, `kit-server.mjs`, and the `start-editor.*` launchers) next
   to `kit-content.json`, then use the one-click editor below.
5. **Edit live (one click):** double-click **`start-editor.command`** (macOS) / `start-editor.sh` (Linux) / `start-editor.cmd` (Windows) — it launches `kit-server.mjs` and opens `http://127.0.0.1:4317`, then click **Edit**:
   - **TipTap rich text** auto-loads from CDN (falls back to native `contenteditable` if offline — editing always works).
   - Highlight text → **bubble toolbar** (bold/italic/link/clear).
   - Type **`/`** in a block → insert a new block (heading/text/callout/list).
   - Hover a block → **⠿** drag-handle to reorder · **✕** to delete.
   - **Save** → writes `kit-content.json` → rebuilds HTML + markdown → live-reloads. Endpoints: `POST /api/save` (text patches), `POST /api/save-full` (structural insert/reorder/delete).

## Block types (the `blocks` array)
`{h}` subheader · `{p}` paragraph · `{callout, variant?}` · `{kv:[[label,value]]}` · `{table:{head,rows}}` · `{rows:[{t,d?,meta?,detail?}]}` (set `detail` to open an inspector record) · `{list:[…]}` · `{chips:[…]}` · `{flow:[[n,label]]}` (process diagram) · `{tree:"…"}` · `{statline:[[n,label]]}` · `{copy:[label,copyText]}` · `{evidence:[{q,who?,src?,url?,metric?}]}` (cited findings — verbatim quote → clickable source; the chain-of-evidence block) · `{widget:"name"}`.

Widgets (client-rendered from `data`): `stats · kitrows · taglines · msgvariants · pricing · calculator · checklist-launch · checklist-rev · scorecard · gallery · exportFiles · exportDocs`.

**Research → dashboard hydration:** when a kit is fed by a research run, don't hand-author the
desk views — run [`report-to-kit.mjs`](scripts/report-to-kit.mjs) `<dir>` over the run's
`.agents/research/report.json` to generate the two-altitude desk views (Briefing + Full report +
preserved Artifact), the **GTM readout** (`v-gtm-readout`), and the **Evidence appendix**
(`v-evidence`), every claim a clickable `evidence` citation. See
[`research-presentation-standard.md`](../product-marketing-os/references/research-presentation-standard.md).

## The generation queue (in-kit AI generation)

In the live editor, **`/` → Generate with AI** and the block menu's **⋯ → Regenerate from
evidence** don't generate in the browser — they queue requests that a Claude Code session
fulfills against the research. The server (`kit-server.mjs` `/api/generate`) appends to
**`generate-queue.json`** next to the kit's `kit-content.json` and, for fresh generates, plants
a placeholder callout carrying a `genId`.

**When the user says "process the generation queue" (or you find a `generate-queue.json` with
`status:"queued"` items in a launch folder), fulfill each item:**

1. **Ground first.** Read the folder's `.agents/research/evidence.md` + `report.json` (and, if
   the target view is a deliverable `v-op-*`/`v-wd-*`, its one-pager template in
   [`references/one-pagers/`](../product-marketing-os/references/one-pagers/)). Generation obeys
   the [deliverable standard](../product-marketing-os/references/deliverable-standard.md):
   answer-first, sourced + dated claims, honest gaps. **Never invent a citation** — `evidence`
   blocks only carry quotes/URLs that exist in the research; unsupported content is written as
   prose with an explicit `(unsourced — verify)` flag.
2. **Write registry blocks** (the block contract above) into `kit-content.json`:
   - `mode:"generate"` → **replace the placeholder block** (find it by `genId` in the item's
     `view`) with the generated block(s) — splice in place, ids via new `blk_*`.
   - `mode:"regenerate"` → **rewrite the target block** (find by `blockId`, falling back to
     `view`+`index`), keeping its `id` and its role in the page.
3. **Mark it done**: set the queue item's `status:"done"` + `fulfilledAt` (ISO date); leave the
   entry in the file (it's the audit trail). Items you cannot fulfill get `status:"blocked"` +
   a `reason`.
4. **Rebuild**: `node <PMM OS>/skills/pmm-launch-kit/scripts/build-kit.mjs <folder>` (or the
   folder-local `build-kit.mjs` if the editor scripts were copied in). If the kit-server is
   running it live-reloads the page.

Editable text blocks automatically carry `data-path` so the live editor can write changes back to the exact JSON location.

## Design rules (do not regress)
- App shell, **not** a card dashboard. Default primitives: sidebar, toolbar, list/table, detail inspector, tabs, section headers, dividers, whitespace. Use a "card" (callout) only for a truly standalone object; never nest them.
- One accent color, used only for active/interactive states. Strict type scale. 8px grid, single left rail.
- Content lives in HTML (server-rendered from JSON), never JS-injected as the *only* copy — so a script hiccup can never blank a section. Each enhancement is wrapped so one failure can't cascade.

## Notes / limits
- Output HTML is fully **offline + shareable** (one file; `exports/` and `generated-docs/` are siblings).
- **Saving requires the local server**, launched in one double-click via `start-editor.*`. Why a server at all: a `file://` page cannot write to disk *or* run the rebuild (browser sandbox), and a page cannot auto-launch a process. **TipTap is integrated** — auto-loaded from CDN on Edit, with native `contenteditable` + bubble menu as the automatic offline fallback. Rebuilding the HTML needs Node, which is why the server (not the page) does it.
- "Bidirectional" = page ⇄ `kit-content.json` ⇄ HTML + markdown. Syncing arbitrary free-form prose docs back into structured JSON is out of scope; keep `kit-content.json` canonical.
- After `pmm-artifact-factory` produces files, run this skill last to wrap everything into the interactive hub. Run `pmm-coach` first on high-stakes content.

## Hand off to

PMM OS is a chain, not a menu — don't dead-end at advice. Pass the work on:

- [`pmm-artifact-factory`](../pmm-artifact-factory/SKILL.md) — source the artifacts to package
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.
