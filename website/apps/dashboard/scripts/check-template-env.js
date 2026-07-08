const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const envPath = path.join(appRoot, '.env.local');
const examplePath = path.join(appRoot, 'env.example.txt');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        return [key.trim(), valueParts.join('=').trim().replace(/^["']|["']$/g, '')];
      })
  );
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getTemplateEnvStatus(env, hasLocalEnvFile) {
  const authBypass = env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
  const hasClerk = hasValue(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && hasValue(env.CLERK_SECRET_KEY);
  const hasConvex = hasValue(env.NEXT_PUBLIC_CONVEX_URL) && hasValue(env.CONVEX_DEPLOYMENT);
  const mode = authBypass
    ? 'template'
    : hasClerk && hasConvex
      ? 'real-provider'
      : 'partial-provider';

  return {
    hasClerk,
    hasConvex,
    mode,
    rows: [
      ['Mode', mode],
      ['Local env file', hasLocalEnvFile ? '.env.local present and gitignored' : 'not present'],
      ['Auth bypass', authBypass ? 'on' : 'off'],
      ['Clerk keys', hasClerk ? 'present' : 'missing or incomplete'],
      ['Convex keys', hasConvex ? 'present' : 'missing or incomplete']
    ]
  };
}

function run() {
  const localEnv = parseEnvFile(envPath);
  const exampleEnv = parseEnvFile(examplePath);
  const hasLocalEnvFile = fs.existsSync(envPath);
  const env = { ...exampleEnv, ...localEnv, ...process.env };
  const status = getTemplateEnvStatus(env, hasLocalEnvFile);

  for (const [label, value] of status.rows) {
    console.log(`${label}: ${value}`);
  }

  if (status.mode === 'partial-provider') {
    console.error(
      'Provider mode is incomplete. Use template mode or add both Clerk and Convex disposable setup values.'
    );
    process.exitCode = 1;
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  getTemplateEnvStatus,
  hasValue,
  parseEnvFile
};
