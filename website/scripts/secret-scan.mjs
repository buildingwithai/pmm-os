#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const patterns = [
  {
    name: 'GitHub personal access token',
    regex: /github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}/g
  },
  {
    name: 'Clerk secret key',
    regex: /sk_(test|live)_[A-Za-z0-9_-]{16,}/g
  },
  {
    name: 'Convex deploy key',
    regex: /\b(?:dev|prod|preview|custom):[a-z0-9-]+\|[A-Za-z0-9_-]{20,}/g
  },
  {
    name: 'Vercel token',
    regex: /\b[A-Za-z0-9]{24}_[A-Za-z0-9]{24,}\b/g
  },
  {
    name: 'Generic bearer token',
    regex: /Bearer\s+[A-Za-z0-9._-]{32,}/g
  }
];

const allowedMatches = new Set([
  'sk_test_...',
  'sk_live_...'
]);

function trackedFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], { encoding: 'buffer' });
  if (result.status !== 0) {
    throw new Error('git ls-files failed.');
  }
  return result.stdout.toString('utf8').split('\0').filter(Boolean);
}

function isLikelyText(content) {
  return !content.includes('\0');
}

function scanFile(file) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  if (!isLikelyText(content)) return [];

  const findings = [];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern.regex)) {
      const value = match[0];
      if (allowedMatches.has(value)) continue;
      const line = content.slice(0, match.index).split(/\r?\n/).length;
      findings.push({
        file,
        line,
        name: pattern.name,
        preview: `${value.slice(0, 6)}...[redacted]`
      });
    }
  }
  return findings;
}

function main() {
  const findings = trackedFiles().flatMap(scanFile);
  if (findings.length === 0) {
    console.log('Secret scan passed. No token-like secrets found in tracked files.');
    return;
  }

  console.log(`Secret scan failed with ${findings.length} finding(s).`);
  for (const finding of findings) {
    console.log(`${finding.file}:${finding.line} ${finding.name} ${finding.preview}`);
  }
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
