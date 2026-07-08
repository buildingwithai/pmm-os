#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const configDir = process.env.IDKWIDK_TEMPLATE_CONFIG_DIR
  ? resolve(process.env.IDKWIDK_TEMPLATE_CONFIG_DIR)
  : join(homedir(), '.config', 'idkwidk-template');
const profilePath = join(configDir, 'profiles.json');
const keychainService = 'idkwidk-template';
const statePath = resolve('.idkwidk/provisioning/state.json');

const secretKeys = {
  github: ['organizationToken'],
  vercel: ['organizationToken'],
  convex: ['deployKey', 'teamAccessToken'],
  clerk: ['secretKey', 'webhookSigningSecret', 'platformAccessToken'],
  codex: ['organizationToken']
};

const nonSecretKeys = {
  github: ['owner'],
  vercel: ['teamSlug'],
  convex: ['teamSlug', 'teamId'],
  clerk: ['applicationId', 'organizationId', 'publishableKey', 'productionDomain'],
  codex: ['workspaceName']
};

function usage() {
  console.log(`Usage:
  npm run vault:init -- --profile <name>
  npm run vault:set -- --profile <name> --provider <github|vercel|convex|clerk|codex> --key <key>
  npm run vault:rotate -- --profile <name> --provider <provider> --key <key>
  npm run vault:delete -- --profile <name> [--provider <provider> --key <key>]
  npm run vault:metadata -- --profile <name> --provider <provider> --key <key> --value <value>
  npm run vault:list
  npm run vault:locations
  npm run vault:check -- --profile <name>
  npm run vault:doctor -- --profile <name> [--json]
  npm run vault:tokens [--profile <name>] [--json]
  npm run vault:env -- --profile <name> --project <slug> --dry-run
  npm run vault:env -- --profile <name> --project <slug> --force
  npm run vault:state
  npm run vault:next -- --profile <name> --project <slug>
  npm run vault:status -- --profile <name> --project <slug> [--json]
  npm run vault:snapshot -- --profile <name> --project <slug> [--json]
  npm run vault:readiness -- --profile <name> --project <slug>
  npm run vault:audit -- --profile <name> --project <slug>
  npm run vault:rollback -- --profile <name> --project <slug> --dry-run
  npm run vault:provision -- --profile <name> --project <slug> --dry-run
  npm --silent run setup:plan -- --profile <name> --project <slug> --dry-run --json
  npm run vault:github -- --profile <name> --project <slug> --dry-run
  npm run vault:github -- --profile <name> --project <slug> --dry-run --check-existing
  npm run vault:github -- --profile <name> --project <slug> --create --confirm-create --visibility private
  npm run vault:github -- --profile <name> --project <slug> --connect-existing --confirm-connect --remote template
  npm run vault:github -- --profile <name> --project <slug> --push-initial --confirm-push
  npm run vault:vercel -- --profile <name> --project <slug> --dry-run
  npm run vault:vercel -- --profile <name> --project <slug> --dry-run --check-access
  npm run vault:vercel -- --profile <name> --project <slug> --create --confirm-create
  npm run vault:vercel -- --profile <name> --project <slug> --plan-settings
  npm run vault:vercel -- --profile <name> --project <slug> --configure-settings --confirm-settings
  npm run vault:vercel -- --profile <name> --project <slug> --plan-env
  npm run vault:vercel -- --profile <name> --project <slug> --set-env --confirm-env
  npm run vault:vercel-dashboard -- --profile <name> --project <slug> --dry-run --check-access
  npm run vault:vercel-dashboard -- --profile <name> --project <slug> --create --confirm-create
  npm run vault:vercel-dashboard -- --profile <name> --project <slug> --plan-settings
  npm run vault:vercel-dashboard -- --profile <name> --project <slug> --configure-settings --confirm-settings
  npm run vault:vercel-dashboard -- --profile <name> --project <slug> --plan-env
  npm run vault:vercel-dashboard -- --profile <name> --project <slug> --set-env --confirm-env
  npm run vault:convex -- --profile <name> --project <slug> --dry-run
  npm run vault:convex -- --profile <name> --project <slug> --dry-run --check-access
  npm run vault:convex -- --profile <name> --project <slug> --create --confirm-create --deployment-type dev
  npm run vault:convex -- --profile <name> --project <slug> --create-deploy-key --confirm-deploy-key --key-name vercel-prod
  npm run vault:clerk -- --profile <name> --project <slug> --dry-run
  npm run vault:clerk -- --profile <name> --project <slug> --deploy-status
  npm run vault:clerk -- --profile <name> --project <slug> --pull-dev-env --confirm-dev-env
  npm run vault:clerk -- --profile <name> --project <slug> --deploy-prod --confirm-prod-deploy
  npm run vault:clerk -- --profile <name> --project <slug> --pull-prod-env --confirm-prod-env
  npm run vault:codex -- --profile <name> --project <slug> --dry-run
  npm run vault:verify -- --profile <name> --project <slug>

Notes:
  - Secrets are stored outside the repo.
  - On macOS, secrets go into Keychain.
  - This tool refuses plaintext secret storage by default.`);
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

function parseCliJson(text, fallback = null) {
  const raw = String(text || '').trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    const objectStart = raw.indexOf('{');
    const arrayStart = raw.indexOf('[');
    const startCandidates = [objectStart, arrayStart].filter((index) => index >= 0);
    if (startCandidates.length === 0) return fallback;
    const start = Math.min(...startCandidates);
    const end = raw.lastIndexOf(raw[start] === '[' ? ']' : '}');
    if (end <= start) return fallback;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return fallback;
    }
  }
}

function runClerkCli(args, options = {}) {
  return spawnSync('npm', ['exec', 'clerk', '--', ...args], {
    encoding: options.stdio === 'inherit' ? undefined : 'utf8',
    timeout: options.timeout || 60000,
    stdio: options.stdio || 'pipe'
  });
}

function readProfiles() {
  if (!existsSync(profilePath)) return { profiles: {} };
  return JSON.parse(readFileSync(profilePath, 'utf8'));
}

function readState() {
  if (!existsSync(statePath)) return { projects: {} };
  return JSON.parse(readFileSync(statePath, 'utf8'));
}

