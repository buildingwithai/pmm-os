#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const pluginName = 'idkwidk-template-provisioner';
const pluginDir = resolve('plugins', pluginName);
const manifestPath = join(pluginDir, '.codex-plugin', 'plugin.json');
const marketplacePath = resolve('.agents/plugins/marketplace.json');
const skillPath = join(pluginDir, 'skills', 'template-provisioning', 'SKILL.md');
const packagePath = resolve('package.json');
const agentScriptPath = resolve('scripts/template-agent.mjs');
const vaultScriptPath = resolve('scripts/template-vault.mjs');
const readmePath = resolve('README.md');
const verificationMatrixPath = resolve(
  'docs/idkwidk/usertour-website-integration/PROVISIONING_VERIFICATION_MATRIX.md'
);
const technicalSpecPath = resolve(
  'docs/idkwidk/usertour-website-integration/PROVISIONING_TECHNICAL_SPEC.md'
);
const troubleshootingPath = resolve(
  'docs/idkwidk/usertour-website-integration/PROVISIONING_TROUBLESHOOTING.md'
);
const authProductionPath = resolve(
  'docs/idkwidk/usertour-website-integration/AUTH_PRODUCTION_RUNBOOK.md'
);
const providerTokenSetupPath = resolve(
  'docs/idkwidk/usertour-website-integration/PROVIDER_TOKEN_SETUP.md'
);
const agentRunbookPath = resolve(
  'docs/idkwidk/usertour-website-integration/PROVISIONING_AGENT_RUNBOOK.md'
);
const autonomyRunbookPath = resolve(
  'docs/idkwidk/usertour-website-integration/PROVISIONING_AUTONOMY_RUNBOOK.md'
);

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

function assertIncludes(value, expected, label) {
  assert(String(value).includes(expected), `${label} includes "${expected}"`);
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
    if (pattern.test(content)) {
      throw new Error(`Potential secret-like text found in ${path}`);
    }
  }
  console.log(`PASS no secret-like text in ${path}`);
}

function parseSkillFrontmatter(content) {
  if (!content.startsWith('---\n')) throw new Error('Skill is missing frontmatter.');
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('Skill frontmatter is not closed.');
  const lines = content.slice(4, end).split('\n');
  return Object.fromEntries(
    lines
      .map((line) => line.split(':'))
      .filter((parts) => parts.length >= 2)
      .map(([key, ...valueParts]) => [key.trim(), valueParts.join(':').trim()])
  );
}

