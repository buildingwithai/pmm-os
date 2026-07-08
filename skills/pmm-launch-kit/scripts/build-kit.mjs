#!/usr/bin/env node
/**
 * PMM OS Launch Kit — static generator.
 * Single source of truth: kit-content.json
 * Run:  node build-kit.mjs [target-dir]
 *   - templates (.kit-style.css/.kit-app.js) + registry load from THIS script's dir
 *   - kit-content.json + all outputs read/written in [target-dir] (default: this dir)
 *   so a launch can build the kit in its own folder WITHOUT copying the generator.
 * Emits:  <wordmark>-launch-kit.html   (the interactive app, name derived from meta)
 *         generated-docs/*.md           (markdown mirror of each section)
 *         deck.md                       (Marp slide deck)
 * Zero dependencies (Node built-ins only).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGISTRY, resolveType, blockMenu, transformMap } from './block-registry.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));   // templates + registry live here
const DIR = process.argv[2] ? resolve(process.argv[2]) : SCRIPT_DIR;  // content + outputs live here
const C = JSON.parse(readFileSync(join(DIR, 'kit-content.json'), 'utf8'));
const slug = (s) => String(s || 'launch').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'launch';
const OUT_HTML = slug(C.meta && C.meta.wordmark) + '-launch-kit.html';

/* ---------------- helpers ---------------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/\s+/g, ' ').trim();

/* injected into each block's render/markdown so the registry stays dep-free
   (block + blockMd let container blocks like `toggle` render their children) */
const CTX = { esc, attr, strip, widget, widgetMd, block, blockMd };

/* ---------------- block → HTML ----------------
   `p` is the JSON path to this block (e.g. views.v-product.blocks.1).
   Editable text elements carry data-path so the live editor can write back. */
function block(b, p) {
  const t = resolveType(b);
  return t && REGISTRY[t] ? REGISTRY[t].render(b, p, CTX) : '';
}
const blocks = (arr, base) => (arr || []).map((b, i) => `<div class="blk" data-block="${base}.blocks.${i}" data-bid="${b.id || ''}">${block(b, base + '.blocks.' + i)}</div>`).join('\n        ');

function widget(name) {
  switch (name) {
    case 'stats': return '<div class="stats" data-w="stats"></div>';
    case 'kitrows': return '<div class="rows" data-w="kitrows"></div>';
    case 'taglines': return '<div data-w="taglines"></div>';
    case 'msgvariants': return '<div class="tabs" data-w="msgtabs"></div><div class="copyline" data-w="msgvariant"></div>';
    case 'pricing': return '<div class="seg" data-w="billtoggle"><button class="active" data-b="mo">Monthly</button><button data-b="yr">Annual −20%</button></div><table data-w="pricetable" style="margin-top:12px"></table>';
    case 'calculator': { const cal = (C.data && C.data.calculator) || {}; const unit = esc(cal.unit || 'unit'); const unitCost = Number(cal.unitCost || 0); const ours = Number(cal.ours || 0); const ourLabel = esc(cal.ourLabel || ('$' + ours)); const def = Number(cal.defaultUnits || 3); const prod = esc(cal.product || 'this product'); return '<p class="small" data-w="calculator" data-unitcost="' + unitCost + '" data-ours="' + ours + '">The cost of the status quo, per ' + unit + ': <input id="days" type="number" value="' + def + '" min="0" style="width:78px;background:#15171d;border:1px solid var(--line2);color:var(--ink);border-radius:7px;padding:6px 8px"/> → <b id="rentCost" style="color:var(--good)"></b> vs <b>' + ourLabel + '</b> with ' + prod + '. <span class="muted">Savings: <b id="savings" style="color:var(--good)"></b>.</span></p>'; }
    case 'checklist-launch': return '<div data-w="checklist-launch"></div>';
    case 'checklist-rev': return '<div data-w="checklist-rev"></div>';
    case 'scorecard': return '<div data-w="scorecard"></div>';
    case 'gallery': return '<div class="gal" data-w="gallery"></div>';
    case 'exportFiles': return '<div class="rows" data-w="exportFiles"></div>';
    case 'exportDocs': return '<div class="rows" data-w="exportDocs"></div>';
    case 'db-findings': return '<div class="dbv" data-w="db" data-coll="findings"></div>';
    case 'db-sources': return '<div class="dbv" data-w="db" data-coll="sources"></div>';
    case 'db-events': return '<div class="dbv" data-w="db" data-coll="events"></div>';
    default: return '';
  }
}

/* ---------------- sidebar / views / details ---------------- */
function sidebarHTML() {
  return C.sidebar.map((g) => `<div class="grp">${g.group}</div>\n    <div class="nav">${g.items.map(([ix, label, v]) => `<a href="#${v}" data-v="${v}">${ix ? `<span class="ix">${ix}</span>` : ''}<span class="nl">${label}</span><span class="scnt"></span><span class="sdot"></span></a>`).join('')}</div>`).join('\n    ');
}
function viewsHTML() {
  return Object.entries(C.views).map(([id, v]) => `    <article class="view" id="${id}" data-title="${attr(v.title)}">
      <div class="vhead"><div class="eyebrow">${v.eyebrow}</div><h1>${v.h1}</h1><p class="sub">${v.sub}</p></div>
        ${blocks(v.blocks, 'views.' + id)}
    </article>`).join('\n');
}
function detailsHTML() {
  return Object.entries(C.details).map(([id, d]) => `  <div data-id="${id}" data-eye="${attr(d.eye)}" data-title="${attr(d.title)}">${blocks(d.blocks, 'details.' + id)}</div>`).join('\n');
}