function writeState(data) {
  mkdirSync(dirname(statePath), { recursive: true, mode: 0o700 });
  writeFileSync(statePath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}

function updateProjectState(project, profile, provider, patch) {
  const safeProject = projectSlug(project);
  const data = readState();
  data.projects[safeProject] ||= {
    project: safeProject,
    profile,
    providers: {},
    createdAt: new Date().toISOString()
  };
  data.projects[safeProject].profile = profile;
  data.projects[safeProject].updatedAt = new Date().toISOString();
  data.projects[safeProject].providers[provider] = {
    ...(data.projects[safeProject].providers[provider] || {}),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  writeState(data);
}

function printState(project) {
  const data = readState();
  if (project) {
    const safeProject = projectSlug(project);
    console.log(JSON.stringify(data.projects[safeProject] || null, null, 2));
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

function printLocations() {
  console.log('idkWidk template storage locations');
  console.log('');
  console.log('Plain English version:');
  console.log('  The template repo is safe to clone and share because reusable provider secrets live outside the repo.');
  console.log('  A new clone can find the setup commands, but it cannot copy your GitHub, Vercel, Convex, Clerk, or Codex secrets.');
  console.log('  Each computer/user sets up their own local profile and OS keychain entries.');
  console.log('');
  console.log('Local computer storage');
  console.log(`  profile metadata: ${profilePath}`);
  console.log(`  profile directory: ${configDir}`);
  console.log(`  OS keychain service: ${keychainService}`);
  console.log(`  keychain account shape: <profile>:<provider>:<key>`);
  console.log('');
  console.log('Repo-local generated files');
  console.log(`  provisioning state: ${statePath}`);
  console.log(`  dashboard env: ${resolve('apps/dashboard/.env.local')}`);
  console.log(`  marketing env: ${resolve('apps/marketing/.env.local')}`);
  console.log('');
  console.log('What is safe to commit');
  console.log('  - setup scripts');
  console.log('  - plugin files');
  console.log('  - docs');
  console.log('  - non-secret examples and command names');
  console.log('');
  console.log('What must stay local or provider-side');
  console.log('  - organization tokens');
  console.log('  - Clerk secret keys');
  console.log('  - Convex deploy keys');
  console.log('  - generated .env.local files');
  console.log('  - .idkwidk/provisioning/state.json');
  console.log('');
  console.log('Fresh computer path');
  console.log('  1. Clone the repo.');
  console.log('  2. Run: npm run setup:onboard -- --project <project-slug>');
  console.log('  3. If you only want the non-interactive guide, run: npm run setup:bootstrap -- --project <project-slug>');
  console.log('  4. Run live provider setup only through the printed guarded commands or setup:walkthrough -- --live.');
  console.log('');
  console.log('Verification');
  console.log('  npm run setup:fresh-clone:verify');
  console.log('  npm run setup:release:verify -- --profile personal --project <project-slug> --fresh-clone');
}

function writeProfiles(data) {
  mkdirSync(dirname(profilePath), { recursive: true, mode: 0o700 });
  writeFileSync(profilePath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}

function requireArg(args, key) {
  if (!args[key] || args[key] === true) {
    throw new Error(`Missing --${key}`);
  }
  return String(args[key]);
}

function account(profile, provider, key) {
  return `${profile}:${provider}:${key}`;
}

function canUseMacKeychain() {
  return process.platform === 'darwin' && spawnSync('security', ['-h']).status !== null;
}

function setSecret(profile, provider, key, value) {
  if (!canUseMacKeychain()) {
    throw new Error('No supported OS keychain found. Refusing plaintext secret storage.');
  }

  const result = spawnSync(
    'security',
    [
      'add-generic-password',
      '-a',
      account(profile, provider, key),
      '-s',
      keychainService,
      '-w',
      value,
      '-U'
    ],
    { encoding: 'utf8' }
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || `Failed to store ${provider}.${key}`);
  }
}

function getSecret(profile, provider, key) {
  if (!canUseMacKeychain()) return null;

  const result = spawnSync(
    'security',
    ['find-generic-password', '-a', account(profile, provider, key), '-s', keychainService, '-w'],
    { encoding: 'utf8' }
  );

  if (result.status !== 0) return null;
  return result.stdout.trim() || null;
}

function deleteSecret(profile, provider, key) {
  if (!canUseMacKeychain()) return false;

  const result = spawnSync(
    'security',
    ['delete-generic-password', '-a', account(profile, provider, key), '-s', keychainService],
    { encoding: 'utf8' }
  );

  return result.status === 0;
}

function ensureProfile(name) {
  const data = readProfiles();
  data.profiles[name] ||= { providers: {} };
  writeProfiles(data);
}

function deleteProfile(name) {
  const data = readProfiles();
  const entry = data.profiles[name];
  if (!entry) throw new Error(`Profile not found: ${name}`);

  for (const provider of Object.keys(secretKeys)) {
    for (const key of secretKeys[provider]) {
      deleteSecret(name, provider, key);
    }
  }

  delete data.profiles[name];
  if (Object.keys(data.profiles).length === 0) {
    if (existsSync(profilePath)) rmSync(profilePath);
    console.log(`Deleted profile "${name}" and removed empty profile store.`);
    return;
  }

  writeProfiles(data);
  console.log(`Deleted profile "${name}".`);
}

function deleteProviderSecret(profile, provider, key) {
  const data = readProfiles();
  if (!data.profiles[profile]) throw new Error(`Profile not found: ${profile}`);
  if (!secretKeys[provider]?.includes(key)) {
    throw new Error(`${provider}.${key} is not a supported secret key.`);
  }

  const deleted = deleteSecret(profile, provider, key);
  console.log(`${provider}.${key} for profile "${profile}" is ${deleted ? 'deleted' : 'not present'}.`);
}

function setMetadata(profile, provider, key, value) {
  const allowed = nonSecretKeys[provider] || [];
  if (!allowed.includes(key)) {
    throw new Error(`${provider}.${key} is not allowed as non-secret metadata.`);
  }

  const normalized = normalizeMetadataValue(provider, key, value);
  const data = readProfiles();
  data.profiles[profile] ||= { providers: {} };
  data.profiles[profile].providers[provider] ||= {};
  data.profiles[profile].providers[provider][key] = normalized;
  writeProfiles(data);

  return normalized;
}

function stripShellPasteNoise(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function normalizeMetadataValue(provider, key, value) {
  const original = stripShellPasteNoise(value);
  if (!original) throw new Error(`${provider}.${key} metadata cannot be empty.`);

  if (provider === 'convex' && key === 'teamId') {
    if (/<\s*team-id\s*>|team-id/i.test(original)) {
      throw new Error(`${provider}.${key} metadata still looks like a placeholder. Replace it with the real numeric team ID.`);
    }
    const labelMatch = original.match(/(?:team\s*id|teamid|id)\s*[:=]\s*<?([0-9]+)>?/i);
    const numeric = labelMatch?.[1] || original.match(/^<?([0-9]+)>?$/)?.[1] || null;
    if (!numeric) {
      throw new Error('convex.teamId must be the numeric team ID. Example: --value 391508');
    }
    return numeric;
  }

  const lower = original.toLowerCase();
  if (lower.includes('<') || lower.includes('>')) {
    const bracketMatch = original.match(/^<\s*([^<>]+?)\s*>$/);
    if (!bracketMatch) {
      throw new Error(`${provider}.${key} metadata should be the real value only. Remove angle brackets or pasted command text.`);
    }
    const inside = bracketMatch[1].trim();
    if (!inside || /^(team-id|team-slug|owner|org|project|domain|workspace-name|app-id)$/i.test(inside)) {
      throw new Error(`${provider}.${key} metadata still looks like a placeholder. Replace it with the real value.`);
    }
    return normalizeMetadataValue(provider, key, inside);
  }

  if (provider === 'clerk' && key === 'productionDomain') {
    return original
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/g, '')
      .toLowerCase();
  }

  return original;
}

async function promptSecret(label) {
  const rl = createInterface({ input, output });
  const canMask = input.isTTY && output.isTTY;
  if (canMask) spawnSync('stty', ['-echo'], { stdio: ['inherit', 'ignore', 'ignore'] });
  try {
    const value = await rl.question(`${label}: `);
    output.write('\n');
    return value.trim();
  } finally {
    if (canMask) spawnSync('stty', ['echo'], { stdio: ['inherit', 'ignore', 'ignore'] });
    rl.close();
  }
}

function listProfiles() {
  const data = readProfiles();
  const names = Object.keys(data.profiles);
  if (names.length === 0) {
    console.log('No profiles configured.');
    return;
  }

  for (const name of names) {
    const providers = Object.keys(data.profiles[name].providers || {});
    console.log(`${name}: ${providers.length > 0 ? providers.join(', ') : 'no metadata'}`);
  }
}

function checkProfile(profile) {
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  for (const provider of Object.keys(secretKeys)) {
    const metadata = entry.providers?.[provider] || {};
    const metadataKeys = Object.keys(metadata);
    const secrets = secretKeys[provider].map((key) => ({
      key,
      present: Boolean(getSecret(profile, provider, key))
    }));
    const status = secrets.map((s) => `${s.key}:${s.present ? 'stored' : 'missing'}`).join(', ');
    console.log(`${provider}: metadata=${metadataKeys.length ? metadataKeys.join(',') : 'none'} secrets=${status}`);
  }
}

function commandForProfile(command, profile) {
  return profile ? command.replaceAll('--profile personal', `--profile ${profile}`) : command;
}

function providerSecretStatus(profile, provider) {
  if (!profile) return null;
  return Object.fromEntries(
    (secretKeys[provider] || []).map((key) => [key, getSecret(profile, provider, key) ? 'stored' : 'missing'])
  );
}

function providerMetadataStatus(profile, provider) {
  if (!profile) return null;
  const metadata = readProfiles().profiles?.[profile]?.providers?.[provider] || {};
  return Object.fromEntries(
    (nonSecretKeys[provider] || []).map((key) => [key, metadata[key] ? 'stored' : 'missing'])
  );
}

function buildTokenGuidePayload(profile = null) {
  const profileExists = profile ? Boolean(readProfiles().profiles?.[profile]) : null;
  const withProfile = (command) => commandForProfile(command, profile);
  const provider = (key, label, summary, requiredBeforeLive, secrets, metadata, commands, notes = []) => ({
    key,
    label,
    summary,
    requiredBeforeLive,
    secretStatus: providerSecretStatus(profile, key),
    metadataStatus: providerMetadataStatus(profile, key),
    secrets,
    metadata,
    commands: commands.map((command) => withProfile(command)),
    notes
  });

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    profile,
    profileExists,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    purpose: 'Provider credential checklist for humans, agents, and plugins.',
    safetyRules: [
      'Do not paste real secrets into chat.',
      'Store reusable secrets with vault:set so they go into the OS keychain.',
      'Store non-secret IDs with vault:metadata outside the repo.',
      'Never write organization tokens to .env.local.',
      'Run read-only provider checks before any live provider creation.'
    ],
    providers: [
      provider(
        'github',
        'GitHub',
        'Needed for repository read checks, repository creation, and later push/connect work.',
        true,
        ['organizationToken'],
        ['owner'],
        [
          'npm run vault:set -- --profile personal --provider github --key organizationToken',
          'npm run vault:metadata -- --profile personal --provider github --key owner --value <github-owner-or-org>'
        ],
        ['Use the least-scoped token that can read/create repositories for the selected owner.']
      ),
      provider(
        'vercel',
        'Vercel',
        'Needed for marketing/dashboard project creation, project settings, and provider env vars.',
        true,
        ['organizationToken'],
        ['teamSlug'],
        [
          'npm run vault:set -- --profile personal --provider vercel --key organizationToken',
          'npm run vault:metadata -- --profile personal --provider vercel --key teamSlug --value <team-slug>'
        ],
        ['This token is reusable provider access, not a project runtime key.']
      ),
      provider(
        'convex',
        'Convex',
        'Needed for fully automated Convex project creation when the user wants no manual Convex setup.',
        false,
        ['teamAccessToken', 'deployKey'],
        ['teamSlug', 'teamId'],
        [
          'npm run vault:set -- --profile personal --provider convex --key teamAccessToken',
          'npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>',
          'npm run vault:metadata -- --profile personal --provider convex --key teamSlug --value <team-slug>',
          'npm run vault:set -- --profile personal --provider convex --key deployKey'
        ],
        [
          'Convex can also work through CLI login or local anonymous development.',
          'Use a team access token only when the agent should create/list Convex projects non-interactively.'
        ]
      ),
      provider(
        'clerk',
        'Clerk',
        'Needed for app runtime keys. Clerk production setup still needs a real domain and may require interactive CLI work.',
        true,
        ['secretKey', 'webhookSigningSecret', 'platformAccessToken'],
        ['applicationId', 'organizationId', 'publishableKey', 'productionDomain'],
        [
          'npm exec clerk -- auth login',
          'npm exec clerk -- apps list -- --json',
          'npm exec clerk -- apps create "idkwidk-template" -- --json',
          'npm run vault:metadata -- --profile personal --provider clerk --key applicationId --value <app-id>',
          'npm run vault:clerk -- --profile personal --project <project-slug> --pull-dev-env --confirm-dev-env',
          'npm run setup:production -- --profile personal --project <project-slug> --domain <your-production-domain>'
        ],
        [
          'Clerk does not normally expose a broad organization token.',
          'Only use platformAccessToken if Clerk grants Platform API access to the workspace.'
        ]
      ),
      provider(
        'codex',
        'Codex/OpenAI',
        'Guided only until an official supported project/workspace automation API is verified.',
        false,
        ['organizationToken'],
        ['workspaceName'],
        [
          'npm run vault:metadata -- --profile personal --provider codex --key workspaceName --value <workspace-name>'
        ],
        ['Do not invent token semantics for Codex/OpenAI automation.']
      )
    ],
    nextCommands: profile
      ? [
          `npm run setup:credentials -- --profile ${profile} --project <project-slug>`,
          `npm run setup:credentials -- --profile ${profile} --project <project-slug> --verify`,
          `npm run setup:snapshot -- --profile ${profile} --project <project-slug>`
        ]
      : [
          'npm run setup:credentials -- --profile personal --project <project-slug>',
          'npm run setup:tokens -- --profile personal --json'
        ]
  };
}

function printTokenGuide(args = {}) {
  const profile = args.profile && args.profile !== true ? String(args.profile) : null;
  const guide = buildTokenGuidePayload(profile);

  if (args.json) {
    console.log(JSON.stringify(guide, null, 2));
    return;
  }

  console.log(commandForProfile(`Provider token guide

Get tokens only when you are ready to run a provider boundary. Do not paste real
tokens into chat. Store them with npm run vault:set so they go into the OS
keychain.

GitHub
  Get this first, before live repository creation.
  Use it for: read-only repo existence checks, repo creation, later push/connect.
  Store it:
    npm run vault:set -- --profile personal --provider github --key organizationToken
  Metadata:
    npm run vault:metadata -- --profile personal --provider github --key owner --value <github-owner-or-org>

Vercel
  Get this after GitHub repo creation/connect works.
  Use it for: project creation/linking and project env vars.
  Store it:
    npm run vault:set -- --profile personal --provider vercel --key organizationToken
  Metadata:
    npm run vault:metadata -- --profile personal --provider vercel --key teamSlug --value <team-slug>

Convex
  Convex does not need an organization token for normal first-run setup.

  Fully automated project creation:
    1. In Convex Team Settings, create a team access token.
    2. Copy the team ID from the same area.
    3. Store them outside the repo:
       npm run vault:set -- --profile personal --provider convex --key teamAccessToken
       npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>

    Read-only check:
       npm run vault:convex -- --profile personal --project <project-slug> --dry-run --check-access

    Create a project only after explicit approval:
       npm run vault:convex -- --profile personal --project <project-slug> --create --confirm-create --deployment-type dev

  New user / new computer:
    cd apps/dashboard
    npm exec convex -- login
    npm exec convex -- dev --configure new --team <team-slug> --project <project-slug> --dev-deployment cloud --once

  Local anonymous development, no account:
    cd apps/dashboard
    npm exec convex -- dev --configure new --dev-deployment local --once

  CI or agent deploys use a deploy key, not the user login:
    cd apps/dashboard
    npm exec convex -- deployment token create vercel-prod --deployment prod --save-env .env.production.local

  Store a deploy key only when using non-interactive deploys:
    npm run vault:set -- --profile personal --provider convex --key deployKey

  Metadata:
    npm run vault:metadata -- --profile personal --provider convex --key teamSlug --value <team-slug>
    npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>

Clerk
  Clerk does not normally expose a general organization token. Use the Clerk CLI
  for workspace/application actions, then store app-level keys for runtime.

  CLI setup:
    npm exec clerk -- auth login
    npm exec clerk -- apps list -- --json
    npm exec clerk -- apps create "idkwidk-template" -- --json
    npm exec clerk -- link -- --app <app-id>
    npm exec clerk -- env pull -- --app <app-id> --file apps/dashboard/.env.local

  The CLI can list apps, create apps, link a local project, pull env vars,
  inspect/patch config, call Clerk API endpoints, and run diagnostics.

  For a normal template/user setup, create or select a Clerk application in the
  Clerk Dashboard or CLI, then store the app-level keys:
    npm run vault:metadata -- --profile personal --provider clerk --key publishableKey --value <pk_test_or_pk_live>
    npm run vault:set -- --profile personal --provider clerk --key secretKey

  Lower-lift app key sync after Clerk CLI login:
    npm run vault:metadata -- --profile personal --provider clerk --key applicationId --value <app-id>
    npm run vault:clerk -- --profile personal --project <project-slug> --pull-dev-env --confirm-dev-env

  If applicationId metadata is missing, the dev env sync can use a Clerk app
  whose name exactly matches the project slug.

  Optional webhook signing secret:
    npm run vault:set -- --profile personal --provider clerk --key webhookSigningSecret

  Only use platformAccessToken directly if your Clerk workspace has private-beta access to
  the Clerk Platform API for creating/managing applications programmatically:
    npm run vault:set -- --profile personal --provider clerk --key platformAccessToken

  Metadata:
    npm run vault:metadata -- --profile personal --provider clerk --key organizationId --value <org-id>
    npm run vault:metadata -- --profile personal --provider clerk --key applicationId --value <app-id>
    npm run setup:production -- --profile personal --project <project-slug> --domain <your-production-domain>

  Production deploy:
    npm run setup:production -- --profile personal --project <project-slug>
    npm run setup:production -- --profile personal --project <project-slug> --deploy-prod --confirm-prod-deploy

  Clerk production deploy is interactive. Store productionDomain first so the
  user and agent know the exact domain to enter when Clerk asks for it.

Codex/OpenAI
  Do not invent a token. Use the official secure setup flow available in Codex/OpenAI tooling.
  Metadata:
    npm run vault:metadata -- --profile personal --provider codex --key workspaceName --value <workspace-name>
`, profile));

  if (profile) {
    console.log(`Profile status for "${profile}"`);
    for (const provider of guide.providers) {
      const secretStatus = provider.secretStatus
        ? Object.entries(provider.secretStatus).map(([key, value]) => `${key}:${value}`).join(', ')
        : 'not checked';
      const metadataStatus = provider.metadataStatus
        ? Object.entries(provider.metadataStatus).map(([key, value]) => `${key}:${value}`).join(', ')
        : 'not checked';
      console.log(`  ${provider.key}: metadata=${metadataStatus}; secrets=${secretStatus}`);
    }
  }

  console.log('');
  console.log('Agent JSON:');
  console.log(`  npm --silent run setup:tokens --${profile ? ` --profile ${profile}` : ''} --json`);
}

function buildNextActionPayload(profile, project) {
  const safeProject = projectSlug(project);
  const commandBase = `--profile ${profile} --project ${safeProject}`;
  const profileEntry = readProfiles().profiles?.[profile] || null;
  const projectState = readState().projects?.[safeProject] || { providers: {} };
  const providers = projectState.providers || {};
  const action = (item) => ({
    key: item.key,
    label: item.label,
    provider: item.provider || null,
    phase: item.phase,
    type: item.type,
    command: item.command,
    reason: item.reason,
    requiresApproval: Boolean(item.requiresApproval),
    confirmationFlag: item.confirmationFlag || null,
    blockedByUserInput: Boolean(item.blockedByUserInput),
    liveCommand: item.liveCommand || null
  });
  const base = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    project: safeProject,
    profile,
    profileReady: Boolean(profileEntry),
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    purpose: 'Single next safe setup action for humans, agents, and plugins.',
    commands: {
      human: `npm run setup:next -- ${commandBase}`,
      json: `npm --silent run setup:next -- ${commandBase} --json`,
      snapshotJson: `npm --silent run setup:snapshot -- ${commandBase} --json`,
      statusJson: `npm --silent run setup:status -- ${commandBase} --json`,
      productionJson: `npm --silent run setup:production -- ${commandBase} --json`,
      tokensJson: `npm --silent run setup:tokens -- --profile ${profile} --json`
    }
  };

  if (!profileEntry) {
    return {
      ...base,
      action: action({
        key: 'create-local-profile',
        label: 'Create the local setup profile and store reusable provider access.',
        phase: 'credential-setup',
        type: 'credential-wizard',
        command: `npm run setup:credentials -- ${commandBase}`,
        reason: `Profile "${profile}" does not exist on this computer yet.`,
        blockedByUserInput: true
      }),
      followUp: `npm run setup:bootstrap -- ${commandBase} --check-access`
    };
  }

  const github = providers.github || {};
  if (!profileEntry.providers?.github?.owner) {
    return {
      ...base,
      action: action({
        key: 'store-github-owner',
        label: 'Store the GitHub owner or organization name.',
        provider: 'github',
        phase: 'credential-setup',
        type: 'metadata',
        command: `npm run vault:metadata -- --profile ${profile} --provider github --key owner --value <github-owner-or-org>`,
        reason: 'GitHub owner metadata is required before repository checks.',
        blockedByUserInput: true
      })
    };
  }
  if (!providerReady(profile, 'github')) {
    return {
      ...base,
      action: action({
        key: 'store-github-token',
        label: 'Store the GitHub organization token.',
        provider: 'github',
        phase: 'credential-setup',
        type: 'secret',
        command: `npm run vault:set -- --profile ${profile} --provider github --key organizationToken`,
        reason: 'GitHub provider access is missing.',
        blockedByUserInput: true
      })
    };
  }
  if (!github.verified) {
    return {
      ...base,
      action: action({
        key: 'verify-github-repository',
        label: 'Run the GitHub read-only repository check.',
        provider: 'github',
        phase: 'provider-read',
        type: 'read-only-check',
        command: `npm run vault:github -- ${commandBase} --dry-run --check-existing`,
        reason: 'The GitHub repository has not been verified.',
        liveCommand: `npm run vault:github -- ${commandBase} --create --confirm-create --visibility private`,
        confirmationFlag: '--confirm-create'
      })
    };
  }
  if (!github.remote) {
    return {
      ...base,
      action: action({
        key: 'connect-github-remote',
        label: 'Connect the verified GitHub repository as a git remote.',
        provider: 'github',
        phase: 'provider-connect',
        type: 'live-mutation',
        command: `npm run vault:github -- ${commandBase} --connect-existing --confirm-connect --remote template`,
        reason: 'The repository is verified, but this clone has no recorded remote.',
        requiresApproval: true,
        confirmationFlag: '--confirm-connect'
      })
    };
  }

  const vercel = providers.vercel || {};
  if (!profileEntry.providers?.vercel?.teamSlug) {
    return {
      ...base,
      action: action({
        key: 'store-vercel-team',
        label: 'Store the Vercel team slug.',
        provider: 'vercel',
        phase: 'credential-setup',
        type: 'metadata',
        command: `npm run vault:metadata -- --profile ${profile} --provider vercel --key teamSlug --value <team-slug>`,
        reason: 'Vercel team metadata is required before project checks.',
        blockedByUserInput: true
      })
    };
  }
  if (!providerReady(profile, 'vercel')) {
    return {
      ...base,
      action: action({
        key: 'store-vercel-token',
        label: 'Store the Vercel token.',
        provider: 'vercel',
        phase: 'credential-setup',
        type: 'secret',
        command: `npm run vault:set -- --profile ${profile} --provider vercel --key organizationToken`,
        reason: 'Vercel provider access is missing.',
        blockedByUserInput: true
      })
    };
  }
  if (!vercel.verified) {
    return {
      ...base,
      action: action({
        key: 'verify-vercel-marketing',
        label: 'Run the Vercel marketing project read-only check.',
        provider: 'vercel',
        phase: 'provider-read',
        type: 'read-only-check',
        command: `npm run vault:vercel -- ${commandBase} --dry-run --check-access`,
        reason: 'The Vercel marketing project has not been verified.',
        liveCommand: `npm run vault:vercel -- ${commandBase} --create --confirm-create`,
        confirmationFlag: '--confirm-create'
      })
    };
  }
  if (vercel.envStatus !== 'configured' && vercel.envReadbackStatus !== 'ok') {
    return {
      ...base,
      action: action({
        key: 'configure-vercel-marketing-env',
        label: 'Configure Vercel marketing environment variables.',
        provider: 'vercel',
        phase: 'provider-env',
        type: 'live-mutation',
        command: `npm run vault:vercel -- ${commandBase} --set-env --confirm-env`,
        reason: 'Marketing Vercel env vars are not fully configured.',
        requiresApproval: true,
        confirmationFlag: '--confirm-env'
      })
    };
  }

  const vercelDashboard = providers.vercelDashboard || {};
  if (!vercelDashboard.verified) {
    return {
      ...base,
      action: action({
        key: 'verify-vercel-dashboard',
        label: 'Run the Vercel dashboard service read-only check.',
        provider: 'vercelDashboard',
        phase: 'provider-read',
        type: 'read-only-check',
        command: `npm run vault:vercel-dashboard -- ${commandBase} --dry-run --check-access`,
        reason: 'The Vercel dashboard service has not been verified.',
        liveCommand: `npm run vault:vercel-dashboard -- ${commandBase} --create --confirm-create`,
        confirmationFlag: '--confirm-create'
      })
    };
  }
  if (vercelDashboard.settingsStatus !== 'configured') {
    return {
      ...base,
      action: action({
        key: 'configure-vercel-dashboard-settings',
        label: 'Configure Vercel dashboard settings.',
        provider: 'vercelDashboard',
        phase: 'provider-config',
        type: 'live-mutation',
        command: `npm run vault:vercel-dashboard -- ${commandBase} --configure-settings --confirm-settings`,
        reason: 'Dashboard project settings are not fully configured.',
        requiresApproval: true,
        confirmationFlag: '--confirm-settings'
      })
    };
  }
  if (vercelDashboard.envStatus !== 'configured' && vercelDashboard.envReadbackStatus !== 'ok') {
    return {
      ...base,
      action: action({
        key: 'configure-vercel-dashboard-env',
        label: 'Configure Vercel dashboard environment variables.',
        provider: 'vercelDashboard',
        phase: 'provider-env',
        type: 'live-mutation',
        command: `npm run vault:vercel-dashboard -- ${commandBase} --set-env --confirm-env`,
        reason: 'Dashboard Vercel env vars are not fully configured.',
        requiresApproval: true,
        confirmationFlag: '--confirm-env'
      })
    };
  }

  const convex = providers.convex || {};
  if (!providerReady(profile, 'convex')) {
    return {
      ...base,
      action: action({
        key: 'setup-convex-access',
        label: 'Log in with Convex or store Convex team access.',
        provider: 'convex',
        phase: 'credential-setup',
        type: 'credential-guide',
        command: `npm run setup:tokens -- --profile ${profile}`,
        reason: 'Convex access is missing.',
        blockedByUserInput: true
      })
    };
  }
  if (!convex.verified || !convex.deployKeyStored) {
    return {
      ...base,
      action: action({
        key: 'verify-convex',
        label: 'Run the Convex project read-only check.',
        provider: 'convex',
        phase: 'provider-read',
        type: 'read-only-check',
        command: `npm run vault:convex -- ${commandBase} --dry-run --check-access`,
        reason: 'Convex project/deployment proof is missing.',
        liveCommand: `npm run vault:convex -- ${commandBase} --create --confirm-create --deployment-type dev`,
        confirmationFlag: '--confirm-create'
      })
    };
  }
  if (!convex.analyticsWriteVerified) {
    return {
      ...base,
      action: action({
        key: 'verify-convex-analytics',
        label: 'Verify live Convex analytics write/read.',
        provider: 'convex',
        phase: 'verification',
        type: 'live-verification',
        command: `npm run analytics:convex:verify -- ${commandBase}`,
        reason: 'Live Convex analytics storage has not been verified.'
      })
    };
  }

  const clerk = providers.clerk || {};
  const clerkMetadata = profileEntry.providers?.clerk || {};
  if (!providerReady(profile, 'clerk')) {
    return {
      ...base,
      action: action({
        key: 'setup-clerk-development',
        label: 'Select a Clerk app and store development runtime keys.',
        provider: 'clerk',
        phase: 'credential-setup',
        type: 'credential-guide',
        command: `npm run vault:clerk -- ${commandBase} --pull-dev-env --confirm-dev-env`,
        reason: 'Clerk development runtime keys are missing.',
        requiresApproval: true,
        confirmationFlag: '--confirm-dev-env',
        blockedByUserInput: true
      })
    };
  }
  if (!clerk.verified || !clerk.developmentInstanceId) {
    return {
      ...base,
      action: action({
        key: 'verify-clerk-development',
        label: 'Run the Clerk development auth read-only check.',
        provider: 'clerk',
        phase: 'provider-read',
        type: 'read-only-check',
        command: `npm run vault:clerk -- ${commandBase} --dry-run`,
        reason: 'Clerk development auth has not been verified.'
      })
    };
  }

  const codexWorkspace = profileEntry.providers?.codex?.workspaceName || providers.codex?.metadataValue;
  if (!codexWorkspace) {
    return {
      ...base,
      action: action({
        key: 'store-codex-workspace-label',
        label: 'Store a Codex workspace label.',
        provider: 'codex',
        phase: 'credential-setup',
        type: 'metadata',
        command: `npm run vault:metadata -- --profile ${profile} --provider codex --key workspaceName --value <workspace-name>`,
        reason: 'Codex/OpenAI setup remains guided, so the profile should record the intended workspace label.',
        blockedByUserInput: true
      })
    };
  }
  if (!clerkMetadata.productionDomain && !clerk.productionDomainStored) {
    return {
      ...base,
      action: action({
        key: 'store-clerk-production-domain',
        label: 'Store the production domain for Clerk.',
        provider: 'clerk',
        phase: 'production-auth',
        type: 'metadata',
        command: `npm run setup:production -- ${commandBase} --domain <your-production-domain>`,
        reason: 'Clerk production needs a real domain before production auth can be configured.',
        blockedByUserInput: true
      })
    };
  }
  if (!clerk.productionInstanceExists) {
    return {
      ...base,
      action: action({
        key: 'deploy-clerk-production',
        label: 'Run Clerk production deployment.',
        provider: 'clerk',
        phase: 'production-auth',
        type: 'interactive-live-mutation',
        command: `npm run setup:production -- ${commandBase} --deploy-prod --confirm-prod-deploy`,
        reason: 'Clerk production instance is missing.',
        requiresApproval: true,
        confirmationFlag: '--confirm-prod-deploy',
        blockedByUserInput: true
      })
    };
  }
  if (!clerk.productionConfigured) {
    return {
      ...base,
      action: action({
        key: 'pull-clerk-production-env',
        label: 'Pull and store Clerk production runtime keys.',
        provider: 'clerk',
        phase: 'production-auth',
        type: 'live-mutation',
        command: `npm run setup:production -- ${commandBase} --pull-prod-env --confirm-prod-env`,
        reason: 'Clerk production exists, but live production keys are not stored.',
        requiresApproval: true,
        confirmationFlag: '--confirm-prod-env'
      })
    };
  }

  return {
    ...base,
    action: action({
      key: 'run-release-verification',
      label: 'Run final release verification.',
      phase: 'verification',
      type: 'verification',
      command: `npm run setup:release:verify -- ${commandBase}`,
      reason: 'Provider setup appears complete; final verification should prove it.'
    }),
    followUp: `npm run setup:release:verify -- ${commandBase} --fresh-clone`
  };
}

function printNextSteps(profile, project, args = {}) {
  const next = buildNextActionPayload(profile, project);
  if (args.json) {
    console.log(JSON.stringify(next, null, 2));
    return;
  }
  const safeProject = projectSlug(project);
  const profiles = readProfiles();
  const entry = profiles.profiles[profile];
  if (!entry) {
    console.log(`Next provisioning steps for "${safeProject}"`);
    console.log(`profile: ${profile}`);
    console.log('Plain English version: this computer has not been prepared for this template profile yet.');
    console.log('');
    console.log('1. Create the local setup profile and store reusable provider access');
    console.log(`   npm run setup:credentials -- --profile ${profile} --project ${safeProject}`);
    console.log('');
    console.log('2. Then run read-only provider checks');
    console.log(`   npm run setup:bootstrap -- --profile ${profile} --project ${safeProject} --check-access`);
    console.log('');
    console.log('No provider resources were created. No secrets were printed.');
    console.log('\nAgent JSON:');
    console.log(`  ${next.commands.json}`);
    return;
  }
  const projectState = readState().projects[safeProject];

  console.log(`Next provisioning steps for "${safeProject}"`);
  console.log(`profile: ${profile}`);
  console.log('Plain English version: this prints the next real setup action without creating or changing provider resources.');

  const github = projectState?.providers?.github;
  if (!github?.verified) {
    console.log('\n1. Finish GitHub first');
    console.log('   Run the GitHub dry-run and read-only check before creating the repo.');
    console.log(`   npm run vault:github -- --profile ${profile} --project ${safeProject} --dry-run --check-existing`);
    return;
  }

  console.log('\nGitHub');
  console.log(`  verified: yes`);
  console.log(`  url: ${github.url}`);
  console.log(`  remote: ${github.remote || 'not connected'}`);
  if (!github.remote) {
    console.log(`  next: npm run vault:github -- --profile ${profile} --project ${safeProject} --connect-existing --confirm-connect --remote template`);
  }

  const vercel = projectState?.providers?.vercel || {};
  console.log('\nVercel marketing');
  console.log(`  verified: ${vercel.verified ? 'yes' : 'no'}`);
  console.log(`  env: ${vercel.envStatus || 'unknown'}`);
  console.log(`  url: ${vercel.url || 'missing'}`);
  if (!entry.providers?.vercel?.teamSlug) {
    console.log(`  next: npm run vault:metadata -- --profile ${profile} --provider vercel --key teamSlug --value <team-slug>`);
  } else if (!providerReady(profile, 'vercel')) {
    console.log(`  next: npm run vault:set -- --profile ${profile} --provider vercel --key organizationToken`);
  } else if (!vercel.verified) {
    console.log(`  next: npm run vault:vercel -- --profile ${profile} --project ${safeProject} --dry-run --check-access`);
  } else if (vercel.envStatus !== 'configured') {
    console.log(`  next: npm run vault:vercel -- --profile ${profile} --project ${safeProject} --set-env --confirm-env`);
  }

  const vercelDashboard = projectState?.providers?.vercelDashboard || {};
  console.log('\nVercel dashboard service');
  console.log(`  verified: ${vercelDashboard.verified ? 'yes' : 'no'}`);
  console.log(`  env: ${vercelDashboard.envStatus || 'unknown'}`);
  console.log(`  url: ${vercelDashboard.url || 'missing'}`);
  if (providerReady(profile, 'vercel') && !vercelDashboard.verified) {
    console.log(`  next: npm run vault:vercel-dashboard -- --profile ${profile} --project ${safeProject} --dry-run --check-access`);
  } else if (vercelDashboard.verified && vercelDashboard.envStatus !== 'configured') {
    console.log(`  next: npm run vault:vercel-dashboard -- --profile ${profile} --project ${safeProject} --set-env --confirm-env`);
  }

  const convex = projectState?.providers?.convex || {};
  console.log('\nConvex');
  console.log(`  verified: ${convex.verified ? 'yes' : 'no'}`);
  console.log(`  analytics write/read: ${convex.analyticsWriteVerified ? 'verified' : 'not verified'}`);
  console.log(`  deployment: ${convex.deployment || 'missing'}`);
  if (!providerReady(profile, 'convex')) {
    console.log(`  next: log in with Convex or store a Convex team access token`);
  } else if (!convex.verified) {
    console.log(`  next: npm run vault:convex -- --profile ${profile} --project ${safeProject} --dry-run --check-access`);
  } else if (!convex.analyticsWriteVerified) {
    console.log(`  next: npm run analytics:convex:verify -- --profile ${profile} --project ${safeProject}`);
  }

  const clerk = projectState?.providers?.clerk || {};
  const clerkMetadata = entry.providers?.clerk || {};
  console.log('\nClerk');
  console.log(`  development auth: ${clerk.verified && clerk.developmentInstanceId ? 'ready' : 'not ready'}`);
  console.log(`  production instance: ${clerk.productionInstanceExists ? 'exists' : 'missing'}`);
  console.log(`  production domain metadata: ${clerkMetadata.productionDomain || clerk.productionDomain || 'missing'}`);
  console.log(`  live production keys: ${clerk.productionConfigured ? 'stored' : 'missing'}`);
  if (!providerReady(profile, 'clerk')) {
    console.log(`  next: select a Clerk app, store publishableKey metadata, and store secretKey`);
  } else if (!clerk.productionInstanceExists && !clerkMetadata.productionDomain) {
    console.log(`  next: npm run setup:production -- --profile ${profile} --project ${safeProject} --domain <your-production-domain>`);
  } else if (!clerk.productionInstanceExists) {
    console.log(`  next: npm run setup:production -- --profile ${profile} --project ${safeProject} --deploy-prod --confirm-prod-deploy`);
  } else if (!clerk.productionConfigured) {
    console.log(`  next: npm run setup:production -- --profile ${profile} --project ${safeProject} --pull-prod-env --confirm-prod-env`);
  }

  const codexWorkspace = entry.providers?.codex?.workspaceName || projectState?.providers?.codex?.metadataValue;
  console.log('\nCodex/OpenAI');
  console.log(`  workspace metadata: ${codexWorkspace || 'missing'}`);
  console.log('  automation: guided only until an official workspace API is verified');
  if (!codexWorkspace) {
    console.log(`  next: npm run vault:metadata -- --profile ${profile} --provider codex --key workspaceName --value <workspace-name>`);
  }

  console.log('\nFinal proof');
  console.log(`  next: npm run setup:release:verify -- --profile ${profile} --project ${safeProject}`);
  console.log(`  fresh clone: npm run setup:release:verify -- --profile ${profile} --project ${safeProject} --fresh-clone`);
  console.log(`  readiness: npm run vault:readiness -- --profile ${profile} --project ${safeProject}`);
  console.log('\nNext safe action');
  console.log(`  ${next.action.command}`);
  console.log(`  reason: ${next.action.reason}`);
  console.log('\nAgent JSON:');
  console.log(`  ${next.commands.json}`);
}

function commandExists(command) {
  if (!/^[a-zA-Z0-9._-]+$/.test(command)) return false;
  return spawnSync('sh', ['-lc', `command -v ${command}`], { encoding: 'utf8' }).status === 0;
}

function npmExecAvailable(binary, options = {}) {
  if (!commandExists('npm')) return false;
  const prefixArgs = options.prefix ? ['--prefix', options.prefix] : [];
  const result = spawnSync('npm', [...prefixArgs, 'exec', '--no', '--', binary, '--version'], {
    encoding: 'utf8',
    timeout: 30000
  });
  return result.status === 0;
}

function trackedFiles(pattern) {
  const result = spawnSync('git', ['ls-files', pattern], { encoding: 'utf8' });
  if (result.status !== 0) return [];
  return result.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
}

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8' });
}

function noTrackedEnvLeaks() {
  return trackedFiles('.env').length === 0
    && trackedFiles('.env.*').filter((file) => !file.endsWith('.example')).length === 0
    && trackedFiles('*.env.local').length === 0;
}

function currentRemoteUrl(name) {
  const result = git(['remote', 'get-url', name]);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function setGitRemote(name, url, options = {}) {
  const current = currentRemoteUrl(name);
  if (current === url) return 'already-matched';
  if (current && !options.replace) {
    throw new Error(`Remote ${name} already points at ${current}. Use a different --remote name or pass --replace-remote.`);
  }
  if (current) {
    const result = git(['remote', 'set-url', name, url]);
    if (result.status !== 0) throw new Error(`Failed to update git remote ${name}.`);
    return 'updated';
  }
  const result = git(['remote', 'add', name, url]);
  if (result.status !== 0) throw new Error(`Failed to add git remote ${name}.`);
  return 'added';
}

function ignored(path) {
  const result = spawnSync('git', ['check-ignore', '-q', path], { encoding: 'utf8' });
  return result.status === 0;
}

function buildDoctorPayload(profile) {
  const checks = [];
  const data = readProfiles();
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const npmAvailable = commandExists('npm');
  const gitAvailable = commandExists('git');
  const githubCliAvailable = commandExists('gh');
  const vercelCliAvailable = commandExists('vercel') || npmExecAvailable('vercel');
  const convexCliAvailable = commandExists('convex') || npmExecAvailable('convex', { prefix: 'apps/dashboard' });
  const clerkCliAvailable = commandExists('clerk') || npmExecAvailable('clerk');

  checks.push({
    label: 'Node.js version',
    ok: nodeMajor >= 20,
    detail: `current=${process.versions.node}, required>=20`
  });
  checks.push({
    label: 'macOS Keychain available',
    ok: canUseMacKeychain(),
    detail: canUseMacKeychain() ? 'security CLI found' : 'no supported plaintext-free secret store found'
  });
  checks.push({
    label: 'Git available',
    ok: gitAvailable,
    detail: gitAvailable ? 'git CLI found' : 'git CLI missing'
  });
  checks.push({
    label: 'npm available',
    ok: npmAvailable,
    detail: npmAvailable ? 'npm CLI found' : 'npm CLI missing'
  });
  checks.push({
    label: 'GitHub CLI available',
    ok: githubCliAvailable,
    detail: githubCliAvailable ? 'gh CLI found' : 'install GitHub CLI before GitHub provider automation'
  });
  checks.push({
    label: 'Vercel CLI available',
    ok: vercelCliAvailable,
    detail: vercelCliAvailable ? 'vercel CLI available' : 'install Vercel CLI before Vercel provider automation'
  });
  checks.push({
    label: 'Convex CLI available',
    ok: convexCliAvailable,
    detail: convexCliAvailable ? 'convex CLI available' : 'install dashboard dependencies before Convex setup'
  });
  checks.push({
    label: 'Clerk CLI available',
    ok: clerkCliAvailable,
    detail: clerkCliAvailable ? 'clerk CLI available' : 'install or run Clerk CLI before Clerk setup'
  });
  checks.push({
    label: 'Dashboard env ignored',
    ok: ignored('apps/dashboard/.env.local'),
    detail: 'apps/dashboard/.env.local should not be tracked'
  });
  checks.push({
    label: 'Marketing env ignored',
    ok: ignored('apps/marketing/.env.local'),
    detail: 'apps/marketing/.env.local should not be tracked'
  });
  checks.push({
    label: 'No local env files tracked',
    ok: trackedFiles('.env.local').length === 0 && trackedFiles('*.env.local').length === 0,
    detail: 'tracked .env.local files would leak project secrets'
  });

  if (profile) {
    checks.push({
      label: `Profile "${profile}" exists`,
      ok: Boolean(data.profiles[profile]),
      detail: profilePath
    });

    if (data.profiles[profile]) {
      for (const provider of Object.keys(secretKeys)) {
        const label = providerCredentialLabel(provider);
        checks.push({
          label,
          ok: providerReady(profile, provider),
          detail: providerReady(profile, provider) ? 'ready' : 'missing'
        });
      }
    }
  }

  const failed = checks.filter((check) => !check.ok).length;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    profile: profile || null,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    ok: failed === 0,
    failed,
    checks: checks.map((check) => ({
      label: check.label,
      ok: Boolean(check.ok),
      detail: check.detail
    }))
  };
}

function doctor(profile, args = {}) {
  const report = buildDoctorPayload(profile);

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
    return;
  }

  for (const check of report.checks) {
    console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.label} - ${check.detail}`);
  }

  if (report.failed > 0) {
    process.exitCode = 1;
    console.log(`Doctor finished with ${report.failed} issue${report.failed === 1 ? '' : 's'}.`);
    return;
  }

  console.log('Doctor finished with no issues.');
}

function providerReady(profile, provider) {
  if (provider === 'codex') {
    return true;
  }
  if (provider === 'convex') {
    const hasTeamAccess = Boolean(getSecret(profile, 'convex', 'teamAccessToken'));
    return hasTeamAccess || Boolean(getSecret(profile, 'convex', 'deployKey')) || convexCliStatus().authenticated || convexDashboardEnv().configured;
  }
  if (provider === 'clerk') {
    const data = readProfiles();
    const publishableKey = data.profiles[profile]?.providers?.clerk?.publishableKey;
    return Boolean(
      getSecret(profile, 'clerk', 'platformAccessToken')
      || (publishableKey && getSecret(profile, 'clerk', 'secretKey'))
    );
  }
  return Boolean(getSecret(profile, provider, 'organizationToken'));
}

function providerCredentialState(profile, provider) {
  if (provider === 'codex') return 'guided';
  if (provider === 'convex') {
    if (getSecret(profile, 'convex', 'teamAccessToken')) return 'team-token-stored';
    if (getSecret(profile, 'convex', 'deployKey')) return 'deploy-key-stored';
    if (convexDashboardEnv().configured) return 'local-env-configured';
    if (convexCliStatus().authenticated) return 'cli-authenticated';
    return 'missing';
  }
  if (provider === 'clerk') {
    const data = readProfiles();
    const publishableKey = data.profiles[profile]?.providers?.clerk?.publishableKey;
    if (publishableKey && getSecret(profile, 'clerk', 'secretKey')) return 'app-keys-stored';
    if (getSecret(profile, 'clerk', 'platformAccessToken')) return 'platform-token-stored';
    return 'missing';
  }
  return getSecret(profile, provider, 'organizationToken') ? 'stored' : 'missing';
}

function providerCredentialLabel(provider) {
  if (provider === 'github') return 'GitHub organization token';
  if (provider === 'vercel') return 'Vercel organization token';
  if (provider === 'convex') return 'Convex setup';
  if (provider === 'clerk') return 'Clerk app runtime keys';
  if (provider === 'codex') return 'Codex official setup';
  return `${provider} credentials`;
}

function providerCredentialStatusLabel(provider, ready) {
  if (provider === 'codex') return ready ? 'guided' : 'missing';
  if (provider === 'convex') return ready ? 'configured' : 'missing';
  if (provider === 'clerk') return ready ? 'stored' : 'missing';
  return ready ? 'stored' : 'missing';
}

function providerCredentialNextAction(provider) {
  if (provider === 'github') return 'store a GitHub organization token before live GitHub setup';
  if (provider === 'vercel') return 'store a Vercel organization token before live Vercel setup';
  if (provider === 'clerk') return 'select a Clerk app, store its publishable key metadata, and store its secret key';
  if (provider === 'convex') return 'log in with Convex or store a Convex team access token';
  return `finish ${provider} setup`;
}

function parseEnvContent(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        const rawValue = valueParts.join('=').trim();
        const value = rawValue.startsWith('"') || rawValue.startsWith("'")
          ? rawValue.replace(/^["']|["']$/g, '')
          : rawValue.replace(/\s+#.*$/, '').trim();
        return [key.trim(), value];
      })
  );
}

function convexDashboardEnv() {
  const file = resolve('apps/dashboard/.env.local');
  if (!existsSync(file)) {
    return {
      path: file,
      exists: false,
      configured: false,
      deployment: null,
      urlPresent: false
    };
  }
  const env = parseEnvContent(readFileSync(file, 'utf8'));
  return {
    path: file,
    exists: true,
    configured: Boolean(env.CONVEX_DEPLOYMENT && env.NEXT_PUBLIC_CONVEX_URL),
    deployment: env.CONVEX_DEPLOYMENT || null,
    urlPresent: Boolean(env.NEXT_PUBLIC_CONVEX_URL)
  };
}

function ignoreGlobalCliAuth() {
  return process.env.IDKWIDK_TEMPLATE_IGNORE_GLOBAL_CLI_AUTH === '1';
}

function convexCliStatus() {
  if (ignoreGlobalCliAuth()) {
    const available = commandExists('convex') || npmExecAvailable('convex', { prefix: 'apps/dashboard' });
    return {
      available,
      authenticated: false,
      configPath: null,
      teams: [],
      detail: available
        ? 'global Convex CLI auth ignored for isolated template verification'
        : 'convex CLI missing'
    };
  }

  const result = spawnSync('npm', ['exec', 'convex', '--', 'login', 'status'], {
    cwd: resolve('apps/dashboard'),
    encoding: 'utf8',
    timeout: 15000
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const teams = [...output.matchAll(/^\s*-\s+(.+?)\s+\(([^)]+)\)/gm)].map((match) => ({
    name: match[1],
    slug: match[2]
  }));
  return {
    available: result.status !== null,
    authenticated: /Status:\s+Logged in/.test(output),
    configPath: output.match(/Convex account token found in:\s+(.+)/)?.[1]?.trim() || null,
    teams,
    detail: /Status:\s+Logged in/.test(output)
      ? `logged in${teams.length ? `, teams=${teams.map((team) => team.slug).join(',')}` : ''}`
      : 'not logged in'
  };
}

async function convexManagementRequest(profile, path, options = {}) {
  const token = getSecret(profile, 'convex', 'teamAccessToken');
  if (!token) {
    throw new Error('Missing convex.teamAccessToken. Store it with npm run vault:set -- --profile <name> --provider convex --key teamAccessToken');
  }

  const response = await fetch(`https://api.convex.dev/v1${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText;
    throw new Error(`Convex Management API ${response.status}: ${message}`);
  }

  return payload;
}

