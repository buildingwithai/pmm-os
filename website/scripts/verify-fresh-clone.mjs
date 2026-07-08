#!/usr/bin/env node

import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(label, command, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env || process.env,
    encoding: 'utf8'
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${label} failed.`);
  }
  return result;
}

function requireCleanCommittedSource() {
  const status = run('Source status', 'git', ['status', '--short'], { cwd: process.cwd() });
  if (status.stdout.trim()) {
    throw new Error('Fresh clone verification requires a clean committed source tree.');
  }
}

function assertMissing(path, label) {
  if (existsSync(path)) {
    throw new Error(`${label} should not exist in a fresh clone: ${path}`);
  }
  console.log(`PASS ${label} is absent`);
}

function assertJson(path) {
  JSON.parse(readFileSync(path, 'utf8'));
  console.log(`PASS JSON parses: ${path}`);
}

function assertJsonStdout(label, command, args, options = {}) {
  const result = run(label, command, args, options);
  const parsed = JSON.parse(result.stdout);
  if (options.validate) options.validate(parsed);
  console.log(`PASS ${label} stdout parses as JSON`);
}

function main() {
  const source = resolve('.');
  const workspace = mkdtempSync(join(tmpdir(), 'idkwidk-fresh-clone-'));
  const clonePath = join(workspace, 'repo');
  const isolatedConfig = join(workspace, 'config');

  try {
    requireCleanCommittedSource();
    run('Clone committed source', 'git', ['clone', '--quiet', '--no-hardlinks', source, clonePath]);

    assertMissing(join(clonePath, 'apps/dashboard/.env.local'), 'dashboard .env.local');
    assertMissing(join(clonePath, 'apps/marketing/.env.local'), 'marketing .env.local');
    assertMissing(join(clonePath, '.idkwidk/provisioning/state.json'), 'local provisioning state');
    assertJson(join(clonePath, 'package.json'));
    assertJson(join(clonePath, '.agents/plugins/marketplace.json'));
    assertJson(join(clonePath, 'plugins/idkwidk-template-provisioner/.codex-plugin/plugin.json'));

    const env = {
      ...process.env,
      IDKWIDK_TEMPLATE_CONFIG_DIR: isolatedConfig,
      IDKWIDK_TEMPLATE_IGNORE_GLOBAL_CLI_AUTH: '1'
    };

    run('Guide help works without credentials', 'npm', ['run', 'setup:guide', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Project front door help works without credentials', 'npm', ['run', 'setup:project', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Bootstrap front door help works without credentials', 'npm', ['run', 'setup:bootstrap', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Factory front door help works without credentials', 'npm', ['run', 'setup:factory', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Onboarding shortcut help works without credentials', 'npm', ['run', 'setup:onboard', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Dependency install check works without credentials', 'npm', ['run', 'setup:install', '--', '--check'], {
      cwd: clonePath,
      env
    });
    run('Start help works without credentials', 'npm', ['run', 'setup:start', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Agent control center help works without credentials', 'npm', ['run', 'setup:agent', '--', '--help'], {
      cwd: clonePath,
      env
    });
    assertJsonStdout(
      'Agent control center JSON works without credentials',
      'npm',
      ['--silent', 'run', 'setup:agent', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (agent) => {
          if (agent.secretValuesPrinted !== false || agent.providerApisCalled !== false) {
            throw new Error('Agent control center JSON must not print secrets or call provider APIs.');
          }
          if (!agent.recommendation?.command?.includes('setup:credentials')) {
            throw new Error('Fresh clone agent control center must point to credential setup.');
          }
          if (agent.recommendation?.canAgentContinueWithoutUser !== false) {
            throw new Error('Fresh clone agent control center must not claim the agent can continue without user input.');
          }
        }
      }
    );
    run('Production helper help works without credentials', 'npm', ['run', 'setup:production', '--', '--help'], {
      cwd: clonePath,
      env
    });
    assertJsonStdout(
      'Production helper JSON works without credentials',
      'npm',
      ['--silent', 'run', 'setup:production', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (production) => {
          if (production.secretValuesPrinted !== false || production.providerApisCalled !== false) {
            throw new Error('Production helper JSON must not print secrets or call provider APIs.');
          }
          if (!Array.isArray(production.checklist) || production.checklist.length < 5) {
            throw new Error('Production helper JSON must include the production checklist.');
          }
          if (!production.commands?.storeDomain?.includes('setup:production')) {
            throw new Error('Production helper JSON must advertise the domain storage command.');
          }
          if (production.productionReady !== false) {
            throw new Error('Fresh clone production helper JSON must not claim production readiness.');
          }
        }
      }
    );
    run('Walkthrough help works without credentials', 'npm', ['run', 'setup:walkthrough', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Storage locations works without credentials', 'npm', ['run', 'setup:locations'], {
      cwd: clonePath,
      env
    });
    run('Credential wizard help works without credentials', 'npm', ['run', 'setup:credentials', '--', '--help'], {
      cwd: clonePath,
      env
    });
    run('Vault metadata normalization works without credentials', 'npm', ['run', 'setup:vault-metadata:verify'], {
      cwd: clonePath,
      env
    });
    assertJsonStdout(
      'Setup token checklist JSON works without credentials',
      'npm',
      ['--silent', 'run', 'setup:tokens', '--', '--profile', 'fresh-clone', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (guide) => {
          if (guide.secretValuesPrinted !== false || guide.providerApisCalled !== false) {
            throw new Error('Setup token checklist JSON must not print secrets or call provider APIs.');
          }
          const providerKeys = new Set((guide.providers || []).map((provider) => provider.key));
          for (const provider of ['github', 'vercel', 'convex', 'clerk', 'codex']) {
            if (!providerKeys.has(provider)) throw new Error(`Setup token checklist JSON missing ${provider}.`);
          }
          const github = guide.providers.find((provider) => provider.key === 'github');
          if (github.secretStatus?.organizationToken !== 'missing') {
            throw new Error('Fresh clone token checklist should report missing GitHub organization token.');
          }
        }
      }
    );
    run(
      'Completion audit works without credentials',
      'npm',
      ['run', 'setup:audit', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Implementation completion checklist works without credentials',
      'npm',
      ['run', 'setup:completion', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    assertJsonStdout(
      'Implementation completion checklist JSON works without credentials',
      'npm',
      ['--silent', 'run', 'setup:completion', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (completion) => {
          if (completion.secretValuesPrinted !== false || completion.providerApisCalled !== false) {
            throw new Error('Setup completion JSON must not print secrets or call provider APIs.');
          }
          if (!Array.isArray(completion.phases) || completion.phases.length < 8) {
            throw new Error('Setup completion JSON must include the implementation plan phases.');
          }
          if (!completion.recommendedCommands?.completionJson?.includes('setup:completion')) {
            throw new Error('Setup completion JSON must advertise its machine-readable command.');
          }
        }
      }
    );
    run(
      'Next action works without profile',
      'npm',
      ['run', 'setup:next', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env,
        validate: (plan) => {
          const convex = plan.steps?.find((step) => step.provider === 'convex');
          const codex = plan.steps?.find((step) => step.provider === 'codex');
          if (convex?.credentialState === 'stored') {
            throw new Error('Convex setup plan must describe how credentials are available, not just say stored.');
          }
          if (codex?.credentialState !== 'guided') {
            throw new Error('Codex setup plan must stay guided until official automation is verified.');
          }
        }
      }
    );
    assertJsonStdout(
      'Setup next JSON works without profile',
      'npm',
      ['--silent', 'run', 'setup:next', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (next) => {
          if (next.secretValuesPrinted !== false || next.providerApisCalled !== false) {
            throw new Error('Setup next JSON must not print secrets or call provider APIs.');
          }
          if (next.action?.key !== 'create-local-profile') {
            throw new Error('Fresh clone setup next JSON must start with local profile creation.');
          }
          if (!next.action?.command?.includes('setup:credentials')) {
            throw new Error('Fresh clone setup next JSON must point to setup:credentials.');
          }
          if (!next.commands?.snapshotJson?.includes('setup:snapshot')) {
            throw new Error('Setup next JSON must advertise the combined snapshot command.');
          }
          if (!next.commands?.productionJson?.includes('setup:production')) {
            throw new Error('Setup next JSON must advertise the production checklist command.');
          }
        }
      }
    );
    run(
      'Setup status works without profile',
      'npm',
      ['run', 'setup:status', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    assertJsonStdout(
      'Setup status JSON works without profile',
      'npm',
      ['--silent', 'run', 'setup:status', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (status) => {
          if (!status.commands?.plan || !status.commands?.planJson) {
            throw new Error('Setup status JSON must advertise setup:plan commands for agents.');
          }
          if (!status.commands?.factory?.includes('setup:factory')) {
            throw new Error('Setup status JSON must advertise the new-project factory command.');
          }
          if (!status.commands?.doctor?.includes('setup:doctor') || !status.commands?.doctorJson?.includes('--json')) {
            throw new Error('Setup status JSON must advertise human and JSON setup:doctor commands for local safety checks.');
          }
          if (!status.commands?.snapshot?.includes('setup:snapshot') || !status.commands?.snapshotJson?.includes('--json')) {
            throw new Error('Setup status JSON must advertise human and JSON setup:snapshot commands for agent setup snapshots.');
          }
          if (!status.commands?.production?.includes('setup:production') || !status.commands?.productionJson?.includes('--json')) {
            throw new Error('Setup status JSON must advertise human and JSON setup:production commands for final auth blockers.');
          }
        }
      }
    );
    assertJsonStdout(
      'Setup doctor JSON works without profile',
      'npm',
      ['--silent', 'run', 'setup:doctor', '--', '--profile', 'fresh-clone', '--json'],
      {
        cwd: clonePath,
        env,
        allowFailure: true,
        validate: (doctor) => {
          if (doctor.secretValuesPrinted !== false || doctor.providerApisCalled !== false) {
            throw new Error('Setup doctor JSON must not print secrets or call provider APIs.');
          }
          if (!Array.isArray(doctor.checks) || doctor.checks.length === 0) {
            throw new Error('Setup doctor JSON must include local safety checks.');
          }
        }
      }
    );
    assertJsonStdout(
      'Setup snapshot JSON works without profile',
      'npm',
      ['--silent', 'run', 'setup:snapshot', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke', '--json'],
      {
        cwd: clonePath,
        env,
        validate: (snapshot) => {
          if (snapshot.secretValuesPrinted !== false || snapshot.providerApisCalled !== false) {
            throw new Error('Setup snapshot JSON must not print secrets or call provider APIs.');
          }
          if (!snapshot.doctor || !snapshot.status) {
            throw new Error('Setup snapshot JSON must include doctor and status sections.');
          }
          if (snapshot.plan !== null || !snapshot.planUnavailableReason) {
            throw new Error('Setup snapshot JSON must avoid building a provider plan before the profile exists.');
          }
          if (!snapshot.commands?.snapshotJson?.includes('setup:snapshot')) {
            throw new Error('Setup snapshot JSON must advertise its machine-readable command.');
          }
          if (!snapshot.commands?.factory?.includes('setup:factory')) {
            throw new Error('Setup snapshot JSON must advertise the new-project factory command.');
          }
          if (!snapshot.commands?.productionJson?.includes('setup:production')) {
            throw new Error('Setup snapshot JSON must advertise the production checklist command.');
          }
        }
      }
    );
    const credentialWizardMetadata = run(
      'Credential wizard non-interactive metadata path is safe without secrets',
      'npm',
      [
        'run',
        'setup:credentials',
        '--',
        '--profile',
        'fresh-clone-metadata',
        '--project',
        'fresh-clone-smoke',
        '--non-interactive',
        '--github-owner',
        'example-org',
        '--vercel-team-slug',
        'example-vercel'
      ],
      {
        cwd: clonePath,
        env
      }
    );
    if (credentialWizardMetadata.stdout.includes('--profile personal')) {
      throw new Error('Credential wizard token guide must use the active setup profile, not personal.');
    }
    if (!credentialWizardMetadata.stdout.includes('--profile fresh-clone-metadata')) {
      throw new Error('Credential wizard token guide must print commands for the active setup profile.');
    }
    run(
      'Credential wizard verify path is safe without secrets',
      'npm',
      [
        'run',
        'setup:credentials',
        '--',
        '--profile',
        'fresh-clone-verify',
        '--project',
        'fresh-clone-smoke',
        '--non-interactive',
        '--github-owner',
        'example-org',
        '--vercel-team-slug',
        'example-vercel',
        '--verify'
      ],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Project front door is safe without credentials',
      'npm',
      ['run', 'setup:project', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Bootstrap front door is safe without credentials',
      'npm',
      ['run', 'setup:bootstrap', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Factory front door is safe without credentials',
      'npm',
      [
        'run',
        'setup:factory',
        '--',
        '--profile',
        'fresh-clone-factory',
        '--project',
        'fresh-clone-smoke',
        '--non-interactive',
        '--github-owner',
        'example-org',
        '--vercel-team-slug',
        'example-vercel'
      ],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Onboarding shortcut dry run is safe without secrets',
      'npm',
      [
        'run',
        'setup:onboard',
        '--',
        '--profile',
        'fresh-clone-onboard',
        '--project',
        'fresh-clone-smoke',
        '--non-interactive',
        '--github-owner',
        'example-org',
        '--vercel-team-slug',
        'example-vercel'
      ],
      {
        cwd: clonePath,
        env
      }
    );
    assertJsonStdout(
      'Setup plan JSON works with isolated metadata',
      'npm',
      [
        '--silent',
        'run',
        'setup:plan',
        '--',
        '--profile',
        'fresh-clone-onboard',
        '--project',
        'fresh-clone-smoke',
        '--dry-run',
        '--json'
      ],
      {
        cwd: clonePath,
        env,
        validate: (plan) => {
          const convex = plan.steps?.find((step) => step.provider === 'convex');
          const clerk = plan.steps?.find((step) => step.provider === 'clerk');
          if (!convex || !clerk) {
            throw new Error('Setup plan JSON must include Convex and Clerk provider steps.');
          }
          if (convex.ready !== false || convex.credentialState !== 'missing') {
            throw new Error('Fresh clone setup plan must not borrow global Convex CLI auth.');
          }
          if (clerk.ready !== false || clerk.credentialState !== 'missing') {
            throw new Error('Fresh clone setup plan must not borrow global Clerk CLI auth.');
          }
        }
      }
    );
    run(
      'Start command is safe without credentials',
      'npm',
      ['run', 'setup:start', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Walkthrough command is safe without credentials',
      'npm',
      ['run', 'setup:walkthrough', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Guide dry-run is safe without credentials',
      'npm',
      ['run', 'setup:guide', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run(
      'Production helper is safe without credentials',
      'npm',
      ['run', 'setup:production', '--', '--profile', 'fresh-clone', '--project', 'fresh-clone-smoke'],
      {
        cwd: clonePath,
        env
      }
    );
    run('Secret scan passes in fresh clone', 'npm', ['run', 'secret:scan'], {
      cwd: clonePath,
      env
    });
    run('Plugin package verifies in fresh clone', 'npm', ['run', 'setup:plugin:verify'], {
      cwd: clonePath,
      env
    });
    run('Plugin package check works in fresh clone', 'npm', ['run', 'setup:plugin:package', '--', '--check'], {
      cwd: clonePath,
      env
    });
    run('Plugin discovery verifies in fresh clone', 'npm', ['run', 'setup:plugin-discovery:verify'], {
      cwd: clonePath,
      env
    });

    console.log('\nFresh clone verification passed.');
    console.log('No local env files, local provisioning state, or real provider credentials were required.');
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
