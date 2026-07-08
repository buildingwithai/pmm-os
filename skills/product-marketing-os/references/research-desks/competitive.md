# Competitive Desk

**Lens:** competitive-intelligence analyst. The job: map the real alternatives (including
"do nothing"), find where each wins and loses, and arm the field — with sourced evidence,
not assumptions. Feeds positioning, messaging, and sales enablement; it's a **hard-gate
dependency** for positioning/GTM.

**Inputs:** `{product}`, `{named competitors}` (or discover them), `{ICP/segment}`, `{market}`.

## Question set (the CI analyst's brief)

1. Who are the **real alternatives** buyers weigh — direct, adjacent, and "do nothing / DIY"?
2. What's each one's **pitch and positioning** (how do *they* describe themselves)?
3. **Where do they win** (strengths, proof, buyer love) and **where do they lose** (gaps, complaints)?
4. **Pricing & packaging** — model, tiers, what's gated, how they discount?
5. **Feature reality** vs. their marketing — what do reviews/users actually report?
6. **Win/loss signals** — why do deals swing to/from them (switching stories)?
7. **Recent moves** — launches, repositioning, funding, M&A in the last ~90 days?
8. **Trap-setting** — claims of theirs we can turn into discovery questions against them?

**Platform matrix (walk every cell or log the skip):** each competitor's site + pricing + changelog · Reddit · X · HN · GitHub · web/SERP · review/comparison pages (G2 compare — deep-mine via the Reviews Desk). Query archetypes: "X vs Y" · migration threads · feature complaints.

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1 — alternatives | search `"{category} alternatives"`, `"{competitor} vs"`; read comparison/listicle pages | topic `"{category} tools"` (what people actually use) |
| 2 — their pitch | fetch each competitor's homepage / product / pricing pages | — |
| 3 — win/lose | read G2/Capterra/Reddit review threads; fetch case studies | topic `"{competitor}"` + `"{competitor} vs {us-or-rival}"` (sentiment, complaints) |
| 4 — pricing | fetch pricing page / sales prospectus | topic `"{competitor} pricing"` (sticker shock, value gripes) |
| 5 — feature reality | read reviews + GitHub issues (for dev tools) | — |
| 6 — win/loss | search `"switched from {competitor}"`, `"moved off {competitor}"` | topic `"switched from {competitor}"` |
| 7 — recent moves | search news + the competitor's blog/changelog | topic `"{competitor}"` (last-30-days news) |

Typical run = **one `last30days` topic per priority competitor (+ a vs-comparison) + ~15–25 `agent-reach` calls**.

**Full-contract invocation (1:1 depth — do this, not a bare topic):**
- `last30days "{competitor}" --x-handle={competitor_x} --x-related={rival1,rival2} --github-repo={owner/repo} --subreddits={category_subs} --tiktok-hashtags={tags}` (NO `--quick`) — this is what lights up all 9 sources.
- `agent-reach`: per competitor, `reach.sh read` the homepage **+ pricing + a review page (G2/Reddit)**, `reach.sh gh-search`, plus reddit/twitter via configured backends. ~5 calls × each competitor.

## Evidence target

`## Competitive` in `.agents/research/evidence.md`: per competitor — pitch, where-they-win,
where-they-lose, pricing, recent moves — each sourced. Mark single-source claims; never
assert a competitor weakness you can't cite.

## Artifacts (the skill's real templates, hydrated)

1. **Competitor matrix** — the comparison grid from
   [`battlecard-template.md`](../../assets/battlecard-template.md) (Dimension × Us × each
   competitor + sales guidance). Renders as the `v-competitive` matrix table; exports `competitor-matrix.csv`.
2. **Battlecard** per priority competitor — [`battlecard-template.md`](../../assets/battlecard-template.md)
   / [`battlecard-full-template.md`](../../assets/battlecard-full-template.md) (when they win / when we
   win / objection handling / how to win / what not to say). Renders as inspector cards in the kit;
   exports `battlecards.docx`.
3. *(deep, optional)* **Competitor profile** — [`library/competitive-intelligence/assets/templates/competitor-profile-template.md`](../library/competitive-intelligence/assets/templates/competitor-profile-template.md).

Methodology: [`library/competitive-intelligence/references/core/07-battlecard-creation.md`](../library/competitive-intelligence/references/core/07-battlecard-creation.md)
+ `09-win-loss-analysis.md`.

## Flow

`{product}+{competitors}+{ICP}` → this question set → engine fan-out → `## Competitive`
evidence (sourced) → competitor matrix + battlecards → feeds `pmm-positioning-exercise`,
`pmm-messaging-positioning`, `pmm-battlecard`, `pmm-competitive-landing-page`, sales enablement.