async function convexAccessSnapshot(profile, metadata) {
  const teamAccessTokenStored = Boolean(getSecret(profile, 'convex', 'teamAccessToken'));
  if (!teamAccessTokenStored) {
    return {
      teamAccessTokenStored,
      tokenDetails: null,
      projects: null,
      error: null
    };
  }

  try {
    const tokenDetails = await convexManagementRequest(profile, '/token_details');
    const teamId = metadata.teamId || tokenDetails?.teamId;
    const projects = teamId
      ? await convexManagementRequest(profile, `/teams/${teamId}/list_projects`)
      : null;

    return {
      teamAccessTokenStored,
      tokenDetails,
      projects,
      error: null
    };
  } catch (error) {
    return {
      teamAccessTokenStored,
      tokenDetails: null,
      projects: null,
      error: error.message
    };
  }
}

function projectSlug(value) {
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
    throw new Error('Project slug can only contain letters, numbers, dots, underscores, and hyphens.');
  }
  return value;
}

function requireMetadata(entry, provider, key, example) {
  const value = entry.providers?.[provider]?.[key];
  if (!value) {
    throw new Error(`Missing ${provider}.${key} metadata. Set it with: ${example}`);
  }
  return value;
}

function providerPlan(profile, project, provider, metadataKey, action, example) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  const metadataValue = metadataKey
    ? requireMetadata(entry, provider, metadataKey, example)
    : entry.providers?.[provider]?.workspaceName || 'local-codex-workspace';
  const hasToken = providerReady(profile, provider);
  const prior = readState().projects?.[safeProject]?.providers?.[provider] || {};

  updateProjectState(safeProject, profile, provider, {
    ...prior,
    plan: 'completed',
    metadataKey: metadataKey || 'workspaceName',
    metadataValue,
    tokenStored: hasToken
  });

  console.log(`${provider} dry-run plan for "${safeProject}"`);
  console.log('No provider API was called. No resources were created.');
  console.log(`credentials: ${providerCredentialStatusLabel(provider, hasToken)}`);
  console.log(`${metadataKey || 'workspaceName'}: ${metadataValue}`);
  console.log(`planned action: ${action}`);
  console.log(`state: recorded in ${statePath}`);
  if (!hasToken && provider !== 'codex') {
    process.exitCode = 1;
    console.log(`next action: ${providerCredentialNextAction(provider)}.`);
  }
}

async function vercelRequest(token, pathname, query = {}, requestBody = null, method = null) {
  const url = new URL(`https://api.vercel.com${pathname}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method: method || (requestBody ? 'POST' : 'GET'),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: requestBody ? JSON.stringify(requestBody) : undefined
  });
  const responseBody = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body: responseBody };
}

async function checkVercelAccess(profile, project) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const teamSlug = requireMetadata(entry, 'vercel', 'teamSlug', 'npm run vault:metadata -- --profile <name> --provider vercel --key teamSlug --value <team-slug>');
  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) {
    updateProjectState(safeProject, profile, 'vercel', {
      teamSlug,
      accessCheck: 'missing-token',
      created: false,
      verified: false
    });
    throw new Error('Missing Vercel organization token.');
  }

  console.log(`Vercel read-only access check for "${teamSlug}/${safeProject}"`);
  console.log('No Vercel project will be created.');

  const user = await vercelRequest(token, '/v2/user');
  if (!user.ok) {
    updateProjectState(safeProject, profile, 'vercel', {
      teamSlug,
      accessCheck: `user-failed-${user.status}`,
      created: false,
      verified: false
    });
    throw new Error(`Vercel token could not read the authenticated user. HTTP ${user.status}.`);
  }

  const teams = await vercelRequest(token, '/v2/teams', { limit: 100 });
  if (!teams.ok) {
    updateProjectState(safeProject, profile, 'vercel', {
      teamSlug,
      accessCheck: `teams-failed-${teams.status}`,
      created: false,
      verified: false
    });
    throw new Error(`Vercel token could not list teams. HTTP ${teams.status}.`);
  }

  const username = user.body.user?.username;
  const team = (teams.body.teams || []).find((candidate) => candidate.slug === teamSlug);
  const personalScope = !team && username === teamSlug;
  if (!team && !personalScope) {
    updateProjectState(safeProject, profile, 'vercel', {
      teamSlug,
      accessCheck: 'team-not-found',
      created: false,
      verified: false
    });
    throw new Error(`Vercel token works, but team slug "${teamSlug}" was not found for this user.`);
  }

  const projectQuery = personalScope ? { limit: 100 } : { slug: teamSlug, limit: 100 };
  const projects = await vercelRequest(token, '/v10/projects', projectQuery);
  let projectStatus = 'not-checked';
  let projectUrl = null;
  if (projects.ok) {
    const foundProject = (projects.body.projects || []).find((candidate) => candidate.name === safeProject);
    projectStatus = foundProject ? 'exists' : 'not-found';
    projectUrl = foundProject ? `https://vercel.com/${teamSlug}/${foundProject.name}` : null;
  } else {
    projectStatus = `projects-failed-${projects.status}`;
  }

  updateProjectState(safeProject, profile, 'vercel', {
    teamSlug,
    scopeType: personalScope ? 'personal' : 'team',
    teamId: team?.id || null,
    accessCheck: 'ok',
    projectCheck: projectStatus,
    url: projectUrl,
    created: projectStatus === 'exists',
    verified: true
  });

  console.log('token: works');
  console.log(personalScope ? `scope: found personal scope ${teamSlug}` : `team: found ${team.slug}`);
  console.log(`project: ${projectStatus}`);
  if (projectUrl) console.log(`url: ${projectUrl}`);
  console.log('state: recorded without token values.');
}

async function createVercelProject(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-create']) {
    throw new Error('Refusing to create Vercel project without --confirm-create.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const teamSlug = requireMetadata(entry, 'vercel', 'teamSlug', 'npm run vault:metadata -- --profile <name> --provider vercel --key teamSlug --value <team-slug>');
  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) throw new Error('Missing Vercel organization token.');

  const state = readState().projects[safeProject]?.providers?.vercel;
  if (state?.teamSlug !== teamSlug || state?.accessCheck !== 'ok' || state?.projectCheck !== 'not-found') {
    throw new Error('Refusing to create Vercel project before a matching --dry-run --check-access result of project not-found is recorded.');
  }

  const query = state.scopeType === 'personal' ? {} : { slug: teamSlug };
  const created = await vercelRequest(token, '/v11/projects', query, {
    name: safeProject,
    framework: 'nextjs'
  });

  if (!created.ok) {
    updateProjectState(safeProject, profile, 'vercel', {
      ...state,
      createStatus: `failed-${created.status}`,
      created: false,
      verified: false
    });
    throw new Error(`Vercel project creation failed. HTTP ${created.status}. Token value was not printed.`);
  }

  await checkVercelAccess(profile, safeProject);
  const verified = readState().projects[safeProject]?.providers?.vercel;
  if (verified?.projectCheck !== 'exists') {
    updateProjectState(safeProject, profile, 'vercel', {
      ...verified,
      createStatus: 'created-unverified',
      created: true,
      verified: false
    });
    throw new Error('Vercel project was created but readback verification did not find it.');
  }

  updateProjectState(safeProject, profile, 'vercel', {
    ...verified,
    createStatus: 'created',
    created: true,
    verified: true
  });

  console.log(`Created and verified Vercel project: ${verified.url || `${teamSlug}/${safeProject}`}`);
  console.log('No deployments or env vars were configured yet.');
}

function getVercelState(profile, project) {
  const safeProject = projectSlug(project);
  const state = readState().projects[safeProject]?.providers?.vercel;
  if (!state?.verified || !state?.teamSlug || state?.projectCheck !== 'exists') {
    throw new Error('Refusing Vercel env action before project is verified in local state.');
  }
  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) throw new Error('Missing Vercel organization token.');
  const query = state.scopeType === 'personal' ? {} : { slug: state.teamSlug };
  return { safeProject, state, token, query };
}

function vercelProjectSettings() {
  return {
    framework: 'nextjs',
    rootDirectory: 'apps/marketing',
    buildCommand: 'npm run build',
    installCommand: 'npm install',
    outputDirectory: null,
    sourceFilesOutsideRootDirectory: true
  };
}

function vercelDashboardProjectName(project) {
  return `${projectSlug(project)}-dashboard`;
}

function vercelDashboardProjectSettings() {
  return {
    framework: 'nextjs',
    rootDirectory: 'apps/dashboard',
    buildCommand: 'npm run build',
    installCommand: 'npm install',
    outputDirectory: null,
    sourceFilesOutsideRootDirectory: true
  };
}

function planVercelSettings(profile, project) {
  const { safeProject, state } = getVercelState(profile, project);
  const settings = vercelProjectSettings();
  console.log(`Vercel project settings plan for "${state.teamSlug}/${safeProject}"`);
  console.log('No Vercel project settings were written.');
  for (const [key, value] of Object.entries(settings)) {
    console.log(`${key}: ${value === null ? 'auto' : value}`);
  }
  console.log('This points Vercel at the marketing app only. The dashboard stays local until Clerk/Convex production credentials are configured.');
}

