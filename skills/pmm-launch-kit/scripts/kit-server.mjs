#!/usr/bin/env node
/**
 * PMM OS Launch Kit — local sync/edit server.
 * Run:  node kit-server.mjs   then open http://127.0.0.1:4317
 *
 * - Serves the built kit + assets.
 * - POST /api/save {edits:[{path,value}]} → patches kit-content.json (with .bak +
 *   JSON validation), reruns build-kit.mjs (regenerates HTML + markdown), then
 *   pushes a live-reload to open tabs.
 * - GET /api/events → Server-Sent Events for live reload.
 * Bidirectional: edit in the page → kit-content.json updates → HTML + generated-docs rebuild.
 * Zero dependencies (Node built-ins only).
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4317;
const JSONP = join(DIR, 'kit-content.json');

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.md': 'text/markdown', '.csv': 'text/csv', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };

const sseClients = new Set();
function broadcast(msg) { for (const res of sseClients) { try { res.write('data: ' + msg + '\n\n'); } catch (e) {} } }

function build() {
  const r = spawnSync('node', ['build-kit.mjs'], { cwd: DIR, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'build failed');
  return r.stdout;
}

/** set a value at a dot-path inside obj (numeric segments index arrays). */
function setPath(obj, path, value) {
  const segs = path.split('.');
  let cur = obj;
  for (let i = 0; i < segs.length - 1; i++) {
    const k = segs[i];
    if (cur == null || typeof cur !== 'object' || !(k in cur)) throw new Error('bad path: ' + path);
    cur = cur[k];
  }
  const last = segs[segs.length - 1];
  if (cur == null || typeof cur !== 'object' || !(last in cur)) throw new Error('bad path: ' + path);
  cur[last] = value;
}

function applyEdits(edits) {
  const raw = readFileSync(JSONP, 'utf8');
  const data = JSON.parse(raw);
  for (const e of edits) {
    if (typeof e.path !== 'string' || typeof e.value !== 'string') throw new Error('bad edit');
    setPath(data, e.path, e.value);
  }
  const out = JSON.stringify(data, null, 2);
  JSON.parse(out); // validate round-trip
  writeFileSync(JSONP + '.bak', raw);   // backup previous
  writeFileSync(JSONP, out);
  return edits.length;
}

