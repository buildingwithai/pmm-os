/**
 * Find a Python the research engine can actually run on.
 *
 * The authority for config/python-policy.json. Native Node, so Windows works
 * without bash — which matters because `py -3.13` is the only reliable launcher
 * there and nothing in this repo handled it before.
 *
 * The four cases, all real:
 *   no Python at all      -> platform-correct instructions, never an auto-install
 *   Python < 3.12         -> the COMMON case (stock macOS ships 3.9); keep looking
 *   Python > 3.13         -> runs, with a warning; the engine has no upper bound
 *                            and nothing above 3.13 is tested
 *   uv present            -> ask it before downloading; install only on request
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const POLICY = JSON.parse(readFileSync(join(ROOT, 'config', 'python-policy.json'), 'utf8'));

const cmp = (a, b) => (a[0] - b[0]) || (a[1] - b[1]);

/** Ask the interpreter itself — never parse `--version` output, which varies. */
function versionOf(exe, extraArgs = []) {
  const r = spawnSync(exe, [...extraArgs, '-c',
    'import sys;print("%d.%d" % sys.version_info[:2])'], { encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout) return null;
  const m = r.stdout.trim().match(/^(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/**
 * @returns {{path:string, args:string[], version:string, lane:string, warning?:string}|null}
 */
export function resolvePython({ allowInstall = false, quiet = true } = {}) {
  const min = POLICY.min;
  const say = (s) => { if (!quiet) console.error(s); };

  // 1. An explicit override. If it's wrong, FAIL — the user asserted something
  //    false and papering over it hides the real problem.
  const override = process.env[POLICY.envOverride];
  if (override) {
    const v = versionOf(override);
    if (!v || cmp(v, min) < 0) {
      return { error: `${POLICY.envOverride}=${override} is ${v ? v.join('.') : 'not runnable'}, `
        + `need >= ${min.join('.')}` };
    }
    return { path: override, args: [], version: v.join('.'), lane: 'env-override',
             warning: warnIfUntested(v) };
  }

  // 2. Named interpreters, tested versions first.
  for (const cand of POLICY.probeOrder) {
    const v = versionOf(cand);
    if (v && cmp(v, min) >= 0) {
      return { path: cand, args: [], version: v.join('.'), lane: 'path', warning: warnIfUntested(v) };
    }
  }

  // 3. The Windows launcher. Missing from every script in this repo until now.
  if (process.platform === 'win32') {
    for (const spec of POLICY.windowsLauncher) {
      const [exe, ...args] = spec.split(' ');
      const v = versionOf(exe, args);
      if (v && cmp(v, min) >= 0) {
        return { path: exe, args, version: v.join('.'), lane: 'py-launcher', warning: warnIfUntested(v) };
      }
    }
  }

  // 4. uv keeps interpreters outside PATH — ask before downloading anything.
  const find = spawnSync('uv', ['python', 'find', `>=${min.join('.')}`], { encoding: 'utf8' });
  if (find.status === 0 && find.stdout.trim()) {
    const p = find.stdout.trim();
    const v = versionOf(p);
    if (v && cmp(v, min) >= 0) {
      return { path: p, args: [], version: v.join('.'), lane: 'uv-managed', warning: warnIfUntested(v) };
    }
  }

  // 5. Fetch one, but only when asked. ~28MB, once, reversible.
  if (allowInstall && spawnSync('uv', ['--version'], { stdio: 'ignore' }).status === 0) {
    say(`→ no Python ${min.join('.')}+ found; fetching ${POLICY.uvInstallVersion} via uv (~28MB, once)…`);
    spawnSync('uv', ['python', 'install', POLICY.uvInstallVersion], { stdio: 'inherit' });
    const again = spawnSync('uv', ['python', 'find', `>=${min.join('.')}`], { encoding: 'utf8' });
    if (again.status === 0 && again.stdout.trim()) {
      const p = again.stdout.trim();
      const v = versionOf(p);
      if (v) return { path: p, args: [], version: v.join('.'), lane: 'uv-installed' };
    }
  }

  return { error: notFoundMessage(allowInstall) };
}

function warnIfUntested(v) {
  return cmp(v, POLICY.untestedAbove) > 0
    ? `Python ${v.join('.')} is above the tested ceiling (${POLICY.untestedAbove.join('.')}). `
      + 'The engine declares no upper bound, so this may work — but if it breaks, this is why.'
    : undefined;
}

function notFoundMessage(triedInstall) {
  const inst = POLICY.install;
  const platform = inst[process.platform] || inst.linux;
  return [
    `No Python ${POLICY.min.join('.')}+ found, and the research engine requires it.`,
    '',
    'Install one:',
    `  ${platform}`,
    `  ${inst.any}`,
    '',
    `Or point at an existing interpreter:  ${POLICY.envOverride}=/path/to/python3.13`,
    triedInstall ? '' : '\nTo let PMM OS fetch one for you: add --allow-install (~28MB, once).',
  ].filter((l) => l !== '').join('\n');
}

export const policy = POLICY;