async function configureVercelSettings(profile, project, args) {
  if (!args['confirm-settings']) {
    throw new Error('Refusing to write Vercel project settings without --confirm-settings.');
  }

  const { safeProject, state, token, query } = getVercelState(profile, project);
  const settings = vercelProjectSettings();
  const result = await vercelRequest(
    token,
    `/v9/projects/${encodeURIComponent(safeProject)}`,
    query,
    settings,
    'PATCH'
  );

  if (!result.ok) {
    updateProjectState(safeProject, profile, 'vercel', {
      ...state,
      settingsStatus: `failed-${result.status}`
    });
    throw new Error(`Vercel project settings update failed. HTTP ${result.status}. Token values were not printed.`);
  }

  updateProjectState(safeProject, profile, 'vercel', {
    ...state,
    settingsStatus: 'configured',
    settings: {
      framework: result.body.framework || settings.framework,
      rootDirectory: result.body.rootDirectory ?? settings.rootDirectory,
      buildCommand: result.body.buildCommand ?? settings.buildCommand,
      installCommand: result.body.installCommand ?? settings.installCommand,
      outputDirectory: result.body.outputDirectory ?? settings.outputDirectory,
      sourceFilesOutsideRootDirectory: result.body.sourceFilesOutsideRootDirectory ?? settings.sourceFilesOutsideRootDirectory
    }
  });

  console.log(`Configured Vercel project settings for ${state.teamSlug}/${safeProject}.`);
  console.log(`rootDirectory: ${settings.rootDirectory}`);
  console.log('No deployment was triggered by this command.');
}

function vercelTemplateEnvVars(profile, project) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const projectState = readState().projects?.[safeProject]?.providers || {};
  const convexState = projectState.convex || {};
  const clerkState = projectState.clerk || {};
  const clerkPublishableKey = entry.providers?.clerk?.publishableKey || '';
  const clerkSecretKey = getSecret(profile, 'clerk', 'secretKey');
  const convexDeployKey = getSecret(profile, 'convex', 'deployKey');
  const convexDeployment = convexState.deploymentName ? `dev:${convexState.deploymentName}` : convexState.deployment || '';
  const convexUrl = convexState.deploymentUrl || '';
  const clerkIsProductionReady = clerkState.productionConfigured
    && clerkPublishableKey.startsWith('pk_live_')
    && clerkSecretKey?.startsWith('sk_live_');
  const clerkTargets = clerkIsProductionReady
    ? ['production', 'preview', 'development']
    : ['development'];

  const vars = [
    {
      key: 'NEXT_PUBLIC_AUTH_BYPASS',
      value: 'true',
      type: 'plain',
      target: ['production', 'preview', 'development']
    },
    {
      key: 'NEXT_PUBLIC_ANALYTICS_PROVIDER',
      value: 'convex',
      type: 'plain',
      target: ['production', 'preview', 'development']
    },
    {
      key: 'NEXT_PUBLIC_ANALYTICS_SITE_ID',
      value: 'default',
      type: 'plain',
      target: ['production', 'preview', 'development']
    },
    {
      key: 'NEXT_PUBLIC_DASHBOARD_URL',
      value: 'http://localhost:3015',
      type: 'plain',
      target: ['development']
    }
  ];

  if (convexUrl) {
    vars.push({
      key: 'NEXT_PUBLIC_CONVEX_URL',
      value: convexUrl,
      type: 'plain',
      target: ['production', 'preview', 'development']
    });
  }
  if (convexDeployment) {
    vars.push({
      key: 'CONVEX_DEPLOYMENT',
      value: convexDeployment,
      type: 'plain',
      target: ['production', 'preview', 'development']
    });
  }
  if (convexDeployKey) {
    vars.push({
      key: 'CONVEX_DEPLOY_KEY',
      value: convexDeployKey,
      type: 'encrypted',
      target: ['production', 'preview', 'development']
    });
  }
  if (clerkPublishableKey) {
    vars.push({
      key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      value: clerkPublishableKey,
      type: 'plain',
      target: clerkTargets
    });
  }
  if (clerkSecretKey) {
    vars.push({
      key: 'CLERK_SECRET_KEY',
      value: clerkSecretKey,
      type: 'encrypted',
      target: clerkTargets
    });
  }

  return vars;
}

function planVercelEnv(profile, project) {
  const { safeProject, state } = getVercelState(profile, project);
  const vars = vercelTemplateEnvVars(profile, safeProject);
  console.log(`Vercel env plan for "${state.teamSlug}/${safeProject}"`);
  console.log('No Vercel environment variables were written.');
  for (const item of vars) {
    console.log(`${item.key}: type=${item.type} target=${item.target.join(',')}`);
  }
  console.log('Secret values are sourced from the local keychain and are never printed.');
  if (vars.some((item) => item.key.startsWith('CLERK') || item.key.includes('_CLERK_'))) {
    console.log('Clerk keys target production only when a production Clerk instance and live keys are verified.');
  }
}

async function setVercelEnv(profile, project, args) {
  if (!args['confirm-env']) {
    throw new Error('Refusing to write Vercel env vars without --confirm-env.');
  }
  const { safeProject, state, token, query } = getVercelState(profile, project);
  const vars = vercelTemplateEnvVars(profile, safeProject);
  const existingResult = await vercelRequest(token, `/v9/projects/${encodeURIComponent(safeProject)}/env`, query);
  if (existingResult.ok) {
    const existing = existingResult.body.envs || existingResult.body.env || [];
    for (const item of vars) {
      const currentItems = existing.filter((candidate) => candidate.key === item.key);
      for (const current of currentItems) {
        const currentTargets = current.target || [];
        if (currentTargets.join(',') === item.target.join(',') && current.type === item.type) continue;
        const deleteResult = await vercelRequest(
          token,
          `/v9/projects/${encodeURIComponent(safeProject)}/env/${encodeURIComponent(current.id)}`,
          query,
          {},
          'DELETE'
        );
        if (!deleteResult.ok) {
          throw new Error(`Vercel env target sync failed for ${item.key}. HTTP ${deleteResult.status}. Secret values were not printed.`);
        }
      }
    }
  }

  const result = await vercelRequest(
    token,
    `/v10/projects/${encodeURIComponent(safeProject)}/env`,
    { ...query, upsert: 'true' },
    vars
  );

  if (!result.ok) {
    updateProjectState(safeProject, profile, 'vercel', {
      ...state,
      envStatus: `failed-${result.status}`
    });
    throw new Error(`Vercel env write failed. HTTP ${result.status}. Token values were not printed.`);
  }

  const failed = Array.isArray(result.body.failed) ? result.body.failed : [];
  if (failed.length > 0) {
    updateProjectState(safeProject, profile, 'vercel', {
      ...state,
      envStatus: 'partial-failure',
      envKeys: vars.map((item) => item.key)
    });
    throw new Error(`Vercel env write had ${failed.length} failure(s). Secret values were not printed.`);
  }

  updateProjectState(safeProject, profile, 'vercel', {
    ...state,
    envStatus: 'configured',
    envKeys: vars.map((item) => item.key)
  });

  console.log(`Configured ${vars.length} Vercel environment variable(s) for ${state.teamSlug}/${safeProject}.`);
  console.log('Secret values, if included, were sent to Vercel without printing them.');
}

async function checkVercelDashboardAccess(profile, project) {
  const safeProject = projectSlug(project);
  const dashboardProject = vercelDashboardProjectName(safeProject);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const teamSlug = requireMetadata(entry, 'vercel', 'teamSlug', 'npm run vault:metadata -- --profile <name> --provider vercel --key teamSlug --value <team-slug>');
  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      teamSlug,
      projectName: dashboardProject,
      accessCheck: 'missing-token',
      created: false,
      verified: false
    });
    throw new Error('Missing Vercel organization token.');
  }

  console.log(`Vercel dashboard read-only access check for "${teamSlug}/${dashboardProject}"`);
  console.log('No Vercel project will be created.');

  const user = await vercelRequest(token, '/v2/user');
  if (!user.ok) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      teamSlug,
      projectName: dashboardProject,
      accessCheck: `user-failed-${user.status}`,
      created: false,
      verified: false
    });
    throw new Error(`Vercel token could not read the authenticated user. HTTP ${user.status}.`);
  }

  const teams = await vercelRequest(token, '/v2/teams', { limit: 100 });
  if (!teams.ok) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      teamSlug,
      projectName: dashboardProject,
      accessCheck: `teams-failed-${teams.status}`,
      created: false,
      verified: false
    });
    throw new Error(`Vercel token could not list teams. HTTP ${teams.status}.`);
  }

  const username = user.body.user?.username;
  const team = (teams.body.teams || []).find((candidate) => candidate.slug === teamSlug);
  const personalScope = !team && username === teamSlug;
  if (!team && !personalScope) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      teamSlug,
      projectName: dashboardProject,
      accessCheck: 'team-not-found',
      created: false,
      verified: false
    });
    throw new Error(`Vercel token works, but team slug "${teamSlug}" was not found for this user.`);
  }

  const projectQuery = personalScope ? { limit: 100 } : { slug: teamSlug, limit: 100 };
  const projects = await vercelRequest(token, '/v10/projects', projectQuery);
  let projectStatus = 'not-checked';
  let projectUrl = null;
  if (projects.ok) {
    const foundProject = (projects.body.projects || []).find((candidate) => candidate.name === dashboardProject);
    projectStatus = foundProject ? 'exists' : 'not-found';
    projectUrl = foundProject ? `https://vercel.com/${teamSlug}/${foundProject.name}` : null;
  } else {
    projectStatus = `projects-failed-${projects.status}`;
  }

  updateProjectState(safeProject, profile, 'vercelDashboard', {
    teamSlug,
    scopeType: personalScope ? 'personal' : 'team',
    teamId: team?.id || null,
    projectName: dashboardProject,
    accessCheck: 'ok',
    projectCheck: projectStatus,
    url: projectUrl,
    created: projectStatus === 'exists',
    verified: true
  });

  console.log('token: works');
  console.log(personalScope ? `scope: found personal scope ${teamSlug}` : `team: found ${team.slug}`);
  console.log(`project: ${projectStatus}`);
  if (projectUrl) console.log(`url: ${projectUrl}`);
  console.log('state: recorded without token values.');
}

function getVercelDashboardState(profile, project) {
  const safeProject = projectSlug(project);
  const state = readState().projects[safeProject]?.providers?.vercelDashboard;
  if (!state?.verified || !state?.teamSlug || !state?.projectName || state?.projectCheck !== 'exists') {
    throw new Error('Refusing dashboard Vercel action before dashboard project is verified in local state.');
  }
  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) throw new Error('Missing Vercel organization token.');
  const query = state.scopeType === 'personal' ? {} : { slug: state.teamSlug };
  return { safeProject, dashboardProject: state.projectName, state, token, query };
}

async function createVercelDashboardProject(profile, project, args) {
  const safeProject = projectSlug(project);
  const dashboardProject = vercelDashboardProjectName(safeProject);
  if (!args['confirm-create']) {
    throw new Error('Refusing to create Vercel dashboard project without --confirm-create.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const teamSlug = requireMetadata(entry, 'vercel', 'teamSlug', 'npm run vault:metadata -- --profile <name> --provider vercel --key teamSlug --value <team-slug>');
  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) throw new Error('Missing Vercel organization token.');

  const state = readState().projects[safeProject]?.providers?.vercelDashboard;
  if (state?.teamSlug !== teamSlug || state?.projectName !== dashboardProject || state?.accessCheck !== 'ok' || state?.projectCheck !== 'not-found') {
    throw new Error('Refusing to create Vercel dashboard project before a matching --dry-run --check-access result of project not-found is recorded.');
  }

  const query = state.scopeType === 'personal' ? {} : { slug: teamSlug };
  const created = await vercelRequest(token, '/v11/projects', query, {
    name: dashboardProject,
    framework: 'nextjs'
  });

  if (!created.ok) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      ...state,
      createStatus: `failed-${created.status}`,
      created: false,
      verified: false
    });
    throw new Error(`Vercel dashboard project creation failed. HTTP ${created.status}. Token value was not printed.`);
  }

  await checkVercelDashboardAccess(profile, safeProject);
  const verified = readState().projects[safeProject]?.providers?.vercelDashboard;
  if (verified?.projectCheck !== 'exists') {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      ...verified,
      createStatus: 'created-unverified',
      created: true,
      verified: false
    });
    throw new Error('Vercel dashboard project was created but readback verification did not find it.');
  }

  updateProjectState(safeProject, profile, 'vercelDashboard', {
    ...verified,
    createStatus: 'created',
    created: true,
    verified: true
  });

  console.log(`Created and verified Vercel dashboard project: ${verified.url || `${teamSlug}/${dashboardProject}`}`);
  console.log('No deployments or env vars were configured yet.');
}

function planVercelDashboardSettings(profile, project) {
  const { dashboardProject, state } = getVercelDashboardState(profile, project);
  const settings = vercelDashboardProjectSettings();
  console.log(`Vercel dashboard settings plan for "${state.teamSlug}/${dashboardProject}"`);
  console.log('No Vercel project settings were written.');
  for (const [key, value] of Object.entries(settings)) {
    console.log(`${key}: ${value === null ? 'auto' : value}`);
  }
  console.log('This points Vercel at the dashboard app. Keep it protected before using it as a production admin surface.');
}

async function configureVercelDashboardSettings(profile, project, args) {
  if (!args['confirm-settings']) {
    throw new Error('Refusing to write Vercel dashboard settings without --confirm-settings.');
  }

  const { safeProject, dashboardProject, state, token, query } = getVercelDashboardState(profile, project);
  const settings = vercelDashboardProjectSettings();
  const result = await vercelRequest(
    token,
    `/v9/projects/${encodeURIComponent(dashboardProject)}`,
    query,
    settings,
    'PATCH'
  );

  if (!result.ok) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      ...state,
      settingsStatus: `failed-${result.status}`
    });
    throw new Error(`Vercel dashboard settings update failed. HTTP ${result.status}. Token values were not printed.`);
  }

  updateProjectState(safeProject, profile, 'vercelDashboard', {
    ...state,
    settingsStatus: 'configured',
    settings: {
      framework: result.body.framework || settings.framework,
      rootDirectory: result.body.rootDirectory ?? settings.rootDirectory,
      buildCommand: result.body.buildCommand ?? settings.buildCommand,
      installCommand: result.body.installCommand ?? settings.installCommand,
      outputDirectory: result.body.outputDirectory ?? settings.outputDirectory,
      sourceFilesOutsideRootDirectory: result.body.sourceFilesOutsideRootDirectory ?? settings.sourceFilesOutsideRootDirectory
    }
  });

  console.log(`Configured Vercel dashboard settings for ${state.teamSlug}/${dashboardProject}.`);
  console.log(`rootDirectory: ${settings.rootDirectory}`);
  console.log('No deployment was triggered by this command.');
}

function vercelDashboardEnvVars(profile, project) {
  return vercelTemplateEnvVars(profile, project)
    .filter((item) => item.key !== 'NEXT_PUBLIC_DASHBOARD_URL')
    .map((item) => item.key === 'NEXT_PUBLIC_AUTH_BYPASS'
      ? { ...item, target: ['development'] }
      : item);
}

function planVercelDashboardEnv(profile, project) {
  const { dashboardProject, state } = getVercelDashboardState(profile, project);
  const vars = vercelDashboardEnvVars(profile, project);
  console.log(`Vercel dashboard env plan for "${state.teamSlug}/${dashboardProject}"`);
  console.log('No Vercel environment variables were written.');
  for (const item of vars) {
    console.log(`${item.key}: type=${item.type} target=${item.target.join(',')}`);
  }
  console.log('Secret values are sourced from the local keychain and are never printed.');
  console.log('Clerk production and preview targets require live Clerk production keys.');
}

async function setVercelDashboardEnv(profile, project, args) {
  if (!args['confirm-env']) {
    throw new Error('Refusing to write Vercel dashboard env vars without --confirm-env.');
  }
  const { safeProject, dashboardProject, state, token, query } = getVercelDashboardState(profile, project);
  const vars = vercelDashboardEnvVars(profile, safeProject);
  const existingResult = await vercelRequest(token, `/v9/projects/${encodeURIComponent(dashboardProject)}/env`, query);
  if (existingResult.ok) {
    const existing = existingResult.body.envs || existingResult.body.env || [];
    for (const item of vars) {
      const currentItems = existing.filter((candidate) => candidate.key === item.key);
      for (const current of currentItems) {
        const currentTargets = current.target || [];
        if (currentTargets.join(',') === item.target.join(',') && current.type === item.type) continue;
        const deleteResult = await vercelRequest(
          token,
          `/v9/projects/${encodeURIComponent(dashboardProject)}/env/${encodeURIComponent(current.id)}`,
          query,
          {},
          'DELETE'
        );
        if (!deleteResult.ok) {
          throw new Error(`Vercel dashboard env target sync failed for ${item.key}. HTTP ${deleteResult.status}. Secret values were not printed.`);
        }
      }
    }
  }

  const result = await vercelRequest(
    token,
    `/v10/projects/${encodeURIComponent(dashboardProject)}/env`,
    { ...query, upsert: 'true' },
    vars
  );

  if (!result.ok) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      ...state,
      envStatus: `failed-${result.status}`
    });
    throw new Error(`Vercel dashboard env write failed. HTTP ${result.status}. Token values were not printed.`);
  }

  const failed = Array.isArray(result.body.failed) ? result.body.failed : [];
  if (failed.length > 0) {
    updateProjectState(safeProject, profile, 'vercelDashboard', {
      ...state,
      envStatus: 'partial-failure',
      envKeys: vars.map((item) => item.key)
    });
    throw new Error(`Vercel dashboard env write had ${failed.length} failure(s). Secret values were not printed.`);
  }

  updateProjectState(safeProject, profile, 'vercelDashboard', {
    ...state,
    envStatus: 'configured',
    envKeys: vars.map((item) => item.key)
  });

  console.log(`Configured ${vars.length} Vercel dashboard environment variable(s) for ${state.teamSlug}/${dashboardProject}.`);
  console.log('Secret values, if included, were sent to Vercel without printing them.');
}

function provisionPlanMetadata(provider, metadata = {}) {
  if (provider !== 'clerk') return metadata;

  const { publishableKey, ...safeMetadata } = metadata;
  return {
    ...safeMetadata,
    publishableKeyStored: Boolean(publishableKey)
  };
}

function buildProvisionPlan(profile, project) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  const providerMetadata = entry.providers || {};
  const steps = [
    {
      provider: 'github',
      ready: providerReady(profile, 'github'),
      credentialState: providerCredentialState(profile, 'github'),
      metadata: provisionPlanMetadata('github', providerMetadata.github || {}),
      action: `Create or connect a repository for "${safeProject}" under the selected owner.`,
      readOnlyCommand: `npm run vault:github -- --profile ${profile} --project ${safeProject} --dry-run --check-existing`,
      liveCommand: `npm run vault:github -- --profile ${profile} --project ${safeProject} --create --confirm-create --visibility private`,
      confirmationRequired: '--confirm-create'
    },
    {
      provider: 'vercel',
      ready: providerReady(profile, 'vercel'),
      credentialState: providerCredentialState(profile, 'vercel'),
      metadata: provisionPlanMetadata('vercel', providerMetadata.vercel || {}),
      action: `Create or link a Vercel project for "${safeProject}" and attach generated env vars.`,
      readOnlyCommand: `npm run vault:vercel -- --profile ${profile} --project ${safeProject} --dry-run --check-access`,
      liveCommand: `npm run vault:vercel -- --profile ${profile} --project ${safeProject} --create --confirm-create`,
      confirmationRequired: '--confirm-create'
    },
    {
      provider: 'convex',
      ready: providerReady(profile, 'convex'),
      credentialState: providerCredentialState(profile, 'convex'),
      metadata: provisionPlanMetadata('convex', providerMetadata.convex || {}),
      action: `Create Convex deployments for "${safeProject}" and return project-specific Convex env values.`,
      readOnlyCommand: `npm run vault:convex -- --profile ${profile} --project ${safeProject} --dry-run --check-access`,
      liveCommand: `npm run vault:convex -- --profile ${profile} --project ${safeProject} --create --confirm-create --deployment-type dev`,
      confirmationRequired: '--confirm-create'
    },
    {
      provider: 'clerk',
      ready: providerReady(profile, 'clerk'),
      credentialState: providerCredentialState(profile, 'clerk'),
      metadata: provisionPlanMetadata('clerk', providerMetadata.clerk || {}),
      action: `Create or select a Clerk application for "${safeProject}" and return project-specific Clerk keys.`,
      readOnlyCommand: `npm run vault:clerk -- --profile ${profile} --project ${safeProject} --dry-run`,
      liveCommand: `npm run vault:clerk -- --profile ${profile} --project ${safeProject} --pull-dev-env --confirm-dev-env`,
      confirmationRequired: '--confirm-dev-env'
    },
    {
      provider: 'codex',
      ready: false,
      credentialState: 'guided',
      metadata: provisionPlanMetadata('codex', providerMetadata.codex || {}),
      action: `Prepare Codex workspace instructions for "${safeProject}" using the secure setup flow available on this machine.`,
      readOnlyCommand: `npm run vault:codex -- --profile ${profile} --project ${safeProject} --dry-run`,
      liveCommand: null,
      confirmationRequired: null
    }
  ];

  return {
    schemaVersion: 1,
    profile,
    project: safeProject,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    recommendedStart: `npm run setup:factory -- --profile ${profile} --project ${safeProject}`,
    humanPlan: `npm run setup:plan -- --profile ${profile} --project ${safeProject} --dry-run`,
    agentPlan: `npm --silent run setup:plan -- --profile ${profile} --project ${safeProject} --dry-run --json`,
    liveWalkthrough: `npm run setup:walkthrough -- --profile ${profile} --project ${safeProject} --live`,
    safetyRules: [
      'Run read-only checks before live provider changes.',
      'Run one live provider mutation at a time.',
      'Require the printed confirmation flag before each live mutation.',
      'Never print or commit organization tokens.',
      'Treat Clerk production as blocked until a real domain and live keys exist.'
    ],
    steps
  };
}

