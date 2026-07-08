#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dashboardEnvPath = resolve('apps/dashboard/.env.local');
const statePath = resolve('.idkwidk/provisioning/state.json');

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

function projectSlug(value) {
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
    throw new Error('Project slug can only contain letters, numbers, dots, underscores, and hyphens.');
  }
  return value;
}

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        const rawValue = valueParts.join('=').trim();
        const value = rawValue
          .replace(/\s+#.*$/, '')
          .replace(/^["']|["']$/g, '')
          .trim();
        return [key.trim(), value];
      })
  );
}

function readDashboardEnv() {
  if (!existsSync(dashboardEnvPath)) {
    throw new Error(`Missing ${dashboardEnvPath}. Run the Convex setup/env flow first.`);
  }
  const env = parseEnv(readFileSync(dashboardEnvPath, 'utf8'));
  if (!env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in apps/dashboard/.env.local.');
  }
  return env;
}

function readState() {
  if (!existsSync(statePath)) return { projects: {} };
  return JSON.parse(readFileSync(statePath, 'utf8'));
}

function writeState(data) {
  mkdirSync(dirname(statePath), { recursive: true, mode: 0o700 });
  writeFileSync(statePath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}

function recordEvidence(project, profile, evidence) {
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
  data.projects[safeProject].providers.convex = {
    ...(data.projects[safeProject].providers.convex || {}),
    analyticsWriteVerified: true,
    analyticsWriteVerifiedAt: new Date().toISOString(),
    analyticsSiteId: evidence.siteId,
    analyticsSmokeSessionId: evidence.sessionId,
    analyticsSmokePath: evidence.path,
    analyticsSummary: {
      totalVisitors: evidence.summary.totalVisitors,
      pageViews: evidence.summary.pageViews,
      recentEventsChecked: evidence.recentEventsChecked
    },
    updatedAt: new Date().toISOString()
  };
  writeState(data);
}

async function importConvexClient() {
  const convexBrowserPath = resolve('apps/dashboard/node_modules/convex/dist/esm/browser/index-node.js');
  const convexServerPath = resolve('apps/dashboard/node_modules/convex/dist/esm/server/index.js');
  if (!existsSync(convexBrowserPath)) {
    throw new Error('Missing dashboard Convex dependency. Run npm --prefix apps/dashboard install first.');
  }
  const [{ ConvexHttpClient }, { makeFunctionReference }] = await Promise.all([
    import(pathToFileURL(convexBrowserPath).href),
    import(pathToFileURL(convexServerPath).href)
  ]);
  return {
    ConvexHttpClient,
    functions: {
      trackEvent: makeFunctionReference('analytics:trackEvent'),
      getAnalyticsSummary: makeFunctionReference('analytics:getAnalyticsSummary'),
      getRecentEvents: makeFunctionReference('analytics:getRecentEvents')
    }
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage:
  npm run analytics:convex:verify -- --profile <profile> --project <project>

Writes one synthetic smoke pageview to the configured Convex deployment, reads
analytics back, records non-secret evidence in local provisioning state, and
prints no secret values.`);
    return;
  }

  const profile = requireArg(args, 'profile');
  const project = requireArg(args, 'project');
  const safeProject = projectSlug(project);
  const env = readDashboardEnv();
  const { ConvexHttpClient, functions } = await importConvexClient();
  const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL, { logger: false });

  const now = Date.now();
  const siteId = args.siteId && args.siteId !== true ? String(args.siteId) : `${safeProject}-smoke`;
  const sessionId = `convex-smoke-${now}`;
  const path = `/__idkwidk-smoke/${now}`;

  console.log(`Convex analytics live verification for "${safeProject}"`);
  console.log(`profile: ${profile}`);
  console.log(`siteId: ${siteId}`);
  console.log('No secret values will be printed.');

  const mutationResult = await client.mutation(functions.trackEvent, {
    type: 'pageview',
    siteId,
    path,
    title: 'idkWidk smoke verification',
    referrer: 'idkwidk://setup-verifier',
    hostname: 'idkwidk.local',
    sessionId,
    properties: JSON.stringify({ source: 'setup-verifier', project: safeProject }),
    screenWidth: 1440,
    screenHeight: 900,
    language: 'en-US',
    browser: 'node-convex-http-client',
    os: process.platform,
    deviceType: 'desktop',
    country: 'US'
  });

  if (!mutationResult?.success) {
    throw new Error('Convex mutation did not return success.');
  }

  const summary = await client.query(functions.getAnalyticsSummary, {
    siteId,
    startTime: now - 60_000,
    endTime: Date.now() + 60_000
  });
  const recentEvents = await client.query(functions.getRecentEvents, { siteId, limit: 10 });
  const matchingEvent = recentEvents.find((event) => event.sessionId === sessionId && event.path === path);

  if (!matchingEvent) {
    throw new Error('Convex readback did not include the smoke event.');
  }
  if (summary.pageViews < 1 || summary.totalVisitors < 1) {
    throw new Error('Convex analytics summary did not count the smoke pageview.');
  }

  recordEvidence(safeProject, profile, {
    siteId,
    sessionId,
    path,
    summary,
    recentEventsChecked: recentEvents.length
  });

  console.log('write: verified');
  console.log('readback: verified');
  console.log(`summary: pageViews=${summary.pageViews} totalVisitors=${summary.totalVisitors}`);
  console.log('state: recorded non-secret Convex analytics evidence.');
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
