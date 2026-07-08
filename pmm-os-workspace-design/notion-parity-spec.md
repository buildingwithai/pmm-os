# Notion parity spec — what the center pane can be

Research-backed (Notion Help Center 2024-25 + TipTap/ProseMirror docs + an audit of our own editor).
Defines the **full block/feature set** for the center pane, an **adopt / adapt / skip** call on each,
how **`@`** works, how **paste-image** works, and the **one architectural decision** that unlocks it.

---

## 0. The architectural decision (read first)

Today there are **two editors** that don't share a block model:
- **Middle pane** — custom `contenteditable` + `execCommand`; structural ops (slash, turn-into, drag,
  move) are **server-gated** and only **9 of 18** block types are slash-insertable; bubble toolbar is
  bold/italic/link only. (`.kit-app.js:347-500`)
- **Notebook** — full **TipTap** (real slash, bubble, tables) but **localStorage-only**, never writes
  back to `kit-content.json`. (`.kit-app.js:185-279`)

**Recommendation: unify the middle pane on TipTap**, mapping the TipTap document ↔ our block registry
(`block-registry.mjs`). Every Notion behavior the user asked for is then an *official, free* TipTap
extension instead of hand-rolled `contenteditable`. This is the single highest-leverage move; the rest
of this spec assumes it.

---

## 1. The block set (every Notion `/` block → our call)

### Adopt — build to parity (the writing core)
| Block | Notion `/` | Our status | To do |
| --- | --- | --- | --- |
| Text / paragraph | `/text` | ✅ have | — |
| Heading 1 / 2 / 3 | `/h1 /h2 /h3` | ⚠ generic `heading` only | split into real H1/H2/H3 |
| Bulleted list | `/bullet` | ✅ have | — |
| Numbered list | `/num` | ⚠ via list | add ordered variant |
| To-do / checklist | `/todo` | ✅ have | — |
| Toggle | `/toggle` | ✅ have (children) | use TipTap `details` |
| Quote | `/quote` | ✅ have | — (carries evidence) |
| Divider | `/divider` | ✅ have | — (the anti-card) |
| Callout | `/callout` | ✅ have | keep **rare** (1/page) |
| Code | `/code` | ❌ missing | add code block (highlight + lang) |
| Simple table | `/table` | ✅ have | add row/col ops in middle pane |
| Columns (2–3) | `/columns` | ❌ missing | community ext (partial — see §4) |
| Link to page | `/link` | ⚠ via nav | inline page link |
| Image (paste/URL) | `/image` | ❌ missing | base64 paste (see §3) |
| Table of contents | `/toc` | ❌ missing | auto-gen from headings (great for long desks) |

