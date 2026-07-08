/**
 * Block registry — the uniform block model's contract layer (Phase 1).
 *
 * Each block type declares how it renders to HTML, to markdown, and (later)
 * how it edits. build-kit.mjs dispatches through this registry instead of a
 * type-switch. The render/markdown bodies are byte-exact copies of the old
 * build-kit branches, so output is unchanged.
 *
 * A block today is `{ type?, id?, ...fields }` — fields stay top-level (so the
 * existing data-path scheme and the live editor are untouched). `resolveType`
 * accepts either an explicit `type` or infers it from the field signature, so
 * pre-migration blocks and editor-inserted blocks both render.
 *
 * ctx = { esc, attr, strip, widget, widgetMd } is injected by build-kit so the
 * registry stays dependency-free and the widget templates live in one place.
 */

// Field signature → type. Order mirrors the original if/else precedence.
const DETECT = [
  ['heading', (b) => b.h != null],
  ['code', (b) => b.code != null],
  ['text', (b) => b.p != null],
  ['callout', (b) => b.callout != null],
  ['keyvalue', (b) => b.kv != null],
  ['table', (b) => b.table != null],
  ['rows', (b) => b.rows != null],
  ['list', (b) => b.list != null],
  ['chips', (b) => b.chips != null],
  ['flow', (b) => b.flow != null],
  ['tree', (b) => b.tree != null],
  ['statline', (b) => b.statline != null],
  ['evidence', (b) => b.evidence != null],
  ['copy', (b) => b.copy != null],
  ['todo', (b) => b.todo != null],
  ['quote', (b) => b.quote != null],
  ['divider', (b) => b.divider != null],
  ['toggle', (b) => Array.isArray(b.children)],
  ['widget', (b) => b.widget != null]
];

export function resolveType(b) {
  if (b && typeof b.type === 'string' && REGISTRY[b.type]) return b.type;
  for (const [name, test] of DETECT) { if (test(b)) return name; }
  return null;
}

