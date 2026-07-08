#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup -- --profile <name> --project <slug> --dry-run
  npm run setup -- --profile <name> --project <slug> --check-access

This setup wrapper runs safe setup checks:
  1. vault doctor
  2. provisioning dry run
  3. provider dry runs or read-only access checks
  4. env-file dry run

Live provider creation is intentionally not part of this command yet. It prints
the guarded provider commands to run next.`);
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
  if (!args[key] || args[key] === true) {
    throw new Error(`Missing --${key}`);
  }
  return String(args[key]);
}

function run(label, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    if (options.allowFailure) {
      console.log(`${label} reported a non-passing state; continuing because this check can be informational.`);
      return;
    }
    throw new Error(`${label} failed.`);
  }
}

function printNextActions(profile, project, mode) {
  console.log('\n== Next guarded live actions ==');
  console.log('Run only the provider step you want to mutate, then verify it before moving on.');
  console.log('');
  console.log(`GitHub read check: npm run vault:github -- --profile ${profile} --project ${project} --dry-run --check-existing`);
  console.log(`GitHub create: npm run vault:github -- --profile ${profile} --project ${project} --create --confirm-create --visibility private`);
  console.log(`Vercel access check: npm run vault:vercel -- --profile ${profile} --project ${project} --dry-run --check-access`);
  console.log(`Vercel create: npm run vault:vercel -- --profile ${profile} --project ${project} --create --confirm-create`);
  console.log(`Vercel dashboard access check: npm run vault:vercel-dashboard -- --profile ${profile} --project ${project} --dry-run --check-access`);
  console.log(`Vercel dashboard create: npm run vault:vercel-dashboard -- --profile ${profile} --project ${project} --create --confirm-create`);
  console.log(`Convex access check: npm run vault:convex -- --profile ${profile} --project ${project} --dry-run --check-access`);
  console.log(`Convex create: npm run vault:convex -- --profile ${profile} --project ${project} --create --confirm-create --deployment-type dev`);
  console.log(`Clerk check: npm run vault:clerk -- --profile ${profile} --project ${project} --dry-run`);
  console.log(`Clerk development env pull: npm run vault:clerk -- --profile ${profile} --project ${project} --pull-dev-env --confirm-dev-env`);
  console.log(`Production helper: npm run setup:production -- --profile ${profile} --project ${project}`);
  console.log(`Production domain: npm run setup:production -- --profile ${profile} --project ${project} --domain <your-production-domain>`);
  console.log(`Clerk production deploy: npm run setup:production -- --profile ${profile} --project ${project} --deploy-prod --confirm-prod-deploy`);
  console.log(`Clerk production env pull: npm run setup:production -- --profile ${profile} --project ${project} --pull-prod-env --confirm-prod-env`);
  console.log(`Vercel env re-sync: npm run setup:production -- --profile ${profile} --project ${project} --sync-vercel-env --confirm-env`);
  console.log(`Readiness report: npm run vault:readiness -- --profile ${profile} --project ${project}`);
  console.log(`State: npm run vault:state -- --project ${project}`);
  console.log(`Rollback plan: npm run vault:rollback -- --profile ${profile} --project ${project} --dry-run`);
  console.log('');
  if (mode === 'check-access') {
    console.log('Access checks finished. No live creation was performed by setup.');
  } else {
    console.log('Dry run finished. Re-run with --check-access when credentials are stored.');
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const mode = args['check-access'] ? 'check-access' : args['dry-run'] ? 'dry-run' : null;
  if (!mode) {
    throw new Error('Setup requires either --dry-run or --check-access.');
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');

  run('Doctor', ['scripts/template-vault.mjs', 'doctor', '--profile', profile]);
  run('Provisioning plan', [
    'scripts/template-vault.mjs',
    'provision',
    '--profile',
    profile,
    '--project',
    project,
    '--dry-run'
  ]);
  for (const provider of ['github', 'vercel', 'convex', 'clerk', 'codex']) {
    const providerArgs = [
      'scripts/template-vault.mjs',
      provider,
      '--profile',
      profile,
      '--project',
      project,
      '--dry-run'
    ];

    if (mode === 'check-access' && provider === 'github') {
      providerArgs.push('--check-existing');
    }
    if (mode === 'check-access' && provider === 'vercel') {
      providerArgs.push('--check-access');
    }
    if (mode === 'check-access' && provider === 'convex') {
      providerArgs.push('--check-access');
    }

    run(`${provider} ${mode === 'check-access' ? 'check' : 'plan'}`, providerArgs, {
      allowFailure: mode === 'check-access' && provider === 'github'
    });
  }
  run('Env preview', [
    'scripts/template-vault.mjs',
    'env',
    '--profile',
    profile,
    '--project',
    project,
    '--dry-run'
  ]);

  printNextActions(profile, project, mode);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
