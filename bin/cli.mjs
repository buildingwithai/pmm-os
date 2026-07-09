#!/usr/bin/env node
/**
 * pmm-os — installer CLI for the PMM OS Claude Code plugin.
 *
 *   npx pmm-os install     copy the plugin payload to ~/.pmm-os/plugin and register
 *                          it with Claude Code (marketplace add + plugin install)
 *   npx pmm-os update      refresh the payload + marketplace, reinstall
 *   npx pmm-os uninstall   remove the plugin, the marketplace, and the payload
 *   npx pmm-os doctor      check node / claude CLI / payload / research engines
 *                          (--deep additionally runs verify-research.sh --smoke)
 *
 * Why copy out of node_modules: `npx` caches are ephemeral and prunable, while the
 * Claude Code marketplace needs a stable local path. ~/.pmm-os/plugin is that path.
 * Registration goes through the official CLI (`claude plugin ...`) — writing into
 * ~/.claude/plugins directly is unsupported.
 */
import { cpSync, existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOME = homedir();
const PAYLOAD = join(HOME, '.pmm-os', 'plugin');
const MARKETPLACE = 'pmm-os';
const PLUGIN = 'pmm-os@pmm-os';
const IS_WIN = process.platform === 'win32';

const log = (s) => console.log(s);
const ok = (s) => console.log('  ✓ ' + s);
const warn = (s) => console.log('  ! ' + s);
const fail = (s) => { console.error('  ✗ ' + s); };

function claude(args, opts = {}) {
  return spawnSync('claude', args, { encoding: 'utf8', shell: IS_WIN, ...opts });
}
function hasClaude() {
  const r = claude(['--version']);
  return r.status === 0 ? r.stdout.trim() : null;
}
function copyPayload() {
  mkdirSync(dirname(PAYLOAD), { recursive: true });
  rmSync(PAYLOAD, { recursive: true, force: true });
  cpSync(PKG_ROOT, PAYLOAD, {
    recursive: true,
    filter: (src) => !/node_modules|[\\/]bin[\\/]|\.git($|[\\/])/.test(src)
  });
  ok('payload → ' + PAYLOAD);
}
function manualSteps() {
  log('\nManual install (run these in a terminal or Claude Code):');
  log('  claude plugin marketplace add ' + PAYLOAD);
  log('  claude plugin install ' + PLUGIN);
  log('Then restart Claude Code (or run /reload-plugins).');
}

function install() {
  log('\nPMM OS — installing\n');
  copyPayload();
  if (!hasClaude()) {
    warn('`claude` CLI not found on PATH — payload staged, registration skipped.');
    manualSteps();
    process.exitCode = 1;
    return;
  }
  let r = claude(['plugin', 'marketplace', 'add', PAYLOAD]);
  if (r.status !== 0 && /already|exists/i.test((r.stderr || '') + (r.stdout || ''))) {
    r = claude(['plugin', 'marketplace', 'update', MARKETPLACE]);
  }
  if (r.status !== 0) { fail('marketplace registration failed: ' + (r.stderr || r.stdout || '').trim()); manualSteps(); process.exitCode = 1; return; }
  ok('marketplace registered (' + MARKETPLACE + ')');
  r = claude(['plugin', 'install', PLUGIN]);
  if (r.status !== 0 && !/already/i.test((r.stderr || '') + (r.stdout || ''))) {
    fail('plugin install failed: ' + (r.stderr || r.stdout || '').trim()); manualSteps(); process.exitCode = 1; return;
  }
  ok('plugin installed (' + PLUGIN + ')');
  log('\nDone. Restart Claude Code (or run /reload-plugins).');
  log('First session auto-installs the research engines in the background;');
  log('then wire your logged-in X / Instagram / TikTok sessions (no passwords):');
  log('  bash ' + join(PAYLOAD, 'skills', 'agent-reach', 'scripts', 'reach.sh') + ' social-setup');
  log('\nStart with: "take <your product> to market" — or any PMM request.');
}

function update() {
  log('\nPMM OS — updating\n');
  copyPayload();
  if (!hasClaude()) { warn('`claude` CLI not found — payload refreshed only.'); manualSteps(); return; }
  let r = claude(['plugin', 'marketplace', 'update', MARKETPLACE]);
  if (r.status !== 0) { r = claude(['plugin', 'marketplace', 'add', PAYLOAD]); }
  if (r.status === 0) ok('marketplace refreshed'); else warn('marketplace refresh failed — try: claude plugin marketplace add ' + PAYLOAD);
  r = claude(['plugin', 'install', PLUGIN]);
  ok('plugin reinstalled at v' + requireVersion());
  log('\nRestart Claude Code (or /reload-plugins) to pick up the update.');
}

function uninstall() {
  log('\nPMM OS — uninstalling\n');
  if (hasClaude()) {
    claude(['plugin', 'uninstall', PLUGIN]);
    ok('plugin uninstalled');
    claude(['plugin', 'marketplace', 'remove', MARKETPLACE]);
    ok('marketplace removed');
  } else {
    warn('`claude` CLI not found — remove the plugin from Claude Code manually (/plugin).');
  }
  rmSync(PAYLOAD, { recursive: true, force: true });
  ok('payload removed (' + PAYLOAD + ')');
  log('\nNote: research-engine state under ~/.pmm-os and ~/.config/last30days is kept;');
  log('delete those folders yourself if you want a full wipe.');
}

function requireVersion() {
  try {
    return JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version;
  } catch { return 'unknown'; }
}

async function doctor() {
  log('\nPMM OS — doctor\n');
  const major = Number(process.versions.node.split('.')[0]);
  major >= 18 ? ok('node ' + process.versions.node) : fail('node ' + process.versions.node + ' (need >= 18)');
  const cv = hasClaude();
  cv ? ok('claude CLI: ' + cv) : fail('claude CLI not found on PATH — install Claude Code first: https://claude.com/claude-code');
  existsSync(PAYLOAD) ? ok('payload present: ' + PAYLOAD) : warn('payload not staged — run: npx pmm-os install');
  const py = spawnSync(IS_WIN ? 'python' : 'python3', ['--version'], { encoding: 'utf8', shell: IS_WIN });
  const pyv = py.status === 0 ? (py.stdout || py.stderr).trim() : null;
  const m = pyv ? pyv.match(/(\d+)\.(\d+)/) : null;
  const pyOk = m && (Number(m[1]) > 3 || (Number(m[1]) === 3 && Number(m[2]) >= 10));
  pyv
    ? (pyOk ? ok('python: ' + pyv) : warn('python: ' + pyv + ' — the research engines need 3.10+ (verify-research.sh finds newer installs)'))
    : warn('python3 not found — the research engines need Python 3.10+');
  const marker = join(HOME, '.pmm-os', 'research-setup');
  existsSync(marker) ? ok('research engines: set up') : warn('research engines: not yet set up (first Claude Code session auto-installs them)');
  const verify = [join(PAYLOAD, 'scripts', 'verify-research.sh'), join(PKG_ROOT, 'scripts', 'verify-research.sh')].find(existsSync);
  if (!process.argv.includes('--deep')) {
    log('\nDeep health check (live keyless engine calls): npx pmm-os doctor --deep');
    return;
  }
  if (!verify) { fail('verify-research.sh not found — run: npx pmm-os install'); process.exitCode = 1; return; }
  if (IS_WIN && spawnSync('bash', ['--version'], { encoding: 'utf8', shell: true }).status !== 0) {
    warn('--deep needs bash (Git Bash / WSL on Windows)'); process.exitCode = 1; return;
  }
  log('\nDeep health check — real keyless engine calls (~30–60s)\n');
  const r = spawnSync('bash', [verify, '--smoke'], { stdio: 'inherit', shell: false });
  process.exitCode = r.status ?? 1;
}

// --- research gateway (Pro "Research Intelligence") client wiring ---
// Points the vendored engine's rerank at the PMM OS Cloud gateway, so the LLM
// judge runs WITHOUT the member ever holding a real provider key. We reuse the
// engine's redirectable provider slot: set the token + gateway URL in the
// engine's own config (~/.config/last30days/.env). The real OpenAI key lives
// only in the gateway's server env — never here.
const L30_CONFIG_DIR = join(HOME, '.config', 'last30days');
const L30_ENV = join(L30_CONFIG_DIR, '.env');
const GATEWAY_KEYS = ['LAST30DAYS_REASONING_PROVIDER', 'XAI_API_KEY', 'XAI_BASE_URL'];

function readEnvFile(p) {
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n');
}
function writeEnvKeys(lines, updates) {
  const keys = new Set(Object.keys(updates));
  const kept = lines.filter((l) => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=/);
    return !(m && keys.has(m[1]));
  });
  for (const [k, v] of Object.entries(updates)) if (v !== null) kept.push(`${k}=${v}`);
  return kept.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n').replace(/\n+$/, '') + '\n';
}

