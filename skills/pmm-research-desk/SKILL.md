---
name: pmm-research-desk
description: Run a domain research desk — Events, Competitive, Customer/pain, Market, Pricing — scoped to your product, segment, and market. Loads the senior-specialist question set, fans it out across the two research engines (last30days + agent-reach), captures sourced evidence into the ledger, and emits the desk's structured artifact (e.g. a ranked events table + CSV) into the launch-kit dashboard. Use for "research events/conferences to market at", "competitive research", "customer pain research for {segment} in {market}", or any scoped, specialist research that should produce an artifact and hydrate the rest of PMM OS.
---

# PMM Research Desk runner

You run **research desks**: a desk is a PMM research domain owned by a senior
specialist's question set, executed across both engines, producing a sourced
evidence slice **and** a structured dashboard artifact. This is how research becomes
scoped, specialist-grade, and reusable — not a generic web search.

Read the framework first: [`../product-marketing-os/references/research-desks/README.md`](../product-marketing-os/references/research-desks/README.md).
Recipes live in `../product-marketing-os/references/research-desks/<domain>.md`
(today: **events**; others are the roadmap).

## Workflow

1. **Scope it.** Read the `## Scope` block from `.agents/research/brief.md` (and the
   context spine `.agents/product-marketing.md`): `{product}`, `{ICP/segment}`, `{market}`,
   `{window}`, **plus geography (+ granularity), timeframe/seasonality, and the
   exhaustiveness target** — the model is
   [`../product-marketing-os/references/research-scope-model.md`](../product-marketing-os/references/research-scope-model.md).
   Ask only for the dimension genuinely missing. Research is always scoped, never generic —
   and **scoped means focused *and* complete within the focus**: you filter out-of-scope
   hits (wrong geo/quarter/segment) *and* you pursue the target count (events ≥ the recipe's
   floor, the full competitor set, …) — a handful when the scope holds dozens is a fail.
   **If the user arrived with a raw product brain-dump**, the scope + which desks to run
   comes from [`pmm-research-brief`](../pmm-research-brief/SKILL.md) (the research front
   door) — run that first; this skill then executes one planned desk with the scoped
   entities + scope it named.
   **Check the Plan gate before ANY engine call:** `.agents/research/hypothesis.md` and
   `.agents/research/issue-tree.md` must exist (the brief's Plan gate writes them — per
   [deliverable-standard §5](../product-marketing-os/references/deliverable-standard.md)).
   Missing ⇒ stop and produce them first. Then **map every engine call in your fan-out to
   the issue-tree leaf it tests** — a call that tests no leaf doesn't run.
   **Open the desk's own sprint:** FIRST read `hypothesis.md` **in full — the pivot log
   at the BOTTOM is the newest truth** (a sweep that reads only the day-1 head can
   re-litigate kill-conditions the corpus already resolved — verified failure mode).
   Then append a `### Desk: {name}` mini-hypothesis (5 lines — likely answer + the
   disconfirming evidence that would kill it), and **read
   `.agents/research/carry-forward.md`** (if present) — earlier desks' findings re-scope
   THIS desk's entities and queries (their verbatims become your grep phrases, their
   named competitors your read targets).
2. **Load the desk recipe** for the requested domain (e.g. `research-desks/events.md`).
   It carries the specialist's question set + the engine fan-out table.
3. **Know what's live.** Run `bash scripts/verify-research.sh` (or `reach.sh doctor`) so you
   know which sources are available before you promise depth. Capability map +
   keyless-vs-setup matrix: [`../product-marketing-os/references/research-engines.md`](../product-marketing-os/references/research-engines.md).
   For **X + Instagram**, run `reach.sh social-status`; if a desk needs them and they're not
   signed in, tell the user the one-time step (X = stay logged into x.com in a browser; IG =
   `reach.sh ig-login YOUR_IG_USERNAME`) — guide, don't ask for their password. See
   [`../product-marketing-os/references/social-auth-setup.md`](../product-marketing-os/references/social-auth-setup.md).
   For **LinkedIn**, run `bash scripts/linkedin-setup.sh status` — it names one of three
   states with the exact fix (never configured → run setup after logging into linkedin.com
   in a browser; service down → the printed restart one-liner; session expired →
   `linkedin-setup.sh reauth`). **A platform being un-signed-in NEVER kills a desk:** relay
   the state + fix to the user verbatim, degrade to the keyless path (LinkedIn → Jina
   public-page reads via `reach.sh read`; IG/TikTok → skip the cell), log the gap, and
   continue. If a LinkedIn call errors mid-run with a login/authentication message, that IS
   the session-expired state — same relay-fix-degrade-continue, never silent failure.
