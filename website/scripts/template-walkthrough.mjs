#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function usage() {
  console.log(`Usage:
  npm run setup:walkthrough -- --profile <name> --project <slug>
  npm run setup:walkthrough -- --profile <name> --project <slug> --credentials
  npm run setup:walkthrough -- --profile <name> --project <slug> --check-access
  npm run setup:walkthrough -- --profile <name> --project <slug> --live

This is the lowest-lift human and agent walkthrough.
It checks the local vault, explains what is missing, and can guide provider
setup one step at a time. Live provider changes are only offered with --live
and still require yes/no prompts plus the existing --confirm-* command flags.`);
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

function commandText(command, args) {
  return [command, ...args].join(' ');
}

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  console.log(commandText(command, args));
  const result = spawnSync(command, args, {
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: options.capture ? 'utf8' : undefined,
    env: process.env,
    cwd: process.cwd()
  });
  const ok = result.status === 0;

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr && !(options.suppressErrorOutput && !ok)) process.stderr.write(result.stderr);
  }

  if (!ok && !options.allowFailure) throw new Error(`${label} failed.`);
  if (!ok && options.allowFailure) {
    console.log(`${label} did not fully pass. The walkthrough will keep showing the safe next step.`);
  }
  return ok;
}

async function askYesNo(rl, question, defaultYes = false) {
  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  const answer = (await rl.question(`${question}${suffix}`)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === 'y' || answer === 'yes';
}

function printIntro(profile, project, args) {
  console.log('idkWidk project setup walkthrough');
  console.log(`profile: ${profile}`);
  console.log(`project: ${project}`);
  console.log('');
  console.log('Plain English version:');
  console.log('  This is the guided setup button.');
  console.log('  If this computer already has organization access saved, the agent can check providers.');
  console.log('  If something is missing, it tells you the exact safe command to run.');
  console.log('  If --live is on, it offers provider changes one at a time and waits for yes/no.');
  console.log('');
  console.log('Safety rules:');
  console.log('  - Secrets stay in the OS keychain or provider env, not in the repo.');
  console.log('  - This script never prints secret values.');
  console.log('  - Live provider changes still run through the existing guarded vault commands.');
  console.log('');
  console.log(`Read-only provider checks: ${args['check-access'] || args.live ? 'on' : 'off'}`);
  console.log(`Live guided setup: ${args.live ? 'on' : 'off'}`);
}

function safeChecks(profile, project, checkAccess) {
  run('Local safety doctor', 'node', ['scripts/template-vault.mjs', 'doctor', '--profile', profile], {
    allowFailure: true
  });
  run('Setup guide', 'node', [
    'scripts/template-setup-guide.mjs',
    '--profile',
    profile,
    '--project',
    project,
    checkAccess ? '--check-access' : '--dry-run'
  ].filter(Boolean), {
    allowFailure: true
  });
  run('Next safest action', 'node', ['scripts/template-vault.mjs', 'next', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });
}

function verificationChecks(profile, project) {
  run('Provider readiness', 'node', ['scripts/template-vault.mjs', 'readiness', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });
  run('Provider readback', 'node', ['scripts/template-vault.mjs', 'verify', '--profile', profile, '--project', project], {
    allowFailure: true,
    capture: true,
    suppressErrorOutput: true
  });
}

function liveSteps(profile, project) {
  return [
    {
      label: 'GitHub repository read check',
      command: ['npm', ['run', 'vault:github', '--', '--profile', profile, '--project', project, '--dry-run', '--check-existing']],
      defaultYes: true
    },
    {
      label: 'Create GitHub repository',
      command: ['npm', ['run', 'vault:github', '--', '--profile', profile, '--project', project, '--create', '--confirm-create', '--visibility', 'private']]
    },
    {
      label: 'Vercel marketing project read check',
      command: ['npm', ['run', 'vault:vercel', '--', '--profile', profile, '--project', project, '--dry-run', '--check-access']],
      defaultYes: true
    },
    {
      label: 'Create or configure Vercel marketing project',
      command: ['npm', ['run', 'vault:vercel', '--', '--profile', profile, '--project', project, '--create', '--confirm-create']]
    },
    {
      label: 'Vercel dashboard project read check',
      command: ['npm', ['run', 'vault:vercel-dashboard', '--', '--profile', profile, '--project', project, '--dry-run', '--check-access']],
      defaultYes: true
    },
    {
      label: 'Create or configure Vercel dashboard project',
      command: ['npm', ['run', 'vault:vercel-dashboard', '--', '--profile', profile, '--project', project, '--create', '--confirm-create']]
    },
    {
      label: 'Convex project read check',
      command: ['npm', ['run', 'vault:convex', '--', '--profile', profile, '--project', project, '--dry-run', '--check-access']],
      defaultYes: true
    },
    {
      label: 'Create or connect Convex project',
      command: ['npm', ['run', 'vault:convex', '--', '--profile', profile, '--project', project, '--create', '--confirm-create', '--deployment-type', 'dev']]
    },
    {
      label: 'Clerk app read check',
      command: ['npm', ['run', 'vault:clerk', '--', '--profile', profile, '--project', project, '--dry-run']],
      defaultYes: true
    },
    {
      label: 'Pull Clerk development env into local vault',
      command: ['npm', ['run', 'vault:clerk', '--', '--profile', profile, '--project', project, '--pull-dev-env', '--confirm-dev-env']]
    },
    {
      label: 'Check Clerk production status',
      command: ['npm', ['run', 'setup:production', '--', '--profile', profile, '--project', project]],
      defaultYes: true
    },
    {
      label: 'Launch Clerk production deploy',
      command: ['npm', ['run', 'setup:production', '--', '--profile', profile, '--project', project, '--deploy-prod', '--confirm-prod-deploy']]
    },
    {
      label: 'Pull Clerk production env into local vault',
      command: ['npm', ['run', 'setup:production', '--', '--profile', profile, '--project', project, '--pull-prod-env', '--confirm-prod-env']]
    },
    {
      label: 'Sync Vercel production env',
      command: ['npm', ['run', 'setup:production', '--', '--profile', profile, '--project', project, '--sync-vercel-env', '--confirm-env']]
    }
  ];
}

async function runLiveWalkthrough(profile, project) {
  const rl = createInterface({ input, output });
  try {
    console.log('\n== Live guided provider setup ==');
    console.log('Each step is optional. Say no when the resource already exists, when a prerequisite is missing, or when you want to stop.');
    console.log('After any live change, this walkthrough runs readback checks again.');

    for (const step of liveSteps(profile, project)) {
      const [command, args] = step.command;
      console.log(`\nNext step: ${step.label}`);
      console.log(commandText(command, args));
      const shouldRun = await askYesNo(rl, `Run "${step.label}" now?`, Boolean(step.defaultYes));
      if (!shouldRun) {
        console.log(`Skipped ${step.label}.`);
        continue;
      }
      const ok = run(step.label, command, args, { allowFailure: true });
      verificationChecks(profile, project);
      if (!ok) {
        const keepGoing = await askYesNo(rl, 'That step did not fully pass. Continue to later steps anyway?');
        if (!keepGoing) break;
      }
    }
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');
  printIntro(profile, project, args);

  if (args.credentials) {
    run('Credential bootstrap wizard', 'node', ['scripts/template-credentials-wizard.mjs', '--profile', profile, '--project', project], {
      allowFailure: true
    });
  }

  safeChecks(profile, project, Boolean(args['check-access'] || args.live));

  if (args.live) {
    await runLiveWalkthrough(profile, project);
  }

  console.log('\n== Final local proof snapshot ==');
  verificationChecks(profile, project);
  run('Secret scan', 'npm', ['run', 'secret:scan'], { allowFailure: true });
  console.log('\nWalkthrough finished. If readiness still says blocked, follow the printed next action before calling the project production-ready.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