function researchConnect() {
  const url = process.argv[3];
  const token = process.argv[4];
  if (!url || !token) {
    log('\nUsage: npx pmm-os research-connect <gateway-url> <pmm-os-token>');
    log('  e.g. npx pmm-os research-connect https://pmm-os-green.vercel.app/api/research/rerank pmmos_xxx');
    log('\nThe token is YOUR PMM OS member credential. The real AI key stays server-side.');
    process.exitCode = 1;
    return;
  }
  mkdirSync(L30_CONFIG_DIR, { recursive: true });
  const merged = writeEnvKeys(readEnvFile(L30_ENV), {
    LAST30DAYS_REASONING_PROVIDER: 'xai', // redirectable, key-only-gated slot; the gateway forces the real cheap model
    XAI_API_KEY: token,
    XAI_BASE_URL: url,
  });
  writeFileSync(L30_ENV, merged, { mode: 0o600 });
  try { spawnSync('chmod', ['600', L30_ENV]); } catch { /* best effort */ }
  log('\nPMM OS — Research Intelligence connected');
  ok('gateway: ' + url);
  ok('config:  ' + L30_ENV + ' (chmod 600)');
  log('\nThe engine now rescoring-ranks candidates via the gateway (Pro). Verify: npx pmm-os doctor --deep');
}