4. **Fan out — at FULL DEPTH (1:1 with the source repos), decompose, don't batch.** Neither
   engine takes a list of questions: `last30days` = one topic per run; `agent-reach` = one
   query/URL per call. Turn the question set into the recipe's **~15–30 calls** and run them
   in parallel. **The depth target is parity with running the engines' own repos directly** —
   drive their full vendored contracts, never a throttled subset:
   - **`last30days` — run its full contract per its own [SKILL.md](../last30days/SKILL.md).**
     Resolve and pass **every applicable flag**: `--subreddits={communities}`, `--x-handle` +
     `--x-related`, `--github-user`/`--github-repo`, `--tiktok-hashtags`, `--ig-creators`, and a
     `--plan`. **Never `--quick`** on a real desk run. *Why it matters (measured):* a bare topic
     hits **1–3 of 9 sources**; the flags are what activate TikTok/IG/X/Threads to reach the full
     **9 sources / 10–15 clusters**. A bare/untargeted topic also returns entity-miss NOISE
     (measured: an untargeted consumer-domain topic → horror-movie reviews + Kubernetes docs).
     The recipe names the entities → flags — always derived from the brief's `{segment}`/`{product}`,
     never a fixed list.
   - **`agent-reach` — use the FULL channel set, not just `reach.sh`'s keyless 4.** The vendored
     package has **14 channels** (twitter, reddit, linkedin, xiaohongshu, bilibili, xiaoyuzhou,
     xueqiu, exa, rss, youtube, v2ex, github, web). Drive the keyless ones via
     [`reach.sh`](../agent-reach/scripts/reach.sh) (`read`/`gh-search`/`yt`/`v2ex`) and the
     login/key ones per the agent-reach [SKILL.md](../agent-reach/SKILL.md) (`agent-reach configure`
     + the backends). `reach.sh` covers **free TikTok + Instagram incl. hashtag SEARCH**:
     `reach.sh tiktok @user` / `tiktok-search <hashtag>` (TikTokApi+webkit) ·
     `reach.sh ig user` / `ig-search <hashtag>` (instaloader; one-time login, residential IP). So
     named-account *and* topic-discovery social research are free — ScrapeCreators isn't needed
     (it only adds Threads/Pinterest + YT comments). **Issue the recipe's full ~15–30 calls** —
     read each competitor's site + pricing + reviews + socials, search GitHub + the social hashtags.
     Two reads is not a desk run.
     Run `bash ../agent-reach/scripts/setup.sh` once to install the backends.
   - **Walk the desk's platform matrix — every cell or a logged skip.** Each recipe (and
     the README's platform-coverage rule) declares which platforms × query archetypes carry
     signal for this desk — including TikTok/IG/YouTube/web-SERP for creator/discovery
     desks and review sites for text-pain desks. A cell you don't run gets a one-line
     reason in the Gaps block; an unexplained empty cell is a silent cap, which is a fail.
   - If a source is `needs setup`, record the gap in the ledger (one-line fix), don't drop it silently.
   - **Select sources per desk + cap runtime (don't let one source hang the sweep).** Pass
     `--search=<sources>` so each `last30days` run only hits sources that carry signal for
     *that* desk, and wrap every engine call in an outer `timeout`:
     - **Text-pain desks** (customer, competitive, market, pricing): `--search=reddit,x,github,web`
       — **exclude `youtube`**. YouTube *transcript* fetching is the slowest + most
       rate-limited source (yt-dlp hits HTTP 429 / "confirm you're not a bot" and burns the
       retry budget); it adds little to pain/competitor text research and is what stalls runs.
     - **Saturation is the DEFAULT for every desk's engine calls** — prefix each
       `last30days` run with the PMM-OS env overrides and pass `--deep`:
       `LAST30DAYS_TRANSCRIPT_LIMIT=1000 LAST30DAYS_RESULTS_PER_PAGE=100 python3 … --deep`
       These are **ceilings (runtime guards), never targets or quotas**: the engine
       fetches whatever the 30-day window actually holds; 1000 just means "the cap is
       never the limiter." (Re-applied to the vendored engine by the sync script.)
     - **Creator/discovery desks** (channels, analyst/KOL): include `youtube`
       deliberately; prefer `reach.sh yt`/`tiktok-search`/`ig-search` for the raw
       hashtag/creator sweep (full result list with engagement counts). Record
       videos-scanned vs judged-relevant vs transcripts-pulled per platform in the run
       file — video coverage is a matrix cell: count it or log why not.
     - **Judged transcription — YOU are the relevance judge, not a keyword heuristic.**
       The engine's local ranking only checks entity-in-title/snippet + engagement (its
       LLM rerank runs only when a GEMINI/OPENAI key is configured, and even then it
       knows just the topic string — never the desk's hypothesis). So between scan and
       transcribe, judge every ranked candidate yourself against the desk rubric:
       (a) **on-entity** — actually about the product/category/segment, not a word
       collision; (b) **in-scope** — right geo/segment/window per the brief's `## Scope`;
       (c) **tests a leaf** — bears on an issue-tree leaf, a kill-condition, or the desk
       mini-hypothesis; (d) **novel** — adds something the ledger doesn't already hold.
       Accept ⇒ transcript/full-fetch. Reject ⇒ one-line reason in the run file
       ("word-collision", "out-of-geo", "duplicate of E12"). A candidate you can't judge
       from title+caption gets a cheap peek (snippet read) before the expensive fetch.
       **Fix a noisy query first (self-healing rule) before deep-transcribing it** —
       saturating a bad query transcribes junk; judging is not a substitute for
       reformulation.
     - **Always**: `timeout 420 python3 .../last30days.py …` (hard ceiling), and run **one
       topic per command into its own `runs/<date>-<desk>-<engine>.md` file** — never blob
       two heavy topics into one fire-and-forget background job (a stalled topic then hides
       behind a 0-byte file, which is exactly how a run looks "hung overnight").
   - **Self-healing probes — noise is NEVER coverage.** After every engine batch, run a
     signal check: are the top clusters on-entity, or dominated by entity-miss demotions
     / off-topic items? A noisy or empty probe does not count as a covered cell — it
     triggers a **reformulate-and-retry loop** (up to 3 reformulations per probe, each
     logged with its outcome):
     1. **Quote the buyer's words** — replace your abstraction with verbatims already in
        the ledger/carry-forward (`"waiting on the data team"`, not `analytics delays`).
     2. **Name entities** — add `--x-handle`/`--x-related` (competitor + creator handles
        harvested from earlier desks), tighten `--subreddits` to the segment's real
        communities, name the product/category exactly.
     3. **Split, don't broaden** — a topic that misses gets divided into two narrower
        topics, never padded with more keywords (more keywords = more entity-miss).
     Only after 3 reformulations still return noise is the cell a logged dead-end
     ("no fresh signal for X in this window — probes: a/b/c") — a *finding*, not a skip.
   - **Tight X / topic queries — never broad keyword soup.** `last30days` topic strings and
     `--x-handle`/`--x-related` must be **entity-targeted**: real handles + quoted exact
     phrases (`"flying blind"`, `"waiting on the data team"`), not a bag of common words.
     A broad free-text topic (`waiting on data team for product analytics answers slow`)
     matches any tweet with those words → off-topic noise (sports, politics). Name the
     handles and quote the phrases the recipe gives you.
5. **Capture every run** to `.agents/research/runs/<date>-<domain>-<engine>.md` via
   `scripts/research-store.sh add <domain> <engine> <file>`. Nothing is lost to chat.
   **Screenshot the load-bearing quotes.** When a finding rests on a real user's public
   post (Reddit thread, review, tweet), also capture a screenshot: drive Chrome via the
   Chrome DevTools MCP in **attach mode** (see the `chrome-for-testing` skill — never
   launch mode), save the PNG to `.agents/research/evidence-shots/<desk>-<slug>-<YYYYMMDD>.png`,
   and set the evidence record's `shot` field (the record already carries `url` + `date`).
   Guardrails: **public content only**, no logged-in/private views, and never crop away
   the context that makes the quote honest. Double duty: proof inside the workspace +
   ready-made social-proof material — an "evidence pack" export is just this folder with
   captions from the records.
6. **Distill into the ledger — the FULL findings, not a summary.** Write the recipe's
   evidence section in `.agents/research/evidence.md` answering **each question in the
   question set** with its evidence (quotes, numbers, named entities, the "so what"), every
   claim sourced; gated/unknown facts marked, never invented. The dashboard hydrates from
   this section — **thin evidence here ⇒ a thin dashboard.** Hand to `pmm-product-context`
   to reconcile with the spine. See
   [`../product-marketing-os/references/research-context-pipeline.md`](../product-marketing-os/references/research-context-pipeline.md).
7. **Present meat-first in the dashboard — not just the artifact.** Per the
   [`research-presentation-standard.md`](../product-marketing-os/references/research-presentation-standard.md),
   the desk's dashboard view renders in order: **(a) Scope** (geo · timeframe · target) →
   **(b) Questions this desk answers** (the question set, shown) → **(c) Findings** (each
   question answered in depth, sourced — the bulk) → **(d) the Artifact** (the ranked table
   / matrix / battlecards from the recipe's template, *after* the findings) → **(e) Gaps &
   verify**. Build it as `kit-content.json` blocks (`kv`/`list`/`rows`/`table`/`callout`)
   and render via `pmm-launch-kit`; export the artifact's CSV. **A view that is only the
   artifact + a callout is incomplete** — that's the thinness this standard prevents.

## Evidence rigor — run requirements

Every desk run obeys the research rigor rules
([deliverable-standard §3](../product-marketing-os/references/deliverable-standard.md));
the structured shape they land in is the
[report contract](../product-marketing-os/references/report-contract.md). These are run
requirements, not aspirations:

- **Type every claim.** Each ledger claim is a **fact** (source + date + locator), an
  **estimate** (method stated), or an **assumption** (flagged). Unsourced model knowledge
  is re-searched or labeled **unverified** — never silently asserted as fact.
- **Record the capture date.** Every quote/number carries the date it was captured (the
  run date) — in `report.json`, evidence entries take the optional `date` field
  (`"YYYY-MM-DD"`). A number without its capture date can't be judged for freshness.
- **Two-source rule.** Any number the recommendation depends on is triangulated against an
  independent source. A conflict between sources is **surfaced, not averaged** — show both
  numbers, name the disagreement.
- **Adversarial pass.** Before the desk closes, run one explicit search FOR evidence
  AGAINST the desk's main finding, and log the result — **supports / refutes /
  nothing-found** — in the desk's Gaps (and the report's `adversarialPass` field).
- **Synthesize continuously.** After each engine batch, update the running "current best
  answer" in `.agents/research/hypothesis.md` (append — the pivot log is the audit trail),
  scoring the new findings **supporting / refuting / neutral** against the day-1 hypothesis
  **and the desk's own mini-hypothesis**.
- **Close the sprint — carry forward.** Before the desk closes, append a
  `### From {desk} ({date})` block to `.agents/research/carry-forward.md`: the 3–5
  findings that should re-scope later desks' queries (new competitor names, the segment's
  verbatim phrases, the communities that lit up, the category language). The next desk
  reads this at scope time — sequencing is what makes the sweep compound.