### Adapt — Notion concept → our domain (this is where the product gets special)
| Notion | Our adaptation |
| --- | --- |
| `@page` mention | **`@finding` / `@source` / `@desk` / `@event`** → auto-**backlink** ("referenced by"). The backbone — a strategy claim that @-mentions a finding is *provably sourced* (see §2). |
| `@date` | an **as-of timestamp** on findings/events — recency matters for GTM (a competitor price decays). |
| `@remind` | **research follow-ups** — "@remind in 2 weeks: did the predicted pricing move happen?" (wire to the `schedule` skill, since a static file can't push). |
| `@person` | **@stakeholder / @competitor-exec / @analyst** stubs → a People/Accounts mini-collection; backlinks build an auto-dossier. |
| Database views (table/board/gallery/calendar/timeline/list) | our **inline database** for Findings · Evidence · Events. Calendar/timeline = Events by quarter; board = findings by desk; gallery = personas/creators. |
| Linked database | a **filtered view embedded in a page** — a desk shows *its* findings as a linked view of the Findings DB. |
| Synced block | **transclude a finding** in several places via @mention (edit once). |
| Button | a **"Run this desk" / "Re-run"** action button (plugin action, not just template). |
| Breadcrumb / TOC | breadcrumb ✅ in nav; TOC auto-from-headings for long desks. |

### Skip — out of scope (per your call + the product)
Video · audio · file upload · PDF embed · generic web-embed (500 services) · real-time multi-user /
presence · `@person` push notifications (no real teammates) · block-level equations (no math in PMM).
*(Kept lean: this is a research/GTM workspace, not a wiki or a Figma.)*

---

## 2. `@` mentions — the backbone

The single most valuable Notion mechanic for us. `@page` does two durable things with zero setup:
1. **Auto-backlink** — the mentioned page shows "{n} backlinks" listing every place that cites it.
2. **Live chip** — rename the target and every mention updates.

**Our use:** `@`-mention a **Finding** or **Source** inside a Positioning/Messaging/Campaign claim →
the claim is provably sourced, and the Finding page accrues a backlinks panel = the chain of evidence,
bidirectional, automatic. Default to **inline @-mentions** (keeps the sidebar a clean IA) over the
"Link to page" block (which would explode the tree into sub-pages). `@date` stamps recency; `@remind`
turns passive research into a follow-up engine.

---

## 3. Paste an image inline — yes, with a size guard

**Feasible** (TipTap `Image` with `allowBase64: true` + a clipboard `paste` handler). Copy an image on
the web → click on the page → paste → inline. **The landmine:** a screenshot is often 1 MB+, and base64
inflates it ~33%, bloating the single self-contained file. **Mitigation (on paste):**
- Downscale to ~1600px max edge + re-encode to WebP/JPEG ~0.8 → typically 50–150 KB. Default: inline base64 (stays single-file).
- If still large (> ~400 KB), write to an `assets/` folder beside the kit and reference by relative path (leaner file, no longer pure single-file). Offer both; default to compressed-inline.

---

## 4. Editor feasibility (TipTap, single self-contained file via esm.sh)

| Feature | Verdict | Extension / technique |
| --- | --- | --- |
| Drag-reorder blocks | ✅ | `@tiptap/extension-drag-handle` (now free) + Floating UI |
| `/` slash menu (filtered) | ✅ | custom ext on `@tiptap/suggestion`, `char:'/'`, hand-built popup + keyboard nav |
| `@` mention menu | ✅ | `@tiptap/extension-mention`, `char:'@'`, in-file items array |
| Paste image (base64) | ✅ | `Image{allowBase64:true}` + paste handler (see §3) |
| Tables (add/remove row/col) | ✅ | `@tiptap/extension-table` (TableKit) — prosemirror-tables |
| Bubble toolbar | ✅ | `@tiptap/extension-bubble-menu` (vanilla) |
| Toggle / nested | ✅ | `@tiptap/extension-details` (native `<details>`) |
| Columns 2–5 | ⚠ partial | only community exts (aging); highest risk in a single file |

**Shared gotchas:** pin ONE `@floating-ui/dom` (esm.sh import map) so drag/slash/@/bubble don't load
duplicates; give slash and `@` **distinct plugin keys**; atom nodes (mention, image) must round-trip
their `data-*` attributes through the local save server.

---

## 5. Is this shippable as a plugin? — yes

- **Distribution:** already a **Claude Code plugin** (marketplace packaging + a SessionStart auto-install
  hook). Install from a marketplace (or our site) → run in Claude Code / Codex → the research pipeline
  runs → out comes the launch-kit dashboard. This is real today.
- **The pipeline:** brief → desks (cited) → `report.json` → `report-to-kit.mjs` → `kit-content.json` →
  `build-kit.mjs` → the HTML workspace. Real today.
- **The one caveat:** *viewing* the dashboard is a pure file; *editing* it Notion-style needs the tiny
  local save server (`kit-server.mjs`, one double-click `start-editor`). Under `file://` you get inline
  text edits (localStorage) but not structural ops — that's a known limitation, not a blocker.

---

## 6. Build sequence (proposed)

1. **Re-skin** wireframes Notion-clean (S1/S5/S6 + the rest) — *no code, approved.*
2. **De-card** the live dashboard content (callouts → plain blocks + quote-bars) — *content, approved.*
3. **Registry quick wins** — real H1/H2/H3, code block, ordered list, full slash menu (all 18 + new),
   widen turn-into beyond the 6 text types. *(Small, in `block-registry.mjs`.)*
4. **Unify the middle pane on TipTap** — the big one: TipTap doc ↔ block registry, drag-handle, filtered
   slash, bubble, details. Retire the custom `contenteditable`. *(Architectural — confirm before starting.)*
5. **`@`-mention + backlinks** — finding/source/desk/event mentions → "referenced by" panels.
6. **Paste-image** (compressed base64) + **image block**.
7. **Inline databases** (Findings/Evidence/Events as table/board/gallery) + linked views.
8. **Adapt extras** — TOC, `@date`, `@remind`→schedule, run-desk button.

Steps 1–3 are safe and approved. Step 4 is the fork that defines the effort.