function researchDisconnect() {
  if (!existsSync(L30_ENV)) { log('\nNothing to disconnect (no engine config).'); return; }
  writeFileSync(L30_ENV, writeEnvKeys(readEnvFile(L30_ENV), Object.fromEntries(GATEWAY_KEYS.map((k) => [k, null]))), { mode: 0o600 });
  log('\nPMM OS — Research Intelligence disconnected (back to local heuristic ranking).');
}

const cmd = process.argv[2] || 'help';
if (cmd === 'install') install();
else if (cmd === 'update') update();
else if (cmd === 'uninstall') uninstall();
else if (cmd === 'doctor') await doctor();
else if (cmd === 'research-connect') researchConnect();
else if (cmd === 'research-disconnect') researchDisconnect();
else {
  log('\npmm-os — Product Marketing OS for Claude Code');
  log('\nUsage:');
  log('  npx pmm-os install     install the plugin into Claude Code');
  log('  npx pmm-os update      update to this package’s version');
  log('  npx pmm-os uninstall   remove plugin + marketplace + payload');
  log('  npx pmm-os doctor      environment + research-engine health (--deep = live smoke test)');
  log('  npx pmm-os research-connect <url> <token>   connect Pro Research Intelligence (gateway rerank)');
  log('  npx pmm-os research-disconnect              revert to local heuristic ranking');
  log('\nDocs: https://github.com/buildingwithai/pmm-os');
}
