# Analyst & Influencer Desk

**Lens:** analyst relations / community lead. The job: find the people and institutions
who shape the category's narrative — analysts, creators, podcasters, OSS maintainers,
community leaders — so the launch earns third-party credibility, not just owned-channel noise.

**Inputs:** `{product}`, `{category}`, `{ICP/segment}`, `{market}`.

## Question set (the AR/community lead's brief)

1. Which **analysts / firms** cover this category (and do they matter to our buyer)?
2. Which **independent creators / influencers** does the ICP trust on this topic?
3. Which **podcasters / newsletter authors** set the agenda here?
4. Which **OSS maintainers / practitioners** carry credibility (for dev/technical buyers)?
5. **Reach × relevance × reachability** — who's worth a briefing, a seeding, a collab?
6. **Sentiment / leanings** — what do they already say about our space and competitors?
7. **Recent activity** — who's actively publishing on this right now (warm to engage)?

## Engine fan-out (decompose, run in parallel)

| Question | `agent-reach` | `last30days` |
| --- | --- | --- |
| 1 analysts | search `"{category} analyst / Gartner / Forrester / G2"`; read coverage | — |
| 2–4 creators/maintainers | fetch creator profiles, GitHub maintainer pages, podcast sites | topic `"{category}"` (whose names keep surfacing, by engagement) |
| 5 reach | check follower/subscriber/star counts on profiles | — |
| 6 sentiment | read their recent posts on the space | topic `"{influencer}"` / `"{competitor}"` (what they say) |
| 7 recent activity | fetch their latest posts/episodes | topic `"{category} 2026"` (active voices) |

Run = **1–3 `last30days` topics + ~10–15 `agent-reach` profile/coverage reads**.

## Evidence target

`## Channels & KOLs` (people who shape the category) in the ledger, with reach figures +
their leanings, sourced.

## Artifact (hydrated)

**KOL / influence map** — a ranked table: Name · Type (analyst/creator/podcaster/maintainer)
· Platform · Reach · Relevance · Leaning (favors us / neutral / favors competitor) ·
Recommended play (brief / seed / collab / monitor) · Source. Renders as a `v-analysts`
table; exports `kol-list.csv`. Ranking: `relevance × reach × reachability`.

## Flow

`{category}+{ICP}` → this question set → engine fan-out → `## Channels & KOLs` → ranked KOL
map → feeds `pmm-go-to-market` (launch seeding), `pmm-campaign-brief`, `pmm-aeo-geo`
(who AI engines cite), the Channels Desk.