function main() {
  assert(existsSync(pluginDir), `plugin directory exists: ${pluginDir}`);
  assert(existsSync(manifestPath), `plugin manifest exists: ${manifestPath}`);
  assert(existsSync(skillPath), `plugin skill exists: ${skillPath}`);
  assert(existsSync(marketplacePath), `local marketplace exists: ${marketplacePath}`);
  assert(existsSync(verificationMatrixPath), `verification matrix exists: ${verificationMatrixPath}`);
  assert(existsSync(technicalSpecPath), `technical spec exists: ${technicalSpecPath}`);
  assert(existsSync(troubleshootingPath), `troubleshooting guide exists: ${troubleshootingPath}`);
  assert(existsSync(authProductionPath), `auth production runbook exists: ${authProductionPath}`);
  assert(existsSync(providerTokenSetupPath), `provider token setup exists: ${providerTokenSetupPath}`);
  assert(existsSync(agentRunbookPath), `agent runbook exists: ${agentRunbookPath}`);
  assert(existsSync(autonomyRunbookPath), `autonomy runbook exists: ${autonomyRunbookPath}`);
  assert(existsSync(agentScriptPath), `agent control center script exists: ${agentScriptPath}`);

  const manifest = readJson(manifestPath);
  const marketplace = readJson(marketplacePath);
  const pkg = readJson(packagePath);
  const agentScript = readFileSync(agentScriptPath, 'utf8');
  const vaultScript = readFileSync(vaultScriptPath, 'utf8');
  const readme = readFileSync(readmePath, 'utf8');
  const verificationMatrix = readFileSync(verificationMatrixPath, 'utf8');
  const technicalSpec = readFileSync(technicalSpecPath, 'utf8');
  const troubleshooting = readFileSync(troubleshootingPath, 'utf8');
  const authProduction = readFileSync(authProductionPath, 'utf8');
  const providerTokenSetup = readFileSync(providerTokenSetupPath, 'utf8');
  const agentRunbook = readFileSync(agentRunbookPath, 'utf8');
  const autonomyRunbook = readFileSync(autonomyRunbookPath, 'utf8');
  const releaseVerifier = readFileSync(resolve('scripts/verify-provisioning-release.mjs'), 'utf8');
  const pluginPackager = readFileSync(resolve('scripts/package-template-plugin.mjs'), 'utf8');

  assert(manifest.name === pluginName, `manifest name is ${pluginName}`);
  assert(manifest.skills === './skills/', 'manifest skills path points to ./skills/');
  assert(manifest.interface?.displayName === 'idkWidk Template Provisioner', 'manifest display name is set');
  assert(Array.isArray(manifest.interface?.defaultPrompt), 'manifest default prompts are present');
  assert(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:agent')),
    'manifest prompts point to agent control center'
  );
  assert(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:bootstrap')),
    'manifest prompts point to a setup entrypoint'
  );
  assert(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:factory')),
    'manifest prompts point to new-project factory entrypoint'
  );
  assert(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('setup:onboard')),
    'manifest prompts point new users at onboarding shortcut'
  );

  const marketplaceEntry = marketplace.plugins?.find((plugin) => plugin.name === pluginName);
  assert(Boolean(marketplaceEntry), 'local marketplace registers the template provisioner plugin');
  assert(marketplaceEntry.source?.source === 'local', 'marketplace entry uses local source');
  assert(marketplaceEntry.source?.path === './plugins/idkwidk-template-provisioner', 'marketplace entry points at plugin folder');
  assert(marketplaceEntry.policy?.installation === 'AVAILABLE', 'marketplace entry is available for install');

  const skillContent = readFileSync(skillPath, 'utf8');
  const skillFrontmatter = parseSkillFrontmatter(skillContent);
  assert(skillFrontmatter.name === 'template-provisioning', 'skill frontmatter name is template-provisioning');
  assertIncludes(skillContent, 'npm run setup:bootstrap', 'skill bootstrap front-door flow');
  assertIncludes(skillContent, 'npm run setup:factory', 'skill new-project factory flow');
  assertIncludes(skillContent, 'npm run setup:agent', 'skill agent control center flow');
  assertIncludes(skillContent, 'npm --silent run setup:agent', 'skill machine-readable agent control center flow');
  assertIncludes(skillContent, 'npm run setup:onboard', 'skill onboarding shortcut flow');
  assertIncludes(skillContent, 'npm run setup:project', 'skill project front-door flow');
  assertIncludes(skillContent, '--install --confirm-install', 'skill dependency install flow');
  assertIncludes(skillContent, 'npm run setup:guide', 'skill setup flow');
  assertIncludes(skillContent, 'npm run setup:start', 'skill start flow');
  assertIncludes(skillContent, 'npm run setup:walkthrough', 'skill walkthrough flow');
  assertIncludes(skillContent, 'npm run setup:next', 'skill next-action flow');
  assertIncludes(skillContent, 'npm --silent run setup:next', 'skill machine-readable next-action flow');
  assertIncludes(skillContent, 'npm run setup:status', 'skill status snapshot flow');
  assertIncludes(skillContent, 'npm --silent run setup:status', 'skill machine-readable status flow');
  assertIncludes(skillContent, 'npm run setup:snapshot', 'skill combined snapshot flow');
  assertIncludes(skillContent, 'npm --silent run setup:snapshot', 'skill machine-readable combined snapshot flow');
  assertIncludes(skillContent, 'npm run setup:plan', 'skill setup plan flow');
  assertIncludes(skillContent, 'npm --silent run setup:plan', 'skill machine-readable setup plan flow');
  assertIncludes(skillContent, 'npm --silent run setup:doctor', 'skill machine-readable doctor flow');
  assertIncludes(skillContent, 'npm run setup:production', 'skill production setup flow');
  assertIncludes(skillContent, 'npm --silent run setup:production', 'skill machine-readable production flow');
  assertIncludes(skillContent, 'npm run setup:credentials', 'skill credential bootstrap flow');
  assertIncludes(skillContent, 'setup:credentials -- --profile <profile> --project <project> --verify', 'skill credential verify flow');
  assertIncludes(skillContent, 'npm run setup:tokens', 'skill token checklist flow');
  assertIncludes(skillContent, 'npm --silent run setup:tokens', 'skill machine-readable token checklist flow');
  assertIncludes(skillContent, 'npm run setup:completion', 'skill implementation completion checklist flow');
  assertIncludes(skillContent, 'npm run setup:vault-metadata:verify', 'skill vault metadata verification flow');
  assertIncludes(skillContent, 'npm run setup:fresh-clone:verify', 'skill verification flow');
  assertIncludes(skillContent, '--confirm-create', 'skill confirmation rules');
  assertIncludes(skillContent, '--pull-dev-env', 'skill Clerk development env pull');
  assertIncludes(skillContent, '--confirm-dev-env', 'skill Clerk development env confirmation');
  assertIncludes(skillContent, 'clerk.productionDomain', 'skill Clerk production domain preflight');

  const skillDirs = readdirSync(join(pluginDir, 'skills'), { withFileTypes: true }).filter((entry) => entry.isDirectory());
  assert(skillDirs.length >= 1, 'plugin contains at least one skill directory');

  assert(pkg.scripts?.['setup:project'] === 'node scripts/template-project.mjs', 'package exposes setup:project');
  assert(pkg.scripts?.['setup:agent'] === 'node scripts/template-agent.mjs', 'package exposes setup:agent');
  assert(pkg.scripts?.['setup:bootstrap'] === 'node scripts/template-project.mjs', 'package exposes setup:bootstrap');
  assert(pkg.scripts?.['setup:factory'] === 'node scripts/template-project.mjs --credentials --check-access', 'package exposes setup:factory');
  assert(pkg.scripts?.['setup:onboard'] === 'node scripts/template-project.mjs --credentials --check-access', 'package exposes setup:onboard');
  assert(pkg.scripts?.['setup:install'] === 'node scripts/template-install.mjs', 'package exposes setup:install');
  assert(pkg.scripts?.['setup:production'] === 'node scripts/template-production.mjs', 'package exposes setup:production');
  assert(pkg.scripts?.['setup:guide'] === 'node scripts/template-setup-guide.mjs', 'package exposes setup:guide');
  assert(pkg.scripts?.['setup:start'] === 'node scripts/template-start.mjs', 'package exposes setup:start');
  assert(pkg.scripts?.['setup:walkthrough'] === 'node scripts/template-walkthrough.mjs', 'package exposes setup:walkthrough');
  assert(pkg.scripts?.['setup:next'] === 'node scripts/template-vault.mjs next', 'package exposes setup:next');
  assert(pkg.scripts?.['setup:completion'] === 'node scripts/template-completion.mjs', 'package exposes setup:completion');
  assert(pkg.scripts?.['setup:doctor'] === 'node scripts/template-vault.mjs doctor', 'package exposes setup:doctor');
  assert(pkg.scripts?.['setup:status'] === 'node scripts/template-vault.mjs status', 'package exposes setup:status');
  assert(pkg.scripts?.['setup:snapshot'] === 'node scripts/template-vault.mjs snapshot', 'package exposes setup:snapshot');
  assert(pkg.scripts?.['vault:snapshot'] === 'node scripts/template-vault.mjs snapshot', 'package exposes vault:snapshot');
  assert(pkg.scripts?.['setup:plan'] === 'node scripts/template-vault.mjs provision', 'package exposes setup:plan');
  assert(pkg.scripts?.['vault:status'] === 'node scripts/template-vault.mjs status', 'package exposes vault:status');
  assert(pkg.scripts?.['vault:completion'] === 'node scripts/template-completion.mjs', 'package exposes vault:completion');
  assert(pkg.scripts?.['setup:audit'] === 'node scripts/template-vault.mjs audit', 'package exposes setup:audit');
  assert(pkg.scripts?.['vault:audit'] === 'node scripts/template-vault.mjs audit', 'package exposes vault:audit');
  assert(pkg.scripts?.['setup:credentials'] === 'node scripts/template-credentials-wizard.mjs', 'package exposes setup:credentials');
  assert(pkg.scripts?.['setup:tokens'] === 'node scripts/template-vault.mjs tokens', 'package exposes setup:tokens');
  assert(pkg.scripts?.['setup:vault-metadata:verify'] === 'node scripts/verify-vault-metadata.mjs', 'package exposes vault metadata verifier');
  assertIncludes(vaultScript, 'publishableKeyStored', 'setup plan redacts Clerk publishable key values');
  assertIncludes(vaultScript, 'provisionPlanMetadata', 'setup plan has metadata redaction boundary');
  assertIncludes(vaultScript, 'normalizeMetadataValue', 'vault script normalizes metadata values');
  assertIncludes(vaultScript, 'convex.teamId must be the numeric team ID', 'vault script rejects invalid Convex team IDs');
  assertIncludes(vaultScript, 'buildNextActionPayload', 'vault script exposes machine-readable next action payload');
  assertIncludes(vaultScript, 'setup:factory', 'vault script exposes new-project factory command in machine-readable outputs');
  assertIncludes(vaultScript, 'productionJson', 'vault script exposes machine-readable production checklist command');
  assertIncludes(agentScript, 'providerApisCalled: false', 'agent control center declares provider boundary');
  assertIncludes(agentScript, 'secretValuesPrinted: false', 'agent control center declares secret boundary');
  assertIncludes(agentScript, 'canAgentContinueWithoutUser', 'agent control center reports autonomy boundary');
  assert(
    pkg.scripts?.['setup:plugin-discovery:verify'] === 'node scripts/verify-template-plugin-discovery.mjs',
    'package exposes plugin discovery verifier'
  );
  assert(
    pkg.scripts?.['setup:release:verify'] === 'node scripts/verify-provisioning-release.mjs',
    'package exposes provisioning release verifier'
  );
  assertIncludes(releaseVerifier, 'setup:doctor', 'release verifier checks setup doctor');
  assertIncludes(releaseVerifier, 'setup:vault-metadata:verify', 'release verifier checks vault metadata normalization');
  assertIncludes(releaseVerifier, '--json', 'release verifier checks machine-readable outputs');
  assert(pkg.scripts?.['vault:vercel-dashboard'] === 'node scripts/template-vault.mjs vercel-dashboard', 'package exposes dashboard Vercel boundary');
  assert(pkg.scripts?.['setup:locations'] === 'node scripts/template-vault.mjs locations', 'package exposes setup:locations');
  assert(pkg.scripts?.['vault:locations'] === 'node scripts/template-vault.mjs locations', 'package exposes vault:locations');
  assert(pkg.scripts?.['setup:fresh-clone:verify'] === 'node scripts/verify-fresh-clone.mjs', 'package exposes fresh clone verifier');
  assert(pkg.scripts?.['setup:plugin:verify'] === 'node scripts/verify-template-plugin.mjs', 'package exposes plugin verifier');
  assert(pkg.scripts?.['setup:plugin:package'] === 'node scripts/package-template-plugin.mjs', 'package exposes plugin packager');
  assert(pkg.scripts?.['analytics:convex:verify'] === 'node scripts/verify-convex-analytics.mjs', 'package exposes Convex analytics verifier');
  assertIncludes(pluginPackager, 'secretValuesPrinted: false', 'plugin packager declares secret boundary');
  assertIncludes(pluginPackager, 'providerApisCalled: false', 'plugin packager declares provider boundary');
  assertIncludes(readme, 'npm run setup:bootstrap', 'root README bootstrap front-door flow');
  assertIncludes(readme, 'npm run setup:factory', 'root README new-project factory flow');
  assertIncludes(readme, 'npm run setup:agent', 'root README agent control center flow');
  assertIncludes(readme, 'npm --silent run setup:agent', 'root README machine-readable agent control center flow');
  assertIncludes(readme, 'npm run setup:onboard', 'root README onboarding shortcut flow');
  assertIncludes(readme, 'npm run setup:project', 'root README project front-door flow');
  assertIncludes(readme, 'npm run setup:start', 'root README start flow');
  assertIncludes(readme, 'npm run setup:next', 'root README next-action flow');
  assertIncludes(readme, 'npm --silent run setup:next', 'root README machine-readable next-action flow');
  assertIncludes(readme, 'npm run setup:status', 'root README status snapshot flow');
  assertIncludes(readme, 'npm --silent run setup:status', 'root README machine-readable status flow');
  assertIncludes(readme, 'npm run setup:snapshot', 'root README combined snapshot flow');
  assertIncludes(readme, 'npm --silent run setup:snapshot', 'root README machine-readable combined snapshot flow');
  assertIncludes(readme, 'npm run setup:plan', 'root README setup plan flow');
  assertIncludes(readme, 'npm --silent run setup:plan', 'root README machine-readable setup plan flow');
  assertIncludes(readme, 'npm --silent run setup:doctor', 'root README machine-readable doctor flow');
  assertIncludes(readme, 'npm run setup:production', 'root README production setup flow');
  assertIncludes(readme, 'npm --silent run setup:production', 'root README machine-readable production setup flow');
  assertIncludes(readme, 'npm run setup:audit', 'root README completion audit flow');
  assertIncludes(readme, 'npm run setup:completion', 'root README implementation completion checklist flow');
  assertIncludes(readme, 'npm run setup:locations', 'root README storage locations flow');
  assertIncludes(readme, 'npm run setup:credentials', 'root README credential flow');
  assertIncludes(readme, 'npm run setup:tokens', 'root README token checklist flow');
  assertIncludes(readme, 'npm --silent run setup:tokens', 'root README machine-readable token checklist flow');
  assertIncludes(readme, 'npm run setup:vault-metadata:verify', 'root README vault metadata verification flow');
  assertIncludes(readme, 'npm run setup:plugin:package', 'root README plugin package flow');
  assertIncludes(readme, 'PROVISIONING_TROUBLESHOOTING.md', 'root README troubleshooting link');
  assertIncludes(skillContent, 'PROVISIONING_TROUBLESHOOTING.md', 'skill troubleshooting link');
  assertIncludes(verificationMatrix, 'Project front door', 'verification matrix setup:project evidence');
  assertIncludes(verificationMatrix, 'Bootstrap front door', 'verification matrix setup:bootstrap evidence');
  assertIncludes(verificationMatrix, 'Project factory front door', 'verification matrix setup:factory evidence');
  assertIncludes(verificationMatrix, 'Onboarding shortcut', 'verification matrix setup:onboard evidence');
  assertIncludes(verificationMatrix, 'Dependency install plan', 'verification matrix dependency install evidence');
  assertIncludes(verificationMatrix, 'Setup start access check', 'verification matrix setup:start evidence');
  assertIncludes(verificationMatrix, 'Setup walkthrough', 'verification matrix setup:walkthrough evidence');
  assertIncludes(verificationMatrix, 'Credential verify path', 'verification matrix credential verify evidence');
  assertIncludes(verificationMatrix, 'Storage locations', 'verification matrix storage locations evidence');
  assertIncludes(verificationMatrix, 'Completion audit', 'verification matrix completion audit evidence');
  assertIncludes(verificationMatrix, 'Implementation completion checklist', 'verification matrix implementation completion checklist evidence');
  assertIncludes(verificationMatrix, 'Production helper JSON', 'verification matrix production helper JSON evidence');
  assertIncludes(verificationMatrix, 'Agent control center', 'verification matrix agent control center evidence');
  assertIncludes(verificationMatrix, 'Provider CLI preflight', 'verification matrix provider CLI preflight evidence');
  assertIncludes(verificationMatrix, 'Next action fresh profile', 'verification matrix fresh profile next-action evidence');
  assertIncludes(verificationMatrix, 'Setup next JSON', 'verification matrix next-action JSON evidence');
  assertIncludes(verificationMatrix, 'Setup status JSON', 'verification matrix status JSON evidence');
  assertIncludes(verificationMatrix, 'Setup snapshot JSON', 'verification matrix snapshot JSON evidence');
  assertIncludes(verificationMatrix, 'Setup plan JSON', 'verification matrix setup plan JSON evidence');
  assertIncludes(verificationMatrix, 'Setup token checklist JSON', 'verification matrix token checklist JSON evidence');
  assertIncludes(verificationMatrix, 'Vault metadata normalization', 'verification matrix vault metadata evidence');
  assertIncludes(verificationMatrix, 'Plugin package check', 'verification matrix plugin package evidence');
  assertIncludes(verificationMatrix, 'Fresh clone', 'verification matrix fresh clone evidence');
  assertIncludes(verificationMatrix, 'Troubleshooting guide', 'verification matrix troubleshooting evidence');
  assertIncludes(verificationMatrix, 'Production readiness', 'verification matrix readiness evidence');
  assertIncludes(verificationMatrix, 'Clerk dev env pull', 'verification matrix Clerk dev env evidence');
  assertIncludes(verificationMatrix, 'Clerk production domain preflight', 'verification matrix Clerk domain preflight evidence');
  assertIncludes(verificationMatrix, 'Production helper', 'verification matrix production helper evidence');
  assertIncludes(technicalSpec, 'setup:bootstrap', 'technical spec bootstrap front door');
  assertIncludes(technicalSpec, 'setup:factory', 'technical spec new-project factory front door');
  assertIncludes(technicalSpec, 'setup:agent', 'technical spec agent control center');
  assertIncludes(technicalSpec, 'setup:onboard', 'technical spec onboarding shortcut');
  assertIncludes(technicalSpec, 'setup:project', 'technical spec project front door');
  assertIncludes(technicalSpec, 'npm run setup:status', 'technical spec status snapshot requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:next', 'technical spec machine-readable next-action requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:status', 'technical spec machine-readable status requirement');
  assertIncludes(technicalSpec, 'npm run setup:snapshot', 'technical spec combined snapshot requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:snapshot', 'technical spec machine-readable combined snapshot requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:plan', 'technical spec machine-readable setup plan requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:doctor', 'technical spec machine-readable doctor requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:production', 'technical spec machine-readable production helper requirement');
  assertIncludes(technicalSpec, 'npm run setup:tokens', 'technical spec token checklist requirement');
  assertIncludes(technicalSpec, 'npm --silent run setup:tokens', 'technical spec machine-readable token checklist requirement');
  assertIncludes(technicalSpec, 'npm run setup:vault-metadata:verify', 'technical spec vault metadata requirement');
  assertIncludes(technicalSpec, 'npm run setup:plugin:package', 'technical spec plugin package requirement');
  assertIncludes(technicalSpec, 'npm run setup:production', 'technical spec production helper requirement');
  assertIncludes(technicalSpec, 'npm run setup:completion', 'technical spec implementation completion checklist requirement');
  assertIncludes(technicalSpec, 'IDKWIDK_TEMPLATE_IGNORE_GLOBAL_CLI_AUTH=1', 'technical spec isolated provider auth requirement');
  assertIncludes(verificationMatrix, 'ignores global Convex/Clerk CLI auth', 'verification matrix isolated provider auth evidence');
  assertIncludes(technicalSpec, 'GitHub CLI, Vercel CLI, Convex CLI, Clerk CLI', 'technical spec provider CLI preflight requirement');
  assertIncludes(technicalSpec, 'npm run setup:install -- --check', 'technical spec dependency install check requirement');
  assertIncludes(troubleshooting, 'npm run setup:bootstrap', 'troubleshooting bootstrap flow');
  assertIncludes(troubleshooting, 'npm run setup:production', 'troubleshooting production helper flow');
  assertIncludes(troubleshooting, 'clerk.productionDomain', 'troubleshooting Clerk production domain preflight');
  assertIncludes(troubleshooting, 'npm run vault:rollback', 'troubleshooting rollback flow');
  assertIncludes(authProduction, 'npm run setup:production', 'auth production runbook helper flow');
  assertIncludes(providerTokenSetup, 'npm run setup:production', 'provider token setup production helper flow');
  assertIncludes(agentRunbook, 'npm run setup:bootstrap', 'agent runbook bootstrap flow');
  assertIncludes(agentRunbook, 'npm run setup:agent', 'agent runbook agent control center flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:agent', 'agent runbook machine-readable agent control center flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:next', 'agent runbook machine-readable next-action flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:status', 'agent runbook machine-readable status flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:snapshot', 'agent runbook machine-readable combined snapshot flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:plan', 'agent runbook machine-readable setup plan flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:doctor', 'agent runbook machine-readable doctor flow');
  assertIncludes(agentRunbook, 'npm --silent run setup:tokens', 'agent runbook machine-readable token checklist flow');
  assertIncludes(agentRunbook, 'npm run setup:vault-metadata:verify', 'agent runbook vault metadata flow');
  assertIncludes(agentRunbook, 'npm run setup:plugin:package', 'agent runbook plugin package flow');
  assertIncludes(autonomyRunbook, 'setup:bootstrap', 'autonomy runbook bootstrap queue');

  for (const path of [
    manifestPath,
    marketplacePath,
    skillPath,
    join(pluginDir, 'README.md'),
    readmePath,
    verificationMatrixPath,
    technicalSpecPath,
    troubleshootingPath,
    authProductionPath,
    providerTokenSetupPath,
    agentRunbookPath,
    autonomyRunbookPath
  ]) {
    assertNoSecretText(path);
  }

  console.log('\nTemplate provisioner plugin verification passed.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
