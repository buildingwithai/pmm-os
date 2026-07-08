#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup:guide -- --profile <name> --project <slug>
  npm run setup:guide -- --profile <name> --project <slug> --check-access

This is the human-and-agent setup guide. It does not create provider resources,
delete anything, or print secrets. It explains the current setup state and the
next safest command.`);
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

function run(label, commandArgs, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, commandArgs, { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr && !(result.status !== 0 && options.allowFailure && options.suppressErrorOutput)) {
    process.stderr.write(result.stderr);
  }
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${label} failed.`);
  }
  if (result.status !== 0 && options.allowFailure) {
    console.log(`${label} is not fully passing yet. That is useful information, so the guide is continuing.`);
  }
  return result.status === 0;
}

function printIntro(profile, project, checkAccess) {
  console.log(`idkWidk template setup guide`);
  console.log(`profile: ${profile}`);
  console.log(`project: ${project}`);
  console.log('');
  console.log('What this does:');
  console.log('  1. Checks whether this computer is safe for local setup.');
  console.log('  2. Checks which provider credentials are already stored in the local vault.');
  console.log('  3. Prints the next safe provider action.');
  console.log('  4. Keeps organization tokens outside this repo.');
  console.log('');
  console.log('What this does not do:');
  console.log('  - It does not create GitHub, Vercel, Convex, or Clerk resources.');
  console.log('  - It does not delete anything.');
  console.log('  - It does not print secret values.');
  console.log('');
  console.log(checkAccess
    ? 'Mode: read-only provider access checks where supported.'
    : 'Mode: local dry-run guidance.');
}

function printProfileRequired(profile, project) {
  console.log('\n== Profile setup needed ==');
  console.log(`This computer does not have a fully usable "${profile}" setup profile yet.`);
  console.log('That is normal on a fresh clone, a new computer, or a machine missing provider tools or tokens.');
  console.log('');
  console.log('Next safe commands:');
  console.log(`npm run setup:onboard -- --profile ${profile} --project ${project}`);
  console.log(`npm run setup:credentials -- --profile ${profile} --project ${project}`);
  console.log(`npm run setup:bootstrap -- --profile ${profile} --project ${project}`);
}

function printBootstrapCommands(profile, project) {
  console.log('\n== If this is a new computer ==');
  console.log('Run these only when the guide reports missing profile data.');
  console.log('');
  console.log('Lowest-lift path:');
  console.log(`npm run setup:onboard -- --profile ${profile} --project ${project}`);
  console.log('');
  console.log('Manual credential path:');
  console.log(`npm run setup:credentials -- --profile ${profile} --project ${project}`);
  console.log('');
  console.log('The credential wizard tells you where to get each provider token and which values are metadata.');
  console.log('Secrets go into the OS keychain. Metadata goes into a local profile file outside the repo.');
  console.log('');
  console.log('After storing provider access, re-run:');
  console.log(`npm run setup:bootstrap -- --profile ${profile} --project ${project} --check-access`);
}

function printMutationLadder(profile, project) {
  console.log('\n== Mutation ladder ==');
  console.log('Use this order when you are ready to let the agent create or connect real provider resources.');
  console.log('Run one command, verify it, then move to the next.');
  console.log('');
  console.log(`1. GitHub read check: npm run vault:github -- --profile ${profile} --project ${project} --dry-run --check-existing`);
  console.log(`2. GitHub create/connect: npm run vault:github -- --profile ${profile} --project ${project} --create --confirm-create --visibility private`);
  console.log(`3. Vercel check: npm run vault:vercel -- --profile ${profile} --project ${project} --dry-run --check-access`);
  console.log(`4. Vercel create/settings/env: npm run vault:vercel -- --profile ${profile} --project ${project} --create --confirm-create`);
  console.log(`5. Vercel dashboard check: npm run vault:vercel-dashboard -- --profile ${profile} --project ${project} --dry-run --check-access`);
  console.log(`6. Vercel dashboard create/settings/env: npm run vault:vercel-dashboard -- --profile ${profile} --project ${project} --create --confirm-create`);
  console.log(`7. Convex check: npm run vault:convex -- --profile ${profile} --project ${project} --dry-run --check-access`);
  console.log(`8. Convex create/connect: npm run vault:convex -- --profile ${profile} --project ${project} --create --confirm-create --deployment-type dev`);
  console.log(`9. Clerk check: npm run vault:clerk -- --profile ${profile} --project ${project} --dry-run`);
  console.log(`10. Clerk development env pull: npm run vault:clerk -- --profile ${profile} --project ${project} --pull-dev-env --confirm-dev-env`);
  console.log(`11. Production helper: npm run setup:production -- --profile ${profile} --project ${project}`);
  console.log(`12. Store production domain: npm run setup:production -- --profile ${profile} --project ${project} --domain <your-production-domain>`);
  console.log(`13. Clerk production deploy: npm run setup:production -- --profile ${profile} --project ${project} --deploy-prod --confirm-prod-deploy`);
  console.log(`14. Clerk production env pull: npm run setup:production -- --profile ${profile} --project ${project} --pull-prod-env --confirm-prod-env`);
  console.log(`15. Re-sync Vercel env: npm run setup:production -- --profile ${profile} --project ${project} --sync-vercel-env --confirm-env`);
  console.log(`16. Readiness: npm run vault:readiness -- --profile ${profile} --project ${project}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');
  const checkAccess = Boolean(args['check-access']);

  printIntro(profile, project, checkAccess);
  const doctorOk = run('Local safety doctor', ['scripts/template-vault.mjs', 'doctor', '--profile', profile], {
    allowFailure: true
  });
  const profileOk = run('Vault profile status', ['scripts/template-vault.mjs', 'check', '--profile', profile], {
    allowFailure: true,
    suppressErrorOutput: true
  });

  if (!doctorOk || !profileOk) {
    printProfileRequired(profile, project);
    printBootstrapCommands(profile, project);
    return;
  }

  run(
    checkAccess ? 'Setup read-only access checks' : 'Setup dry run',
    [
      'scripts/template-setup.mjs',
      '--profile',
      profile,
      '--project',
      project,
      checkAccess ? '--check-access' : '--dry-run'
    ],
    { allowFailure: true }
  );
  run('Production readiness report', ['scripts/template-vault.mjs', 'readiness', '--profile', profile, '--project', project], {
    allowFailure: true
  });

  printBootstrapCommands(profile, project);
  printMutationLadder(profile, project);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