function send(res, code, type, body) { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); }

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);

  if (url === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('data: connected\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (url === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => {
      try {
        const { edits } = JSON.parse(body || '{}');
        if (!Array.isArray(edits)) throw new Error('no edits');
        const n = applyEdits(edits);
        build();
        broadcast('reload');
        send(res, 200, 'application/json', JSON.stringify({ ok: true, applied: n }));
        console.log('✓ saved ' + n + ' edit(s) → kit-content.json → rebuilt');
      } catch (e) {
        console.error('save error:', e.message);
        send(res, 400, 'application/json', JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (url === '/api/save-full' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!data || !data.views || !data.sidebar) throw new Error('not a kit-content document');
        const out = JSON.stringify(data, null, 2);
        JSON.parse(out);
        writeFileSync(JSONP + '.bak', readFileSync(JSONP, 'utf8'));
        writeFileSync(JSONP, out);
        build();
        broadcast('reload');
        send(res, 200, 'application/json', JSON.stringify({ ok: true }));
        console.log('✓ full save → kit-content.json → rebuilt');
      } catch (e) {
        console.error('save-full error:', e.message);
        send(res, 400, 'application/json', JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  /* POST /api/generate {view, index, instruction, mode:'generate'|'regenerate', blockId?}
     → queues the request in generate-queue.json (next to kit-content.json) and, for a fresh
     generate, plants a visible placeholder block carrying genId so the fulfiller (a Claude
     Code session: "process the generation queue") can find it after any reordering. */
  if (url === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const r = JSON.parse(body || '{}');
        if (typeof r.view !== 'string' || typeof r.instruction !== 'string' || !r.instruction.trim()) throw new Error('need view + instruction');
        const mode = r.mode === 'regenerate' ? 'regenerate' : 'generate';
        const data = JSON.parse(readFileSync(JSONP, 'utf8'));
        if (!data.views || !data.views[r.view]) throw new Error('unknown view: ' + r.view);
        const genId = 'gen_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const QP = join(DIR, 'generate-queue.json');
        let queue = [];
        try { queue = JSON.parse(readFileSync(QP, 'utf8')); } catch (e) { /* fresh queue */ }
        queue.push({ id: genId, ts: new Date().toISOString(), view: r.view, index: Number.isInteger(r.index) ? r.index : null,
          blockId: r.blockId || null, instruction: r.instruction.trim().slice(0, 2000), mode, status: 'queued' });
        writeFileSync(QP, JSON.stringify(queue, null, 2));
        if (mode === 'generate') {
          /* fold the slash-text cleanup into the same write (one rebuild, no race) */
          if (r.clean && typeof r.clean.path === 'string' && typeof r.clean.value === 'string') {
            try { setPath(data, r.clean.path, r.clean.value); } catch (e) { /* stale path — placeholder still lands */ }
          }
          const blocks = data.views[r.view].blocks || (data.views[r.view].blocks = []);
          const ph = { type: 'callout', genId, callout: '<b>Queued for generation.</b> “' + r.instruction.trim().slice(0, 200).replace(/</g, '&lt;')
            + '” — in a Claude Code session in this project, say <b>“process the generation queue”</b> and this block is written from the evidence.' };
          const at = Number.isInteger(r.index) && r.index >= 0 && r.index <= blocks.length ? r.index : blocks.length;
          blocks.splice(at, 0, ph);
          writeFileSync(JSONP + '.bak', readFileSync(JSONP, 'utf8'));
          writeFileSync(JSONP, JSON.stringify(data, null, 2));
          build();
          broadcast('reload');
        }
        send(res, 200, 'application/json', JSON.stringify({ ok: true, id: genId, queued: queue.filter((q) => q.status === 'queued').length }));
        console.log('✓ generation queued (' + mode + '): ' + r.instruction.slice(0, 60));
      } catch (e) {
        console.error('generate error:', e.message);
        send(res, 400, 'application/json', JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (url === '/api/comments' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => {
      try {
        const arr = JSON.parse(body || '[]');
        if (!Array.isArray(arr)) throw new Error('comments must be an array');
        const data = JSON.parse(readFileSync(JSONP, 'utf8'));
        data.comments = arr;
        writeFileSync(JSONP + '.bak', readFileSync(JSONP, 'utf8'));
        writeFileSync(JSONP, JSON.stringify(data, null, 2));
        build(); // refresh the seeded window.KITCOMMENTS; no reload broadcast (already applied client-side)
        send(res, 200, 'application/json', JSON.stringify({ ok: true, count: arr.length }));
        console.log('✓ comments saved (' + arr.length + ')');
      } catch (e) {
        send(res, 400, 'application/json', JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // static
  // default page: the folder's built kit (wordmark-named), whatever it's called
  let rel = url;
  if (url === '/') {
    const kit = readdirSync(DIR).find((f) => f.endsWith('-launch-kit.html'));
    rel = '/' + (kit || 'index.html');
  }
  const file = normalize(join(DIR, rel));
  if (!file.startsWith(DIR)) return send(res, 403, 'text/plain', 'forbidden');
  if (!existsSync(file) || statSync(file).isDirectory()) return send(res, 404, 'text/plain', 'not found');
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(readFileSync(file));
});

try { build(); console.log('✓ initial build OK'); } catch (e) { console.error('initial build failed:', e.message); }
server.listen(PORT, '127.0.0.1', () => {
  console.log('PMM OS Launch Kit editor → http://127.0.0.1:' + PORT);
  console.log('Edit in the page (top-bar “Edit”) → Save → writes kit-content.json + rebuilds + live-reloads.');
});
