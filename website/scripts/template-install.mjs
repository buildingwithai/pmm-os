#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const targets = [
  { label: 'root tooling', cwd: '.', lockfileRequired: false, install: false },
  { label: 'dashboard app', cwd: 'apps/dashboard', lockfileRequired: true, install: true },
  { label: 'marketing app', cwd: 'apps/marketing', lockfileRequired: true, install: true }
];

function usage() {
  console.log(`Usage:
  npm run setup:install
  npm run setup:install -- --check
  npm run setup:install -- --confirm-install

This prepares local Node dependencies for the template.
By default it prints the install plan only. It only runs npm install when
--confirm-install is present.`);
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

function targetStatus(target) {
  const packageJson = join(target.cwd, 'package.json');
  const lockfile = join(target.cwd, 'package-lock.json');
  const nodeModules = join(target.cwd, 'node_modules');
  return {
    packageJson: existsSync(packageJson),
    lockfile: existsSync(lockfile),
    nodeModules: existsSync(nodeModules)
  };
}

function printPlan() {
  console.log('idkWidk template dependency setup');
  console.log('');
  console.log('Plain English version:');
  console.log('  This checks whether the template apps have package files and local dependencies.');
  console.log('  It does not touch provider tokens, env files, GitHub, Vercel, Convex, or Clerk.');
  console.log('  It only installs packages when you pass --confirm-install.');
  console.log('');

  for (const target of targets) {
    const status = targetStatus(target);
    console.log(`${target.label}`);
    console.log(`  path: ${target.cwd}`);
    console.log(`  package.json: ${status.packageJson ? 'present' : 'missing'}`);
    console.log(`  package-lock.json: ${status.lockfile ? 'present' : 'missing'}`);
    console.log(`  node_modules: ${status.nodeModules ? 'present' : 'missing'}`);
    console.log(`  install: ${target.install ? `npm --prefix ${target.cwd} install` : 'not needed; root package only exposes scripts'}`);
  }
}

function verifyTargets() {
  const missing = [];
  for (const target of targets) {
    const status = targetStatus(target);
    if (!status.packageJson) missing.push(`${target.cwd}/package.json`);
    if (target.lockfileRequired && !status.lockfile) missing.push(`${target.cwd}/package-lock.json`);
  }
  if (missing.length > 0) {
    throw new Error(`Missing package files: ${missing.join(', ')}`);
  }
}

function installTargets() {
  verifyTargets();
  for (const target of targets.filter((item) => item.install)) {
    console.log(`\n== Install ${target.label} ==`);
    const result = spawnSync('npm', ['--prefix', target.cwd, 'install'], {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd()
    });
    if (result.status !== 0) throw new Error(`npm install failed for ${target.cwd}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  printPlan();
  verifyTargets();

  if (args['confirm-install']) {
    installTargets();
    console.log('\nDependency install completed.');
    return;
  }

  if (args.check) {
    console.log('\nDependency setup check passed. Package manifests and lockfiles are present.');
    return;
  }

  console.log('\nPlan only. Re-run with --confirm-install to install dependencies.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
