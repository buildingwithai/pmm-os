#!/usr/bin/env node

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(label, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, ['scripts/template-vault.mjs', ...args], {
    cwd: process.cwd(),
    env: options.env || process.env,
    encoding: 'utf8'
  });
  const ok = result.status === 0;
  if (options.expectFailure && !ok) {
    console.log(`PASS ${label}`);
    return result;
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (!ok && !options.expectFailure) throw new Error(`${label} failed.`);
  if (ok && options.expectFailure) throw new Error(`${label} should have failed.`);
  return result;
}

function readProfile(configDir, profile) {
  const data = JSON.parse(readFileSync(join(configDir, 'profiles.json'), 'utf8'));
  return data.profiles?.[profile];
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
  console.log(`PASS ${label}`);
}

function main() {
  const configDir = mkdtempSync(join(tmpdir(), 'idkwidk-metadata-'));
  const env = {
    ...process.env,
    IDKWIDK_TEMPLATE_CONFIG_DIR: configDir
  };

  try {
    run('Initialize isolated profile', ['init', '--profile', 'metadata-smoke'], { env });
    run('Normalize Convex team ID with copied label', [
      'metadata',
      '--profile',
      'metadata-smoke',
      '--provider',
      'convex',
      '--key',
      'teamId',
      '--value',
      'Team ID: 391508>'
    ], { env });
    run('Normalize bracketed real Convex team ID', [
      'metadata',
      '--profile',
      'metadata-smoke',
      '--provider',
      'convex',
      '--key',
      'teamId',
      '--value',
      '<391508>'
    ], { env });
    run('Reject Convex placeholder team ID', [
      'metadata',
      '--profile',
      'metadata-smoke',
      '--provider',
      'convex',
      '--key',
      'teamId',
      '--value',
      '<team-id>'
    ], { env, expectFailure: true });
    run('Normalize Clerk production domain', [
      'metadata',
      '--profile',
      'metadata-smoke',
      '--provider',
      'clerk',
      '--key',
      'productionDomain',
      '--value',
      'https://Example.COM/'
    ], { env });

    const profile = readProfile(configDir, 'metadata-smoke');
    assertEqual(profile.providers.convex.teamId, '391508', 'Convex team ID saved as plain numeric metadata');
    assertEqual(profile.providers.clerk.productionDomain, 'example.com', 'Clerk production domain saved without protocol or slash');
    console.log('\nVault metadata normalization verification passed.');
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