function printProvisionPlan(profile, project, args = {}) {
  const plan = buildProvisionPlan(profile, project);

  if (args.json) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  console.log(`Provisioning plan for profile "${profile}" and project "${project}"`);
  console.log('No provider APIs were called. No resources were created.');
  console.log(`Recommended start: ${plan.recommendedStart}`);
  console.log(`Agent JSON: ${plan.agentPlan}`);
  for (const step of plan.steps) {
    const metadataKeys = Object.keys(step.metadata);
    console.log(`\n${step.provider}`);
    console.log(`  credentials: ${step.credentialState}`);
    console.log(`  metadata: ${metadataKeys.length ? metadataKeys.map((key) => `${key}=${step.metadata[key]}`).join(', ') : 'none'}`);
    console.log(`  planned action: ${step.action}`);
    console.log(`  read-only check: ${step.readOnlyCommand}`);
    if (step.liveCommand) {
      console.log(`  guarded live command: ${step.liveCommand}`);
      console.log(`  confirmation required: ${step.confirmationRequired}`);
    } else {
      console.log('  guarded live command: guided only');
    }
  }
}

function runGithubExistenceCheck(profile, owner, project) {
  const token = getSecret(profile, 'github', 'organizationToken');
  if (!token) {
    console.log('repository check: skipped because GitHub organization token is missing.');
    updateProjectState(project, profile, 'github', {
      owner,
      repo: project,
      url: `https://github.com/${owner}/${project}`,
      readCheck: 'missing-token',
      created: false,
      verified: false
    });
    process.exitCode = 1;
    return;
  }

  if (!commandExists('gh')) {
    console.log('repository check: skipped because the GitHub CLI is not installed.');
    updateProjectState(project, profile, 'github', {
      owner,
      repo: project,
      url: `https://github.com/${owner}/${project}`,
      readCheck: 'missing-gh-cli',
      created: false,
      verified: false
    });
    process.exitCode = 1;
    return;
  }

  const result = spawnSync(
    'gh',
    ['repo', 'view', `${owner}/${project}`, '--json', 'nameWithOwner,url,isPrivate'],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        GH_TOKEN: token,
        GITHUB_TOKEN: token
      }
    }
  );

  if (result.status === 0) {
    const repo = JSON.parse(result.stdout);
    console.log('repository check: exists');
    console.log(`  name: ${repo.nameWithOwner}`);
    console.log(`  url: ${repo.url}`);
    console.log(`  private: ${repo.isPrivate ? 'yes' : 'no'}`);
    console.log('next action: choose a different project slug or explicitly connect the existing repository.');
    updateProjectState(project, profile, 'github', {
      owner,
      repo: project,
      url: repo.url,
      readCheck: 'exists',
      isPrivate: Boolean(repo.isPrivate),
      created: false,
      verified: true
    });
    process.exitCode = 1;
    return;
  }

  const output = `${result.stderr || ''}\n${result.stdout || ''}`;
  if (/could not resolve to a Repository|not found|HTTP 404|Could not resolve/.test(output)) {
    console.log('repository check: not found');
    console.log('next action: repository name appears available to create after explicit user approval.');
    updateProjectState(project, profile, 'github', {
      owner,
      repo: project,
      url: `https://github.com/${owner}/${project}`,
      readCheck: 'not-found',
      created: false,
      verified: false
    });
    return;
  }

  console.log('repository check: inconclusive');
  console.log('GitHub returned an error while checking the repository. Token value was not printed.');
  updateProjectState(project, profile, 'github', {
    owner,
    repo: project,
    url: `https://github.com/${owner}/${project}`,
    readCheck: 'inconclusive',
    created: false,
    verified: false
  });
  process.exitCode = 1;
}

function githubRepoView(profile, owner, project) {
  const token = getSecret(profile, 'github', 'organizationToken');
  if (!token) return { status: 'missing-token' };
  if (!commandExists('gh')) return { status: 'missing-gh-cli' };

  const result = spawnSync(
    'gh',
    ['repo', 'view', `${owner}/${project}`, '--json', 'nameWithOwner,url,isPrivate'],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        GH_TOKEN: token,
        GITHUB_TOKEN: token
      }
    }
  );

  if (result.status === 0) {
    const repo = JSON.parse(result.stdout);
    return { status: 'exists', repo };
  }

  const output = `${result.stderr || ''}\n${result.stdout || ''}`;
  if (/could not resolve to a Repository|not found|HTTP 404|Could not resolve/.test(output)) {
    return { status: 'not-found' };
  }

  return { status: 'inconclusive' };
}

function createGithubRepo(profile, project, args) {
  const safeProject = projectSlug(project);
  const visibility = args.visibility && args.visibility !== true ? String(args.visibility) : null;
  if (!args['confirm-create']) {
    throw new Error('Refusing to create GitHub repository without --confirm-create.');
  }
  if (!['private', 'public', 'internal'].includes(visibility)) {
    throw new Error('Missing or invalid --visibility. Use private, public, or internal.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const owner = requireMetadata(entry, 'github', 'owner', 'npm run vault:metadata -- --profile <name> --provider github --key owner --value <owner>');
  const state = readState().projects[safeProject]?.providers?.github;
  if (state?.owner !== owner || state?.repo !== safeProject || state?.readCheck !== 'not-found') {
    throw new Error('Refusing to create GitHub repository before a matching --dry-run --check-existing result of not-found is recorded.');
  }

  const token = getSecret(profile, 'github', 'organizationToken');
  if (!token) throw new Error('Missing GitHub organization token.');
  if (!commandExists('gh')) throw new Error('GitHub CLI is required for live GitHub creation.');

  const argsForGh = ['repo', 'create', `${owner}/${safeProject}`, `--${visibility}`, '--confirm'];
  const result = spawnSync('gh', argsForGh, {
    encoding: 'utf8',
    env: {
      ...process.env,
      GH_TOKEN: token,
      GITHUB_TOKEN: token
    }
  });

  if (result.status !== 0) {
    updateProjectState(safeProject, profile, 'github', {
      owner,
      repo: safeProject,
      url: `https://github.com/${owner}/${safeProject}`,
      createStatus: 'failed',
      created: false,
      verified: false
    });
    throw new Error('GitHub repository creation failed. Token value was not printed.');
  }

  const verified = githubRepoView(profile, owner, safeProject);
  if (verified.status !== 'exists') {
    updateProjectState(safeProject, profile, 'github', {
      owner,
      repo: safeProject,
      url: `https://github.com/${owner}/${safeProject}`,
      createStatus: 'created-unverified',
      created: true,
      verified: false
    });
    throw new Error('GitHub repository was created but readback verification did not pass.');
  }

  updateProjectState(safeProject, profile, 'github', {
    owner,
    repo: safeProject,
    url: verified.repo.url,
    readCheck: 'exists',
    createStatus: 'created',
    created: true,
    verified: true,
    isPrivate: Boolean(verified.repo.isPrivate)
  });

  console.log(`Created and verified GitHub repository: ${verified.repo.url}`);
  console.log('Code was not pushed. Run the future push/connect step after reviewing local git status.');
}

function connectGithubRepo(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-connect']) {
    throw new Error('Refusing to connect GitHub repository without --confirm-connect.');
  }
  const remote = args.remote && args.remote !== true ? String(args.remote) : 'template';
  if (!/^[a-zA-Z0-9._-]+$/.test(remote)) {
    throw new Error('Remote name can only contain letters, numbers, dots, underscores, and hyphens.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const owner = requireMetadata(entry, 'github', 'owner', 'npm run vault:metadata -- --profile <name> --provider github --key owner --value <owner>');
  const state = readState().projects[safeProject]?.providers?.github;
  if (state?.owner !== owner || state?.repo !== safeProject || !state?.verified) {
    throw new Error('Refusing to connect before GitHub repository verification exists in local state.');
  }
  if (!noTrackedEnvLeaks()) {
    throw new Error('Refusing to connect while env files appear tracked.');
  }

  const url = state.url || `https://github.com/${owner}/${safeProject}`;
  const mode = setGitRemote(remote, url, { replace: Boolean(args['replace-remote']) });
  updateProjectState(safeProject, profile, 'github', {
    ...state,
    remote,
    remoteUrl: url,
    connectStatus: mode
  });
  console.log(`Git remote ${remote} ${mode}: ${url}`);
}

function pushInitialGithubRepo(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-push']) {
    throw new Error('Refusing to push without --confirm-push.');
  }

  const data = readState();
  const state = data.projects[safeProject]?.providers?.github;
  if (!state?.remoteUrl || !state?.remote) {
    throw new Error('Refusing to push before GitHub remote is connected in local state.');
  }
  if (!noTrackedEnvLeaks()) {
    throw new Error('Refusing to push while env files appear tracked.');
  }

  const status = git(['status', '--porcelain']);
  if (status.status !== 0) throw new Error('Could not inspect git status.');
  if (status.stdout.trim()) {
    throw new Error('Refusing to push initial code while the worktree has uncommitted changes.');
  }

  const branch = git(['branch', '--show-current']).stdout.trim() || 'main';
  const result = git(['push', '-u', state.remote, branch]);
  if (result.status !== 0) {
    updateProjectState(safeProject, profile, 'github', {
      ...state,
      pushStatus: 'failed'
    });
    throw new Error('Initial git push failed.');
  }

  updateProjectState(safeProject, profile, 'github', {
    ...state,
    pushStatus: 'pushed',
    pushedBranch: branch
  });
  console.log(`Pushed ${branch} to ${state.remote}.`);
}

function printGithubPlan(profile, project, args) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const prior = readState().projects?.[safeProject]?.providers?.github || {};

  const metadata = entry.providers?.github || {};
  const owner = metadata.owner;
  if (!owner) {
    throw new Error('Missing github.owner metadata. Set it with: npm run vault:metadata -- --profile <name> --provider github --key owner --value <owner>');
  }

  const hasToken = providerReady(profile, 'github');
  const ghAvailable = commandExists('gh');

  console.log(`GitHub dry-run plan for "${owner}/${safeProject}"`);
  console.log(args['check-existing']
    ? 'Read-only GitHub repository check requested. No repository will be created.'
    : 'No GitHub API was called. No repository was created.');
  console.log(`token: ${hasToken ? 'stored' : 'missing'}`);
  console.log(`gh CLI: ${ghAvailable ? 'available' : 'not found'}`);
  console.log(`repository check: ${args['check-existing'] ? 'requested' : 'not requested'}`);
  console.log(`target owner: ${owner}`);
  console.log(`target repository: ${safeProject}`);
  console.log(`planned URL: https://github.com/${owner}/${safeProject}`);
  console.log('planned actions:');
  console.log('  1. Confirm the selected GitHub owner with the user.');
  console.log('  2. Check whether the repository already exists.');
  console.log('  3. Create the repository only after explicit approval.');
  console.log('  4. Push or connect the template code only after repository creation is verified.');
  console.log('  5. Store only project-specific deployment secrets in provider environments.');

  if (!hasToken) {
    updateProjectState(safeProject, profile, 'github', {
      owner,
      repo: safeProject,
      url: `https://github.com/${owner}/${safeProject}`,
      plan: 'completed',
      tokenStored: false,
      readCheck: args['check-existing'] ? 'missing-token' : 'not-requested',
      created: false,
      verified: false
    });
    process.exitCode = 1;
    console.log('next action: store a GitHub organization token before live GitHub setup.');
    return;
  }

  updateProjectState(safeProject, profile, 'github', {
    ...prior,
    owner,
    repo: safeProject,
    url: `https://github.com/${owner}/${safeProject}`,
    plan: 'completed',
    tokenStored: true,
    readCheck: args['check-existing'] ? 'requested' : prior.readCheck || 'not-requested'
  });

  if (args['check-existing']) {
    runGithubExistenceCheck(profile, owner, safeProject);
    return;
  }

  console.log('next action: run with --check-existing to perform the read-only repository existence check.');
}

async function printProviderDryRun(profile, project, provider, args = {}) {
  if (provider === 'convex') {
    await printConvexPlan(profile, project, args);
    return;
  }
  if (provider === 'clerk') {
    printClerkPlan(profile, project);
    return;
  }

  const config = {
    vercel: {
      metadataKey: 'teamSlug',
      example: 'npm run vault:metadata -- --profile <name> --provider vercel --key teamSlug --value <team-slug>',
      action: 'Create or link a Vercel project and later attach project-specific env vars.'
    },
    convex: {
      metadataKey: 'teamSlug',
      example: 'npm run vault:metadata -- --profile <name> --provider convex --key teamSlug --value <team-slug>',
      action: 'Create or link Convex project/deployments and return project-specific Convex env values.'
    },
    clerk: {
      metadataKey: 'publishableKey',
      example: 'npm run vault:metadata -- --profile <name> --provider clerk --key publishableKey --value <pk_test_or_pk_live>',
      action: 'Use an existing Clerk app with app-level keys, or use platformAccessToken only if Clerk Platform API private beta is enabled.'
    },
    codex: {
      metadataKey: null,
      example: 'npm run vault:metadata -- --profile <name> --provider codex --key workspaceName --value <workspace-name>',
      action: 'Prepare the supported Codex/OpenAI secure setup flow without inventing provider semantics.'
    }
  }[provider];

  providerPlan(profile, project, provider, config.metadataKey, config.action, config.example);
}

async function printConvexPlan(profile, project, args = {}) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  const metadata = entry.providers?.convex || {};
  const cli = convexCliStatus();
  const env = convexDashboardEnv();
  const deployKeyStored = Boolean(getSecret(profile, 'convex', 'deployKey'));
  const teamAccessTokenStored = Boolean(getSecret(profile, 'convex', 'teamAccessToken'));
  const teamSlug = metadata.teamSlug || cli.teams[0]?.slug || null;
  let access = null;
  if (args['check-access']) {
    access = await convexAccessSnapshot(profile, metadata);
  }
  const teamId = metadata.teamId || access?.tokenDetails?.teamId || null;
  const matchingProject = access?.projects?.find((item) => item.slug === safeProject || item.name === safeProject) || null;

  updateProjectState(safeProject, profile, 'convex', {
    plan: 'completed',
    cliAvailable: cli.available,
    cliAuthenticated: cli.authenticated,
    teamSlug,
    teamId,
    teamAccessTokenStored,
    deployKeyStored,
    managementApiChecked: Boolean(args['check-access']),
    managementApiError: access?.error || null,
    projectId: matchingProject?.id || undefined,
    projectSlug: matchingProject?.slug || undefined,
    dashboardEnvFile: env.exists,
    deployment: env.deployment,
    urlPresent: env.urlPresent,
    configured: env.configured || Boolean(matchingProject),
    created: env.configured || Boolean(matchingProject),
    verified: env.configured || Boolean(matchingProject)
  });

  console.log(`Convex dry-run plan for "${safeProject}"`);
  console.log('No Convex project, deployment, or token was created.');
  console.log(`Convex CLI: ${cli.available ? 'available' : 'missing'} (${cli.detail})`);
  console.log(`team slug: ${teamSlug || 'missing'}`);
  console.log(`team ID: ${teamId || 'missing'}`);
  console.log(`team access token: ${teamAccessTokenStored ? 'stored in keychain' : 'missing / optional for fully automated project creation'}`);
  console.log(`deploy key: ${deployKeyStored ? 'stored in keychain' : 'missing / not needed for interactive local setup'}`);
  if (access) {
    const managementApiStatus = !access.teamAccessTokenStored
      ? 'skipped (missing team access token)'
      : access.error
        ? `failed (${access.error})`
        : 'passed';
    console.log(`Management API check: ${managementApiStatus}`);
    if (Array.isArray(access.projects)) {
      console.log(`Management API projects visible: ${access.projects.length}`);
      console.log(`target project: ${matchingProject ? `found (${matchingProject.slug}, id=${matchingProject.id})` : 'not found'}`);
    }
  }
  console.log(`dashboard env: ${env.exists ? '.env.local present' : 'missing'}`);
  console.log(`CONVEX_DEPLOYMENT: ${env.deployment || 'missing'}`);
  console.log(`NEXT_PUBLIC_CONVEX_URL: ${env.urlPresent ? 'present' : 'missing'}`);
  console.log('team-token path: create/list projects through Convex Management API, then use project/deploy keys for deployment work.');
  console.log('new-user path: log in once, then create or select a project with convex dev.');
  console.log('anonymous path: run a local deployment without an account.');
  console.log('agent/CI path: use CONVEX_DEPLOY_KEY after a project deployment exists.');
  if (!teamAccessTokenStored) {
    console.log('next team token: npm run vault:set -- --profile personal --provider convex --key teamAccessToken');
  }
  if (!teamId) {
    console.log('next team ID: npm run vault:metadata -- --profile personal --provider convex --key teamId --value <team-id>');
  }
  if (!cli.authenticated) {
    console.log('next: cd apps/dashboard && npm exec convex -- login');
  }
  if (!teamSlug) {
    console.log('next: cd apps/dashboard && npm exec convex -- login status');
  }
  console.log(`next cloud setup: cd apps/dashboard && npm exec convex -- dev --configure new --team ${teamSlug || '<team-slug>'} --project ${safeProject} --dev-deployment cloud --once`);
  console.log('next local-only setup: cd apps/dashboard && npm exec convex -- dev --configure new --dev-deployment local --once');
  console.log('next deploy key: cd apps/dashboard && npm exec convex -- deployment token create vercel-prod --deployment prod --save-env .env.production.local');
  console.log(`next management create: npm run vault:convex -- --profile ${profile} --project ${safeProject} --create --confirm-create --deployment-type dev`);
}

async function createConvexProject(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-create']) {
    throw new Error('Refusing to create Convex project without --confirm-create.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  const metadata = entry.providers?.convex || {};
  const access = await convexAccessSnapshot(profile, metadata);
  if (access.error) throw new Error(access.error);
  const teamId = metadata.teamId || access.tokenDetails?.teamId;
  if (!teamId) {
    throw new Error('Missing convex.teamId. Store it with npm run vault:metadata -- --profile <name> --provider convex --key teamId --value <team-id>');
  }

  const existing = access.projects?.find((item) => item.slug === safeProject || item.name === safeProject);
  if (existing) {
    updateProjectState(safeProject, profile, 'convex', {
      plan: 'completed',
      teamId,
      teamSlug: existing.teamSlug || metadata.teamSlug || null,
      teamAccessTokenStored: true,
      projectId: existing.id,
      projectSlug: existing.slug,
      created: true,
      verified: true
    });
    console.log(`Convex project already exists: ${existing.name} (${existing.slug}, id=${existing.id})`);
    console.log('No new project was created.');
    return;
  }

  const deploymentType = args['deployment-type'] && args['deployment-type'] !== true
    ? String(args['deployment-type'])
    : 'dev';
  if (!['dev', 'prod', 'preview', 'custom', 'none'].includes(deploymentType)) {
    throw new Error('--deployment-type must be dev, prod, preview, custom, or none.');
  }

  const body = {
    projectName: args.name && args.name !== true ? String(args.name) : safeProject
  };
  if (deploymentType !== 'none') {
    body.deploymentType = deploymentType;
  }
  if (args.region && args.region !== true) {
    body.deploymentRegion = String(args.region);
  }

  const created = await convexManagementRequest(profile, `/teams/${teamId}/create_project`, {
    method: 'POST',
    body
  });

  updateProjectState(safeProject, profile, 'convex', {
    plan: 'completed',
    teamId,
    teamSlug: metadata.teamSlug || null,
    teamAccessTokenStored: true,
    projectId: created.id || created.projectId,
    projectSlug: created.slug,
    deploymentName: created.deploymentName || null,
    deploymentUrl: created.deploymentUrl || null,
    created: true,
    verified: true
  });

  console.log(`Created Convex project: ${created.slug} (id=${created.id || created.projectId})`);
  if (created.deploymentName) console.log(`deployment: ${created.deploymentName}`);
  if (created.deploymentUrl) console.log(`deployment URL: ${created.deploymentUrl}`);
  console.log('Next: create a deployment key for CI/Vercel or run Convex CLI against this project.');
}

async function createConvexDeployKey(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-deploy-key']) {
    throw new Error('Refusing to create Convex deploy key without --confirm-deploy-key.');
  }

  const state = readState().projects[safeProject]?.providers?.convex;
  const deploymentName = args.deployment && args.deployment !== true
    ? String(args.deployment).replace(/^dev:/, '')
    : state?.deploymentName || state?.deployment?.replace(/^dev:/, '');
  if (!deploymentName) {
    throw new Error('Missing Convex deployment name in state. Run the Convex create/connect step first.');
  }

  const keyName = args['key-name'] && args['key-name'] !== true ? String(args['key-name']) : 'vercel-prod';
  const created = await convexManagementRequest(profile, `/deployments/${encodeURIComponent(deploymentName)}/create_deploy_key`, {
    method: 'POST',
    body: {
      name: keyName
    }
  });
  if (!created?.deployKey) {
    throw new Error('Convex did not return a deploy key.');
  }

  setSecret(profile, 'convex', 'deployKey', created.deployKey);
  updateProjectState(safeProject, profile, 'convex', {
    ...(state || {}),
    deployKeyStored: true,
    deployKeyName: keyName,
    deployKeyDeployment: deploymentName,
    deployKeyCreatedAt: new Date().toISOString(),
    created: true,
    verified: true
  });

  console.log(`Created Convex deploy key "${keyName}" for deployment ${deploymentName}.`);
  console.log('The deploy key was stored in the OS keychain and was not printed.');
}

function getClerkCliStatus() {
  if (ignoreGlobalCliAuth()) {
    const available = commandExists('clerk') || npmExecAvailable('clerk');
    return {
      available,
      authenticated: false,
      detail: available
        ? 'global Clerk CLI auth ignored for isolated template verification'
        : 'clerk CLI missing',
      linkedApplicationId: null
    };
  }

  const cliStatus = runClerkCli(['whoami', '--json']);
  let clerkCli = { available: cliStatus.status !== null, authenticated: false, detail: 'not checked' };
  if (cliStatus.status === 0) {
    const parsed = parseCliJson(cliStatus.stdout, {});
    clerkCli = {
      available: true,
      authenticated: true,
      detail: parsed.email || parsed.user?.email || 'logged in',
      linkedApplicationId: parsed.app?.id || parsed.app?.application_id || parsed.applicationId || null
    };
  } else if (cliStatus.status === null) {
    clerkCli = {
      available: false,
      authenticated: false,
      detail: cliStatus.error?.message || 'command timed out'
    };
  } else if (cliStatus.stdout || cliStatus.stderr) {
    const outputText = `${cliStatus.stdout || ''}${cliStatus.stderr || ''}`;
    clerkCli = {
      available: true,
      authenticated: false,
      detail: /auth_required/.test(outputText) ? 'not logged in' : 'not authenticated'
    };
  }
  return clerkCli;
}

