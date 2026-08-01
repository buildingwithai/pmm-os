/**
 * Live source health for PMM OS.
 *
 * Why this is not built on `last30days --diagnose`: that path passes safe=True,
 * which sets probe=False and touches the network zero times (pipeline.diagnose ->
 * env.get_x_source_status(probe=not safe)). It reports credential PRESENCE. A key
 * that is present and out of credit reports healthy — which is exactly how four
 * sources returned nothing while the engine printed "5/5 core sources".
 *
 * So every probe here makes a real call, and the state model has five values
 * because "we cannot tell" is a real answer that must not be laundered into "yes":
 *
 *   live         a real call returned real data           -> eligible for --search
 *   blocked      a real call returned a classified error  -> named in the receipt
 *   unverifiable plumbing is up, login unknowable         -> named as a risk, never counted
 *   absent       no lane configured
 *   broken       binary present but will not execute
 *
 * `unverifiable` exists because agent-reach's `web` channel hardcodes status "ok"
 * with no probe at all, and OpenCLI-backed channels report ok when the daemon and
 * extension are on disk — neither can see whether you are logged in. Reporting an
 * unknown as a yes is the same bug as the 402.
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();
const STORE = join(HOME, '.pmm-os', 'connections.json');
const L30_ENV = join(HOME, '.config', 'last30days', '.env');

const TTL = { keyless: 21600, key: 900, cookie: 3600, binary: 21600 };
// Instagram's logged-out web endpoint keys off a browser-shaped UA; a bare fetch UA
// gets a 302 to the login wall.
const UA_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/122.0 Safari/537.36';

function readEnvFile(p) {
  const out = {};
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function timed(fn, ms = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fn(ctl.signal); }
  catch (e) { return { error: e.name === 'AbortError' ? 'timeout' : String(e.message || e) }; }
  finally { clearTimeout(t); }
}

const P = (state, lane, extra = {}) => ({ state, lane, verifiedAt: new Date().toISOString(), ...extra });

// ---------------------------------------------------------------- probes

async function probeKeyless() {
  const checks = {
    hackernews: ['https://hn.algolia.com/api/v1/search?query=ai&hitsPerPage=1',
      (j) => (j.hits || []).length > 0],
    reddit: ['https://www.reddit.com/search.json?q=ai&limit=1',
      (j) => ((j.data || {}).children || []).length > 0],
    polymarket: ['https://gamma-api.polymarket.com/markets?limit=1',
      (j) => Array.isArray(j) && j.length > 0],
    github: ['https://api.github.com/search/repositories?q=ai&per_page=1',
      (j) => (j.items || []).length > 0],
  };
  const out = {};
  await Promise.all(Object.entries(checks).map(async ([name, [url, ok]]) => {
    const r = await timed(async (signal) => {
      const res = await fetch(url, { signal, headers: { 'User-Agent': 'pmm-os-health/1' } });
      if (res.status === 429) return { blocked: 'rate-limited' };
      if (res.status === 403) return { blocked: 'http-403 (unauth rate limit)' };
      if (!res.ok) return { blocked: `http-${res.status}` };
      return { ok: ok(await res.json()) };
    });
    out[name] = r.error ? P('blocked', 'keyless', { reason: r.error })
      : r.blocked ? P('blocked', 'keyless', { reason: r.blocked, fix: 'wait, or set GITHUB_TOKEN for github' })
      : r.ok ? P('live', 'keyless', { evidence: 'real query returned ≥1 item', ttlSec: TTL.keyless })
      : P('blocked', 'keyless', { reason: 'returned zero items' });
  }));
  return out;
}

/**
 * One call covers tiktok, instagram, threads and pinterest — they share the key,
 * and an HTTP 402 on it zeroes all four while the engine calls them "bonus" and
 * scores itself 5/5.
 */
