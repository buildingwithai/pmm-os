#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const PHASES = [
  {
    id: 'phase-0-planning-artifacts',
    label: 'Planning artifacts',
    status: 'ready',
    evidence: 'Brief, technical spec, implementation plan, verification matrix, and runbooks exist.',
    nextAction: 'Keep docs current when setup behavior changes.'
  },
  {
    id: 'phase-1-local-state-evidence',
    label: 'Local state and evidence',
    status: 'ready',
    evidence: 'Sanitized local state, storage locations, status, snapshot, next-action, and audit commands exist.',
    nextAction: 'Run npm run setup:locations and npm run setup:status when validating a new computer.'
  },
  {
    id: 'phase-2-github-create',
    label: 'GitHub create boundary',
    status: 'ready',
    evidence: 'GitHub dry-run, read-check, guarded create, connect, and push boundaries exist.',
    nextAction: 'Use vault:github read checks before any live repository mutation.'
  },
  {
    id: 'phase-3-vercel-boundaries',
    label: 'Vercel marketing and dashboard boundaries',
    status: 'ready',
    evidence: 'Marketing and dashboard Vercel project boundaries, env planning, env write, and readback exist.',
    nextAction: 'Re-sync Vercel env after Clerk production live keys exist.'
  },
  {
    id: 'phase-4-convex-boundary',
    label: 'Convex backend and analytics boundary',
    status: 'ready',
    evidence: 'Convex team-token, CLI, deployment, deploy-key, and analytics smoke proof paths exist.',
    nextAction: 'Run npm run analytics:convex:verify after creating or changing a project deployment.'
  },
  {
    id: 'phase-5-clerk-development',
    label: 'Clerk development auth',
    status: 'ready',
    evidence: 'Clerk app readback and guarded development env pull are implemented.',
    nextAction: 'Use vault:clerk --pull-dev-env --confirm-dev-env after Clerk CLI login and app selection.'
  },
  {
    id: 'phase-6-clerk-production',
    label: 'Clerk production auth',
    status: 'blocked',
    evidence: 'Production auth needs a real domain, production Clerk instance, DNS, and live pk_live/sk_live keys.',
    nextAction: 'npm run setup:production -- --profile <profile> --project <project> --domain <your-production-domain>'
  },
  {
    id: 'phase-7-codex-openai',
    label: 'Codex/OpenAI setup',
    status: 'guided',
    evidence: 'The template stores only non-secret workspace metadata and does not claim unsupported workspace automation.',
    nextAction: 'Use official Codex/OpenAI setup flows until a supported project/workspace API is verified.'
  },
  {
    id: 'phase-8-production-verification',
    label: 'End-to-end production verification',
    status: 'blocked',
    evidence: 'Build, preview, provider readback, and fresh-clone checks exist, but production readiness depends on Clerk production auth.',
    nextAction: 'After Clerk production is complete, run setup:release:verify with --build and preview route checks.'
  }
];

function usage() {
  console.log(`Usage:
  npm run setup:completion -- --profile <name> --project <slug>
  npm --silent run setup:completion -- --profile <name> --project <slug> --json

This prints the plan/spec completion checklist for the provisioning template.
It does not call provider APIs and it does not print secrets.`);
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

function getStatus(profile, project) {
  const result = spawnSync(
    'npm',
    ['--silent', 'run', 'setup:status', '--', '--profile', profile, '--project', project, '--json'],
    {
      cwd: process.cwd(),
      env: process.env,
      encoding: 'utf8'
    }
  );
  if (result.status !== 0) {
    return {
      available: false,
      reason: 'setup:status did not complete for this profile/project.'
    };
  }
  try {
    return {
      available: true,
      payload: JSON.parse(result.stdout)
    };
  } catch {
    return {
      available: false,
      reason: 'setup:status did not return valid JSON.'
    };
  }
}

function phaseCounts(phases) {
  return phases.reduce(
    (counts, phase) => {
      counts[phase.status] = (counts[phase.status] || 0) + 1;
      return counts;
    },
    { ready: 0, blocked: 0, pending: 0, guided: 0 }
  );
}

function buildPayload(profile, project) {
  const status = getStatus(profile, project);
  const statusPayload = status.available ? status.payload : null;
  const nextAction =
    statusPayload?.nextAction ||
    'npm run setup:factory -- --profile <profile> --project <project>';

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    project,
    profile,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    purpose: 'Plan/spec completion checklist for humans, agents, and plugins.',
    counts: phaseCounts(PHASES),
    productionReady: Boolean(statusPayload?.productionReady),
    templatePortable: statusPayload?.templatePortable ?? true,
    nextAction,
    statusSnapshotAvailable: status.available,
    statusUnavailableReason: status.available ? null : status.reason,
    readinessBlockers: statusPayload?.blockers || [],
    phases: PHASES.map((phase) => ({
      ...phase,
      nextAction: phase.nextAction
        .replaceAll('<profile>', profile)
        .replaceAll('<project>', project)
    })),
    recommendedCommands: {
      start: `npm run setup:factory -- --profile ${profile} --project ${project}`,
      completionJson: `npm --silent run setup:completion -- --profile ${profile} --project ${project} --json`,
      nextJson: `npm --silent run setup:next -- --profile ${profile} --project ${project} --json`,
      statusJson: `npm --silent run setup:status -- --profile ${profile} --project ${project} --json`,
      snapshotJson: `npm --silent run setup:snapshot -- --profile ${profile} --project ${project} --json`,
      releaseVerify: `npm run setup:release:verify -- --profile ${profile} --project ${project}`,
      production: `npm run setup:production -- --profile ${profile} --project ${project}`
    }
  };
}

function printHuman(payload) {
  console.log(`Provisioning completion checklist for "${payload.project}"`);
  console.log(`profile: ${payload.profile}`);
  console.log('');
  console.log('Plain English version: this tells a person or agent what parts of the setup plan are done, blocked, or guided.');
  console.log('It does not create provider resources, call provider APIs, or print secrets.');
  console.log('');
  console.log(`summary: ready=${payload.counts.ready} blocked=${payload.counts.blocked} guided=${payload.counts.guided}`);
  console.log(`template-portable: ${payload.templatePortable ? 'yes' : 'no'}`);
  console.log(`production-ready: ${payload.productionReady ? 'yes' : 'no'}`);
  console.log('');
  for (const phase of payload.phases) {
    console.log(`${phase.status.toUpperCase()} ${phase.label}`);
    console.log(`  evidence: ${phase.evidence}`);
    console.log(`  next: ${phase.nextAction}`);
  }
  console.log('');
  console.log('Next safest action');
  console.log(`  ${payload.nextAction}`);
  console.log('');
  console.log('Agent JSON:');
  console.log(`  ${payload.recommendedCommands.completionJson}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  const profile = args.profile && args.profile !== true ? String(args.profile) : 'personal';
  const project = requireArg(args, 'project');
  const payload = buildPayload(profile, project);
  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  printHuman(payload);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
