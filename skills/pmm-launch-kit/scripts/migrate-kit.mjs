#!/usr/bin/env node
/**
 * Migration codemod — Phase 1 of the uniform block model.
 * Run:  node migrate-kit.mjs
 *
 * Stamps every block (in views[*].blocks and details[*].blocks) with a stable
 * `id` and an explicit `type`, and bumps `schemaVersion`. Fields stay top-level,
 * so the rendered HTML/markdown and the live editor are unaffected — this only
 * adds metadata the registry-driven generator and (later) the id-anchored
 * editor will use.
 *
 * Idempotent: blocks that already carry id+type are left untouched; re-running
 * after the editor inserts new blocks only stamps the new ones. Writes a .bak.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { resolveType } from './block-registry.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = join(DIR, 'kit-content.json');
const SCHEMA_VERSION = 2;

const raw = readFileSync(FILE, 'utf8');
const C = JSON.parse(raw);

const used = new Set();
function blockId(scope, i, b) {
  // deterministic from position so re-runs are stable; salt on collision
  let base = 'blk_' + createHash('sha1').update(scope + ':' + i).digest('hex').slice(0, 8);
  let id = base, n = 1;
  while (used.has(id)) id = base + (n++);
  used.add(id);
  return id;
}

let stamped = 0, kept = 0;
function migrateBlocks(arr, scope) {
  if (!Array.isArray(arr)) return;
  arr.forEach((b, i) => {
    if (!b || typeof b !== 'object') return;
    const hasId = typeof b.id === 'string' && b.id;
    const hasType = typeof b.type === 'string' && b.type;
    if (hasId) used.add(b.id);
    if (hasId && hasType) { kept++; return; }
    const id = hasId ? b.id : blockId(scope, i, b);
    const type = hasType ? b.type : resolveType(b);
    // rebuild with id + type first for readability; preserve all existing fields
    const rest = {};
    for (const k of Object.keys(b)) { if (k !== 'id' && k !== 'type') rest[k] = b[k]; }
    arr[i] = Object.assign({ id, type }, rest);
    stamped++;
  });
}

for (const [id, v] of Object.entries(C.views || {})) migrateBlocks(v.blocks, 'views.' + id);
for (const [id, d] of Object.entries(C.details || {})) migrateBlocks(d.blocks, 'details.' + id);

const out = { schemaVersion: SCHEMA_VERSION, ...C };
const serialized = JSON.stringify(out, null, 2) + '\n';
JSON.parse(serialized); // sanity

if (stamped === 0 && C.schemaVersion === SCHEMA_VERSION) {
  console.log('✓ already migrated — ' + kept + ' blocks already carry id+type (no change)');
} else {
  writeFileSync(FILE + '.bak', raw);
  writeFileSync(FILE, serialized);
  console.log('✓ migrated kit-content.json → schemaVersion ' + SCHEMA_VERSION);
  console.log('  stamped ' + stamped + ' block(s) with id+type · ' + kept + ' already had both · backup → kit-content.json.bak');
}