async function probeScrapeCreators() {
  const env = { ...readEnvFile(L30_ENV), ...process.env };
  const raw = env.SCRAPECREATORS_API_KEY || env.SCRAPE_CREATORS_API_KEY || '';
  const key = raw.split(',')[0].trim();          // the engine accepts a comma list
  const shared = ['tiktok', 'instagram', 'threads', 'pinterest'];
  const out = {};
  if (!key) {
    for (const s of shared) {
      out[s] = P('absent', 'scrapecreators', {
        reason: 'no SCRAPECREATORS_API_KEY',
        fix: 'npx pmm-os connect  (free GitHub device flow issues one)',
      });
    }
    return out;
  }
  const r = await timed(async (signal) => {
    const res = await fetch('https://api.scrapecreators.com/v1/tiktok/search/keyword?query=ai',
      { signal, headers: { 'x-api-key': key, 'Content-Type': 'application/json' } });
    return { status: res.status };
  });
  for (const s of shared) {
    if (r.error) { out[s] = P('blocked', 'scrapecreators', { reason: r.error }); continue; }
    if (r.status === 402) {
      out[s] = P('blocked', 'scrapecreators', {
        reason: 'http-402 — key is out of credit',
        fix: 'Top up or rotate SCRAPECREATORS_API_KEY at scrapecreators.com',
      });
    } else if (r.status === 401 || r.status === 403) {
      out[s] = P('blocked', 'scrapecreators', { reason: `http-${r.status} — key rejected`,
        fix: 'Re-issue the key: npx pmm-os connect' });
    } else if (r.status >= 200 && r.status < 300) {
      out[s] = P('live', 'scrapecreators', { evidence: 'SC responded 2xx', ttlSec: TTL.key });
    } else {
      out[s] = P('blocked', 'scrapecreators', { reason: `http-${r.status}` });
    }
  }
  // threads + pinterest also need naming in INCLUDE_SOURCES. They used to be reported
  // `absent` whenever the user's .env did not name them — which was circular, because
  // nobody hand-edits that file, so a working key reported two dead sources forever.
  // bin/pmm-research now synthesizes INCLUDE_SOURCES from this same document (see
  // enrichmentSources below), so a live key genuinely means these are reachable.
  return out;
}

/**
 * The INCLUDE_SOURCES value the engine should be launched with.
 *
 * Five capabilities are gated behind an opt-in string in ~/.config/last30days/.env:
 * threads and pinterest as whole sources, and comment enrichment for Instagram, TikTok
 * and YouTube (env.py:846-880 — each is `key AND name in INCLUDE_SOURCES`). The file is
 * written once by setup and never revisited, so in practice every one of them was off
 * even for users paying for the key that unlocks them. A funded run returned Reels with
 * engagement counts but no comment TEXT, which is most of the qualitative signal.
 *
 * Synthesized here rather than written to the user's file: the same reason --search is
 * synthesized. One live document decides, and there is no stale copy on disk to drift.
 *
 * `tiktok` is the honest proxy for "the SC key has credit" — probeScrapeCreators sets
 * all four shared platforms from one probe, and unlike threads/pinterest it carries no
 * extra opt-in condition of its own.
 */
export function enrichmentSources(doc, existing = null) {
  const scLive = doc?.platforms?.tiktok?.state === 'live';
  // `existing` is injectable so the self-check is hermetic — reading the caller's real
  // .env made two assertions pass vacuously on any machine that already named them.
  const raw = existing ?? (readEnvFile(L30_ENV).INCLUDE_SOURCES || '');
  const fromFile = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const out = new Set(fromFile);
  if (scLive) {
    // youtube_comments is in this list for the machine with a key and no yt-dlp.
    // Everywhere else it is now free: scripts/patch-youtube-comments-free.py made
    // the engine read comments with yt-dlp, so the gate no longer consults
    // INCLUDE_SOURCES at all when the binary is present. Naming it stays correct
    // (it is what the no-yt-dlp fallback reads) and costs nothing.
    for (const s of ['threads', 'pinterest',
                     'instagram_comments', 'tiktok_comments', 'youtube_comments']) {
      out.add(s);
    }
  }
  // DELIBERATELY NOT auto-enabled — three more sources sit behind the same string, and
  // each has a reason to stay the user's explicit choice. Do not "finish the job" here:
  //   linkedin    upstream: "power-user-only and must not silently activate for
  //               existing SCRAPECREATORS_API_KEY holders" (pipeline.py:199-206)
  //   trustpilot  can spawn a one-time headless-Chrome WAF cookie harvest — a real
  //               side effect on the user's machine, not just an API call
  //   perplexity  needs its own paid key, and the pipeline already checks for it
  // The five above are different: pure API calls against a key the user already chose
  // to configure, with no side effect beyond spending its credits.
  return [...out].sort();
}

/** X has a four-backend chain; the engine already knows how to probe it for real.
 *  Its status dict keys are `source` plus per-backend flags — there is no `backend`. */
