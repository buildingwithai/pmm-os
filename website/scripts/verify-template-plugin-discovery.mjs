#!/usr/bin/env node

import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const pluginName = 'idkwidk-template-provisioner';
const sourceMarketplacePath = resolve('.agents/plugins/marketplace.json');
const sourcePluginDir = resolve('plugins', pluginName);

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON at ${path}: ${error.message}`);
  }
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
  console.log(`PASS no secret-like text in ${path}`);
}

function resolveMarketplacePlugin(appRoot, plugin) {
  const source = plugin.source || {};
  if (source.source !== 'local') throw new Error(`Unsupported plugin source for ${plugin.name}: ${source.source}`);
  if (!source.path) throw new Error(`Plugin ${plugin.name} is missing a local source path.`);
  return resolve(appRoot, source.path);
}

function main() {
  const workspace = mkdtempSync(join(tmpdir(), 'idkwidk-plugin-discovery-'));
  const appRoot = join(workspace, 'codex-app');
  const marketplacePath = join(appRoot, '.agents/plugins/marketplace.json');
  const pluginDir = join(appRoot, 'plugins', pluginName);

  try {
    cpSync(sourceMarketplacePath, marketplacePath, { recursive: true });
    cpSync(sourcePluginDir, pluginDir, { recursive: true });

    const marketplace = readJson(marketplacePath);
    const entry = marketplace.plugins?.find((plugin) => plugin.name === pluginName);
    assert(Boolean(entry), 'fresh marketplace discovers template provisioner entry');
    assert(entry.policy?.installation === 'AVAILABLE', 'fresh marketplace marks plugin available');

    const resolvedPluginDir = resolveMarketplacePlugin(appRoot, entry);
    assert(resolvedPluginDir === pluginDir, 'fresh marketplace local path resolves to copied plugin directory');
    assert(existsSync(resolvedPluginDir), 'resolved plugin directory exists');

    const manifestPath = join(resolvedPluginDir, '.codex-plugin/plugin.json');
    const manifest = readJson(manifestPath);
    assert(manifest.name === pluginName, 'resolved plugin manifest has expected name');
    assert(manifest.skills === './skills/', 'resolved plugin manifest points at skills directory');
    assert(Array.isArray(manifest.interface?.defaultPrompt), 'resolved plugin exposes default prompts');
    assert(
      manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:agent')),
      'resolved plugin prompt points agents at setup control center'
    );
    assert(
      manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:bootstrap')),
      'resolved plugin prompt points agents at setup entrypoint'
    );
    assert(
      manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:onboard')),
      'resolved plugin prompt points new users at onboarding shortcut'
    );

    const skillPath = join(resolvedPluginDir, 'skills/template-provisioning/SKILL.md');
    assert(existsSync(skillPath), 'resolved plugin skill file exists');
    const skill = readFileSync(skillPath, 'utf8');
    assert(skill.includes('npm run setup:bootstrap'), 'resolved skill includes setup bootstrap front-door command');
    assert(skill.includes('npm run setup:agent'), 'resolved skill includes setup agent control center command');
    assert(skill.includes('npm --silent run setup:agent'), 'resolved skill includes machine-readable setup agent command');
    assert(skill.includes('npm run setup:onboard'), 'resolved skill includes setup onboarding shortcut command');
    assert(skill.includes('npm run setup:project'), 'resolved skill includes setup project front-door command');
    assert(skill.includes('npm run setup:start'), 'resolved skill includes setup start command');
    assert(skill.includes('npm run setup:walkthrough'), 'resolved skill includes setup walkthrough command');
    assert(skill.includes('npm run setup:guide'), 'resolved skill includes setup guide command');
    assert(skill.includes('npm --silent run setup:next'), 'resolved skill includes machine-readable setup next command');
    assert(skill.includes('npm run setup:snapshot'), 'resolved skill includes setup snapshot command');
    assert(skill.includes('npm --silent run setup:snapshot'), 'resolved skill includes machine-readable setup snapshot command');
    assert(skill.includes('npm run setup:plan'), 'resolved skill includes setup plan command');
    assert(skill.includes('npm --silent run setup:plan'), 'resolved skill includes machine-readable setup plan command');
    assert(skill.includes('npm --silent run setup:doctor'), 'resolved skill includes machine-readable setup doctor command');
    assert(skill.includes('npm run setup:credentials'), 'resolved skill includes credential wizard command');
    assert(skill.includes('setup:credentials -- --profile <profile> --project <project> --verify'), 'resolved skill includes credential verify command');
    assert(skill.includes('npm run setup:tokens'), 'resolved skill includes token checklist command');
    assert(skill.includes('npm --silent run setup:tokens'), 'resolved skill includes machine-readable token checklist command');
    assert(skill.includes('npm run setup:plugin:package'), 'resolved skill includes plugin package command');
    assert(skill.includes('npm run setup:locations'), 'resolved skill includes storage locations command');
    assert(skill.includes('npm run setup:audit'), 'resolved skill includes completion audit command');
    assert(skill.includes('--confirm-create'), 'resolved skill includes confirmation rule');

    for (const path of [marketplacePath, manifestPath, skillPath, join(resolvedPluginDir, 'README.md')]) {
      assertNoSecretText(path);
    }

    console.log('\nTemplate provisioner plugin discovery verification passed.');
    console.log('This simulates a fresh Codex-style local marketplace resolving the plugin without user credentials.');
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