## Output

- The desk's **evidence-ledger section** (sourced) — the **full findings**, each question
  answered, not a summary.
- The desk's **dashboard view**, meat-first: Scope → Questions → Findings → Artifact →
  Gaps (per [`research-presentation-standard.md`](../product-marketing-os/references/research-presentation-standard.md)).
- The desk's **artifact**: a ranked, columned table + CSV, plus a short "why the top
  picks rank where they do" and a "verify before you commit budget/effort" note —
  positioned *after* the findings, not as the whole view.
- Every quantitative claim cites a source **and its capture date**, typed
  fact / estimate / assumption; gated/unknown cells are flagged, not guessed. The Gaps
  block carries the **adversarial-pass log** (what was searched against the main finding,
  what came back).

## Hard gate

This desk is what *unblocks* downstream strategy. A GTM/launch/positioning/pricing
deliverable may not be produced until the desks that feed it have run and the ledger
holds their sections (see the framework's *Hard gate*). When asked for strategy with no
evidence present, run the relevant desk(s) first, then proceed.

## Hand off to

- [`pmm-go-to-market`](../pmm-go-to-market/SKILL.md) — the field-marketing motion the events desk feeds
- [`pmm-product-context`](../pmm-product-context/SKILL.md) — reconcile the evidence into the context spine
- [`pmm-launch-kit`](../pmm-launch-kit/SKILL.md) — render the artifact into the dashboard
- [`pmm-coach`](../pmm-coach/SKILL.md) — review before anything customer- or exec-facing.