function probeX(python, repoRoot) {
  if (!python) return { x: P('unverifiable', 'unknown', { reason: 'no Python 3.12+ to run the probe' }) };
  const code = `
import json,sys
sys.path.insert(0, ${JSON.stringify(join(repoRoot, 'skills/last30days/scripts'))})
try:
    from lib import env
    st = env.get_x_source_status(env.get_config(), probe=True)
    src = st.get("source")
    auth = {"bird": st.get("bird_authenticated"), "xai": st.get("xai_available"),
            "xurl": st.get("xurl_available"), "xquik": st.get("xquik_working")}.get(src)
    print(json.dumps({"source": src, "auth": bool(auth)}))
except Exception as e:
    print(json.dumps({"err": str(e)}))
`;
  const r = spawnSync(python, ['-c', code], { encoding: 'utf8', timeout: 40000 });
  let d = {};
  try { d = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch { /* fall through */ }
  if (d.err || !d.source) {
    return { x: P('absent', 'none', { reason: d.err || 'no X backend configured',
      fix: 'Log into x.com in a browser, then: npx pmm-os connect' }) };
  }
  return { x: d.auth
    ? P('live', `x:${d.source}`, { evidence: `${d.source} authenticated (live probe)`, ttlSec: TTL.cookie })
    : P('blocked', `x:${d.source}`, { reason: `${d.source} present but not authenticated`,
        fix: 'Log into x.com in a browser, then: npx pmm-os connect' }) };
}

/**
 * The engine's own last run is stronger evidence than any probe I can write.
 *
 * Learned the hard way: reddit.com returns 403 to both curl and fetch from here,
 * so my keyless probe marked reddit `blocked` — while an actual run had just
 * pulled 11 threads from it via the RSS tier. A false `blocked` is as damaging as
 * a false `live`: it drops a working source out of --search, which is a hard
 * filter. So recent real success always overrides a failed probe.
 */
function applyRunEvidence(platforms, maxAgeHours = 24) {
  let run;
  try { run = JSON.parse(readFileSync(join(HOME, '.config', 'last30days', 'last-run.json'), 'utf8')); }
  catch { return platforms; }
  const at = Date.parse(run.timestamp || run.at || 0);
  if (!at || (Date.now() - at) / 3600000 > maxAgeHours) return platforms;
  for (const [src, count] of Object.entries(run.sources || {})) {
    if (!(count > 0)) continue;
    const cur = platforms[src];
    if (!cur || cur.state !== 'live') {
      platforms[src] = P('live', (cur && cur.lane) || 'engine', {
        evidence: `returned ${count} items in a real run ${new Date(at).toISOString()}`,
        note: cur ? `probe said ${cur.state} (${cur.reason || '—'}); the real run overrides it` : undefined,
        ttlSec: TTL.keyless,
      });
    }
  }
  return platforms;
}

function probeYouTube() {
  const v = spawnSync('yt-dlp', ['--version'], { encoding: 'utf8' });
  if (v.status !== 0) {
    return { youtube: P('absent', 'yt-dlp', { reason: 'yt-dlp not installed',
      fix: 'brew install yt-dlp  (or npx pmm-os setup --yes)' }) };
  }
  // A real metadata fetch. yt-dlp's failure modes here are 429 and the bot wall,
  // and reach.sh used to swallow both.
  const r = spawnSync('yt-dlp', ['--skip-download', '--simulate', '--no-warnings',
    '--print', 'id', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    { encoding: 'utf8', timeout: 25000 });
  if (r.status === 0 && (r.stdout || '').trim()) {
    return { youtube: P('live', 'yt-dlp', { evidence: `yt-dlp ${v.stdout.trim()} fetched metadata`, ttlSec: TTL.binary }) };
  }
  const e = (r.stderr || '').toLowerCase();
  const why = e.includes('429') || e.includes('rate') ? 'rate-limited'
    : e.includes('bot') || e.includes('sign in') ? 'bot-wall (needs cookies)'
    : 'yt-dlp call failed';
  return { youtube: P('blocked', 'yt-dlp', { reason: why,
    fix: why.startsWith('bot') ? 'log into youtube.com in a browser, then: npx pmm-os connect' : 'retry later' }) };
}

async function probeGrounding() {
  const env = { ...readEnvFile(L30_ENV), ...process.env };
  const keyed = ['BRAVE_API_KEY', 'EXA_API_KEY', 'SERPER_API_KEY', 'PARALLEL_API_KEY'].find((k) => env[k]);
  if (keyed) return { grounding: P('live', `web:${keyed.split('_')[0].toLowerCase()}`, { evidence: 'key present', ttlSec: TTL.key }) };
  const r = await timed(async (signal) => {
    const res = await fetch('https://r.jina.ai/https://example.com', { signal });
    return { ok: res.ok, len: res.ok ? (await res.text()).length : 0 };
  }, 15000);
  // Assert on OUR side of the contract — a 200 and a non-trivial body — never on a
  // third party's page content. Asserting /example domain/i false-blocked this on a
  // network that serves a different example.com, dropping web search out of --search
  // entirely. That is the exact failure the comment above warns about, committed by
  // the same file that warns about it.
  if (r.ok && r.len > 80) {
    return { grounding: P('live', 'web:jina-keyless', { evidence: `Jina reader returned ${r.len} bytes`, ttlSec: TTL.keyless }) };
  }
  return { grounding: P('blocked', 'web:jina-keyless', { reason: r.error || 'Jina unreachable',
    fix: 'set BRAVE_API_KEY or SERPER_API_KEY for a keyed web backend' }) };
}

/**
 * The KEYLESS desk lanes (reach.sh), reported separately from the engine lanes.
 *
 * These are `free:*` keys on purpose, so `liveSources()` — which filters on engine
 * source names — can never feed one to `--search`. The engine genuinely cannot reach
 * them; only the desks can, via reach.sh. Keeping them in the same document is what
 * stops the wizard from printing "Instagram: blocked" when `reach.sh ig nike` works
 * perfectly. Both facts are true; they are about different lanes.
 *
 * `free:instagram-search` is deliberately absent — there is no keyless path. All five
 * candidate routes (web tag page, /api/v1/tags/, GraphQL hashtag query, explore, the
 * i/api tag feed) return 302/401/404 logged-out. That is a wall, not a rate limit.
 */
async function probeFree(ytdlpLive) {
  const out = {};
  const ig = await timed(async (signal) => {
    const res = await fetch('https://www.instagram.com/api/v1/feed/user/nasa/username/?count=1',
      // Referer is load-bearing here, not decoration: without it Node's fetch gets a
      // deterministic 400 on the same URL curl and urllib get a 200 on. Dropping it
      // makes the probe report Instagram dead while `reach.sh ig` works.
      { signal, headers: { 'X-IG-App-ID': '936619743392459', 'User-Agent': UA_BROWSER,
        Accept: 'application/json', Referer: 'https://www.instagram.com/nasa/' } });
    if (!res.ok) return { status: res.status };
    const j = await res.json().catch(() => ({}));
    return { status: 200, n: (j.items || []).length };
  }, 15000);
  out['free:instagram-accounts'] = ig.error
    ? P('blocked', 'ig-web-logged-out', { reason: ig.error })
    : ig.status === 200 && ig.n > 0
      ? P('live', 'ig-web-logged-out', { evidence: 'logged-out feed endpoint returned a post', ttlSec: TTL.keyless })
      : P('blocked', 'ig-web-logged-out', {
          reason: `http-${ig.status} — Instagram is walling or throttling this IP`,
          fix: 'run from a residential IP; datacenter ranges are blocked hardest' });

  const bs = await timed(async (signal) => {
    // api.bsky.app, NOT public.api.bsky.app — the latter 403s on searchPosts.
    const res = await fetch('https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=ai&limit=1', { signal });
    if (!res.ok) return { status: res.status };
    const j = await res.json().catch(() => ({}));
    return { status: 200, n: (j.posts || []).length };
  });
  out['free:bluesky'] = bs.error ? P('blocked', 'bsky-appview', { reason: bs.error })
    : bs.status === 200 && bs.n > 0
      ? P('live', 'bsky-appview', { evidence: 'searchPosts returned a post, no auth', ttlSec: TTL.keyless })
      : P('blocked', 'bsky-appview', { reason: `http-${bs.status}` });

  // Same binary, same YouTube API surface as the transcript lane already probed — so
  // this is derived, not re-probed. Spawning yt-dlp twice per health check costs ~8s
  // for a fact we already have.
  for (const k of ['free:youtube-comments', 'free:tiktok-accounts']) {
    out[k] = ytdlpLive
      ? P('live', 'yt-dlp', { evidence: 'yt-dlp present and working', ttlSec: TTL.binary })
      : P('absent', 'yt-dlp', { reason: 'yt-dlp not installed', fix: 'npx pmm-os setup' });
  }
  return out;
}

/**
 * The five China-market channels agent-reach ships. PMM OS does not route them
 * (scripts/patch-agent-reach-trim.py took them out of the skill), and reporting them
 * here was worse than useless: their status messages are Chinese error strings, which
 * surfaced verbatim in `npx pmm-os doctor` for a user who never asked for Xueqiu.
 * A channel the plugin will not call has no business in the plugin's health table.
 */
const REACH_DROP = new Set(['xiaohongshu', 'bilibili', 'xueqiu', 'xiaoyuzhou', 'v2ex']);

/**
 * agent-reach's own doctor output, with its optimism corrected and its untrodden
 * channels dropped. Pure so the self-check can feed it a real doctor payload —
 * including the Chinese error strings — without a 45-second subprocess.
 */
export function reachChannels(d) {
  const out = {};
  for (const [ch, v = {}] of Object.entries(d || {})) {
    if (REACH_DROP.has(ch)) continue;
    const backend = v.active_backend || null;
    const key = `reach:${ch}`;
    if (ch === 'web') {
      // web.py hardcodes "ok" and never probes. Our own Jina check covers it.
      out[key] = P('unverifiable', 'jina', { reason: 'agent-reach reports web ok without probing' });
    } else if (backend === 'OpenCLI') {
      out[key] = P('unverifiable', 'opencli', {
        reason: 'daemon + extension present; login state is only knowable at call time',
        fix: `log into ${ch} in Chrome; the first real call returns AUTH_REQUIRED if not`,
      });
    } else if (v.status === 'ok') {
      // NOT `live`. agent-reach's doctor checks that a backend is INSTALLED and
      // reachable, not that a real query returns data — and the difference is not
      // hypothetical. Measured 2026-07-30: `exa_search` reported ok while the call its
      // own SKILL.md documents
      //   mcporter call 'exa.web_search_exa(query: "...", numResults: 5)'
      // returned HTTP 429 "You've hit Exa's free MCP rate limit". Reporting that as
      // live is the same bug as calling a 402'd ScrapeCreators key healthy.
      // These never enter --search regardless (liveSources filters reach:*), so this
      // only changes what the table claims — which is the point.
      out[key] = P('unverifiable', backend || 'unknown', {
        reason: 'agent-reach doctor confirms the backend is installed, not that a query returns data',
        fix: `make one real call through ${backend || 'the backend'} before relying on it`,
      });
    } else if (v.status === 'warn') {
      out[key] = P('blocked', backend || 'none', { reason: (v.message || '').split('\n')[0].slice(0, 120) });
    } else {
      out[key] = P('absent', 'none', { reason: (v.message || '').split('\n')[0].slice(0, 120) });
    }
  }
  return out;
}

function probeAgentReach() {
  const r = spawnSync('agent-reach', ['doctor', '--json'], { encoding: 'utf8', timeout: 45000 });
  if (r.status !== 0 || !r.stdout) return {};
  try { return reachChannels(JSON.parse(r.stdout)); } catch { return {}; }
}

// ---------------------------------------------------------------- api

export async function probeAll({ python = null, repoRoot = process.cwd() } = {}) {
  const [keyless, sc, grounding] = await Promise.all([
    probeKeyless(), probeScrapeCreators(), probeGrounding(),
  ]);
  const yt = probeYouTube();
  const free = await probeFree(yt.youtube?.state === 'live');
  const doc = {
    schema: 'pmm-os/connections/v1',
    checkedAt: new Date().toISOString(),
    platforms: { ...keyless, ...sc, ...grounding, ...probeX(python, repoRoot),
                 ...yt, ...free, ...probeAgentReach() },
  };
  // jobs rides the same keyless ATS tier as the rest; it is only reachable when named.
  doc.platforms.jobs = P('live', 'keyless-ats', { evidence: 'keyless ATS tier', ttlSec: TTL.keyless });
  doc.platforms = applyRunEvidence(doc.platforms);
  try {
    mkdirSync(join(HOME, '.pmm-os'), { recursive: true });
    writeFileSync(STORE, JSON.stringify(doc, null, 1));
  } catch { /* the in-memory doc is what callers use */ }
  return doc;
}

export function loadCached(maxAgeSec = 900) {
  try {
    const d = JSON.parse(readFileSync(STORE, 'utf8'));
    if ((Date.now() - Date.parse(d.checkedAt)) / 1000 < maxAgeSec) return d;
  } catch { /* no usable cache */ }
  return null;
}

/**
 * The sources the engine may be told to use. ONLY `live` — never `unverifiable`,
 * because --search is a hard filter and naming a dead source wastes the slot while
 * naming nothing at all silently drops the source entirely.
 */
export function liveSources(doc) {
  const engineNames = new Set(['reddit', 'hackernews', 'polymarket', 'github', 'x',
    'youtube', 'tiktok', 'instagram', 'threads', 'pinterest', 'grounding', 'jobs']);
  return Object.entries(doc.platforms)
    .filter(([n, v]) => engineNames.has(n) && v.state === 'live')
    .map(([n]) => n)
    .sort();
}

export function summarize(doc) {
  const by = { live: [], blocked: [], unverifiable: [], absent: [], broken: [] };
  for (const [n, v] of Object.entries(doc.platforms)) (by[v.state] || by.absent).push(n);
  return by;
}
