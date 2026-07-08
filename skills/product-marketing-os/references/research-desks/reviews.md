# Reviews Desk

**Lens:** review-mining analyst (VoC + CI hybrid). The job: mine **software-review
platforms, app stores, and employer reviews** — the highest-density objection and
switching-language source class that social sweeps miss. Buyers write structured
complaints here ("what do you dislike?" is a mandatory G2 field), with star ratings and
dates attached. **Parametric:** always scoped to `{product} × {competitor set} ×
{segment}`, never "reviews" in general.

**Inputs:** `{product}`, `{competitor set}` (from the Competitive Desk scope or the
brief), `{segment}`, product form factor (SaaS · browser extension · mobile app —
decides which stores apply).

## Question set (the analyst's brief)

1. **Dislikes** — what do reviewers of each competitor consistently complain about
   ("what do you dislike" fields, 1–3★ reviews)? These are our objection-mining gold.
2. **Loves** — what do 5★ reviewers praise? (Table stakes we must match; their moat.)
3. **Switching language** — reviews that name *why they left X for Y* (verbatim — feeds
   messaging and battlecards).
4. **Feature gaps** — the most-requested missing features per competitor (roadmap intel).
5. **Segment fit** — which company sizes/roles review well vs. badly (ICP evidence:
   reviewer metadata on G2/Capterra carries company size + role).
6. **Ratings shape** — rating distribution + trend per competitor (a falling trend is a
   why-now signal).
7. **Org health** *(Glassdoor, competitor CI only)* — churn themes, strategy complaints,
   "leadership changed direction" reviews (classic roadmap/instability intel).

## Platform matrix (which sites × which products)

| Platform | Applies to | What it yields |
| --- | --- | --- |
| **G2** | B2B SaaS | structured dislikes · segment metadata · comparison grids |
| **Capterra / GetApp** | SMB-leaning SaaS | pros/cons pairs · pricing-value gripes |
| **TrustRadius** | mid-market/enterprise | long-form use-case reviews |
| **Trustpilot** | B2C + billing/support reputation | support & billing complaints |
| **Chrome Web Store** | browser extensions | breakage reports · permission distrust |
| **App Store / Play Store** | mobile apps | onboarding + paywall complaints, version regressions |
| **Glassdoor** | competitor employers (CI) | org churn · strategy/roadmap signals |

Walk every applicable cell for every competitor in scope, or **log the skip + reason in
Gaps** (e.g. "no mobile app ⇒ store rows n/a") — no silent caps.

## Engine fan-out (decompose, run in parallel)

All fetches are `agent-reach` URL-reads of **public pages** (`reach.sh read <url>`) —
no logins, no scraping behind auth; respect each site's ToS and rate limits (space the
reads; these are ~1–2 pages per competitor per site, not a crawl).

| Question | Calls |
| --- | --- |
| 1–2 dislikes/loves | `read g2.com/products/{slug}/reviews` (+ `?stars=1..2` and `?stars=5` filtered views) per competitor; same for Capterra/TrustRadius product pages |
| 3 switching | `read` G2 comparison pages (`g2.com/compare/{a}-vs-{b}`); web-search `"switched from {competitor}" review` |
| 4 feature gaps | 1–2★ pages above + web-search `"{competitor}" "wish it" OR "missing" review` |
| 5 segment fit | reviewer-metadata visible on the pages already fetched (harvest, don't re-fetch) |
| 6 ratings shape | each product page header carries distribution; capture the numbers + date |
| 7 org health | `read glassdoor.com/Reviews/{competitor}-Reviews-*.htm` (public page) — competitor CI only, never our own hiring |

Run = **~2–4 reads × per competitor × applicable platforms** (typically 15–30 calls for
a 4–6 competitor set). Store-page reads for our own product too, if it's already live —
our reviews are the cheapest VoC we own.

**Typed evidence records are mandatory.** Every captured review lands in the ledger as
`quote (verbatim) · rating (n/5★) · review date · reviewer segment (if shown) · URL ·
capturedAt`. A quote without its rating + date can't be weighed. Ratings-distribution
numbers are **facts** (source + capture date); trend interpretations are **estimates**.

## Evidence target

`## Reviews & ratings` in the ledger (typed records, per competitor), cross-feeding
`## Pains & VoC` (dislike quotes) and `## Competitive` (gaps, switching, org health).

## Artifacts (the skill's real templates, hydrated)

1. **Objection bank** — ranked dislike themes per competitor with verbatim quotes +
   ratings, feeding [`library/sales-enablement`](../library/sales-enablement/) objection
   handling (VARS) and `pmm-battlecard`.
2. **Ratings comparison table** — competitor × platform × rating (+ distribution +
   trend), CSV export. Renders as a `v-reviews` table.
3. **Switching-language board** — verbatim "left X because / chose Y because" quotes,
   sourced — feeds messaging and comparison pages.

## Flow

`{competitor set}×{product form}` → platform matrix → URL-read fan-out → typed records
in `## Reviews & ratings` → objection bank + ratings table + switching board → feeds
competitive (battlecards), customer (VoC), messaging, and pricing (value complaints).
