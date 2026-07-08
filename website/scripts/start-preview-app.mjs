#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

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

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    ...options,
    env: {
      ...process.env,
      ...(options.env || {})
    }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

const args = parseArgs(process.argv.slice(2));
const app = args.app;
const port = String(args.port || '');

if (!app || !port) {
  console.error('Usage: node scripts/start-preview-app.mjs --app <dashboard|marketing> --port <port>');
  process.exit(1);
}

const appDir = resolve(`apps/${app}`);
const standaloneServer = resolve(appDir, '.next/standalone/server.js');

if (existsSync(standaloneServer)) {
  console.log(`Starting ${app} preview from standalone build on port ${port}.`);
  run(process.execPath, [standaloneServer], {
    cwd: resolve(appDir, '.next/standalone'),
    env: {
      PORT: port,
      HOSTNAME: '0.0.0.0'
    }
  });
} else {
  console.log(`Starting ${app} preview with next start on port ${port}.`);
  run('npm', ['--prefix', appDir, 'run', 'start', '--', '--port', port]);
}