export const REGISTRY = {
  heading: {
    detect: (b) => b.h != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; const lvl = (b.level === 1 || b.level === 2 || b.level === 3) ? b.level : 2; return `<div class="h lvl${lvl}"${dp('h')}>${b.h}</div>`; },
    markdown: (b, x) => `${'#'.repeat((b.level === 1 || b.level === 2 || b.level === 3) ? b.level : 3)} ${x.strip(b.h)}`
  },
  code: {
    detect: (b) => b.code != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<pre class="code"><code${dp('code')}>${x.esc(b.code)}</code></pre>`; },
    markdown: (b, x) => '```' + (b.lang || '') + '\n' + b.code + '\n```'
  },
  text: {
    detect: (b) => b.p != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<p${dp('p')}>${b.p}</p>`; },
    markdown: (b, x) => x.strip(b.p)
  },
  callout: {
    detect: (b) => b.callout != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<div class="callout${b.variant === 'warn' ? ' warn' : ''}"${dp('callout')}>${b.callout}</div>`; },
    markdown: (b, x) => `> ${x.strip(b.callout)}`
  },
  keyvalue: {
    detect: (b) => b.kv != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<dl class="kv">${b.kv.map(([k, v], j) => `<dt>${k}</dt><dd${dp('kv.' + j + '.1')}>${v}</dd>`).join('')}</dl>`; },
    markdown: (b, x) => b.kv.map(([k, v]) => `- **${x.strip(k)}:** ${x.strip(v)}`).join('\n')
  },
  table: {
    detect: (b) => b.table != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<table><thead><tr>${b.table.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td${dp('table.rows.' + ri + '.' + ci)}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`; },
    markdown: (b, x) => [`| ${b.table.head.join(' | ')} |`, `| ${b.table.head.map(() => '---').join(' | ')} |`, ...b.table.rows.map((r) => `| ${r.map(x.strip).join(' | ')} |`)].join('\n')
  },
  rows: {
    detect: (b) => b.rows != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<div class="rows">${b.rows.map((r, j) => `<div class="row${r.detail ? ' sel-able" data-detail="' + x.attr(r.detail) + '"' : '"'}><div><div class="t"${dp('rows.' + j + '.t')}>${r.t}</div>${r.d ? `<div class="d"${dp('rows.' + j + '.d')}>${r.d}</div>` : ''}</div><div class="meta">${r.meta || ''}</div></div>`).join('')}</div>`; },
    markdown: (b, x) => b.rows.map((r) => `- **${x.strip(r.t)}**${r.d ? ' — ' + x.strip(r.d) : ''}${r.meta ? ` _(${x.strip(r.meta)})_` : ''}`).join('\n')
  },
  list: {
    detect: (b) => b.list != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<ul class="list">${b.list.map((y, j) => `<li${dp('list.' + j)}>${y}</li>`).join('')}</ul>`; },
    markdown: (b, x) => b.list.map((y) => `- ${x.strip(y)}`).join('\n')
  },
  chips: {
    detect: (b) => b.chips != null,
    render: (b, p, x) => `<div>${b.chips.map((y) => `<span class="chip">${y}</span>`).join('')}</div>`,
    markdown: (b, x) => b.chips.map(x.strip).join(' · ')
  },
  flow: {
    detect: (b) => b.flow != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<div class="flow">${b.flow.map(([n, t], j) => `<div class="step"><div class="sn">${n}</div><div class="st"${dp('flow.' + j + '.1')}>${t}</div></div>`).join('')}</div>`; },
    markdown: (b, x) => b.flow.map(([n, t]) => `${n}. ${x.strip(t)}`).join('\n')
  },
  tree: {
    detect: (b) => b.tree != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<div class="tree"${dp('tree')}>${x.esc(b.tree)}</div>`; },
    markdown: (b, x) => '```\n' + b.tree + '\n```'
  },
  statline: {
    detect: (b) => b.statline != null,
    render: (b, p, x) => `<div class="stats" style="gap:32px">${b.statline.map(([n, l]) => `<div><div class="n" style="font-size:22px">${n}</div><div class="l">${l}</div></div>`).join('')}</div>`,
    markdown: (b, x) => b.statline.map(([n, l]) => `- **${n}** — ${l}`).join('\n')
  },
  copy: {
    detect: (b) => b.copy != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<div class="copyline"><span${dp('copy.0')}>${b.copy[0]}</span><button class="cbtn" data-copy="${x.attr(b.copy[1])}">Copy</button></div>`; },
    markdown: (b, x) => `> ${x.strip(b.copy[1])}`
  },
  todo: {
    detect: (b) => b.todo != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<ul class="todo">${b.todo.map((t, j) => `<li class="todoi${t[1] ? ' done' : ''}"><input type="checkbox" class="todock" data-todo="${p}.todo.${j}"${t[1] ? ' checked' : ''}><span${dp('todo.' + j + '.0')}>${t[0]}</span></li>`).join('')}</ul>`; },
    markdown: (b, x) => b.todo.map((t) => `- [${t[1] ? 'x' : ' '}] ${x.strip(t[0])}`).join('\n')
  },
  quote: {
    detect: (b) => b.quote != null,
    render: (b, p, x) => { const dp = (s) => ` data-path="${p}.${s}"`; return `<blockquote${dp('quote')}>${b.quote}</blockquote>`; },
    markdown: (b, x) => `> ${x.strip(b.quote)}`
  },
  divider: {
    detect: (b) => b.divider != null,
    render: (b, p, x) => `<hr class="divider"/>`,
    markdown: (b, x) => '---'
  },
  toggle: {
    detect: (b) => Array.isArray(b.children),
    render: (b, p, x) => {
      const body = (b.children || []).map((c, i) => x.block(c, p + '.children.' + i)).join('');
      return `<div class="toggle"><div class="tgl-head"><button class="tgl-x" aria-label="Collapse">▾</button><div class="tgl-title" data-path="${p}.title">${b.title || ''}</div></div><div class="tgl-body">${body}</div></div>`;
    },
    markdown: (b, x) => `**${x.strip(b.title || '')}**\n\n` + (b.children || []).map((c) => x.blockMd(c)).filter(Boolean).join('\n\n')
  },
  evidence: {
    detect: (b) => b.evidence != null,
    render: (b, p, x) => {
      const items = b.evidence.map((e, j) => {
        const who = e.who ? `<span class="ev-who">${e.who}</span>` : '';
        const metric = e.metric ? `<span class="ev-metric">${x.esc(e.metric)}</span>` : '';
        const link = e.url
          ? `<a class="ev-src" href="${x.attr(e.url)}" target="_blank" rel="noopener noreferrer">${x.esc(e.src || 'source')} ↗</a>`
          : `<span class="ev-src ev-nolink">${x.esc(e.src || 'source')}</span>`;
        return `<li class="ev"><span class="ev-n">${j + 1}</span><div class="ev-body"><span class="ev-q" data-path="${p}.evidence.${j}.q">${e.q}</span><div class="ev-meta">${who}${metric}${link}</div></div></li>`;
      }).join('');
      return `<ol class="evidence">${items}</ol>`;
    },
    markdown: (b, x) => b.evidence.map((e, j) => `${j + 1}. "${x.strip(e.q)}" — ${x.strip(e.who || e.src || '')}${e.url ? ` <${e.url}>` : (e.src && e.who ? ` (${x.strip(e.src)})` : '')}`).join('\n')
  },
  widget: {
    detect: (b) => b.widget != null,
    render: (b, p, x) => x.widget(b.widget),
    markdown: (b, x) => x.widgetMd(b.widget)
  }
};

/* ---------------- Phase 2: editor metadata (slash menu + "turn into") ----------------
   Declared here so the slash menu and transform graph are registry-driven: the
   client reads window.KITBLOCKMENU / window.KITTRANSFORM (serialized by build-kit),
   so adding an insertable/convertible type is a one-line change here. */
const SLASH_META = {
  text: { label: 'Text', icon: '¶', blank: () => ({ p: 'New text' }) },
  h1: { type: 'heading', label: 'Heading 1', icon: 'H1', blank: () => ({ h: 'Heading 1', level: 1 }) },
  h2: { type: 'heading', label: 'Heading 2', icon: 'H2', blank: () => ({ h: 'Heading 2', level: 2 }) },
  h3: { type: 'heading', label: 'Heading 3', icon: 'H3', blank: () => ({ h: 'Heading 3', level: 3 }) },
  todo: { label: 'To-do list', icon: '☑', blank: () => ({ todo: [['New to-do', false]] }) },
  list: { label: 'Bulleted list', icon: '•', blank: () => ({ list: ['New item'] }) },
  table: { label: 'Table', icon: '⊞', blank: () => ({ table: { head: ['Column A', 'Column B', 'Column C'], rows: [['', '', ''], ['', '', '']] } }) },
  callout: { label: 'Callout', icon: '!', blank: () => ({ callout: 'New callout' }) },
  code: { label: 'Code', icon: '{}', blank: () => ({ code: 'command --flag' }) },
  quote: { label: 'Quote', icon: '❝', blank: () => ({ quote: 'New quote' }) },
  evidence: { label: 'Evidence', icon: '“', blank: () => ({ evidence: [{ q: 'Verbatim quote', who: '@handle', src: 'X' }] }) },
  divider: { label: 'Divider', icon: '—', blank: () => ({ divider: true }) },
  toggle: { label: 'Toggle list', icon: '▸', blank: () => ({ title: 'Toggle', children: [{ type: 'text', p: 'Hidden detail — click ▾ to collapse.' }] }) }
};
const TRANSFORM = {
  text: ['heading', 'quote', 'callout', 'todo', 'list', 'code'],
  heading: ['text', 'quote', 'callout'],
  quote: ['text', 'callout', 'heading'],
  callout: ['text', 'quote', 'heading'],
  list: ['todo', 'text'],
  todo: ['list', 'text'],
  code: ['text', 'quote']
};
for (const [t, m] of Object.entries(SLASH_META)) { if (REGISTRY[t]) { REGISTRY[t].slash = { label: m.label, icon: m.icon }; REGISTRY[t].blank = m.blank; } }
for (const [t, to] of Object.entries(TRANSFORM)) { if (REGISTRY[t]) REGISTRY[t].transform = to; }

/** insertable blocks for the slash menu — { type, label, icon, template }.
    An entry may alias a registry type via `type` (h1/h2/h3 → heading with a level). */
export function blockMenu() {
  return Object.entries(SLASH_META).filter(([t, m]) => REGISTRY[m.type || t]).map(([t, m]) => ({
    type: m.type || t, label: m.label, icon: m.icon,
    template: Object.assign({ type: m.type || t }, m.blank())
  }));
}
/** which types each type can "turn into" */
export function transformMap() { return JSON.parse(JSON.stringify(TRANSFORM)); }

/** the primary text carried by any text-ish block */
export function textOf(b) {
  if (b.h != null) return b.h;
  if (b.p != null) return b.p;
  if (b.quote != null) return b.quote;
  if (b.callout != null) return b.callout;
  if (b.code != null) return b.code;
  if (Array.isArray(b.list)) return b.list.join('\n');
  if (Array.isArray(b.todo)) return b.todo.map((t) => t[0]).join('\n');
  return '';
}
function listOf(b) {
  if (Array.isArray(b.list)) return b.list.slice();
  if (Array.isArray(b.todo)) return b.todo.map((t) => t[0]);
  const t = textOf(b); return t ? t.split('\n') : [''];
}
/** convert a block to another type, preserving its id + text content */
export function convert(b, to) {
  const keep = b.id ? { id: b.id } : {};
  if (to === 'heading') return Object.assign({ type: 'heading' }, keep, { h: textOf(b) });
  if (to === 'text') return Object.assign({ type: 'text' }, keep, { p: textOf(b) });
  if (to === 'quote') return Object.assign({ type: 'quote' }, keep, { quote: textOf(b) });
  if (to === 'callout') return Object.assign({ type: 'callout' }, keep, { callout: textOf(b) });
  if (to === 'list') return Object.assign({ type: 'list' }, keep, { list: listOf(b) });
  if (to === 'todo') return Object.assign({ type: 'todo' }, keep, { todo: listOf(b).map((t) => [t, false]) });
  if (to === 'code') return Object.assign({ type: 'code' }, keep, { code: textOf(b).replace(/<[^>]+>/g, '') });
  return b;
}
