/**
 * `npx pmm-os connect` — walk the user through connecting research sources.
 *
 * Two design rules, both learned from what went wrong:
 *
 * 1. SHOW CONSEQUENCES, NOT STATUSES. "tiktok: blocked" tells you nothing you'd
 *    act on. "TikTok/IG/Threads return NOTHING — creator and discovery desks run
 *    with a hole" does.
 *
 * 2. NEVER DECLARE SUCCESS ON PRESENCE. The existing setup wizard writes an API
 *    key and calls it connected. That is precisely how you end up with a "connected"
 *    TikTok that has been 402ing for weeks. Every step here re-probes for real
 *    before it says the word.
 */
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import * as health from './health.mjs';

const HOME = homedir();
const log = (s = '') => console.log(s);

const C = process.stdout.isTTY
  ? { dim: (s) => `\x1b[2m${s}\x1b[0m`, b: (s) => `\x1b[1m${s}\x1b[0m`,
      ok: (s) => `\x1b[32m${s}\x1b[0m`, bad: (s) => `\x1b[31m${s}\x1b[0m`,
      warn: (s) => `\x1b[33m${s}\x1b[0m` }
  : { dim: (s) => s, b: (s) => s, ok: (s) => s, bad: (s) => s, warn: (s) => s };

/** What the user loses while this platform is down — the only line that drives action. */
const CONSEQUENCE = {
  tiktok: 'creator and discovery desks run with a hole',
  instagram: 'creator and discovery desks run with a hole',
  threads: 'no Threads signal in VoC or competitive',
  pinterest: 'no Pinterest signal in visual/consumer desks',
  x: 'the single richest VoC source is missing',
  youtube: 'no video transcripts — the depth source for creator desks',
  reddit: 'the primary pain/VoC source is missing',
  hackernews: 'no dev/technical audience signal',
  grounding: 'no web search — competitive and market desks thin out',
  github: 'no dev-ecosystem or repo signal',
  polymarket: 'no market-expectation signal',
  jobs: 'no hiring-signal desk',
};

function ask(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(q, (a) => { rl.close(); res(a.trim()); }));
}

function py() {
  for (const c of ['python3.13', 'python3.12', 'python3']) {
    const r = spawnSync(c, ['-c', 'import sys;sys.exit(0 if sys.version_info>=(3,12) else 1)'], { stdio: 'ignore' });
    if (r.status === 0) return c;
  }
  const uv = spawnSync('uv', ['python', 'find', '>=3.12'], { encoding: 'utf8' });
  return uv.status === 0 && uv.stdout.trim() ? uv.stdout.trim() : null;
}

// ---------------------------------------------------------------- screens

function renderMatrix(doc) {
  const by = health.summarize(doc);
  const core = (n) => !n.startsWith('reach:');
  log('');
  log(C.b('PMM OS — source connections') + C.dim(`     probed ${new Date(doc.checkedAt).toLocaleTimeString()}`));
  log('');

  const live = by.live.filter(core);
  if (live.length) log('  ' + C.ok('live'.padEnd(14)) + live.join(' · '));

  const blocked = by.blocked.filter(core);
  if (blocked.length) {
    log('');
    for (const n of blocked) {
      const v = doc.platforms[n];
      log('  ' + C.bad('blocked'.padEnd(14)) + C.b(n.padEnd(12)) + C.dim(v.reason || ''));
    }
    const lost = [...new Set(blocked.map((n) => CONSEQUENCE[n]).filter(Boolean))];
    for (const l of lost) log('  ' + ' '.repeat(14) + C.warn('→ ' + l));
  }

  const unv = by.unverifiable.filter(core);
  if (unv.length) {
    log('');
    for (const n of unv) log('  ' + C.warn('unverifiable'.padEnd(14)) + C.b(n.padEnd(12))
      + C.dim(doc.platforms[n].reason || ''));
  }

  const absent = by.absent.filter(core);
  if (absent.length) {
    log('');
    for (const n of absent) log('  ' + C.dim('absent'.padEnd(14) + n.padEnd(12) + (doc.platforms[n].reason || '')));
  }

  log('');
  log(C.dim(`  ${live.length} live · ${blocked.length} blocked · ${unv.length} unverifiable · ${absent.length} absent`));
  const reach = Object.keys(doc.platforms).filter((n) => !core(n));
  if (reach.length) log(C.dim(`  (plus ${reach.length} agent-reach channels — pmm-research health for detail)`));
  return by;
}

