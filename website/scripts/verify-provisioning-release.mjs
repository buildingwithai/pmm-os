#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup:release:verify -- --profile <name> --project <slug>
  npm run setup:release:verify -- --profile <name> --project <slug> --fresh-clone
  npm run setup:release:verify -- --profile <name> --project <slug> --build
  npm run setup:release:verify -- --profile <name> --project <slug> --preview

This is the top-level proof command for the template provisioning system.
It runs the reusable setup/plugin/provider checks in one place without printing
secret values. Heavy checks are opt-in:
  --fresh-clone requires a clean committed source tree.
  --build runs dashboard and marketing builds.
  --preview checks routes on already-running preview servers.`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      args[arg.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    }
  }
  return args;
}

function requireArg(args, key) {
  if (!args[key] || args[key] === true) throw new Error(`Missing --${key}`);
  return String(args[key]);
}

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: process.env,
    cwd: process.cwd()
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const ok = result.status === 0;
  if (!ok && !options.allowFailure) throw new Error(`${label} failed.`);
  if (!ok && options.allowFailure) console.log(`${label} reported a non-passing state; continuing.`);
  return ok;
}

function npmRun(script, extraArgs = [], options = {}) {
  return run(script, 'npm', ['run', script, ...extraArgs], options);
}

function nodeCheck() {
  const files = [
    'scripts/template-vault.mjs',
    'scripts/template-setup.mjs',
    'scripts/template-setup-guide.mjs',
    'scripts/template-agent.mjs',
    'scripts/template-completion.mjs',
    'scripts/template-start.mjs',
    'scripts/template-install.mjs',
    'scripts/template-production.mjs',
    'scripts/template-credentials-wizard.mjs',
    'scripts/template-walkthrough.mjs',
    'scripts/start-preview-app.mjs',
    'scripts/verify-template-plugin.mjs',
    'scripts/verify-template-plugin-discovery.mjs',
    'scripts/verify-vault-metadata.mjs',
    'scripts/verify-fresh-clone.mjs',
    'scripts/verify-convex-analytics.mjs',
    'scripts/verify-preview-routes.mjs'
  ];
  for (const file of files) {
    run(`Node syntax check ${file}`, process.execPath, ['--check', file]);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');
  const providerArgs = ['--', '--profile', profile, '--project', project];

  console.log(`Provisioning release verification for "${project}"`);
  console.log(`profile: ${profile}`);
  console.log('No secret values will be printed by this verifier.');

  nodeCheck();
  npmRun('secret:scan');
  npmRun('setup:install', ['--', '--check']);
  npmRun('setup:vault-metadata:verify');
  npmRun('setup:plugin:verify');
  npmRun('setup:plugin-discovery:verify');
  npmRun('setup:plugin:package', ['--', '--check']);

  run('Vault doctor', 'npm', ['run', 'vault:doctor', '--', '--profile', profile]);
  run('Setup doctor JSON', 'npm', ['--silent', 'run', 'setup:doctor', '--', '--profile', profile, '--json']);
  run('Setup token checklist JSON', 'npm', ['--silent', 'run', 'setup:tokens', '--', '--profile', profile, '--json']);
  run('Bootstrap front door', 'npm', ['run', 'setup:bootstrap', ...providerArgs]);
  run('Setup guide dry run', 'npm', ['run', 'setup:guide', ...providerArgs]);
  run('Agent control center', 'npm', ['run', 'setup:agent', ...providerArgs]);
  run('Agent control center JSON', 'npm', ['--silent', 'run', 'setup:agent', ...providerArgs, '--json']);
  run('Production helper dry run', 'npm', ['run', 'setup:production', ...providerArgs]);
  run('Production helper JSON checklist', 'npm', ['--silent', 'run', 'setup:production', ...providerArgs, '--json']);
  run('Setup next JSON action', 'npm', ['--silent', 'run', 'setup:next', ...providerArgs, '--json']);
  run('Setup completion JSON checklist', 'npm', ['--silent', 'run', 'setup:completion', ...providerArgs, '--json']);
  run('Setup status snapshot', 'npm', ['run', 'setup:status', ...providerArgs]);
  run('Setup status JSON snapshot', 'npm', ['--silent', 'run', 'setup:status', ...providerArgs, '--json']);
  run('Setup combined JSON snapshot', 'npm', ['--silent', 'run', 'setup:snapshot', ...providerArgs, '--json']);
  run('Provider readiness', 'npm', ['run', 'vault:readiness', ...providerArgs]);
  run('Completion audit', 'npm', ['run', 'setup:audit', ...providerArgs]);
  run('Provider readback verification', 'npm', ['run', 'vault:verify', ...providerArgs]);
  npmRun('analytics:convex:verify', providerArgs);

  if (args.build) {
    npmRun('dashboard:env');
    npmRun('dashboard:test');
    npmRun('dashboard:build');
    npmRun('marketing:typecheck');
    npmRun('marketing:build');
  } else {
    console.log('\nSKIP build checks. Add --build to run dashboard and marketing build gates.');
  }

  if (args.preview) {
    npmRun('preview:verify');
  } else {
    console.log('\nSKIP preview route checks. Add --preview after starting preview servers on 3015 and 3020.');
  }

  if (args['fresh-clone']) {
    npmRun('setup:fresh-clone:verify');
  } else {
    console.log('\nSKIP fresh clone check. Add --fresh-clone after committing changes.');
  }

  console.log('\nProvisioning release verification completed.');
  console.log('If readiness still reports blocked items, the template can be locally verified but is not production-ready yet.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
