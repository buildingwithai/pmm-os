#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup:production -- --profile <name> --project <slug>
  npm run setup:production -- --profile <name> --project <slug> --domain <production-domain>
  npm run setup:production -- --profile <name> --project <slug> --deploy-prod --confirm-prod-deploy
  npm run setup:production -- --profile <name> --project <slug> --pull-prod-env --confirm-prod-env
  npm run setup:production -- --profile <name> --project <slug> --sync-vercel-env --confirm-env
  npm --silent run setup:production -- --profile <name> --project <slug> --json

This is the focused final production setup helper.
It does not print secrets. It only starts live Clerk or Vercel changes when the
matching confirmation flag is present.`);
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

function validateDomain(value) {
  if (!value || value === true) throw new Error('Missing --domain value.');
  const domain = String(value).trim().toLowerCase();
  if (domain.includes('://') || domain.includes('/') || domain.includes(' ') || !domain.includes('.')) {
    throw new Error('Use a bare production domain, for example app.example.com. Do not include https:// or a path.');
  }
  if (!/^[a-z0-9.-]+$/.test(domain)) {
    throw new Error('Production domain can only contain letters, numbers, dots, and hyphens.');
  }
  return domain;
}

function commandText(command, args) {
  return [command, ...args].join(' ');
}

function runJson(command, args) {
  const result = spawnSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    cwd: process.cwd(),
    env: process.env
  });

  if (result.status !== 0) {
    return {
      ok: false,
      error: result.stderr ? result.stderr.trim().split('\n').slice(-1)[0] : `${command} failed`
    };
  }

  try {
    return { ok: true, data: JSON.parse(result.stdout) };
  } catch (error) {
    return { ok: false, error: `Invalid JSON from ${commandText(command, args)}: ${error.message}` };
  }
}

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  console.log(commandText(command, args));
  const result = spawnSync(command, args, {
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: options.capture ? 'utf8' : undefined,
    cwd: process.cwd(),
    env: process.env
  });
  const ok = result.status === 0;

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr && !(options.suppressErrorOutput && !ok)) process.stderr.write(result.stderr);
  }

  if (!ok && !options.allowFailure) throw new Error(`${label} failed.`);
  if (!ok && options.allowFailure) console.log(`${label} did not fully pass. The production helper is continuing with safe reporting.`);
  return ok;
}

function printIntro(profile, project) {
  console.log('idkWidk production setup helper');
  console.log(`profile: ${profile}`);
  console.log(`project: ${project}`);
  console.log('');
  console.log('Plain English version:');
  console.log('  This command focuses on the final production auth path.');
  console.log('  Clerk production needs a real domain that you own and can update DNS for.');
  console.log('  The helper can store that domain as local metadata and then guide the Clerk/Vercel steps.');
  console.log('');
  console.log('Safety rules:');
  console.log('  - No secrets are printed.');
  console.log('  - A domain is metadata, not a secret, but it still stays in your local setup profile.');
  console.log('  - Live provider changes require the existing --confirm-* flags.');
}

function printManualNext(profile, project) {
  console.log('\n== Production command ladder ==');
  console.log('Run these only after you have a real production domain.');
  console.log('');
  console.log(`1. Store domain metadata: npm run setup:production -- --profile ${profile} --project ${project} --domain <your-production-domain>`);
  console.log(`2. Check Clerk production status: npm run setup:production -- --profile ${profile} --project ${project}`);
  console.log(`3. Deploy Clerk production: npm run setup:production -- --profile ${profile} --project ${project} --deploy-prod --confirm-prod-deploy`);
  console.log(`4. Pull live Clerk env: npm run setup:production -- --profile ${profile} --project ${project} --pull-prod-env --confirm-prod-env`);
  console.log(`5. Re-sync Vercel env: npm run setup:production -- --profile ${profile} --project ${project} --sync-vercel-env --confirm-env`);
  console.log(`6. Verify: npm run setup:release:verify -- --profile ${profile} --project ${project} --build`);
}

function buildProductionChecklist(profile, project, args) {
  let providedDomain = null;
  if (args.domain) providedDomain = validateDomain(args.domain);

  const statusResult = runJson('npm', [
    '--silent',
    'run',
    'setup:status',
    '--',
    '--profile',
    profile,
    '--project',
    project,
    '--json'
  ]);
  const status = statusResult.ok ? statusResult.data : null;
  const clerk = status?.providers?.clerk || {};
  const domainReady = Boolean(clerk.productionDomainStored || providedDomain);
  const productionInstanceExists = Boolean(clerk.productionInstanceExists);
  const productionConfigured = Boolean(clerk.productionConfigured);
  const vercelDashboard = status?.providers?.vercelDashboard || {};
  const dashboardProtected = Boolean(productionConfigured && vercelDashboard.envStatus === 'configured');

  const checklist = [
    {
      id: 'production-domain',
      label: 'Store Clerk production domain',
      status: domainReady ? 'ready' : 'blocked',
      evidence: clerk.productionDomainStored
        ? 'production domain metadata is already stored'
        : providedDomain
          ? 'production domain was provided to this dry checklist but was not stored because --json is read-only'
          : 'production domain metadata is missing',
      nextAction: domainReady
        ? `npm run setup:production -- --profile ${profile} --project ${project}`
        : `npm run setup:production -- --profile ${profile} --project ${project} --domain <your-production-domain>`
    },
    {
      id: 'clerk-production-deploy',
      label: 'Create or verify Clerk production instance',
      status: productionInstanceExists ? 'ready' : 'blocked',
      evidence: productionInstanceExists
        ? 'Clerk production instance exists'
        : 'Clerk production instance is missing',
      nextAction: productionInstanceExists
        ? `npm run setup:production -- --profile ${profile} --project ${project} --pull-prod-env --confirm-prod-env`
        : `npm run setup:production -- --profile ${profile} --project ${project} --deploy-prod --confirm-prod-deploy`
    },
    {
      id: 'clerk-production-env',
      label: 'Pull and store live Clerk production keys',
      status: productionConfigured ? 'ready' : 'blocked',
      evidence: productionConfigured
        ? 'live Clerk production keys are stored in the local vault'
        : 'live Clerk production keys are not stored yet',
      nextAction: productionConfigured
        ? `npm run setup:production -- --profile ${profile} --project ${project} --sync-vercel-env --confirm-env`
        : `npm run setup:production -- --profile ${profile} --project ${project} --pull-prod-env --confirm-prod-env`
    },
    {
      id: 'dashboard-production-protection',
      label: 'Protect dashboard with production auth',
      status: dashboardProtected ? 'ready' : 'blocked',
      evidence: dashboardProtected
        ? 'dashboard env can use Clerk production auth'
        : 'dashboard cannot be treated as production-protected until Clerk production auth exists',
      nextAction: `npm run setup:production -- --profile ${profile} --project ${project} --sync-vercel-env --confirm-env`
    },
    {
      id: 'production-release-verification',
      label: 'Run final production verification',
      status: status?.productionReady ? 'ready' : 'blocked',
      evidence: status?.productionReady
        ? 'status snapshot reports productionReady=true'
        : 'production readiness is still blocked',
      nextAction: `npm run setup:release:verify -- --profile ${profile} --project ${project} --build`
    }
  ];

  const firstBlocked = checklist.find((item) => item.status !== 'ready');

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    profile,
    project,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    purpose: 'Machine-readable Clerk production and dashboard protection checklist.',
    statusSnapshotAvailable: statusResult.ok,
    statusUnavailableReason: statusResult.ok ? null : statusResult.error,
    productionReady: Boolean(status?.productionReady),
    requiresUserInput: !domainReady,
    nextAction: firstBlocked?.nextAction || `npm run setup:release:verify -- --profile ${profile} --project ${project} --build`,
    blockers: checklist.filter((item) => item.status !== 'ready'),
    checklist,
    commands: {
      storeDomain: `npm run setup:production -- --profile ${profile} --project ${project} --domain <your-production-domain>`,
      deployClerkProduction: `npm run setup:production -- --profile ${profile} --project ${project} --deploy-prod --confirm-prod-deploy`,
      pullClerkProductionEnv: `npm run setup:production -- --profile ${profile} --project ${project} --pull-prod-env --confirm-prod-env`,
      syncVercelEnv: `npm run setup:production -- --profile ${profile} --project ${project} --sync-vercel-env --confirm-env`,
      verifyProduction: `npm run setup:release:verify -- --profile ${profile} --project ${project} --build`
    }
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');
  if (args.json) {
    console.log(JSON.stringify(buildProductionChecklist(profile, project, args), null, 2));
    return;
  }

  printIntro(profile, project);

  run('Local safety doctor', 'npm', ['run', 'vault:doctor', '--', '--profile', profile], { allowFailure: true });

  if (args.domain) {
    const domain = validateDomain(args.domain);
    run('Store Clerk production domain metadata', 'npm', [
      'run',
      'vault:metadata',
      '--',
      '--profile',
      profile,
      '--provider',
      'clerk',
      '--key',
      'productionDomain',
      '--value',
      domain
    ]);
  }

  run('Clerk production status', 'npm', [
    'run',
    'vault:clerk',
    '--',
    '--profile',
    profile,
    '--project',
    project,
    '--deploy-status'
  ], { allowFailure: true });

  if (args['deploy-prod']) {
    if (!args['confirm-prod-deploy']) throw new Error('Refusing Clerk production deploy without --confirm-prod-deploy.');
    run('Deploy Clerk production', 'npm', [
      'run',
      'vault:clerk',
      '--',
      '--profile',
      profile,
      '--project',
      project,
      '--deploy-prod',
      '--confirm-prod-deploy'
    ], { allowFailure: true });
    run('Clerk production status after deploy', 'npm', [
      'run',
      'vault:clerk',
      '--',
      '--profile',
      profile,
      '--project',
      project,
      '--deploy-status'
    ], { allowFailure: true });
  }

  if (args['pull-prod-env']) {
    if (!args['confirm-prod-env']) throw new Error('Refusing Clerk production env pull without --confirm-prod-env.');
    run('Pull Clerk production env into vault', 'npm', [
      'run',
      'vault:clerk',
      '--',
      '--profile',
      profile,
      '--project',
      project,
      '--pull-prod-env',
      '--confirm-prod-env'
    ], { allowFailure: true });
  }

  if (args['sync-vercel-env']) {
    if (!args['confirm-env']) throw new Error('Refusing Vercel env sync without --confirm-env.');
    run('Sync Vercel marketing env', 'npm', [
      'run',
      'vault:vercel',
      '--',
      '--profile',
      profile,
      '--project',
      project,
      '--set-env',
      '--confirm-env'
    ], { allowFailure: true });
    run('Sync Vercel dashboard env', 'npm', [
      'run',
      'vault:vercel-dashboard',
      '--',
      '--profile',
      profile,
      '--project',
      project,
      '--set-env',
      '--confirm-env'
    ], { allowFailure: true });
  }

  run('Production readiness report', 'npm', ['run', 'vault:readiness', '--', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });
  run('Completion audit', 'npm', ['run', 'setup:audit', '--', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });
  run('Next safest action', 'npm', ['run', 'setup:next', '--', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });
  printManualNext(profile, project);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
