#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup:start -- --profile <name> --project <slug>
  npm run setup:start -- --profile <name> --project <slug> --check-access
  npm run setup:start -- --profile <name> --project <slug> --check-access --verify

This is the lowest-lift starting point for humans and agents.
It explains the setup path, checks the local vault state, and prints the next
safe provider action. It does not create provider resources, delete anything,
or print secret values.`);
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
  if (!args[key] || args[key] === true) {
    throw new Error(`Missing --${key}`);
  }
  return String(args[key]);
}

function run(label, commandArgs, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, commandArgs, { stdio: 'inherit' });
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${label} failed.`);
  }
  if (result.status !== 0 && options.allowFailure) {
    console.log(`${label} found setup work that still needs attention.`);
  }
  return result.status === 0;
}

function printIntro(profile, project, args) {
  console.log('idkWidk template start');
  console.log(`profile: ${profile}`);
  console.log(`project: ${project}`);
  console.log('');
  console.log('Plain English version:');
  console.log('  This is the button you press first.');
  console.log('  It checks whether this computer already has the reusable provider access stored safely.');
  console.log('  It keeps organization tokens in the OS keychain, outside the repo.');
  console.log('  It tells the agent or human the next safe command to run.');
  console.log('');
  console.log('Safety rules:');
  console.log('  - No provider resources are created by setup:start.');
  console.log('  - No secrets are printed.');
  console.log('  - Live provider changes still require explicit --confirm-* commands.');
  console.log('');
  console.log(`Read-only provider checks: ${args['check-access'] ? 'on' : 'off'}`);
  console.log(`Release verifier: ${args.verify ? 'on' : 'off'}`);
}

function printEnd(profile, project) {
  console.log('\n== What to do next ==');
  console.log('If this is a new computer or the guide says credentials are missing:');
  console.log(`  npm run setup:credentials -- --profile ${profile} --project ${project}`);
  console.log('');
  console.log('If credentials are stored and you want read-only provider checks:');
  console.log(`  npm run setup:bootstrap -- --profile ${profile} --project ${project} --check-access`);
  console.log('');
  console.log('If live resources already exist and you want proof:');
  console.log(`  npm run setup:release:verify -- --profile ${profile} --project ${project}`);
  console.log('');
  console.log('If you are ready to create or change a provider resource, use the command printed by the guide.');
  console.log('Run one provider mutation, verify it, then move to the next.');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');

  printIntro(profile, project, args);

  const guideArgs = ['scripts/template-setup-guide.mjs', '--profile', profile, '--project', project];
  if (args['check-access']) guideArgs.push('--check-access');
  run(args['check-access'] ? 'Guided setup with read-only checks' : 'Guided setup', guideArgs, {
    allowFailure: true
  });

  if (args.verify) {
    run('Release verifier', ['scripts/verify-provisioning-release.mjs', '--profile', profile, '--project', project]);
  }

  printEnd(profile, project);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
