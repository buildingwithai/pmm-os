#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup:bootstrap -- --project <slug>
  npm run setup:bootstrap -- --profile <name> --project <slug>
  npm run setup:bootstrap -- --profile <name> --project <slug> --credentials --check-access
  npm run setup:bootstrap -- --profile <name> --project <slug> --live
  npm run setup:factory -- --project <slug>
  npm run setup:factory -- --profile <name> --project <slug>
  npm run setup:onboard -- --project <slug>
  npm run setup:onboard -- --profile <name> --project <slug>
  npm run setup:onboard -- --profile <name> --project <slug> --non-interactive --github-owner <owner> --vercel-team-slug <slug>
  npm run setup:project -- --project <slug>
  npm run setup:project -- --profile <name> --project <slug>
  npm run setup:project -- --profile <name> --project <slug> --credentials
  npm run setup:project -- --profile <name> --project <slug> --install --confirm-install
  npm run setup:project -- --profile <name> --project <slug> --check-access
  npm run setup:project -- --profile <name> --project <slug> --live
  npm run setup:project -- --profile <name> --project <slug> --verify
  npm run setup:project -- --profile <name> --project <slug> --verify --fresh-clone

This is the single front door for humans and agents.
It does not print secrets and it does not create provider resources unless you
explicitly pass --live and approve each guarded provider step.`);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function requireArg(args, key) {
  if (!args[key] || args[key] === true) throw new Error(`Missing --${key}`);
  return String(args[key]);
}

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  console.log([command, ...args].join(' '));
  const result = spawnSync(command, args, {
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: options.capture ? 'utf8' : undefined,
    cwd: process.cwd(),
    env: process.env
  });

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr && !(options.suppressErrorOutput && result.status !== 0)) process.stderr.write(result.stderr);
  }

  if (result.status !== 0 && !options.allowFailure) throw new Error(`${label} failed.`);
  if (result.status !== 0 && options.allowFailure) {
    console.log(`${label} found setup work that still needs attention.`);
  }
  return result.status === 0;
}

function printIntro(profile, project, args) {
  console.log('idkWidk template project setup');
  console.log(`profile: ${profile}`);
  console.log(`project: ${project}`);
  console.log('');
  console.log('Plain English version:');
  console.log('  This is the one command a person or agent can run first.');
  console.log('  It checks this computer, explains where secrets live, and points to the next safe action.');
  console.log('  If reusable provider tokens are missing, it can open the credential setup wizard.');
  console.log('  If provider access already exists, it can run read-only checks or a guarded live walkthrough.');
  console.log('  setup:factory is the clearest new-project command; it runs credential setup and read-only checks.');
  console.log('  setup:onboard is the new-computer shortcut: it runs this front door with credential setup and read-only checks on.');
  console.log('');
  console.log('Safety rules:');
  console.log('  - Organization tokens stay in the OS keychain.');
  console.log('  - Project env files stay local or provider-side.');
  console.log('  - Live provider changes still require the existing --confirm-* gates.');
  console.log('');
  console.log(`Credential wizard: ${args.credentials ? 'on' : 'off'}`);
  console.log(`Dependency install: ${args.install ? 'on' : 'off'}`);
  console.log(`Read-only provider checks: ${args['check-access'] || args.live ? 'on' : 'off'}`);
  console.log(`Live guided setup: ${args.live ? 'on' : 'off'}`);
  console.log(`Release verification: ${args.verify ? 'on' : 'off'}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = args.profile && args.profile !== true ? String(args.profile) : 'personal';
  const project = requireArg(args, 'project');
  printIntro(profile, project, args);

  if (args.install) {
    const installArgs = ['run', 'setup:install', '--'];
    installArgs.push(args['confirm-install'] ? '--confirm-install' : '--check');
    run('Dependency setup', 'npm', installArgs, { allowFailure: true });
  }

  run('Storage boundary explanation', 'npm', ['run', 'setup:locations'], { allowFailure: true });

  if (args.credentials) {
    const credentialArgs = ['run', 'setup:credentials', '--', '--profile', profile, '--project', project];
    if (args.verify || args['check-access']) credentialArgs.push('--verify');
    for (const key of [
      'non-interactive',
      'github-owner',
      'vercel-team-slug',
      'convex-team-slug',
      'convex-team-id',
      'clerk-production-domain',
      'codex-workspace-name'
    ]) {
      if (!args[key]) continue;
      credentialArgs.push(`--${key}`);
      if (args[key] !== true) credentialArgs.push(String(args[key]));
    }
    run('Reusable credential setup', 'npm', credentialArgs, { allowFailure: true });
  }

  const walkthroughArgs = ['run', 'setup:walkthrough', '--', '--profile', profile, '--project', project];
  if (args['check-access'] || args.live) walkthroughArgs.push('--check-access');
  if (args.live) walkthroughArgs.push('--live');
  run('Guided setup walkthrough', 'npm', walkthroughArgs, { allowFailure: true });

  run('Completion audit', 'npm', ['run', 'setup:audit', '--', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });

  run('Setup status snapshot', 'npm', ['run', 'setup:status', '--', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });

  if (args.verify) {
    const verifyArgs = ['run', 'setup:release:verify', '--', '--profile', profile, '--project', project];
    if (args['fresh-clone']) verifyArgs.push('--fresh-clone');
    run('Release verification', 'npm', verifyArgs, { allowFailure: true });
  }

  console.log('\n== Next safest command ==');
  console.log(`npm run setup:next -- --profile ${profile} --project ${project}`);
  console.log('');
  console.log('Do not call this production-ready until setup:audit and vault:readiness show no blocked items.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