function getClerkApps() {
  const appsList = runClerkCli(['apps', 'list', '--json']);
  if (appsList.status !== 0) return [];
  return parseCliJson(appsList.stdout, []);
}

function getClerkDeployStatus(profile, project, options = {}) {
  const safeProject = projectSlug(project);
  const result = runClerkCli(['deploy', 'status']);
  const parsed = parseCliJson(`${result.stdout || ''}${result.stderr || ''}`, null);
  const status = parsed
    ? {
        checked: true,
        complete: Boolean(parsed.complete),
        state: parsed.state || null,
        domain: parsed.domain || null,
        productionInstanceId: parsed.productionInstanceId || null,
        domainStatus: parsed.domainStatus || null,
        pendingDnsRecordCount: Array.isArray(parsed.pendingDnsRecords) ? parsed.pendingDnsRecords.length : 0,
        oauthComplete: Boolean(parsed.oauth?.complete),
        nextAction: parsed.nextAction || null,
        exitStatus: result.status
      }
    : {
        checked: false,
        complete: false,
        state: 'unknown',
        domain: null,
        productionInstanceId: null,
        domainStatus: null,
        pendingDnsRecordCount: null,
        oauthComplete: false,
        nextAction: result.status === null ? 'Clerk deploy status timed out.' : 'Clerk deploy status could not be parsed.',
        exitStatus: result.status
      };

  if (options.record !== false) {
    const prior = readState().projects?.[safeProject]?.providers?.clerk || {};
    updateProjectState(safeProject, profile, 'clerk', {
      ...prior,
      productionDeployStatusChecked: status.checked,
      productionDeployComplete: status.complete,
      productionDeployState: status.state,
      productionDeployDomain: status.domain,
      productionDeployDomainStatus: status.domainStatus,
      productionDeployPendingDnsRecordCount: status.pendingDnsRecordCount,
      productionDeployOauthComplete: status.oauthComplete,
      productionInstanceId: status.productionInstanceId || prior.productionInstanceId || null,
      productionInstanceExists: Boolean(status.productionInstanceId || prior.productionInstanceId),
      productionDeployNextAction: status.nextAction
    });
  }
  return status;
}

function printClerkDeployStatus(profile, project) {
  const status = getClerkDeployStatus(profile, project);
  const safeProject = projectSlug(project);
  console.log(`Clerk production deploy status for "${safeProject}"`);
  console.log('No Clerk resources were created. No secret values were printed.');
  console.log(`complete: ${status.complete ? 'yes' : 'no'}`);
  console.log(`state: ${status.state || 'unknown'}`);
  console.log(`production instance: ${status.productionInstanceId || 'missing'}`);
  console.log(`domain: ${status.domain || 'missing'}`);
  console.log(`domain status: ${status.domainStatus || 'missing'}`);
  if (status.pendingDnsRecordCount !== null) {
    console.log(`pending DNS records: ${status.pendingDnsRecordCount}`);
  }
  if (status.nextAction) console.log(`next: ${status.nextAction}`);
}

function deployClerkProduction(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-prod-deploy']) {
    throw new Error('Refusing to start Clerk production deploy without --confirm-prod-deploy.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const productionDomain = entry.providers?.clerk?.productionDomain;
  if (!productionDomain && !args['allow-domain-prompt']) {
    console.log(`Clerk production deploy for "${safeProject}" needs a real production domain first.`);
    console.log('Why this stopped: Clerk deploy will pause for a domain, DNS records, and OAuth settings.');
    console.log('The setup agent cannot safely invent that domain.');
    console.log('');
    console.log('Store the domain as non-secret metadata, then run the deploy again:');
    console.log(`npm run setup:production -- --profile ${profile} --project ${safeProject} --domain <your-production-domain>`);
    console.log(`npm run setup:production -- --profile ${profile} --project ${safeProject} --deploy-prod --confirm-prod-deploy`);
    console.log('');
    console.log('If you intentionally want the Clerk CLI to ask for the domain live, add --allow-domain-prompt.');
    console.log('status: blocked until clerk.productionDomain is stored or --allow-domain-prompt is provided.');
    process.exitCode = 1;
    return;
  }

  console.log(`Starting Clerk production deploy for "${safeProject}".`);
  console.log('This is an interactive Clerk CLI flow. It may ask for a production domain, DNS records, and OAuth settings.');
  if (productionDomain) {
    console.log(`Use this production domain when Clerk asks: ${productionDomain}`);
  }
  console.log('Do not enter secrets into chat. Enter provider values only in the Clerk CLI prompts.');
  const result = runClerkCli(['deploy'], {
    stdio: 'inherit',
    timeout: 10 * 60 * 1000
  });
  if (result.status !== 0) {
    throw new Error('Clerk production deploy did not complete. Re-run deploy status to see the next safe action.');
  }
  printClerkDeployStatus(profile, safeProject);
}

function printClerkPlan(profile, project) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  const metadata = entry.providers?.clerk || {};
  const publishableKey = metadata.publishableKey || '';
  const productionDomain = metadata.productionDomain || '';
  const secretKey = getSecret(profile, 'clerk', 'secretKey') || '';
  const hasPublishableKey = Boolean(publishableKey);
  const hasSecretKey = Boolean(secretKey);
  const hasLivePublishableKey = publishableKey.startsWith('pk_live_');
  const hasLiveSecretKey = secretKey.startsWith('sk_live_');
  const hasWebhookSigningSecret = Boolean(getSecret(profile, 'clerk', 'webhookSigningSecret'));
  const hasPlatformAccessToken = Boolean(getSecret(profile, 'clerk', 'platformAccessToken'));
  const clerkCli = getClerkCliStatus();

  let appStatus = {
    found: false,
    applicationId: metadata.applicationId || null,
    developmentInstanceId: null,
    productionInstanceId: null,
    productionInstanceExists: false
  };
  if (clerkCli.authenticated) {
    const apps = getClerkApps();
    const app = apps.find((candidate) => (
      candidate.application_id === metadata.applicationId || candidate.name === safeProject
    ));
    if (app) {
      const development = app.instances?.find((instance) => instance.environment_type === 'development');
      const production = app.instances?.find((instance) => instance.environment_type === 'production');
      appStatus = {
        found: true,
        applicationId: app.application_id,
        developmentInstanceId: development?.instance_id || null,
        productionInstanceId: production?.instance_id || null,
        productionInstanceExists: Boolean(production)
      };
    }
  }
  const deployStatus = clerkCli.authenticated ? getClerkDeployStatus(profile, safeProject, { record: false }) : null;
  const productionInstanceId = appStatus.productionInstanceId || deployStatus?.productionInstanceId || null;
  const productionInstanceExists = Boolean(productionInstanceId);
  const productionConfigured = productionInstanceExists && hasLivePublishableKey && hasLiveSecretKey;

  updateProjectState(safeProject, profile, 'clerk', {
    plan: 'completed',
    cliAvailable: clerkCli.available,
    cliAuthenticated: clerkCli.authenticated,
    applicationId: appStatus.applicationId,
    applicationFound: appStatus.found,
    developmentInstanceId: appStatus.developmentInstanceId,
    productionInstanceId,
    productionInstanceExists,
    productionConfigured,
    productionDeployStatusChecked: Boolean(deployStatus?.checked),
    productionDeployComplete: Boolean(deployStatus?.complete),
    productionDeployState: deployStatus?.state || null,
    productionDeployDomain: deployStatus?.domain || null,
    productionDomainStored: Boolean(productionDomain),
    productionDomain: productionDomain || null,
    productionDeployDomainStatus: deployStatus?.domainStatus || null,
    productionDeployPendingDnsRecordCount: deployStatus?.pendingDnsRecordCount ?? null,
    productionDeployOauthComplete: Boolean(deployStatus?.oauthComplete),
    productionDeployNextAction: deployStatus?.nextAction || null,
    publishableKeyStored: hasPublishableKey,
    secretKeyStored: hasSecretKey,
    livePublishableKeyStored: hasLivePublishableKey,
    liveSecretKeyStored: hasLiveSecretKey,
    webhookSigningSecretStored: hasWebhookSigningSecret,
    platformAccessTokenStored: hasPlatformAccessToken,
    created: appStatus.found,
    verified: appStatus.found && hasPublishableKey && hasSecretKey
  });

  console.log(`Clerk dry-run plan for "${safeProject}"`);
  console.log('No Clerk API was called. No Clerk application was created.');
  console.log(`Clerk CLI: ${clerkCli.available ? 'available' : 'missing'} (${clerkCli.detail})`);
  console.log(`application: ${appStatus.found ? appStatus.applicationId : 'not found'}`);
  console.log(`development instance: ${appStatus.developmentInstanceId || 'missing'}`);
  console.log(`production instance: ${productionInstanceId || 'missing'}`);
  console.log(`production domain metadata: ${productionDomain || 'missing'}`);
  console.log(`production deploy status: ${deployStatus?.state || 'not checked'}`);
  console.log(`publishable key: ${hasPublishableKey ? 'stored as metadata' : 'missing'}`);
  console.log(`secret key: ${hasSecretKey ? 'stored in keychain' : 'missing'}`);
  console.log(`live production keys: ${productionConfigured ? 'stored' : 'missing'}`);
  console.log(`webhook signing secret: ${hasWebhookSigningSecret ? 'stored in keychain' : 'optional / missing'}`);
  console.log(`platform access token: ${hasPlatformAccessToken ? 'stored in keychain' : 'private beta only / missing'}`);
  console.log('CLI path: login, list/create an app, link the app, then pull env vars.');
  console.log('normal runtime path: store publishableKey and secretKey for the selected Clerk app.');
  console.log('direct API path: only use platformAccessToken if Clerk enables Platform API private beta for the workspace.');
  if (!clerkCli.authenticated) {
    console.log('next: npm exec clerk -- auth login');
  }
  console.log(`next: npm exec clerk -- apps list -- --json`);
  console.log(`next: npm exec clerk -- apps create "${safeProject}" -- --json`);
  console.log('next: npm exec clerk -- link -- --app <app-id>');
  console.log('next: npm exec clerk -- env pull -- --app <app-id> --file apps/dashboard/.env.local');
  console.log(`next: npm run vault:clerk -- --profile ${profile} --project ${safeProject} --pull-dev-env --confirm-dev-env`);
  if (!productionInstanceExists) {
    console.log(`next: npm run setup:production -- --profile ${profile} --project ${safeProject}`);
    if (!productionDomain) {
      console.log(`next: npm run setup:production -- --profile ${profile} --project ${safeProject} --domain <your-production-domain>`);
    }
    console.log(`next: npm run setup:production -- --profile ${profile} --project ${safeProject} --deploy-prod --confirm-prod-deploy`);
  } else if (!productionConfigured) {
    console.log(`next: npm run setup:production -- --profile ${profile} --project ${safeProject} --pull-prod-env --confirm-prod-env`);
  }
  if (!hasPublishableKey) {
    console.log('next: npm run vault:metadata -- --profile personal --provider clerk --key publishableKey --value <pk_test_or_pk_live>');
  }
  if (!hasSecretKey) {
    console.log('next: npm run vault:set -- --profile personal --provider clerk --key secretKey');
  }
}

function parseEnvFile(file) {
  return parseEnvContent(readFileSync(file, 'utf8'));
}

function normalizeClerkPublishableKey(env) {
  return env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || env.CLERK_PUBLISHABLE_KEY || '';
}

function resolveClerkApplication(profile, project) {
  const safeProject = projectSlug(project);
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);

  const metadataAppId = entry.providers?.clerk?.applicationId;
  if (metadataAppId) return { appId: metadataAppId, source: 'metadata' };

  const cliStatus = getClerkCliStatus();
  if (!cliStatus.authenticated) {
    throw new Error('Clerk CLI is not authenticated. Run `npm exec clerk -- auth login` first.');
  }

  const apps = getClerkApps();
  const app = apps.find((candidate) => candidate.name === safeProject);
  if (!app?.application_id) {
    throw new Error(`No Clerk applicationId metadata and no Clerk app named "${safeProject}" was found.`);
  }

  return { appId: app.application_id, source: 'clerk-app-name' };
}

async function pullClerkDevelopmentEnv(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-dev-env']) {
    throw new Error('Refusing to pull Clerk development env without --confirm-dev-env.');
  }

  const { appId, source } = resolveClerkApplication(profile, safeProject);
  const tempFile = resolve(`.idkwidk/provisioning/${safeProject}.clerk.development.env.tmp`);
  mkdirSync(dirname(tempFile), { recursive: true, mode: 0o700 });
  if (existsSync(tempFile)) rmSync(tempFile);

  const result = spawnSync('npm', [
    'exec',
    'clerk',
    '--',
    'env',
    'pull',
    '--app',
    appId,
    '--instance',
    'dev',
    '--file',
    tempFile
  ], {
    encoding: 'utf8',
    timeout: 30000
  });

  if (result.status !== 0) {
    if (existsSync(tempFile)) rmSync(tempFile);
    updateProjectState(safeProject, profile, 'clerk', {
      ...(readState().projects?.[safeProject]?.providers?.clerk || {}),
      developmentEnvStatus: 'pull-failed'
    });
    throw new Error('Clerk development env pull failed. Secret values were not printed.');
  }

  const env = parseEnvFile(tempFile);
  rmSync(tempFile);
  const publishableKey = normalizeClerkPublishableKey(env);
  const secretKey = env.CLERK_SECRET_KEY || '';
  if (!publishableKey.startsWith('pk_test_') || !secretKey.startsWith('sk_test_')) {
    throw new Error('Clerk development env did not contain test publishable and secret keys.');
  }

  setMetadata(profile, 'clerk', 'applicationId', appId);
  setMetadata(profile, 'clerk', 'publishableKey', publishableKey);
  setSecret(profile, 'clerk', 'secretKey', secretKey);
  updateProjectState(safeProject, profile, 'clerk', {
    ...(readState().projects?.[safeProject]?.providers?.clerk || {}),
    applicationId: appId,
    applicationIdSource: source,
    developmentEnvStatus: 'pulled',
    publishableKeyStored: true,
    secretKeyStored: true,
    verified: true,
    created: true
  });

  console.log('Pulled Clerk development env and stored app keys in the local vault.');
  console.log(`application id source: ${source}`);
  console.log('Secret values were not printed.');
  console.log('Next: run setup:start --check-access to verify Clerk readback.');
}

async function pullClerkProductionEnv(profile, project, args) {
  const safeProject = projectSlug(project);
  if (!args['confirm-prod-env']) {
    throw new Error('Refusing to pull Clerk production env without --confirm-prod-env.');
  }

  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const appId = entry.providers?.clerk?.applicationId;
  if (!appId) {
    throw new Error('Missing clerk.applicationId metadata.');
  }

  const tempFile = resolve(`.idkwidk/provisioning/${safeProject}.clerk.production.env.tmp`);
  mkdirSync(dirname(tempFile), { recursive: true, mode: 0o700 });
  if (existsSync(tempFile)) rmSync(tempFile);

  const result = spawnSync('npm', [
    'exec',
    'clerk',
    '--',
    'env',
    'pull',
    '--app',
    appId,
    '--instance',
    'prod',
    '--file',
    tempFile
  ], {
    encoding: 'utf8',
    timeout: 30000
  });

  if (result.status !== 0) {
    if (existsSync(tempFile)) rmSync(tempFile);
    updateProjectState(safeProject, profile, 'clerk', {
      ...(readState().projects?.[safeProject]?.providers?.clerk || {}),
      productionEnvStatus: 'pull-failed',
      productionConfigured: false
    });
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    const safeReason = /instance_not_found/.test(output)
      ? 'No production instance found for the Clerk application.'
      : 'Clerk production env pull failed.';
    throw new Error(`${safeReason} Secret values were not printed.`);
  }

  const env = parseEnvFile(tempFile);
  rmSync(tempFile);
  const publishableKey = normalizeClerkPublishableKey(env);
  const secretKey = env.CLERK_SECRET_KEY || '';
  if (!publishableKey.startsWith('pk_live_') || !secretKey.startsWith('sk_live_')) {
    throw new Error('Clerk production env did not contain live publishable and secret keys.');
  }

  setMetadata(profile, 'clerk', 'publishableKey', publishableKey);
  setSecret(profile, 'clerk', 'secretKey', secretKey);
  updateProjectState(safeProject, profile, 'clerk', {
    ...(readState().projects?.[safeProject]?.providers?.clerk || {}),
    productionEnvStatus: 'pulled',
    productionConfigured: true,
    publishableKeyStored: true,
    secretKeyStored: true,
    verified: true
  });

  console.log('Pulled Clerk production env and stored live keys in the local vault.');
  console.log('Secret values were not printed.');
  console.log('Next: run vault:vercel --set-env --confirm-env to promote live Clerk keys to production targets.');
}

async function verifyVercelReadback(profile, project, state, githubState = null) {
  if (!state?.verified || !state?.teamSlug || state?.projectCheck !== 'exists') {
    console.log('vercel readback: skipped because project is not verified in local state');
    return;
  }

  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) {
    process.exitCode = 1;
    console.log('vercel readback: missing token');
    return;
  }

  const query = state.scopeType === 'personal' ? {} : { slug: state.teamSlug };
  const result = await vercelRequest(token, `/v9/projects/${encodeURIComponent(project)}`, query);
  if (!result.ok) {
    process.exitCode = 1;
    updateProjectState(project, profile, 'vercel', {
      ...state,
      readbackStatus: `failed-${result.status}`
    });
    console.log(`vercel readback: failed HTTP ${result.status}`);
    return;
  }

  const expected = vercelProjectSettings();
  const actual = {
    framework: result.body.framework,
    rootDirectory: result.body.rootDirectory,
    buildCommand: result.body.buildCommand,
    installCommand: result.body.installCommand,
    outputDirectory: result.body.outputDirectory ?? null,
    sourceFilesOutsideRootDirectory: result.body.sourceFilesOutsideRootDirectory
  };
  const mismatches = Object.entries(expected).filter(([key, value]) => actual[key] !== value);
  const gitLink = result.body.link?.type === 'github'
    ? {
        type: result.body.link.type,
        org: result.body.link.org,
        repo: result.body.link.repo,
        productionBranch: result.body.link.productionBranch
      }
    : null;
  if (githubState?.owner && githubState?.repo) {
    if (!gitLink || gitLink.org !== githubState.owner || gitLink.repo !== githubState.repo) {
      mismatches.push(['gitLink', `${githubState.owner}/${githubState.repo}`]);
    }
  }

  const expectedEnvKeys = Array.isArray(state.envKeys) ? state.envKeys : [];
  let envKeys = [];
  let envTargets = {};
  if (expectedEnvKeys.length > 0) {
    const envResult = await vercelRequest(token, `/v9/projects/${encodeURIComponent(project)}/env`, query);
    if (envResult.ok) {
      const envItems = envResult.body.envs || envResult.body.env || [];
      envKeys = envItems.map((item) => item.key).filter(Boolean);
      for (const item of envItems) {
        envTargets[item.key] ||= [];
        for (const target of item.target || []) {
          if (!envTargets[item.key].includes(target)) envTargets[item.key].push(target);
        }
      }
    }
  }
  const missingEnvKeys = expectedEnvKeys.filter((key) => !envKeys.includes(key));
  const expectedTargets = Object.fromEntries(vercelTemplateEnvVars(profile, project).map((item) => [item.key, item.target]));
  const targetMismatches = Object.entries(expectedTargets)
    .filter(([key, targets]) => {
      if (!envTargets[key]) return false;
      return [...targets].sort().join(',') !== [...envTargets[key]].sort().join(',');
    });
  if (missingEnvKeys.length > 0) {
    mismatches.push(['envKeys', missingEnvKeys.join(',')]);
  }
  if (targetMismatches.length > 0) {
    mismatches.push(['envTargets', targetMismatches.map(([key]) => key).join(',')]);
  }

  updateProjectState(project, profile, 'vercel', {
    ...state,
    readbackStatus: mismatches.length > 0 ? 'settings-mismatch' : 'ok',
    settingsReadback: actual,
    envReadbackKeys: envKeys,
    envReadbackTargets: envTargets,
    envReadbackStatus: missingEnvKeys.length > 0
      ? 'missing-keys'
      : targetMismatches.length > 0
        ? 'target-mismatch'
        : 'ok',
    gitLink,
    verified: mismatches.length === 0
  });

  if (mismatches.length > 0) {
    process.exitCode = 1;
    console.log('vercel readback: settings mismatch');
    for (const [key, expectedValue] of mismatches) {
      const actualValue = key === 'gitLink'
        ? (gitLink ? `${gitLink.org}/${gitLink.repo}` : 'not connected')
        : actual[key];
      console.log(`  ${key}: expected=${expectedValue === null ? 'auto' : expectedValue} actual=${actualValue === null ? 'auto' : actualValue}`);
    }
    return;
  }

  console.log(`vercel readback: verified ${state.url || `${state.teamSlug}/${project}`}`);
  console.log(`  rootDirectory: ${actual.rootDirectory}`);
  if (expectedEnvKeys.length > 0) console.log(`  env keys: ${envKeys.length} present`);
  if (gitLink) console.log(`  git: ${gitLink.org}/${gitLink.repo} production=${gitLink.productionBranch}`);
}

