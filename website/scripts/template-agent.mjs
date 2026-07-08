#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage:
  npm run setup:agent -- --profile <name> --project <slug>
  npm --silent run setup:agent -- --profile <name> --project <slug> --json

This is the agent setup control center. It reads the existing safe setup
snapshots, explains the next safest action, and does not create provider
resources, call provider APIs, or print secret values.`);
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

function runJson(label, script, args) {
  const result = spawnSync('npm', ['--silent', 'run', script, '--', ...args, '--json'], {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || 'unknown error';
    throw new Error(`${label} failed: ${detail}`);
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`${label} did not return valid JSON: ${error.message}`);
  }
}

function firstReadinessBlocker(completion) {
  return completion.readinessBlockers?.[0] || null;
}

function buildRecommendation(profile, project, snapshot, completion, production) {
  if (!snapshot.summary?.profileReady) {
    return {
      key: 'create-local-profile',
      label: 'Create the local setup profile and store reusable provider access.',
      command: `npm run setup:credentials -- --profile ${profile} --project ${project}`,
      agentCommand: `npm --silent run setup:tokens -- --profile ${profile} --json`,
      requiresUserInput: true,
      canAgentContinueWithoutUser: false,
      reason: 'This computer does not have the selected setup profile yet.'
    };
  }

  if (!snapshot.summary?.doctorOk) {
    return {
      key: 'fix-local-setup',
      label: 'Fix the local machine setup checks before provider work.',
      command: `npm run setup:doctor -- --profile ${profile}`,
      agentCommand: `npm --silent run setup:doctor -- --profile ${profile} --json`,
      requiresUserInput: true,
      canAgentContinueWithoutUser: false,
      reason: 'The local doctor check is not fully passing.'
    };
  }

  const blocker = firstReadinessBlocker(completion);
  if (blocker?.name === 'Clerk production auth' || production.requiresUserInput) {
    return {
      key: 'clerk-production-domain',
      label: 'Provide and store the real production domain for Clerk production auth.',
      command: production.nextAction || `npm run setup:production -- --profile ${profile} --project ${project} --domain <your-production-domain>`,
      agentCommand: `npm --silent run setup:production -- --profile ${profile} --project ${project} --json`,
      requiresUserInput: true,
      canAgentContinueWithoutUser: false,
      reason: blocker?.evidence || 'Clerk production needs a real domain and live production keys.'
    };
  }

  if (!snapshot.summary?.productionReady) {
    return {
      key: 'continue-readiness',
      label: 'Continue the next safe provisioning action.',
      command: snapshot.summary?.nextAction || `npm run setup:next -- --profile ${profile} --project ${project}`,
      agentCommand: `npm --silent run setup:next -- --profile ${profile} --project ${project} --json`,
      requiresUserInput: false,
      canAgentContinueWithoutUser: true,
      reason: 'The template is not production-ready yet, but no user-only production domain step was detected.'
    };
  }

  return {
    key: 'verify-production',
    label: 'Run final release verification.',
    command: `npm run setup:release:verify -- --profile ${profile} --project ${project} --build`,
    agentCommand: `npm run setup:release:verify -- --profile ${profile} --project ${project} --build`,
    requiresUserInput: false,
    canAgentContinueWithoutUser: true,
    reason: 'Setup reports production-ready; final build/readback proof is the next gate.'
  };
}

function buildPayload(profile, project) {
  const snapshot = runJson('Setup snapshot', 'setup:snapshot', ['--profile', profile, '--project', project]);
  const completion = runJson('Completion checklist', 'setup:completion', ['--profile', profile, '--project', project]);
  const production = runJson('Production checklist', 'setup:production', ['--profile', profile, '--project', project]);
  const recommendation = buildRecommendation(profile, project, snapshot, completion, production);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    profile,
    project,
    localOnly: true,
    providerApisCalled: false,
    secretValuesPrinted: false,
    purpose: 'Single safe control-center output for humans, agents, and the setup plugin.',
    summary: {
      profileReady: Boolean(snapshot.summary?.profileReady),
      doctorOk: Boolean(snapshot.summary?.doctorOk),
      templatePortable: Boolean(snapshot.summary?.templatePortable),
      productionReady: Boolean(snapshot.summary?.productionReady),
      ready: snapshot.summary?.ready ?? null,
      blocked: snapshot.summary?.blocked ?? null,
      pending: snapshot.summary?.pending ?? null,
      guided: snapshot.summary?.guided ?? null
    },
    recommendation,
    commands: {
      human: `npm run setup:agent -- --profile ${profile} --project ${project}`,
      json: `npm --silent run setup:agent -- --profile ${profile} --project ${project} --json`,
      factory: `npm run setup:factory -- --profile ${profile} --project ${project}`,
      onboard: `npm run setup:onboard -- --profile ${profile} --project ${project}`,
      credentials: `npm run setup:credentials -- --profile ${profile} --project ${project}`,
      liveWalkthrough: `npm run setup:walkthrough -- --profile ${profile} --project ${project} --live`,
      productionJson: `npm --silent run setup:production -- --profile ${profile} --project ${project} --json`,
      releaseVerify: `npm run setup:release:verify -- --profile ${profile} --project ${project}`
    },
    blockers: completion.readinessBlockers || [],
    productionChecklist: production.checklist || []
  };
}

function printHuman(payload) {
  console.log('idkWidk setup agent control center');
  console.log(`profile: ${payload.profile}`);
  console.log(`project: ${payload.project}`);
  console.log('');
  console.log('Plain English version: this is the one safe status screen for an agent or person.');
  console.log('It reads the setup state, chooses the next safest action, and does not print secrets.');
  console.log('');
  console.log(`template-portable: ${payload.summary.templatePortable ? 'yes' : 'no'}`);
  console.log(`production-ready: ${payload.summary.productionReady ? 'yes' : 'no'}`);
  console.log(`summary: ready=${payload.summary.ready} blocked=${payload.summary.blocked} pending=${payload.summary.pending} guided=${payload.summary.guided}`);
  console.log('');
  console.log('Next safest action');
  console.log(`  ${payload.recommendation.label}`);
  console.log(`  ${payload.recommendation.command}`);
  console.log(`  reason: ${payload.recommendation.reason}`);
  console.log(`  user input needed: ${payload.recommendation.requiresUserInput ? 'yes' : 'no'}`);
  console.log(`  agent can continue alone: ${payload.recommendation.canAgentContinueWithoutUser ? 'yes' : 'no'}`);
  console.log('');
  console.log('Agent JSON:');
  console.log(`  ${payload.commands.json}`);
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
