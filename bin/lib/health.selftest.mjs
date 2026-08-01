/**
 * Runnable check for the two synthesis functions that decide what a research run can
 * see. No network — both are pure functions of the health document.
 *
 *   liveSources()       -> --search          (a hard filter; an omitted source is a
 *                                             DROPPED source, not a soft preference)
 *   enrichmentSources() -> INCLUDE_SOURCES   (comment text, Threads, Pinterest)
 *
 * The bug this pins: every `*_comments` opt-in defaults to off in the engine, gated on
 * a string in ~/.config/last30days/.env that nobody hand-edits. Users paying for the
 * key that unlocks comment text were getting Reels with engagement counts and no
 * comments — most of the qualitative signal, silently missing.
 *
 * Run: node bin/lib/health.selftest.mjs
 */
import { liveSources, enrichmentSources, reachChannels } from './health.mjs';

let failed = 0;
const ok = (m) => console.log(`  ok  ${m}`);
function check(msg, cond, detail) {
  if (cond) return ok(msg);
  failed++;
  console.error(`  FAIL  ${msg}${detail ? `\n        ${detail}` : ''}`);
}

const doc = (platforms) => ({ platforms });
const S = (state) => ({ state });

// --- liveSources: only `live`, and never a free:* lane ------------------------
{
  const d = doc({
    reddit: S('live'), hackernews: S('live'), x: S('unverifiable'),
    instagram: S('blocked'), tiktok: S('blocked'), youtube: S('live'),
    'free:instagram-accounts': S('live'), 'free:bluesky': S('live'),
    'reach:github': S('live'), jobs: S('live'),
  });
  const got = liveSources(d);
  check('only `live` enters --search', !got.includes('x'), `got ${got}`);
  check('blocked sources never enter --search',
        !got.includes('instagram') && !got.includes('tiktok'), `got ${got}`);
  check('free:* lanes never enter --search (the engine cannot reach them)',
        !got.some((s) => s.startsWith('free:')), `got ${got}`);
  check('reach:* channels never enter --search (different lane, different names)',
        !got.some((s) => s.startsWith('reach:')), `got ${got}`);
  check('real live sources do enter --search',
        ['hackernews', 'jobs', 'reddit', 'youtube'].every((s) => got.includes(s)), `got ${got}`);
}

// --- enrichmentSources: the opt-ins nobody sets --------------------------------
{
  // Pass an empty existing value so this is hermetic — reading the real .env made
  // the threads/pinterest assertions pass vacuously on a machine that already had them.
  const funded = enrichmentSources(doc({ tiktok: S('live') }), '');
  for (const s of ['instagram_comments', 'tiktok_comments', 'youtube_comments',
                   'threads', 'pinterest']) {
    check(`a live key turns on ${s}`, funded.includes(s), `got ${funded}`);
  }

  // 402 is the case that actually happens: the key is present, so the engine's own
  // `available_sources()` still lists instagram/tiktok, but every call returns nothing.
  // Naming enrichment then would be a lie in the log line, so it must stay off.
  for (const dead of ['blocked', 'absent', 'unverifiable', 'broken']) {
    const got = enrichmentSources(doc({ tiktok: S(dead) }), '');
    check(`a ${dead} key adds nothing at all`, got.length === 0, `got ${got}`);
  }

  check('a missing document does not throw', Array.isArray(enrichmentSources(undefined, '')));
  check('a document with no platforms does not throw', Array.isArray(enrichmentSources({}, '')));

  // Whatever the user already set survives, dead key or not — this must never subtract.
  const kept = enrichmentSources(doc({ tiktok: S('blocked') }), 'threads, PINTEREST ,,x');
  check('an existing INCLUDE_SOURCES is preserved, trimmed and lowercased',
        JSON.stringify(kept) === JSON.stringify(['pinterest', 'threads', 'x']), `got ${kept}`);

  const twice = enrichmentSources(doc({ tiktok: S('live') }), '');
  check('the result is stable and deduplicated',
        JSON.stringify(twice) === JSON.stringify(funded)
        && new Set(twice).size === twice.length, `got ${twice}`);
  check('the result is sorted (so the receipt line is diffable)',
        JSON.stringify(twice) === JSON.stringify([...twice].sort()), `got ${twice}`);
}

// --- reachChannels: only what PMM OS actually routes ---------------------------
{
  // Shaped like a real `agent-reach doctor --json`, Chinese strings and all.
  const doctor = {
    xiaohongshu: { status: 'warn', active_backend: 'OpenCLI', message: '小红书未登录，请在 Chrome 中登录' },
    bilibili: { status: 'error', message: 'bili-cli 未安装' },
    xueqiu: { status: 'error', message: '雪球需要登录' },
    xiaoyuzhou: { status: 'error', message: '缺少 ffmpeg' },
    v2ex: { status: 'ok', active_backend: 'HTTP' },
    exa_search: { status: 'ok', active_backend: 'MCP' },
    linkedin: { status: 'warn', active_backend: 'OpenCLI', message: 'not logged in' },
    web: { status: 'ok' },
    github: { status: 'ok', active_backend: 'gh' },
  };
  const got = reachChannels(doctor);
  const names = Object.keys(got);

  check('the five China-market channels never reach the health document',
        !names.some((n) => ['xiaohongshu', 'bilibili', 'xueqiu', 'xiaoyuzhou', 'v2ex']
          .includes(n.replace('reach:', ''))), `got ${names}`);
  // The concrete harm: `npx pmm-os doctor` printed these to a user who never asked
  // for Xueqiu and cannot read the message telling them what went wrong.
  check('no CJK text survives into the health document',
        !/[一-鿿]/.test(JSON.stringify(got)), JSON.stringify(got));
  check('the channels PMM OS does route are kept',
        ['reach:exa_search', 'reach:linkedin', 'reach:web', 'reach:github']
          .every((n) => names.includes(n)), `got ${names}`);
  // Unchanged by the trim, and the reason reach:* is safe to keep in the document
  // at all: doctor proves a backend is INSTALLED, never that a query returns data.
  check('a doctor `ok` is still only `unverifiable`, never `live`',
        got['reach:exa_search'].state === 'unverifiable', JSON.stringify(got['reach:exa_search']));
  check('an empty or missing doctor payload does not throw',
        Object.keys(reachChannels(undefined)).length === 0
        && Object.keys(reachChannels({})).length === 0);
  check('reach:* still never enters --search',
        liveSources({ platforms: got }).length === 0, JSON.stringify(liveSources({ platforms: got })));
}

if (failed) {
  console.error(`\n✗ ${failed} health-synthesis case(s) failed`);
  process.exit(1);
}
console.log('✓ all health-synthesis cases pass — --search and INCLUDE_SOURCES agree with the document');