async function verifyVercelDashboardReadback(profile, project, state) {
  if (!state?.verified || !state?.teamSlug || !state?.projectName || state?.projectCheck !== 'exists') {
    console.log('vercel dashboard readback: skipped because dashboard project is not verified in local state');
    return;
  }

  const token = getSecret(profile, 'vercel', 'organizationToken');
  if (!token) {
    process.exitCode = 1;
    console.log('vercel dashboard readback: missing token');
    return;
  }

  const query = state.scopeType === 'personal' ? {} : { slug: state.teamSlug };
  const result = await vercelRequest(token, `/v9/projects/${encodeURIComponent(state.projectName)}`, query);
  if (!result.ok) {
    process.exitCode = 1;
    updateProjectState(project, profile, 'vercelDashboard', {
      ...state,
      readbackStatus: `failed-${result.status}`
    });
    console.log(`vercel dashboard readback: failed HTTP ${result.status}`);
    return;
  }

  const expected = vercelDashboardProjectSettings();
  const actual = {
    framework: result.body.framework,
    rootDirectory: result.body.rootDirectory,
    buildCommand: result.body.buildCommand,
    installCommand: result.body.installCommand,
    outputDirectory: result.body.outputDirectory ?? null,
    sourceFilesOutsideRootDirectory: result.body.sourceFilesOutsideRootDirectory
  };
  const mismatches = Object.entries(expected).filter(([key, value]) => actual[key] !== value);

  const expectedEnvKeys = Array.isArray(state.envKeys) ? state.envKeys : [];
  let envKeys = [];
  let envTargets = {};
  if (expectedEnvKeys.length > 0) {
    const envResult = await vercelRequest(token, `/v9/projects/${encodeURIComponent(state.projectName)}/env`, query);
    if (envResult.ok) {
      const envItems = envResult.body.envs || envResult.body.env || [];
      envKeys = envItems.map((item) => item.key).filter(Boolean);
      for (const item of envItems) {
        envTargets[item.key] ||= [];
        for (const target of item.target || []) {
          if (!envTargets[item.key].includes(target)) envTargets[item.key].push(target);
        }
      }
    }
  }
  const missingEnvKeys = expectedEnvKeys.filter((key) => !envKeys.includes(key));
  const expectedTargets = Object.fromEntries(vercelDashboardEnvVars(profile, project).map((item) => [item.key, item.target]));
  const targetMismatches = Object.entries(expectedTargets)
    .filter(([key, targets]) => {
      if (!envTargets[key]) return false;
      return [...targets].sort().join(',') !== [...envTargets[key]].sort().join(',');
    });
  if (missingEnvKeys.length > 0) {
    mismatches.push(['envKeys', missingEnvKeys.join(',')]);
  }
  if (targetMismatches.length > 0) {
    mismatches.push(['envTargets', targetMismatches.map(([key]) => key).join(',')]);
  }

  updateProjectState(project, profile, 'vercelDashboard', {
    ...state,
    readbackStatus: mismatches.length > 0 ? 'settings-mismatch' : 'ok',
    settingsReadback: actual,
    envReadbackKeys: envKeys,
    envReadbackTargets: envTargets,
    envReadbackStatus: missingEnvKeys.length > 0
      ? 'missing-keys'
      : targetMismatches.length > 0
        ? 'target-mismatch'
        : 'ok',
    verified: mismatches.length === 0
  });

  if (mismatches.length > 0) {
    process.exitCode = 1;
    console.log('vercel dashboard readback: settings mismatch');
    for (const [key, expectedValue] of mismatches) {
      const actualValue = actual[key];
      console.log(`  ${key}: expected=${expectedValue === null ? 'auto' : expectedValue} actual=${actualValue === null ? 'auto' : actualValue}`);
    }
    return;
  }

  console.log(`vercel dashboard readback: verified ${state.url || `${state.teamSlug}/${state.projectName}`}`);
  console.log(`  rootDirectory: ${actual.rootDirectory}`);
  if (expectedEnvKeys.length > 0) console.log(`  env keys: ${envKeys.length} present`);
}

async function verifyProvisioning(profile, project) {
  const safeProject = projectSlug(project);
  const data = readState();
  const projectState = data.projects[safeProject];
  if (!projectState) {
    throw new Error(`No provisioning state found for ${safeProject}.`);
  }

  console.log(`Provisioning verification for "${safeProject}"`);
  console.log(`profile: ${profile}`);
  for (const [provider, state] of Object.entries(projectState.providers || {})) {
    console.log(`${provider}: created=${state.created ? 'yes' : 'no'} verified=${state.verified ? 'yes' : 'no'} readCheck=${state.readCheck || 'none'}`);
  }

  const github = projectState.providers?.github;
  if (github?.created && github.owner && github.repo) {
    const view = githubRepoView(profile, github.owner, github.repo);
    if (view.status === 'exists') {
      updateProjectState(safeProject, profile, 'github', {
        ...github,
        verified: true,
        url: view.repo.url,
        isPrivate: Boolean(view.repo.isPrivate)
      });
      console.log(`github readback: verified ${view.repo.url}`);
    } else {
      process.exitCode = 1;
      console.log(`github readback: ${view.status}`);
    }
  }

  await verifyVercelReadback(profile, safeProject, projectState.providers?.vercel, projectState.providers?.github);
  await verifyVercelDashboardReadback(profile, safeProject, projectState.providers?.vercelDashboard);
}

function readinessItem(name, status, evidence, nextAction = null) {
  return { name, status, evidence, nextAction };
}

function buildReadinessItems(profile, project) {
  const safeProject = projectSlug(project);
  const state = readState().projects?.[safeProject] || { providers: {} };
  const profileEntry = readProfiles().profiles?.[profile] || {};
  const clerkMetadata = profileEntry.providers?.clerk || {};

  const providers = state.providers || {};
  const github = providers.github || {};
  const vercel = providers.vercel || {};
  const vercelDashboard = providers.vercelDashboard || {};
  const convex = providers.convex || {};
  const clerk = providers.clerk || {};
  const codex = providers.codex || {};

  const items = [
    readinessItem(
      'GitHub repository',
      github.verified ? 'ready' : 'pending',
      github.verified ? `${github.owner}/${github.repo || safeProject}` : 'repository not verified',
      github.verified ? null : `npm run vault:github -- --profile ${profile} --project ${safeProject} --dry-run --check-existing`
    ),
    readinessItem(
      'Vercel marketing project',
      vercel.verified && vercel.readbackStatus === 'ok' ? 'ready' : 'pending',
      vercel.verified ? `${vercel.teamSlug}/${safeProject}` : 'project/settings not verified',
      vercel.verified ? null : `npm run vault:vercel -- --profile ${profile} --project ${safeProject} --dry-run --check-access`
    ),
    readinessItem(
      'Vercel env keys',
      vercel.envReadbackStatus === 'ok' ? 'ready' : 'pending',
      Array.isArray(vercel.envReadbackKeys) ? `${vercel.envReadbackKeys.length} keys present` : 'env keys not verified',
      vercel.envReadbackStatus === 'ok' ? null : `npm run vault:vercel -- --profile ${profile} --project ${safeProject} --set-env --confirm-env`
    ),
    readinessItem(
      'Vercel dashboard service',
      vercelDashboard.verified && vercelDashboard.settingsStatus === 'configured' && vercelDashboard.envStatus === 'configured' ? 'ready' : 'pending',
      vercelDashboard.verified
        ? `${vercelDashboard.teamSlug}/${vercelDashboard.projectName || vercelDashboardProjectName(safeProject)}`
        : 'dashboard Vercel project not verified',
      vercelDashboard.verified && vercelDashboard.settingsStatus === 'configured' && vercelDashboard.envStatus === 'configured'
        ? null
        : !vercelDashboard.verified
        ? `npm run vault:vercel-dashboard -- --profile ${profile} --project ${safeProject} --dry-run --check-access`
        : vercelDashboard.settingsStatus !== 'configured'
          ? `npm run vault:vercel-dashboard -- --profile ${profile} --project ${safeProject} --configure-settings --confirm-settings`
          : `npm run vault:vercel-dashboard -- --profile ${profile} --project ${safeProject} --plan-env`
    ),
    readinessItem(
      'Convex backend',
      convex.verified && convex.deployKeyStored ? 'ready' : 'pending',
      convex.verified ? `${convex.projectSlug || safeProject} ${convex.deployment || ''}`.trim() : 'Convex project not verified',
      convex.verified && convex.deployKeyStored ? null : `npm run vault:convex -- --profile ${profile} --project ${safeProject} --dry-run --check-access`
    ),
    readinessItem(
      'Convex analytics write path',
      convex.analyticsWriteVerified ? 'ready' : 'pending',
      convex.analyticsWriteVerified
        ? `${convex.analyticsSiteId || 'site'} verified at ${convex.analyticsWriteVerifiedAt || 'unknown time'}`
        : 'live write/read proof missing',
      convex.analyticsWriteVerified ? null : `npm run analytics:convex:verify -- --profile ${profile} --project ${safeProject}`
    ),
    readinessItem(
      'Clerk development auth',
      clerk.verified && clerk.developmentInstanceId ? 'ready' : 'pending',
      clerk.developmentInstanceId || 'development instance missing',
      clerk.verified && clerk.developmentInstanceId ? null : `npm run vault:clerk -- --profile ${profile} --project ${safeProject} --dry-run`
    ),
    readinessItem(
      'Clerk production auth',
      clerk.productionConfigured ? 'ready' : 'blocked',
      clerk.productionConfigured
        ? clerk.productionInstanceId
        : clerk.productionInstanceExists
          ? 'production instance exists but live Clerk keys are not stored'
          : 'production instance missing in Clerk',
      clerk.productionConfigured
        ? null
        : clerk.productionInstanceExists
          ? `npm run setup:production -- --profile ${profile} --project ${safeProject} --pull-prod-env --confirm-prod-env`
          : clerkMetadata.productionDomain
            ? `npm run setup:production -- --profile ${profile} --project ${safeProject} --deploy-prod --confirm-prod-deploy`
            : `npm run setup:production -- --profile ${profile} --project ${safeProject} --domain <your-production-domain>`
    ),
    readinessItem(
      'Dashboard production protection',
      clerk.productionConfigured && vercelDashboard.envStatus === 'configured' ? 'ready' : 'blocked',
      clerk.productionConfigured ? 'dashboard protection can use Clerk production auth' : 'dashboard cannot be treated as production-protected until Clerk production auth exists',
      clerk.productionConfigured ? null : `npm run setup:production -- --profile ${profile} --project ${safeProject}`
    ),
    readinessItem(
      'Codex setup',
      codex.plan === 'completed' ? 'guided' : 'pending',
      'no automated Codex workspace API was used',
      'Use official Codex/OpenAI setup flows; do not invent token semantics.'
    )
  ];

  return { safeProject, state, items };
}

function buildStatusPayload(profile, project) {
  const { safeProject, state, items } = buildReadinessItems(profile, project);
  const profiles = readProfiles();
  const profileEntry = profiles.profiles?.[profile] || null;
  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const blockers = items.filter((item) => item.status === 'blocked');
  const pending = items.filter((item) => item.status === 'pending');
  const productionReady = blockers.length === 0 && pending.length === 0;
  const templatePortable = true;
  const firstUnresolved = blockers[0] || pending[0] || null;
  const providers = state.providers || {};

  const profileReady = Boolean(profileEntry);
  const nextAction = profileReady
    ? firstUnresolved?.nextAction || `npm run setup:release:verify -- --profile ${profile} --project ${safeProject} --fresh-clone`
    : `npm run setup:credentials -- --profile ${profile} --project ${safeProject}`;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    project: safeProject,
    profile,
    profileReady,
    localOnly: true,
    secretValuesPrinted: false,
    providerApisCalled: false,
    templatePortable,
    productionReady,
    counts: {
      ready: counts.ready || 0,
      blocked: counts.blocked || 0,
      pending: counts.pending || 0,
      guided: counts.guided || 0
    },
    nextAction,
    blockers: blockers.map((item) => ({
      name: item.name,
      evidence: item.evidence,
      nextAction: item.nextAction
    })),
    pending: pending.map((item) => ({
      name: item.name,
      evidence: item.evidence,
      nextAction: item.nextAction
    })),
    guided: items
      .filter((item) => item.status === 'guided')
      .map((item) => ({
        name: item.name,
        evidence: item.evidence,
        nextAction: item.nextAction
      })),
    providers: {
      github: {
        verified: Boolean(providers.github?.verified),
        owner: providers.github?.owner || null,
        repo: providers.github?.repo || safeProject,
        url: providers.github?.url || null,
        remote: providers.github?.remote || null
      },
      vercel: {
        verified: Boolean(providers.vercel?.verified),
        teamSlug: providers.vercel?.teamSlug || null,
        projectName: providers.vercel?.projectName || safeProject,
        envStatus: providers.vercel?.envStatus || null,
        readbackStatus: providers.vercel?.readbackStatus || null
      },
      vercelDashboard: {
        verified: Boolean(providers.vercelDashboard?.verified),
        teamSlug: providers.vercelDashboard?.teamSlug || null,
        projectName: providers.vercelDashboard?.projectName || vercelDashboardProjectName(safeProject),
        settingsStatus: providers.vercelDashboard?.settingsStatus || null,
        envStatus: providers.vercelDashboard?.envStatus || null
      },
      convex: {
        verified: Boolean(providers.convex?.verified),
        projectSlug: providers.convex?.projectSlug || safeProject,
        deployment: providers.convex?.deployment || null,
        analyticsWriteVerified: Boolean(providers.convex?.analyticsWriteVerified),
        analyticsWriteVerifiedAt: providers.convex?.analyticsWriteVerifiedAt || null
      },
      clerk: {
        developmentReady: Boolean(providers.clerk?.verified && providers.clerk?.developmentInstanceId),
        developmentInstanceId: providers.clerk?.developmentInstanceId || null,
        productionInstanceExists: Boolean(providers.clerk?.productionInstanceExists),
        productionConfigured: Boolean(providers.clerk?.productionConfigured),
        productionDomainStored: Boolean(providers.clerk?.productionDomainStored || profileEntry?.providers?.clerk?.productionDomain)
      },
      codex: {
        guided: true,
        workspaceName: providers.codex?.metadataValue || providers.codex?.workspaceName || profileEntry?.providers?.codex?.workspaceName || null
      }
    },
    commands: {
      next: `npm run setup:next -- --profile ${profile} --project ${safeProject}`,
      nextJson: `npm --silent run setup:next -- --profile ${profile} --project ${safeProject} --json`,
      factory: `npm run setup:factory -- --profile ${profile} --project ${safeProject}`,
      plan: `npm run setup:plan -- --profile ${profile} --project ${safeProject} --dry-run`,
      planJson: `npm --silent run setup:plan -- --profile ${profile} --project ${safeProject} --dry-run --json`,
      audit: `npm run setup:audit -- --profile ${profile} --project ${safeProject}`,
      doctor: `npm run setup:doctor -- --profile ${profile}`,
      doctorJson: `npm --silent run setup:doctor -- --profile ${profile} --json`,
      tokens: `npm run setup:tokens -- --profile ${profile}`,
      tokensJson: `npm --silent run setup:tokens -- --profile ${profile} --json`,
      snapshot: `npm run setup:snapshot -- --profile ${profile} --project ${safeProject}`,
      snapshotJson: `npm --silent run setup:snapshot -- --profile ${profile} --project ${safeProject} --json`,
      readiness: `npm run vault:readiness -- --profile ${profile} --project ${safeProject}`,
      production: `npm run setup:production -- --profile ${profile} --project ${safeProject}`,
      productionJson: `npm --silent run setup:production -- --profile ${profile} --project ${safeProject} --json`,
      releaseVerify: `npm run setup:release:verify -- --profile ${profile} --project ${safeProject}`,
      freshCloneVerify: `npm run setup:release:verify -- --profile ${profile} --project ${safeProject} --fresh-clone`
    }
  };
}

function printStatus(profile, project, args = {}) {
  const status = buildStatusPayload(profile, project);

  if (args.json) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`Provisioning status for "${status.project}"`);
  console.log(`profile: ${status.profile}`);
  console.log('Plain English version: this is a safe snapshot for people and agents. It does not call provider APIs and it does not print secrets.');
  console.log(`summary: ready=${status.counts.ready} blocked=${status.counts.blocked} pending=${status.counts.pending} guided=${status.counts.guided}`);
  console.log(`profile-ready: ${status.profileReady ? 'yes' : 'no'}`);
  console.log(`template-portable: ${status.templatePortable ? 'yes' : 'no'}`);
  console.log(`production-ready: ${status.productionReady ? 'yes' : 'no'}`);
  console.log(`next safest action: ${status.nextAction}`);

  if (status.blockers.length) {
    console.log('\nBlocked');
    for (const blocker of status.blockers) {
      console.log(`- ${blocker.name}: ${blocker.evidence}`);
      if (blocker.nextAction) console.log(`  next: ${blocker.nextAction}`);
    }
  }

  if (status.pending.length) {
    console.log('\nPending');
    for (const item of status.pending) {
      console.log(`- ${item.name}: ${item.evidence}`);
      if (item.nextAction) console.log(`  next: ${item.nextAction}`);
    }
  }

  console.log('\nAgent JSON:');
  console.log(`  npm --silent run setup:status -- --profile ${status.profile} --project ${status.project} --json`);
  console.log('Agent setup plan:');
  console.log(`  ${status.commands.planJson}`);
}

function buildSnapshotPayload(profile, project) {
  const safeProject = projectSlug(project);
  const status = buildStatusPayload(profile, safeProject);
  const doctorReport = buildDoctorPayload(profile);
  const profileExists = Boolean(readProfiles().profiles?.[profile]);
  const plan = profileExists ? buildProvisionPlan(profile, safeProject) : null;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    project: safeProject,
    profile,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    purpose: 'Single safe setup snapshot for agents and plugins.',
    summary: {
      profileReady: status.profileReady,
      templatePortable: status.templatePortable,
      productionReady: status.productionReady,
      doctorOk: doctorReport.ok,
      ready: status.counts.ready,
      blocked: status.counts.blocked,
      pending: status.counts.pending,
      guided: status.counts.guided,
      nextAction: status.nextAction
    },
    commands: {
      start: `npm run setup:start -- --profile ${profile} --project ${safeProject}`,
      nextJson: `npm --silent run setup:next -- --profile ${profile} --project ${safeProject} --json`,
      factory: `npm run setup:factory -- --profile ${profile} --project ${safeProject}`,
      bootstrap: `npm run setup:bootstrap -- --profile ${profile} --project ${safeProject}`,
      onboard: `npm run setup:onboard -- --profile ${profile} --project ${safeProject}`,
      credentials: `npm run setup:credentials -- --profile ${profile} --project ${safeProject}`,
      credentialsVerify: `npm run setup:credentials -- --profile ${profile} --project ${safeProject} --verify`,
      tokens: `npm run setup:tokens -- --profile ${profile}`,
      tokensJson: `npm --silent run setup:tokens -- --profile ${profile} --json`,
      checkAccess: `npm run setup:bootstrap -- --profile ${profile} --project ${safeProject} --check-access`,
      liveWalkthrough: `npm run setup:walkthrough -- --profile ${profile} --project ${safeProject} --live`,
      statusJson: `npm --silent run setup:status -- --profile ${profile} --project ${safeProject} --json`,
      planJson: `npm --silent run setup:plan -- --profile ${profile} --project ${safeProject} --dry-run --json`,
      doctorJson: `npm --silent run setup:doctor -- --profile ${profile} --json`,
      snapshotJson: `npm --silent run setup:snapshot -- --profile ${profile} --project ${safeProject} --json`,
      production: `npm run setup:production -- --profile ${profile} --project ${safeProject}`,
      productionJson: `npm --silent run setup:production -- --profile ${profile} --project ${safeProject} --json`,
      releaseVerify: `npm run setup:release:verify -- --profile ${profile} --project ${safeProject}`
    },
    doctor: doctorReport,
    status,
    plan,
    planUnavailableReason: profileExists ? null : `Profile "${profile}" does not exist yet. Run setup:credentials or setup:onboard first.`,
    guardrails: [
      'Do not ask the user to paste secrets into chat.',
      'Store reusable provider secrets with vault:set in the OS keychain.',
      'Run read-only checks before live provider changes.',
      'Run one live provider mutation at a time, then verify it.',
      'Do not call the project production-ready while Clerk production auth is blocked.'
    ]
  };
}

