#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const pluginName = 'idkwidk-template-provisioner';
const pluginDir = resolve('plugins', pluginName);
const manifestPath = join(pluginDir, '.codex-plugin', 'plugin.json');
const marketplacePath = resolve('.agents/plugins/marketplace.json');

function usage() {
  console.log(`Usage:
  npm run setup:plugin:package
  npm run setup:plugin:package -- --check
  npm run setup:plugin:package -- --out dist/plugins

This creates a local distributable archive for the template provisioner plugin.
It does not publish anything, install anything, or include provider secrets.`);
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

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
}

function assertNoSecretText(path) {
  const content = readFileSync(path, 'utf8');
  const secretPatterns = [
    /github_pat_[A-Za-z0-9_]+/,
    /ghp_[A-Za-z0-9_]+/,
    /sk_(test|live)_[A-Za-z0-9_]+/,
    /pk_live_[A-Za-z0-9_]+/,
    /Bearer\s+[A-Za-z0-9._-]+/,
    /CONVEX_DEPLOY_KEY\s*=\s*[A-Za-z0-9._-]+/
  ];
  for (const pattern of secretPatterns) {
    if (pattern.test(content)) throw new Error(`Potential secret-like text found in ${path}`);
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8'
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed.`);
}

function validateInputs() {
  assert(existsSync(pluginDir), `plugin directory exists: ${pluginDir}`);
  assert(existsSync(manifestPath), `plugin manifest exists: ${manifestPath}`);
  assert(existsSync(marketplacePath), `local marketplace exists: ${marketplacePath}`);

  const manifest = readJson(manifestPath);
  const marketplace = readJson(marketplacePath);
  assert(manifest.name === pluginName, `plugin manifest name is ${pluginName}`);
  assert(manifest.version, 'plugin manifest has a version');
  assert(manifest.skills === './skills/', 'plugin manifest points to local skills');

  const entry = marketplace.plugins?.find((plugin) => plugin.name === pluginName);
  assert(Boolean(entry), 'local marketplace registers the plugin');
  assert(entry.source?.source === 'local', 'marketplace entry uses local source');
  assert(entry.source?.path === './plugins/idkwidk-template-provisioner', 'marketplace entry points at plugin folder');

  for (const path of [
    manifestPath,
    join(pluginDir, 'README.md'),
    join(pluginDir, 'skills/template-provisioning/SKILL.md'),
    marketplacePath
  ]) {
    assertNoSecretText(path);
  }
  assert(true, 'plugin package inputs contain no secret-like text');
  return { manifest, marketplaceEntry: entry };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  console.log('idkWidk template provisioner package');
  console.log('Plain English version: this checks or creates a local plugin archive without publishing it.');
  console.log('No provider APIs are called. No secret values are printed.');
  console.log('');

  const { manifest, marketplaceEntry } = validateInputs();
  const filename = `${pluginName}-${manifest.version}.tgz`;
  const outDir = resolve(args.out && args.out !== true ? String(args.out) : 'dist/plugins');
  const outPath = join(outDir, filename);

  if (args.check) {
    console.log(`Package check passed. Planned archive: ${outPath}`);
    return;
  }

  const workspace = mkdtempSync(join(tmpdir(), 'idkwidk-plugin-package-'));
  try {
    const packageRoot = join(workspace, `${pluginName}-${manifest.version}`);
    mkdirSync(packageRoot, { recursive: true });
    cpSync(pluginDir, join(packageRoot, 'plugin'), { recursive: true });
    cpSync(marketplacePath, join(packageRoot, 'marketplace.json'));
    const packageManifest = {
      schemaVersion: 1,
      name: pluginName,
      version: manifest.version,
      createdAt: new Date().toISOString(),
      localOnly: true,
      providerApisCalled: false,
      secretValuesPrinted: false,
      pluginPath: 'plugin',
      marketplaceEntry: marketplaceEntry.name,
      installNote: 'Install through the Codex local plugin flow or copy plugin/ into the template plugins directory. Do not store provider tokens in plugin files.'
    };
    writeFileSync(join(packageRoot, 'package-manifest.json'), `${JSON.stringify(packageManifest, null, 2)}\n`);

    mkdirSync(outDir, { recursive: true });
    run('tar', ['-czf', outPath, basename(packageRoot)], { cwd: workspace });
    run('tar', ['-tzf', outPath]);
    console.log(`Created plugin archive: ${outPath}`);
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