// ---------------------------------------------------------------- actions

/**
 * The wait-and-verify loop. Tell them what to do, WAIT, then check for real —
 * and if the cookie isn't there yet, say why and let them retry rather than
 * declaring failure.
 */
async function connectBrowserCookie(repoRoot, platform, site, doc) {
  log('');
  log(C.b(`${platform} — free, about 30 seconds`));
  log('');
  log(`  1. Open ${C.b(site)} in Chrome, Firefox, Safari, Arc, Brave, Edge or Vivaldi`);
  log('     and make sure you are signed in.');
  log('  2. Come back here and press Enter.');
  log('');

  for (let attempt = 1; attempt <= 3; attempt++) {
    const a = await ask(`  [Enter when signed in, or 's' to skip] `);
    if (a.toLowerCase() === 's') { log(C.dim('  skipped.')); return false; }

    log(C.dim('  scanning chrome, brave, arc, edge, vivaldi, firefox, safari…'));
    const r = spawnSync('python3', [join(repoRoot, 'skills/agent-reach/scripts/social_setup.py'), platform],
      { encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    const wrote = /✓/.test(out);

    if (wrote) {
      // Presence is not proof. Re-probe before saying the word.
      log(C.dim('  verifying with a live call…'));
      const fresh = await health.probeAll({ python: py(), repoRoot });
      const st = fresh.platforms[platform === 'x' ? 'x' : platform];
      if (st && st.state === 'live') {
        log('  ' + C.ok(`✓ ${platform} connected and verified`) + C.dim(` — ${st.evidence || ''}`));
      } else {
        log('  ' + C.warn(`! cookies were written but the live check still says ${st?.state || 'unknown'}`));
        log(C.dim(`    ${st?.reason || ''}`));
      }
      // The cookies now land in BOTH lanes — but agent-reach's X channel also needs
      // its own binary, so credentials alone will not flip it out of `warn`. Say so
      // rather than leaving the two lanes visibly disagreeing with no explanation.
      if (platform === 'x' && fresh.platforms['reach:twitter']?.state !== 'live') {
        log(C.dim("    note: agent-reach's X lane additionally needs `pipx install twitter-cli`."));
        log(C.dim('    last30days can use X regardless — that is the lane research actually runs on.'));
      }
      return fresh;
    }

    log('  ' + C.bad('✗ no session found in any of those browsers.'));
    if (out.includes('browser_cookie3')) {
      log(C.dim('    browser_cookie3 is not installed — run `npx pmm-os setup --yes` first.'));
      return false;
    }
    if (attempt < 3) {
      log(C.dim(`    If you signed in just now, the cookie may not be written yet —`));
      log(C.dim(`    reload ${site} once, then press Enter to rescan. (attempt ${attempt} of 3)`));
    }
  }
  log(C.dim('  giving up on this one for now.'));
  return false;
}

/**
 * ScrapeCreators, via the GitHub device flow the engine already implements.
 * The existing wizard stops at "key written". We probe the credit balance,
 * because a written key at 402 is worse than no key: it looks connected.
 */
async function connectScrapeCreators(repoRoot) {
  const P = py();
  if (!P) { log(C.bad('  ✗ needs Python 3.12+ — run `npx pmm-os connect` again after installing one.')); return false; }
  const engine = join(repoRoot, 'skills/last30days/scripts/last30days.py');

  log('');
  log(C.b('ScrapeCreators — free tier, unlocks TikTok · Instagram · Threads · Pinterest'));
  log('');
  const go = await ask('  Start the GitHub device authorization? [Y/n] ');
  if (go.toLowerCase() === 'n') return false;

  const start = spawnSync(P, [engine, 'setup', '--github-start'], { encoding: 'utf8', timeout: 60000 });
  const line = (start.stdout || '').split('\n').find((l) => l.includes('device_code_ready'));
  let info = {};
  try { info = JSON.parse(line); } catch { /* fall back to inherited output */ }

  if (info.user_code) {
    log('');
    log('  Your code: ' + C.b(info.user_code) + C.dim('  (copied to your clipboard on macOS)'));
    log('  Open: ' + C.b(info.verification_uri || 'https://github.com/login/device'));
    log('');
    log(C.dim('  Waiting for you to authorize — up to 5 minutes. Ctrl-C to stop.'));
  } else {
    log(C.dim('  (device flow started; follow the prompts above)'));
  }

  const poll = spawnSync(P, [engine, 'setup', '--github-poll'], { stdio: 'inherit', timeout: 320000 });
  if (poll.status !== 0) { log(C.bad('  ✗ authorization did not complete.')); return false; }

  // The whole point: verify credit, not just that a key landed on disk.
  log(C.dim('  key written — checking it actually has credit…'));
  const fresh = await health.probeAll({ python: P, repoRoot });
  const tk = fresh.platforms.tiktok;
  if (tk?.state === 'live') {
    log('  ' + C.ok('✓ ScrapeCreators connected and has credit') + C.dim(' — TikTok/IG/Threads/Pinterest are live'));
  } else {
    log('  ' + C.warn(`! key written but ${tk?.reason || 'the credit check failed'}`));
    if (tk?.fix) log(C.dim(`    ${tk.fix}`));
  }
  return fresh;
}

// ---------------------------------------------------------------- entry

export async function connect({ repoRoot, json = false } = {}) {
  const P = py();
  let doc = await health.probeAll({ python: P, repoRoot });

  if (json) { console.log(JSON.stringify(doc, null, 1)); return 0; }

  const by = renderMatrix(doc);
  const fixable = [];
  if (['blocked', 'absent'].includes(doc.platforms.x?.state)) fixable.push(['x', 'X / Twitter']);
  if (['blocked', 'absent'].includes(doc.platforms.tiktok?.state)) fixable.push(['sc', 'ScrapeCreators (TikTok · IG · Threads · Pinterest)']);
  // Only offered for HASHTAG search. Named-account IG is keyless and needs no login
  // (`free:instagram-accounts`), so offering a login when that lane is already live
  // would be asking for a password to fix something that is not broken.
  if (['blocked', 'absent'].includes(doc.platforms.instagram?.state)
      && doc.platforms.tiktok?.state === 'live') {
    fixable.push(['ig', 'Instagram HASHTAG search (instaloader login — accounts already work keyless)']);
  }

  if (!fixable.length) {
    log('');
    log(C.ok('  Everything fixable is already connected.'));
    if (by.unverifiable.length) {
      log(C.dim('  The unverifiable ones cannot be checked without a real call — they will'));
      log(C.dim('  report AUTH_REQUIRED on first use if you are not logged in.'));
    }
    return 0;
  }

  log('');
  log(C.b('  Fix, highest value first:'));
  fixable.forEach(([, label], i) => log(`    ${i + 1}. ${label}`));
  log('');
  const pick = await ask(`  Which? [1-${fixable.length}, 'a' for all, Enter to quit] `);
  if (!pick) return 0;

  const chosen = pick.toLowerCase() === 'a'
    ? fixable
    : [fixable[Number(pick) - 1]].filter(Boolean);

  for (const [kind] of chosen) {
    let r = false;
    if (kind === 'x') r = await connectBrowserCookie(repoRoot, 'x', 'https://x.com', doc);
    else if (kind === 'ig') r = await connectBrowserCookie(repoRoot, 'ig', 'https://instagram.com', doc);
    else if (kind === 'sc') r = await connectScrapeCreators(repoRoot);
    if (r && typeof r === 'object') doc = r;
  }

  log('');
  log(C.b('  Where you landed:'));
  renderMatrix(doc);
  log('');
  log(C.dim('  Re-run any time: npx pmm-os connect'));
  log(C.dim('  Machine-readable: npx pmm-os connect --json'));
  return 0;
}