function printSnapshot(profile, project, args = {}) {
  const snapshot = buildSnapshotPayload(profile, project);

  if (args.json) {
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  console.log(`Provisioning snapshot for "${snapshot.project}"`);
  console.log(`profile: ${snapshot.profile}`);
  console.log('Plain English version: this combines local safety, provider status, and the setup plan for agents. It does not call provider APIs or print secrets.');
  console.log(`doctor-ok: ${snapshot.summary.doctorOk ? 'yes' : 'no'}`);
  console.log(`profile-ready: ${snapshot.summary.profileReady ? 'yes' : 'no'}`);
  console.log(`template-portable: ${snapshot.summary.templatePortable ? 'yes' : 'no'}`);
  console.log(`production-ready: ${snapshot.summary.productionReady ? 'yes' : 'no'}`);
  console.log(`summary: ready=${snapshot.summary.ready} blocked=${snapshot.summary.blocked} pending=${snapshot.summary.pending} guided=${snapshot.summary.guided}`);
  console.log(`next safest action: ${snapshot.summary.nextAction}`);
  if (snapshot.planUnavailableReason) console.log(`plan: ${snapshot.planUnavailableReason}`);
  console.log('\nAgent JSON:');
  console.log(`  ${snapshot.commands.snapshotJson}`);
}

function printReadiness(profile, project) {
  const { safeProject, items } = buildReadinessItems(profile, project);

  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  console.log(`Readiness report for "${safeProject}"`);
  console.log(`profile: ${profile}`);
  console.log(`summary: ready=${counts.ready || 0} blocked=${counts.blocked || 0} pending=${counts.pending || 0} guided=${counts.guided || 0}`);
  console.log('No provider APIs were called. No secret values were printed.');

  for (const item of items) {
    console.log(`\n${item.status.toUpperCase()} ${item.name}`);
    console.log(`  evidence: ${item.evidence}`);
    if (item.nextAction) console.log(`  next: ${item.nextAction}`);
  }

  const productionReady = items.every((item) => item.status === 'ready' || item.status === 'guided');
  console.log(`\nproduction-ready: ${productionReady ? 'yes' : 'no'}`);
  if (!productionReady) {
    console.log('next safest action: resolve blocked items before disabling auth bypass or claiming full production readiness.');
  }
}

function auditItem(area, status, evidence, nextAction = null) {
  return { area, status, evidence, nextAction };
}

function printAudit(profile, project) {
  const { safeProject, state, items: readinessItems } = buildReadinessItems(profile, project);
  const providers = state.providers || {};
  const github = providers.github || {};
  const vercel = providers.vercel || {};
  const vercelDashboard = providers.vercelDashboard || {};
  const convex = providers.convex || {};
  const clerk = providers.clerk || {};
  const codex = providers.codex || {};
  const profileEntry = readProfiles().profiles?.[profile] || {};
  const clerkMetadata = profileEntry.providers?.clerk || {};

  const readinessBlocked = readinessItems.filter((item) => item.status === 'blocked');
  const readinessPending = readinessItems.filter((item) => item.status === 'pending');
  const productionReady = readinessBlocked.length === 0 && readinessPending.length === 0;

  const auditItems = [
    auditItem(
      'Plugin entrypoint',
      'ready',
      'setup:bootstrap, setup:onboard, setup:project, setup:walkthrough, setup:credentials --verify, setup:locations, setup:doctor, setup:next, setup:status, setup:plan, and setup:release:verify are part of the command contract.',
      'npm run setup:plugin:verify'
    ),
    auditItem(
      'Fresh computer proof',
      'ready',
      'fresh-clone verification proves no env files, local state, or provider credentials are shipped with the repo.',
      'npm run setup:release:verify -- --profile <profile> --project <project> --fresh-clone'
    ),
    auditItem(
      'Secret boundary',
      'ready',
      `profile metadata is outside the repo at ${profilePath}; OS keychain service is ${keychainService}; local state is gitignored at ${statePath}.`,
      'npm run setup:locations'
    ),
    auditItem(
      'GitHub repository',
      github.verified ? 'ready' : 'pending',
      github.verified ? `${github.owner}/${github.repo || safeProject}` : 'repository readback is not verified.',
      github.verified ? null : `npm run vault:github -- --profile ${profile} --project ${safeProject} --dry-run --check-existing`
    ),
    auditItem(
      'Vercel services',
      vercel.verified && vercelDashboard.verified ? 'ready' : 'pending',
      vercel.verified && vercelDashboard.verified
        ? `marketing=${vercel.teamSlug}/${safeProject}; dashboard=${vercelDashboard.teamSlug}/${vercelDashboard.projectName || vercelDashboardProjectName(safeProject)}`
        : 'marketing or dashboard Vercel project readback is missing.',
      vercel.verified && vercelDashboard.verified ? null : `npm run vault:vercel -- --profile ${profile} --project ${safeProject} --dry-run --check-access`
    ),
    auditItem(
      'Convex backend and analytics',
      convex.verified && convex.analyticsWriteVerified ? 'ready' : 'pending',
      convex.verified && convex.analyticsWriteVerified
        ? `${convex.deployment || 'deployment'}; analytics verified at ${convex.analyticsWriteVerifiedAt || 'unknown time'}`
        : 'Convex project or live analytics write/read proof is missing.',
      convex.verified && convex.analyticsWriteVerified ? null : `npm run analytics:convex:verify -- --profile ${profile} --project ${safeProject}`
    ),
    auditItem(
      'Clerk development auth',
      clerk.verified && clerk.developmentInstanceId ? 'ready' : 'pending',
      clerk.developmentInstanceId || 'Clerk development instance not verified.',
      clerk.verified && clerk.developmentInstanceId ? null : `npm run vault:clerk -- --profile ${profile} --project ${safeProject} --dry-run`
    ),
    auditItem(
      'Clerk production auth',
      clerk.productionConfigured ? 'ready' : 'blocked',
      clerk.productionConfigured
        ? `production=${clerk.productionInstanceId}`
        : clerk.productionDomainStored || clerkMetadata.productionDomain
          ? 'production domain is stored but live production keys are not verified.'
          : 'production domain, production instance, and live production keys are missing.',
      clerk.productionConfigured
        ? null
        : !clerk.productionDomainStored && !clerkMetadata.productionDomain
          ? `npm run setup:production -- --profile ${profile} --project ${safeProject} --domain <your-production-domain>`
          : `npm run setup:production -- --profile ${profile} --project ${safeProject} --deploy-prod --confirm-prod-deploy`
    ),
    auditItem(
      'Dashboard production protection',
      clerk.productionConfigured ? 'ready' : 'blocked',
      clerk.productionConfigured
        ? 'dashboard can be protected by Clerk production auth.'
        : 'dashboard must not be treated as production-protected while Clerk production auth is missing.',
      clerk.productionConfigured ? null : `npm run setup:production -- --profile ${profile} --project ${safeProject}`
    ),
    auditItem(
      'Codex/OpenAI setup',
      'guided',
      codex.metadataValue || codex.workspaceName
        ? `workspace metadata=${codex.metadataValue || codex.workspaceName}; no official project API automation claimed.`
        : 'no official Codex workspace/project automation is claimed.',
      'Use official Codex/OpenAI setup flows until a supported API is verified.'
    ),
    auditItem(
      'Production claim',
      productionReady ? 'ready' : 'blocked',
      productionReady
        ? 'all readiness items are ready or guided.'
        : `${readinessBlocked.length} blocked and ${readinessPending.length} pending readiness item(s) remain.`,
      productionReady ? null : 'Run setup:next and resolve the first blocked item before claiming production readiness.'
    )
  ];

  const counts = auditItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  console.log(`Provisioning completion audit for "${safeProject}"`);
  console.log(`profile: ${profile}`);
  console.log(`summary: ready=${counts.ready || 0} blocked=${counts.blocked || 0} pending=${counts.pending || 0} guided=${counts.guided || 0}`);
  console.log('No provider APIs were called. No secret values were printed.');

  for (const item of auditItems) {
    console.log(`\n${item.status.toUpperCase()} ${item.area}`);
    console.log(`  evidence: ${item.evidence}`);
    if (item.nextAction) console.log(`  next: ${item.nextAction}`);
  }

  console.log(`\nproduction-ready: ${productionReady ? 'yes' : 'no'}`);
  console.log(`template-portable: yes`);
  console.log('idkWidk verification note: this audit proves local/template portability and provider-readback state, not Clerk production readiness while Clerk remains blocked.');
}

function printRollbackPlan(profile, project, args = {}) {
  if (!args['dry-run']) {
    throw new Error('Rollback is non-destructive for now. Re-run with --dry-run to print cleanup guidance.');
  }

  const safeProject = projectSlug(project);
  const state = readState().projects?.[safeProject];
  if (!state) {
    throw new Error(`No provisioning state found for ${safeProject}.`);
  }

  const providerFilter = args.provider && args.provider !== true ? String(args.provider) : null;
  const include = (provider) => !providerFilter || providerFilter === provider;
  const providers = state.providers || {};

  console.log(`Rollback plan for "${safeProject}"`);
  console.log('No provider resources, local files, remotes, or secrets were deleted.');
  console.log('Run cleanup manually and verify each provider after deletion.');

  if (include('local')) {
    console.log('\nlocal files and vault');
    console.log(`  env files: apps/dashboard/.env.local and apps/marketing/.env.local are gitignored`);
    console.log(`  local state: .idkwidk/provisioning/state.json is gitignored`);
    console.log(`  remove one provider secret: npm run vault:delete -- --profile ${profile} --provider <provider> --key <key>`);
    console.log(`  remove the whole profile: npm run vault:delete -- --profile ${profile}`);
  }

  if (include('github') && providers.github) {
    const github = providers.github;
    console.log('\ngithub');
    console.log(`  repo: ${github.owner || '<owner>'}/${github.repo || safeProject}`);
    if (github.url) console.log(`  url: ${github.url}`);
    if (github.remote) console.log(`  local remote cleanup: git remote remove ${github.remote}`);
    console.log('  repo deletion is destructive; prefer archive/private settings unless you are sure.');
    console.log(`  manual delete command, if intended: gh repo delete ${github.owner || '<owner>'}/${github.repo || safeProject} --confirm`);
  }

  if (include('vercel') && providers.vercel) {
    const vercel = providers.vercel;
    console.log('\nvercel');
    console.log(`  project: ${vercel.teamSlug || '<scope>'}/${safeProject}`);
    if (vercel.url) console.log(`  url: ${vercel.url}`);
    console.log('  first remove custom domains and production aliases if any.');
    console.log(`  then delete from Vercel Dashboard or run: vercel project rm ${safeProject}`);
    if (Array.isArray(vercel.envKeys) && vercel.envKeys.length) {
      console.log(`  env keys currently managed: ${vercel.envKeys.join(', ')}`);
    }
  }

  if (include('convex') && providers.convex) {
    const convex = providers.convex;
    console.log('\nconvex');
    console.log(`  project: ${convex.projectSlug || safeProject}`);
    if (convex.projectId) console.log(`  project id: ${convex.projectId}`);
    if (convex.deploymentName) console.log(`  deployment: ${convex.deploymentName}`);
    if (convex.deploymentUrl) console.log(`  url: ${convex.deploymentUrl}`);
    console.log('  revoke deploy keys from the Convex Dashboard if they are no longer needed.');
    console.log('  delete the Convex project/deployment from the Convex Dashboard after export/backups.');
  }

  if (include('clerk') && providers.clerk) {
    const clerk = providers.clerk;
    console.log('\nclerk');
    console.log(`  application id: ${clerk.applicationId || '<app-id>'}`);
    console.log(`  development instance: ${clerk.developmentInstanceId || 'missing'}`);
    console.log(`  production instance: ${clerk.productionInstanceId || 'missing'}`);
    console.log('  delete or archive the app in Clerk Dashboard only after exporting users/settings if needed.');
    console.log(`  local unlink, if this repo should stop using the app: npm exec clerk -- unlink`);
  }

  if (include('codex') && providers.codex) {
    console.log('\ncodex');
    console.log('  no automated Codex workspace resource was created by this template.');
    console.log('  remove any local metadata with vault:delete only if the profile should be reset.');
  }

  console.log('\nverification after cleanup');
  console.log(`  npm run vault:state -- --project ${safeProject}`);
  console.log(`  npm run vault:doctor -- --profile ${profile}`);
  console.log('  git status --short');
}

function renderEnvFiles(profile, project = null) {
  const data = readProfiles();
  const entry = data.profiles[profile];
  if (!entry) throw new Error(`Profile not found: ${profile}`);
  const projectState = project ? readState().projects?.[projectSlug(project)] : null;
  const convexState = projectState?.providers?.convex || {};
  const convexUrl = convexState.deploymentUrl || '';
  const convexDeployment = convexState.deploymentName ? `dev:${convexState.deploymentName}` : '';

  const clerkSecretKey = getSecret(profile, 'clerk', 'secretKey');
  const clerkWebhookSecret = getSecret(profile, 'clerk', 'webhookSigningSecret');
  const convexDeployKey = getSecret(profile, 'convex', 'deployKey');
  const convexTeamAccessToken = getSecret(profile, 'convex', 'teamAccessToken');
  const githubToken = getSecret(profile, 'github', 'organizationToken');
  const vercelToken = getSecret(profile, 'vercel', 'organizationToken');
  const clerkPublishableKey = entry.providers?.clerk?.publishableKey || '';

  const dashboardLines = [
    '# Generated by scripts/template-vault.mjs. This file is gitignored.',
    'NEXT_PUBLIC_AUTH_BYPASS=true',
    'NEXT_PUBLIC_ANALYTICS_PROVIDER=convex',
    'NEXT_PUBLIC_ANALYTICS_SITE_ID=default',
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerkPublishableKey}`,
    `CLERK_SECRET_KEY=${clerkSecretKey || ''}`,
    `CLERK_WEBHOOK_SIGNING_SECRET=${clerkWebhookSecret || ''}`,
    `NEXT_PUBLIC_CONVEX_URL=${convexUrl}`,
    `CONVEX_DEPLOYMENT=${convexDeployment}`,
    clerkSecretKey ? '# Clerk app secret key is stored in your OS keychain.' : '# Clerk app secret key missing from vault.',
    entry.providers?.clerk?.publishableKey ? '# Clerk publishable key is stored as non-secret metadata.' : '# Clerk publishable key missing from vault metadata.',
    convexTeamAccessToken ? '# Convex team access token is stored in your OS keychain.' : '# Convex team access token missing from vault. This is only needed for automated project creation.',
    convexDeployKey ? '# Convex deploy key is stored in your OS keychain.' : '# Convex deploy key missing from vault. This is only needed for non-interactive deploys.',
    githubToken ? '# GitHub organization token is stored in your OS keychain.' : '# GitHub organization token missing from vault.',
    vercelToken ? '# Vercel organization token is stored in your OS keychain.' : '# Vercel organization token missing from vault.'
  ];

  const marketingLines = [
    '# Generated by scripts/template-vault.mjs. This file is gitignored.',
    'NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3015'
  ];

  return [
    { path: resolve('apps/dashboard/.env.local'), content: `${dashboardLines.join('\n')}\n` },
    { path: resolve('apps/marketing/.env.local'), content: `${marketingLines.join('\n')}\n` }
  ];
}

function writeEnvFile(file, content, options) {
  mkdirSync(dirname(file), { recursive: true });

  if (existsSync(file) && !options.force) {
    throw new Error(`${file} already exists. Re-run with --force to replace it, or use --dry-run to preview.`);
  }

  if (existsSync(file)) {
    const backupPath = `${file}.backup-${Date.now()}`;
    copyFileSync(file, backupPath);
    console.log(`Backed up existing env file to ${backupPath}`);
  }

  writeFileSync(file, content, { mode: 0o600 });
  console.log(`Wrote ${file}`);
}

function redactEnvPreview(content) {
  const secretKeys = new Set([
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SIGNING_SECRET',
    'CONVEX_DEPLOY_KEY',
    'GITHUB_TOKEN',
    'VERCEL_TOKEN'
  ]);

  return content
    .split(/\r?\n/)
    .map((line) => {
      if (!line.includes('=') || line.trim().startsWith('#')) return line;
      const [key] = line.split('=');
      return secretKeys.has(key.trim()) && line.trim() !== `${key.trim()}=`
        ? `${key.trim()}=[redacted]`
        : line;
    })
    .join('\n');
}

function writeProjectEnv(profile, args) {
  const files = renderEnvFiles(profile, args.project && args.project !== true ? String(args.project) : null);

  if (args['dry-run']) {
    for (const file of files) {
      console.log(`--- ${file.path}`);
      console.log(redactEnvPreview(file.content).trimEnd());
    }
    console.log('Dry run only. No env files were changed.');
    return;
  }

  for (const file of files) {
    writeEnvFile(file.path, file.content, { force: Boolean(args.force) });
  }

  console.log('Project-specific provider keys are intentionally left blank until provisioning creates them.');
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (!command || command === 'help') {
    usage();
    return;
  }

  if (command === 'init') {
    const profile = requireArg(args, 'profile');
    ensureProfile(profile);
    console.log(`Initialized profile "${profile}" at ${profilePath}`);
    return;
  }

  if (command === 'set') {
    const profile = requireArg(args, 'profile');
    const provider = requireArg(args, 'provider');
    const key = requireArg(args, 'key');
    if (!secretKeys[provider]?.includes(key)) {
      throw new Error(`${provider}.${key} is not a supported secret key.`);
    }
    ensureProfile(profile);
    const value = args.value && args.value !== true
      ? String(args.value)
      : await promptSecret(`${provider}.${key}`);
    if (!value) throw new Error('Secret value cannot be empty.');
    setSecret(profile, provider, key, value);
    console.log(`Stored ${provider}.${key} for profile "${profile}" in the OS keychain.`);
    return;
  }

  if (command === 'rotate') {
    const profile = requireArg(args, 'profile');
    const provider = requireArg(args, 'provider');
    const key = requireArg(args, 'key');
    if (!secretKeys[provider]?.includes(key)) {
      throw new Error(`${provider}.${key} is not a supported secret key.`);
    }
    ensureProfile(profile);
    const value = args.value && args.value !== true
      ? String(args.value)
      : await promptSecret(`new ${provider}.${key}`);
    if (!value) throw new Error('Secret value cannot be empty.');
    setSecret(profile, provider, key, value);
    console.log(`Rotated ${provider}.${key} for profile "${profile}" in the OS keychain.`);
    return;
  }

  if (command === 'delete') {
    const profile = requireArg(args, 'profile');
    if (args.provider || args.key) {
      deleteProviderSecret(profile, requireArg(args, 'provider'), requireArg(args, 'key'));
      return;
    }
    deleteProfile(profile);
    return;
  }

  if (command === 'metadata') {
    const profile = requireArg(args, 'profile');
    const provider = requireArg(args, 'provider');
    const key = requireArg(args, 'key');
    const value = requireArg(args, 'value');
    const normalized = setMetadata(profile, provider, key, value);
    console.log(`Saved ${provider}.${key} metadata for profile "${profile}".`);
    if (normalized !== String(value).trim()) {
      console.log('Input was normalized before saving.');
    }
    return;
  }

  if (command === 'list') {
    listProfiles();
    return;
  }

  if (command === 'locations') {
    printLocations();
    return;
  }

  if (command === 'check') {
    checkProfile(requireArg(args, 'profile'));
    return;
  }

  if (command === 'doctor') {
    doctor(args.profile && args.profile !== true ? String(args.profile) : null, args);
    return;
  }

  if (command === 'tokens') {
    printTokenGuide(args);
    return;
  }

  if (command === 'env') {
    writeProjectEnv(requireArg(args, 'profile'), args);
    return;
  }

  if (command === 'state') {
    printState(args.project && args.project !== true ? String(args.project) : null);
    return;
  }

  if (command === 'next') {
    printNextSteps(requireArg(args, 'profile'), requireArg(args, 'project'), args);
    return;
  }

  if (command === 'status') {
    printStatus(requireArg(args, 'profile'), requireArg(args, 'project'), args);
    return;
  }

  if (command === 'snapshot') {
    printSnapshot(requireArg(args, 'profile'), requireArg(args, 'project'), args);
    return;
  }

  if (command === 'readiness') {
    printReadiness(requireArg(args, 'profile'), requireArg(args, 'project'));
    return;
  }

  if (command === 'audit') {
    printAudit(requireArg(args, 'profile'), requireArg(args, 'project'));
    return;
  }

  if (command === 'rollback') {
    printRollbackPlan(requireArg(args, 'profile'), requireArg(args, 'project'), args);
    return;
  }

  if (command === 'provision') {
    if (!args['dry-run']) {
      throw new Error('Refusing hidden live provisioning. Use setup:walkthrough -- --live so each provider change is shown and confirmed.');
    }
    printProvisionPlan(requireArg(args, 'profile'), requireArg(args, 'project'), args);
    return;
  }

  if (command === 'github') {
    if (args.create) {
      createGithubRepo(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (args['connect-existing']) {
      connectGithubRepo(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (args['push-initial']) {
      pushInitialGithubRepo(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (!args['dry-run']) {
      throw new Error('GitHub changes need an explicit action. Use --create --confirm-create, --connect-existing --confirm-connect, or --push-initial --confirm-push.');
    }
    printGithubPlan(requireArg(args, 'profile'), requireArg(args, 'project'), args);
    return;
  }

  if (command === 'vercel-dashboard') {
    if (args.create) {
      await createVercelDashboardProject(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (args['plan-settings']) {
      planVercelDashboardSettings(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    if (args['configure-settings']) {
      await configureVercelDashboardSettings(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (args['plan-env']) {
      planVercelDashboardEnv(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    if (args['set-env']) {
      await setVercelDashboardEnv(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (!args['dry-run']) {
      throw new Error('Vercel dashboard changes need an explicit action. Use --create --confirm-create, --configure-settings --confirm-settings, or --set-env --confirm-env.');
    }
    if (args['check-access']) {
      await checkVercelDashboardAccess(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    const safeProject = projectSlug(requireArg(args, 'project'));
    console.log(`vercel-dashboard dry-run plan for "${vercelDashboardProjectName(safeProject)}"`);
    console.log('No provider API was called. No resources were created.');
    console.log(`planned action: create or verify a separate Vercel project rooted at ${vercelDashboardProjectSettings().rootDirectory}.`);
    console.log(`next action: npm run vault:vercel-dashboard -- --profile ${requireArg(args, 'profile')} --project ${safeProject} --dry-run --check-access`);
    return;
  }

  if (['vercel', 'convex', 'clerk', 'codex'].includes(command)) {
    if (command === 'convex' && args.create) {
      await createConvexProject(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'convex' && args['create-deploy-key']) {
      await createConvexDeployKey(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'clerk' && args['pull-prod-env']) {
      await pullClerkProductionEnv(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'clerk' && args['pull-dev-env']) {
      await pullClerkDevelopmentEnv(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'clerk' && args['deploy-status']) {
      printClerkDeployStatus(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    if (command === 'clerk' && args['deploy-prod']) {
      deployClerkProduction(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'vercel' && args.create) {
      await createVercelProject(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'vercel' && args['plan-settings']) {
      planVercelSettings(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    if (command === 'vercel' && args['configure-settings']) {
      await configureVercelSettings(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (command === 'vercel' && args['plan-env']) {
      planVercelEnv(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    if (command === 'vercel' && args['set-env']) {
      await setVercelEnv(requireArg(args, 'profile'), requireArg(args, 'project'), args);
      return;
    }
    if (!args['dry-run']) {
      throw new Error(`${command} changes need an explicit supported action. Run with --dry-run to inspect the plan, or use setup:walkthrough -- --live for the guided flow.`);
    }
    if (command === 'vercel' && args['check-access']) {
      await checkVercelAccess(requireArg(args, 'profile'), requireArg(args, 'project'));
      return;
    }
    await printProviderDryRun(requireArg(args, 'profile'), requireArg(args, 'project'), command, args);
    return;
  }

  if (command === 'verify') {
    await verifyProvisioning(requireArg(args, 'profile'), requireArg(args, 'project'));
    return;
  }

  usage();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