/* ---------------- block → Markdown ---------------- */
function blockMd(b) {
  const t = resolveType(b);
  return t && REGISTRY[t] ? REGISTRY[t].markdown(b, CTX) : '';
}
function widgetMd(name) {
  const d = C.data;
  if (name === 'stats') return d.stats.map((s) => `- **${s[0]}** — ${strip(s[1])}`).join('\n');
  if (name === 'kitrows') return d.kit.map((k) => `- ${k[0]} · ${k[1]}`).join('\n');
  if (name === 'taglines') return d.taglines.map((t) => `- ${strip(t)}`).join('\n');
  if (name === 'msgvariants') return d.msgVariants.map((m) => `- **${m[0]}:** ${strip(m[1])}`).join('\n');
  if (name === 'pricing') return [`| Capability | ${d.pricing.tiers.map((t) => t[0]).join(' | ')} |`, `| --- | ${d.pricing.tiers.map(() => '---').join(' | ')} |`, `| Price (mo) | ${d.pricing.tiers.map((t) => t[1]).join(' | ')} |`, ...d.pricing.features.map((f) => `| ${f.join(' | ')} |`)].join('\n');
  if (name === 'scorecard') return d.scorecard.map((s) => `- ${s[0]}: ${s[1]}/5`).join('\n');
  if (name === 'gallery') return d.gallery.map((g) => `- **${g[0]}** (${g[1]}) — ${strip(g[2])}`).join('\n');
  if (name === 'checklist-launch') return d.launchActs.map((a) => `- [ ] ${strip(a)}`).join('\n');
  if (name === 'checklist-rev') return d.revisions.map((a) => `- [ ] ${strip(a)}`).join('\n');
  if (name === 'calculator') return '_Interactive calculator: rental days × $1,000 vs $9.99._';
  if (name === 'exportFiles') return d.exportFiles.map((e) => `- ${e[0]} — ${e[1]}`).join('\n');
  if (name === 'exportDocs') return d.exportDocs.map((x) => `- ${x}.md`).join('\n');
  if (name === 'db-findings' && d.research) return ['| Finding | Desk | Sourced |', '| --- | --- | --- |',
    ...d.research.findings.map((f) => `| ${strip(f.insight)} | ${f.deskTitle} | ${f.sourced}/${f.evTotal} |`)].join('\n');
  if (name === 'db-sources' && d.research) return d.research.sources.map((s) =>
    `- "${strip(s.q)}" — ${s.who || s.src}${s.url ? ` <${s.url}>` : ' (' + s.src + ')'}${s.metric ? ` · ${s.metric}` : ''} · backs ${s.backs.length} finding(s)`).join('\n');
  if (name === 'db-events' && d.research) return ['| Event | Area | When | Audience |', '| --- | --- | --- | --- |',
    ...d.research.events.map((e) => `| ${strip(e.event)}${e.url ? ` <${e.url}>` : ''} | ${e.area} | ${[e.date, e.quarter].filter(Boolean).join(' · ')} | ${strip(e.audience)} |`)].join('\n');
  return '';
}
function viewMd(id, v) {
  return `# ${strip(v.h1)}\n\n_${strip(v.eyebrow)} · ${strip(v.sub)}_\n\n${(v.blocks || []).map(blockMd).filter(Boolean).join('\n\n')}\n`;
}

/* ---------------- Marp slide deck (registry-driven; → pptx/pdf via marp-cli) ----------------
   A third output target straight from the same blocks: `npx @marp-team/marp-cli deck.md --pptx`
   (or --pdf/--html). Proves the fan-out — adding a target is one serializer over the registry. */
function deckMd() {
  const front = '---\nmarp: true\npaginate: true\ntheme: default\n---\n\n';
  const cover = `<!-- _class: lead -->\n# ${strip(C.meta.wordmark || C.meta.title)}\n\n${strip(C.meta.tagline || '')}`;
  const slides = Object.entries(C.views).map(([id, v]) =>
    `## ${strip(v.h1)}\n\n_${strip(v.sub)}_\n\n${(v.blocks || []).map(blockMd).filter(Boolean).join('\n\n')}`
  );
  return front + [cover, ...slides].join('\n\n---\n\n') + '\n';
}

/* ---------------- CSS + client JS (the app shell) ---------------- */
const CSS = readFileSync(join(SCRIPT_DIR, '.kit-style.css'), 'utf8');
const JS = readFileSync(join(SCRIPT_DIR, '.kit-app.js'), 'utf8');

