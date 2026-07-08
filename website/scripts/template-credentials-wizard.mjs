#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function usage() {
  console.log(`Usage:
  npm run setup:credentials -- --profile <name> --project <slug>
  npm run setup:credentials -- --profile <name> --project <slug> --verify
  npm run setup:credentials -- --profile <name> --project <slug> --non-interactive --github-owner <owner> --vercel-team-slug <slug>
  npm run setup:credentials -- --profile <name> --project <slug> --non-interactive --github-owner <owner> --vercel-team-slug <slug> --clerk-production-domain <domain> --verify

This prepares reusable local provider access for the template.
Secrets are entered into terminal prompts and stored by vault:set. They are not
stored in the repo and are not printed by this wizard.`);
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
  const executable = options.executable || process.execPath;
  const stdio = options.inheritInput ? 'inherit' : ['ignore', 'inherit', 'inherit'];
  const result = spawnSync(executable, args, { stdio });
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${label} failed.`);
  }
  if (result.status !== 0 && options.allowFailure) {
    console.log(`${label} did not complete. Continuing with the remaining safe steps.`);
  }
}

async function ask(rl, question) {
  const answer = await rl.question(question);
  return answer.trim();
}

async function askYesNo(rl, question, defaultYes = false) {
  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  const answer = (await ask(rl, `${question}${suffix}`)).toLowerCase();
  if (!answer) return defaultYes;
  return answer === 'y' || answer === 'yes';
}

function saveMetadata(profile, provider, key, value) {
  run(`Save ${provider}.${key} metadata`, [
    'scripts/template-vault.mjs',
    'metadata',
    '--profile',
    profile,
    '--provider',
    provider,
    '--key',
    key,
    '--value',
    value
  ]);
}

async function askMetadata(rl, provider, key, label, required = false) {
  const value = await ask(rl, `${label}${required ? '' : ' (optional)'}: `);
  if (!value) {
    if (required) console.log(`Skipped ${provider}.${key}. You can add it later with vault:metadata.`);
    return null;
  }
  return { provider, key, value };
}

async function askSecret(rl, provider, key, label) {
  const shouldStore = await askYesNo(rl, `Store ${label} now?`);
  if (!shouldStore) {
    console.log(`Skipped ${provider}.${key}. You can add it later with vault:set.`);
    return null;
  }
  return { provider, key };
}

function storeSecret(profile, provider, key) {
  run(`Store ${provider}.${key} in the OS keychain`, [
    'scripts/template-vault.mjs',
    'set',
    '--profile',
    profile,
    '--provider',
    provider,
    '--key',
    key
  ], { inheritInput: true });
}

function printIntro(profile, project) {
  console.log('idkWidk reusable credential setup');
  console.log(`profile: ${profile}`);
  console.log(`project: ${project}`);
  console.log('');
  console.log('Plain English version:');
  console.log('  This sets up this computer one time so future projects can be created faster.');
  console.log('  Organization tokens stay in the OS keychain.');
  console.log('  Non-secret IDs, like GitHub owner or Vercel team slug, stay in a local profile file outside the repo.');
  console.log('  Project runtime keys are still generated per project later.');
  console.log('');
  console.log('This wizard will not create GitHub, Vercel, Convex, or Clerk resources.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');
  printIntro(profile, project);

  run('Initialize local profile', ['scripts/template-vault.mjs', 'init', '--profile', profile]);
  run('Show provider token guide', ['scripts/template-vault.mjs', 'tokens', '--profile', profile]);

  const metadataWrites = [];
  const secretWrites = [];
  let runClerkLogin = false;
  let verifyAfterSetup = Boolean(args.verify || args['check-access']);

  if (args['non-interactive']) {
    const provided = [
      ['github', 'owner', args['github-owner']],
      ['vercel', 'teamSlug', args['vercel-team-slug']],
      ['convex', 'teamSlug', args['convex-team-slug']],
      ['convex', 'teamId', args['convex-team-id']],
      ['clerk', 'productionDomain', args['clerk-production-domain']],
      ['codex', 'workspaceName', args['codex-workspace-name']]
    ];
    for (const [provider, key, value] of provided) {
      if (value && value !== true) metadataWrites.push({ provider, key, value: String(value) });
    }
    console.log('\nNon-interactive mode: saved provided metadata only.');
    console.log('Secrets were not requested. Store them later with vault:set.');
  } else {
    const rl = createInterface({ input, output });
    try {
      console.log('\n== Reusable provider metadata ==');
      for (const item of [
        await askMetadata(rl, 'github', 'owner', 'GitHub owner or organization, for example buildingwithai', true),
        await askMetadata(rl, 'vercel', 'teamSlug', 'Vercel team slug, for example jovannytovar-4890', true),
        await askMetadata(rl, 'convex', 'teamSlug', 'Convex team slug, for example jovannytovar', false),
        await askMetadata(rl, 'convex', 'teamId', 'Convex team ID, numbers only if Convex shows one', false),
        await askMetadata(rl, 'clerk', 'productionDomain', 'Clerk production domain you own and can edit DNS for', false),
        await askMetadata(rl, 'codex', 'workspaceName', 'Codex workspace name or local label', false)
      ]) {
        if (item) metadataWrites.push(item);
      }

      console.log('\n== Reusable provider secrets ==');
      for (const item of [
        await askSecret(rl, 'github', 'organizationToken', 'GitHub organization token'),
        await askSecret(rl, 'vercel', 'organizationToken', 'Vercel token'),
        await askSecret(rl, 'convex', 'teamAccessToken', 'Convex team access token')
      ]) {
        if (item) secretWrites.push(item);
      }

      console.log('\n== Clerk note ==');
      console.log('Clerk usually does not use an organization token for normal setup.');
      console.log('The safer path is to log in with the Clerk CLI, create/select an app, then store app keys.');
      runClerkLogin = await askYesNo(rl, 'Run Clerk login now?');
      verifyAfterSetup = verifyAfterSetup || await askYesNo(rl, 'Run read-only provider checks after saving these values?', true);
    } finally {
      rl.close();
    }
  }

  for (const item of metadataWrites) {
    saveMetadata(profile, item.provider, item.key, item.value);
  }
  for (const item of secretWrites) {
    storeSecret(profile, item.provider, item.key);
  }
  if (runClerkLogin) {
    run('Clerk login', ['exec', 'clerk', '--', 'auth', 'login'], {
      executable: 'npm',
      inheritInput: true,
      allowFailure: true
    });
  }

  run('Profile status', ['scripts/template-vault.mjs', 'check', '--profile', profile], { allowFailure: true });
  if (verifyAfterSetup) {
    run('Read-only provider verification', [
      'scripts/template-walkthrough.mjs',
      '--profile',
      profile,
      '--project',
      project,
      '--check-access'
    ], {
      allowFailure: true
    });
    return;
  }
  run('Next setup guide', ['scripts/template-setup-guide.mjs', '--profile', profile, '--project', project], {
    allowFailure: true
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
