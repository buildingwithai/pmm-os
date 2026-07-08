# Mission Control: SuperIsland Notch

## Original Objective

Use `shobhit99/SuperIsland` as the reference for a top-of-screen island notch that can replace the current modal, while keeping the right-side agent working pad alone for now.

## Current User-Level Goal

Show a working top notch command surface in the local Next.js website that carries SuperIsland-inspired capabilities and current idkWidk workflow actions.

## Current Engineering Phase

Verified first pass

## Task Classification

- Work type: Feature integration with external repo research
- Risk level: Medium
- Platform: Next.js website plus external Swift reference repo
- Owner: Codex

## Current Hypothesis

SuperIsland cannot be imported directly because it is a macOS Swift app. The right move is to adapt its compact/expanded/module/extension model into a small React component for this repo.

## Evidence Collected

| Evidence | Source | Confidence | Notes |
|---|---|---|---|
| SuperIsland is a macOS Swift app | `.um/references/SuperIsland/README.md` | High | Requires macOS 14, Xcode 15, XcodeGen |
| SuperIsland has compact, expanded, and full expanded island states | `SuperIsland/Views/*.swift` | High | `IslandContainerView`, `CompactView`, `ExpandedView` |
| SuperIsland has extension capabilities | `.um/references/SuperIsland/EXTENSIONS.md` | High | Compact, expanded, fullExpanded, backgroundRefresh, settings |
| Local website is Next.js | `apps/website/package.json` | High | Next 15, React 19 |
| Existing page already uses app-shell layout | `apps/website/app/page.tsx` and `globals.css` | High | Sidebar, toolbar, workspace, inspector |

## Active Workstream

Build a top notch in the website without disturbing the right-side inspector.

## Blocking Issues

| Issue | Why it blocks | Owner | Status |
|---|---|---|---|
| None active | First pass can be built as a repo-native React component | Codex | Clear |

## Side Quests / Parked Issues

| Issue | Why parked | Revisit when | Status |
|---|---|---|---|
| Directly porting SuperIsland Swift code | This repo is a web app, not a macOS app | If a native macOS Quick Ping app is planned | Parked |
| Replacing an exact existing modal | No modal was found in this checkout | When the target product modal path is present | Parked |
| Right-side agent pad redesign | User explicitly said to leave it for now | Later phase | Parked |

## Decision Log

| Date | Decision | Why | Consequence |
|---|---|---|---|
| 2026-05-18 | Started Mission Control | Prevent drift and preserve objective | Use this as source of truth |
| 2026-05-18 | Clone SuperIsland under `.um/references` | Inspect the outside repo without mixing source trees | Reference stays local and separate |
| 2026-05-18 | Adapt behavior, not Swift source | SuperIsland is not a React dependency | Implement a small native React notch |

## Files Touched or Likely Involved

| File or area | Reason | Status |
|---|---|---|
| `apps/website/app/page.tsx` | Main website surface and new notch component | In progress |
| `apps/website/app/globals.css` | Top notch and expanded surface styling | Complete |
| `docs/idkwidk/super-island-notch/*` | idkWidk intake and Mission Control | Complete |
| `.um/references/SuperIsland` | External repo research clone | Complete |

## Tests and Verification

| Check | Status | Evidence | Notes |
|---|---|---|---|
| SuperIsland repo cloned | Complete | Commit `e238f35` on `main` | Reference only |
| Website build | Complete | `npm run build` in `apps/website` | Passed |
| Closed notch browser check | Complete | `/tmp/idkwidk-island.png` | Compact pill renders at the top |
| Expanded notch browser check | Complete | `/tmp/idkwidk-island-open-fixed.png` | Expanded surface opens; compact pill hides while open |

## Next Best Action

Wire the notch actions to the real modal command handlers when the target product modal path is present.

## Resume Prompt

```text
Continue SuperIsland Notch. Read docs/idkwidk/super-island-notch/MISSION_CONTROL.md first. Preserve the original objective: use SuperIsland as reference for a top notch replacing modal-style command UI, leave the right-side agent pad alone, update evidence, classify side quests, and proceed with the next best action.
```