/* ---------------- assemble ---------------- */
const KITDATA = JSON.stringify(C.data);
const BUILT = new Date().toISOString().slice(0, 16).replace('T', ' ');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(C.meta.title)}</title>
<style>
${CSS}
</style>
</head>
<body>
<header class="toolbar">
  <div class="mark" id="home"><div class="dot">L</div><div><b class="black">${C.meta.wordmark}</b><span>${C.meta.tagline}</span></div></div>
  <div class="sep tb-extra"></div>
  <div class="crumb tb-extra" id="crumb"><b>Overview</b></div>
  <button class="statusbtn tb-extra" id="statusBtn" title="Set section status">no status</button>
  <div class="grow"></div>
  <div class="cmdk tb-extra" id="cmdkBtn"><span class="ph">Search &amp; jump</span><kbd>⌘K</kbd></div>
  <button class="tbtn tb-extra" id="introBtn">Intro</button>
  <button class="tbtn tb-extra" id="notesBtn">Notes</button>
  <button class="tbtn" id="presentBtn">Present</button>
  <button class="tbtn tb-extra" id="pdfBtn">PDF</button>
</header>
<div class="shell">
  <button class="reopen reopen-l" id="reopenL" title="Open sidebar">›</button>
  <button class="reopen reopen-r" id="reopenR" title="Open inspector">‹</button>
  <div class="rsz rsz-l" id="rszL"></div>
  <div class="rsz rsz-r" id="rszR"></div>
  <nav class="sidebar">
    ${sidebarHTML()}
    <div class="sidefoot"><b>Launch-gating:</b> broke-ICP monetization + brand-safety perception. Make consent / AI-label / anti-fraud structural before scaling loops.<br/><span class="dim" style="font-size:10px">build ${BUILT} UTC</span></div>
  </nav>
  <main class="work" id="work">
${viewsHTML()}
  </main>
  <aside class="inspector">
    <div class="instabs"><button class="instab on" id="tabInspect">Inspector</button><button class="instab" id="tabComments">Comments<span class="ct" id="cmtCount"></span></button></div>
    <div id="pane-inspect">
      <div class="ins-head"><div class="eye" id="ins-eye">Inspector</div><h3 id="ins-title">Select an item</h3></div>
      <div id="inspector-body"><p class="muted small">Pick a section, then select a row to inspect its details here.</p></div>
    </div>
    <div id="pane-comments" style="display:none"><div id="comments-body"></div></div>
  </aside>
</div>
<div id="details">
${detailsHTML()}
</div>
<div class="scrim" id="scrim"></div>
<div class="palette" id="palette"><input id="pInput" placeholder="Jump to a section or item…" autocomplete="off"/><div class="pres" id="pRes"></div></div>
<div class="drawer" id="notes">
  <div class="dh">Notebook <button id="notesClose">✕</button></div>
  <div class="db"><div id="noteDoc"></div></div>
  <div class="df"><button class="tbtn" id="notesClear">Clear</button> <span class="muted small">autosaved · type “/” or select text to format</span></div>
</div>
<div class="intro" id="intro">
  <button class="tbtn iskip" id="introSkip">Skip ✕</button>
  <div id="introPanels"></div>
  <div class="icue">scroll ↓</div>
</div>
<div class="deckbar"><button class="tbtn" id="prevSlide">←</button><span class="ct" id="slideCt"></span><button class="tbtn" id="nextSlide">→</button><button class="tbtn on" id="exitPresent">Exit</button></div>
<div id="savePill">Saved ✓</div>
<div class="bubble" id="bubble"><button data-cmd="bold" title="Bold"><b>B</b></button><button data-cmd="italic" title="Italic"><i>I</i></button><button data-cmd="createLink" title="Link">↗</button><button data-cmd="removeFormat" title="Clear">⌫</button></div>
<div class="slash" id="slash"></div>
<div class="cmadd" id="cmAdd">💬 Comment</div>
<div class="cmpop" id="cmPop"><div class="q" id="cmQuote"></div><textarea id="cmText" placeholder="Add a comment…"></textarea><div class="act"><button class="tbtn" id="cmCancel">Cancel</button><button class="tbtn on" id="cmSave">Comment</button></div></div>
<script>window.KIT=${KITDATA};window.KITCOMMENTS=${JSON.stringify(C.comments || [])};window.KITBLOCKMENU=${JSON.stringify(blockMenu())};window.KITTRANSFORM=${JSON.stringify(transformMap())};</script>
<script>
${JS}
</script>
</body>
</html>
`;

writeFileSync(join(DIR, OUT_HTML), html);

mkdirSync(join(DIR, 'generated-docs'), { recursive: true });
let n = 0;
for (const [id, v] of Object.entries(C.views)) { writeFileSync(join(DIR, 'generated-docs', id + '.md'), viewMd(id, v)); n++; }

writeFileSync(join(DIR, 'deck.md'), deckMd());

console.log('✓ built ' + OUT_HTML + ' (' + Math.round(html.length / 1024) + 'KB) in ' + DIR + ' from kit-content.json');
console.log('✓ emitted ' + n + ' markdown mirrors → generated-docs/');
console.log('✓ emitted deck.md (Marp slide deck → pptx/pdf via marp-cli)');
