#!/usr/bin/env node
/**
 * report-to-kit.mjs — hydrate a launch kit FROM a structured, cited research report.
 *
 * This is the "research → dashboard" plumbing: it takes the structured findings a
 * research run produces (insight → evidence[cited] → implication, per desk) and
 * composes the two-altitude desk views (Briefing + Full research report + Artifact),
 * a GTM strategy readout (answer-first / Minto), and an Evidence Appendix — so every
 * claim on the dashboard is traceable to a clickable source.
 *
 * Usage:  node report-to-kit.mjs <target-dir>
 *   reads  <target-dir>/.agents/research/report.json   (the structured report)
 *          <target-dir>/kit-content.json                (existing kit — artifacts preserved)
 *   writes <target-dir>/kit-content.json                (hydrated, in place)
 *
 * Design: the report supplies the MEAT (cited findings). The existing kit supplies the
 * ARTIFACTS (its table/rows blocks — matrix, battlecards, pricing table, etc.), which are
 * preserved and placed after the meat. Prose-only finding blocks are replaced by the
 * cited report. Idempotent: re-running regenerates from report.json + preserved artifacts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIR = resolve(process.argv[2] || '.');
const KIT = join(DIR, 'kit-content.json');
const REPORT = join(DIR, '.agents', 'research', 'report.json');

const C = JSON.parse(readFileSync(KIT, 'utf8'));
const R = JSON.parse(readFileSync(REPORT, 'utf8'));

// desk id (from the research run) → kit view id (in the dashboard)
const DESK_VIEW = {
  product: 'v-product', customer: 'v-personas', competitive: 'v-competitive',
  market: 'v-market', pricing: 'v-pricing', channels: 'v-channels',
  analysts: 'v-analysts', gtmdesk: 'v-gtm'
};

const esc = (s) => String(s == null ? '' : s);
// an artifact block = a table or a selectable rows block (matrix, battlecards, pricing, KOL…)
const isArtifact = (b) => b && (b.table != null || (Array.isArray(b.rows) && b.rows.some((r) => r && r.detail)));

/** compose the meat (briefing + full research report) for one desk from its structured report */
function meatBlocks(d) {
  const out = [];
  // — Briefing altitude (BLUF as a bold lead paragraph + highlights — NOT a card) —
  if (d.briefingBluf) out.push({ p: '<b>Bottom line.</b> ' + esc(d.briefingBluf) });
  if (Array.isArray(d.highlights) && d.highlights.length) out.push({ list: d.highlights.map(esc) });
  out.push({ divider: true });
  // — Full research report (the meat) —
  out.push({ h: 'Full research report', level: 2 });
  const om = [];
  if (d.objective) om.push(['Objective', esc(d.objective)]);
  if (d.method) om.push(['Method', esc(d.method)]);
  if (om.length) out.push({ kv: om });
  (d.findings || []).forEach((f, i) => {
    out.push({ h: (i + 1) + ' · ' + esc(f.insight), level: 3 });
    const ev = (f.evidence || []).filter((e) => e && e.q).map((e) => {
      const o = { q: esc(e.q) };
      if (e.who) o.who = esc(e.who);
      if (e.src) o.src = esc(e.src);
      if (e.url) o.url = esc(e.url);
      if (e.metric) o.metric = esc(e.metric);
      return o;
    });
    if (ev.length) out.push({ evidence: ev });
    if (f.implication) out.push({ p: '<span class="small muted">↳ <b>Implication:</b> ' + esc(f.implication) + '</span>' });
  });
  if (d.analysis) { out.push({ h: 'Analysis', level: 2 }); out.push({ p: esc(d.analysis) }); }
  return out;
}

/** rebuild each desk view: meat → preserved artifact → gaps */
let hydrated = 0;
for (const d of (R.desks || [])) {
  const vid = DESK_VIEW[d.id];
  const view = vid && C.views[vid];
  if (!view) continue;
  const artifacts = (view.blocks || []).filter(isArtifact);
  const blocks = meatBlocks(d);
  if (artifacts.length) { blocks.push({ divider: true }); blocks.push({ h: 'Artifact', level: 2 }); blocks.push(...artifacts); }
  if (d.gaps) blocks.push({ callout: '<b>Gaps &amp; verify.</b> ' + esc(d.gaps), variant: 'warn' });
  view.blocks = blocks;
  view.sub = (view.sub || '').replace(/Meat-first[^.]*\.\s*/, '') ; // keep sub but drop stale meta if present
  hydrated++;
}

/** events desk — real, cited, scoped events table (links in cells) */
if (Array.isArray(R.events) && R.events.length && C.views['v-events']) {
  const ev = R.events.slice().sort((a, b) => String(a.area).localeCompare(String(b.area)));
  const rows = ev.map((e) => [
    e.url ? '<a href="' + esc(e.url).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">' + esc(e.event) + ' ↗</a>' : esc(e.event),
    esc(e.area), [e.date, e.quarter].filter(Boolean).map(esc).join(' · '), esc(e.audience), esc(e.fit)
  ]);
  C.views['v-events'].blocks = [
    { callout: '<b>Real, scoped sweep.</b> ' + ev.length + ' Southern California career events found via live web search — scoped by area (LA County, Long Beach, San Diego, OC/IE) and quarter. Click any event to open its source.', variant: 'warn' },
    { table: { head: ['Event ↗', 'Area', 'When', 'Audience', 'Why it fits'], rows } },
    { p: '<span class="small muted">Two motions: be where job seekers gather (campus + city fairs) and where the B2B buyer gathers (career centers / NACE). Product Hunt anchors the online launch.</span>' }
  ];
  C.views['v-events'].sub = ev.length + ' real SoCal career events, scoped by area + quarter, each linked to its source — the field-marketing target list.';
}

/** GTM strategy readout — answer-first (Minto / SCQA) stakeholder presentation */
if (R.gtm) {
  const g = R.gtm;
  const blocks = [];
  if (g.answer) blocks.push({ p: '<b>Recommendation (answer-first).</b> ' + esc(g.answer) });
  blocks.push({ h: 'The set-up (SCQA)' });
  blocks.push({ kv: [
    ['Situation', esc(g.situation)], ['Complication', esc(g.complication)],
    ['Question', esc(g.question)], ['Answer', esc(g.answer)]
  ].filter((r) => r[1]) });
  if (Array.isArray(g.segmentation) && g.segmentation.length) {
    blocks.push({ h: 'Segmentation & targeting' });
    blocks.push({ table: { head: ['Segment', 'Priority', 'Why'], rows: g.segmentation.map((s) => [esc(s.segment), esc(s.priority), esc(s.why)]) } });
  }
  const pm = [];
  if (g.positioning) pm.push(['Positioning', esc(g.positioning)]);
  if (g.motion) pm.push(['GTM motion', esc(g.motion)]);
  if (pm.length) blocks.push({ kv: pm });
  if (g.plan) {
    blocks.push({ h: 'The plan' });
    if (g.plan.pre && g.plan.pre.length) { blocks.push({ p: '<b>Pre-launch</b>' }); blocks.push({ list: g.plan.pre.map(esc) }); }
    if (g.plan.launch && g.plan.launch.length) { blocks.push({ p: '<b>Launch</b>' }); blocks.push({ list: g.plan.launch.map(esc) }); }
    if (g.plan.post && g.plan.post.length) { blocks.push({ p: '<b>Post-launch</b>' }); blocks.push({ list: g.plan.post.map(esc) }); }
  }
  if (Array.isArray(g.metrics) && g.metrics.length) {
    blocks.push({ h: 'How we measure it' });
    blocks.push({ table: { head: ['Stage', 'Metric'], rows: g.metrics.map((m) => [esc(m.stage), esc(m.metric)]) } });
  }
  if (Array.isArray(g.risks) && g.risks.length) {
    blocks.push({ h: 'Risks & mitigations' });
    blocks.push({ table: { head: ['Risk', 'Mitigation'], rows: g.risks.map((m) => [esc(m.risk), esc(m.mitigation)]) } });
  }
  if (Array.isArray(g.asks) && g.asks.length) {
    blocks.push({ callout: '<b>What we need to proceed.</b> ' + g.asks.map(esc).join(' · '), variant: 'warn' });
  }
  C.views['v-gtm-readout'] = {
    eyebrow: 'GTM Strategy · stakeholder readout', title: 'GTM readout', h1: 'GTM strategy readout',
    sub: 'The answer-first stakeholder presentation (Minto Pyramid / SCQA): the recommendation, the segmentation, the plan, the metrics, the risks, the asks.',
    blocks
  };
}

/** Deliverables — the one-pager suite (deliverable-standard.md: answer-first, one page, one decision).
    Reads .agents/research/deliverables.json when present: [{ id, title, artifact, governingThought,
    reviewed?, blocks[], working?[] }] — blocks are ordinary registry blocks composed by the generator
    against the one-pager templates. Each deliverable = a one-pager view (+ optional working doc view,
    linked from the page, not the sidebar — the menu stays tight). Idempotent via deterministic ids. */
{
  const DELIV = join(DIR, '.agents', 'research', 'deliverables.json');
  let D = null;
  try { D = JSON.parse(readFileSync(DELIV, 'utf8')); } catch { /* no deliverables yet — fine */ }
  const items = (D && (D.deliverables || D)) || [];
  let built = 0;
  for (const d of (Array.isArray(items) ? items : [])) {
    if (!d || !d.id || !Array.isArray(d.blocks)) continue;
    const opId = 'v-op-' + d.id, wdId = 'v-wd-' + d.id;
    const blocks = [];
    if (d.governingThought) blocks.push({ p: '<b>' + esc(d.governingThought) + '</b>' });
    blocks.push(...d.blocks);
    if (Array.isArray(d.working) && d.working.length) {
      blocks.push({ p: '<span class="small muted"><a href="#' + wdId + '">Working doc — the full reasoning behind this page →</a></span>' });
      C.views[wdId] = {
        eyebrow: 'Working doc · ' + esc(d.title), title: esc(d.title) + ' — working doc', h1: esc(d.title) + ' — working doc',
        sub: 'The reasoning behind the one-pager: full analysis, claims @-linked to findings. The one-pager is at ' + esc(d.artifact || d.title) + '.',
        blocks: [{ callout: 'This backs the <a href="#' + opId + '"><b>' + esc(d.title) + ' one-pager</b></a> — read that first; drill here for the why.' }, ...d.working]
      };
    }
    C.views[opId] = {
      eyebrow: 'Deliverable · ' + esc(d.artifact || 'one-pager'), title: esc(d.title), h1: esc(d.title),
      sub: (d.reviewed ? 'Reviewed ' + esc(d.reviewed) + ' · ' : '') + 'One page, one decision — per the deliverable standard. Claims link to the findings that back them.',
      blocks
    };
    ensureNav('Deliverables', ['▤', esc(d.title), opId]);
    built++;
  }
  if (built) console.log('  deliverables: ' + built + ' one-pager(s) hydrated');
}

/** Research index — one client-side source of truth for database views + the side peek.
    Slim rows into C.data.research: findings (with sourced counts), sources (deduped by url+quote,
    each carrying backs[] = the findings it supports), events. */
{
  C.data = C.data || {};
  const findings = [], sources = [], smap = new Map();
  for (const d of (R.desks || [])) {
    const vid = DESK_VIEW[d.id] || '';
    let n = 0;
    for (const f of (d.findings || [])) {
      n++;
      const fid = 'f-' + d.id + '-' + n;
      const ev = (f.evidence || []).filter((e) => e && e.q);
      findings.push({ id: fid, desk: d.id, deskTitle: esc(d.title || d.id), view: vid,
        insight: esc(f.insight || ''), implication: esc(f.implication || ''),
        evTotal: ev.length, sourced: ev.filter((e) => e.url).length });
      for (const e of ev) {
        const key = (e.url || '') + '|' + String(e.q).slice(0, 80);
        let s = smap.get(key);
        if (!s) {
          s = { id: 's-' + (smap.size + 1), q: esc(e.q), who: esc(e.who || ''), src: esc(e.src || ''),
                url: esc(e.url || ''), metric: esc(e.metric || ''), date: esc(e.date || ''), backs: [] };
          smap.set(key, s); sources.push(s);
        }
        s.backs.push({ id: fid, insight: esc(String(f.insight || '').slice(0, 120)), view: vid });
      }
    }
  }
  const events = (R.events || []).map((e) => ({ event: esc(e.event || ''), area: esc(e.area || ''),
    date: esc(e.date || ''), quarter: esc(e.quarter || ''), audience: esc(e.audience || ''),
    fit: esc(e.fit || ''), url: esc(e.url || '') }));
  C.data.research = { findings, sources, events };

  /** Database views (the cross-cutting slicers). Events desk view becomes the interactive
      events database (one table, now filterable) instead of a duplicate static table. */
  C.views['v-db-findings'] = { eyebrow: 'Database · Research', title: 'Findings', h1: 'Findings',
    sub: findings.length + ' findings across ' + (R.desks || []).length + ' desks. Filter by desk or sourced status; click a row to peek.',
    blocks: [{ widget: 'db-findings' }] };
  C.views['v-db-sources'] = { eyebrow: 'Database · Research', title: 'Evidence / Sources', h1: 'Evidence / Sources',
    sub: sources.length + ' deduped sources behind every claim in this kit. Click a row to peek; open the original from the peek.',
    blocks: [{ widget: 'db-sources' }] };
  if (events.length && C.views['v-events']) {
    C.views['v-events'].blocks = [
      { callout: '<b>Real, scoped sweep.</b> ' + events.length + ' events found via live web search — filter by area and quarter; click a row to peek and open its source listing.', variant: 'warn' },
      { widget: 'db-events' },
      { p: '<span class="small muted">Two motions: where job seekers gather (campus + city fairs) and where the B2B buyer gathers (career centers / NACE).</span>' }
    ];
    C.views['v-events'].sub = events.length + ' events, scoped by area + quarter, each linked to its source — the field-marketing target list.';
  }
}

/** Evidence appendix — every cited source, grouped by desk, all clickable */
{
  const blocks = [{ p: '<b>Chain of evidence.</b> Every finding above traces to a source here. Click any to open the original Reddit thread, tweet, video, repo, or page. Findings without a link were synthesized or the source wasn’t captured — flagged in each desk’s gaps.' }];
  let total = 0;
  for (const d of (R.desks || [])) {
    const cites = (d.findings || []).flatMap((f) => (f.evidence || []).filter((e) => e && e.q && (e.url || e.who)));
    if (!cites.length) continue;
    blocks.push({ h: (d.title || d.id) });
    blocks.push({ evidence: cites.map((e) => {
      const o = { q: esc(e.q) }; if (e.who) o.who = esc(e.who); if (e.src) o.src = esc(e.src); if (e.url) o.url = esc(e.url); if (e.metric) o.metric = esc(e.metric); return o;
    }) });
    total += cites.length;
  }
  if (R.verify && R.verify.suspect && R.verify.suspect.length) {
    blocks.push({ callout: '<b>Citation check flagged ' + R.verify.suspect.length + ' source(s) to re-verify:</b> ' + R.verify.suspect.map((s) => esc(s.url) + ' (' + esc(s.reason) + ')').join('; '), variant: 'warn' });
  } else if (R.verify) {
    blocks.push({ callout: '<b>Citation check passed</b> — ' + (R.verify.checked || total) + ' sources spot-checked, none flagged as fabricated.' });
  }
  C.views['v-evidence'] = {
    eyebrow: 'Appendix · evidence', title: 'Evidence appendix', h1: 'Evidence appendix',
    sub: total + ' cited sources across the desks — the traceable backbone of every claim in this kit.', blocks
  };
}

/** splice the two new views into the sidebar (idempotent) */
function ensureNav(group, item) {
  let g = C.sidebar.find((x) => x.group === group);
  if (!g) { g = { group, items: [] }; C.sidebar.push(g); }
  if (!g.items.some((it) => it[2] === item[2])) g.items.push(item);
}
ensureNav('Go-to-market', ['▶', 'GTM readout', 'v-gtm-readout']);
ensureNav('Appendix', ['§', 'Evidence', 'v-evidence']);

/** Sidebar IA — rebuild wholesale to the card-sort structure (answer-first top, then the
    Research / Strategy / Deliverables zones, Appendix last). Items carry no index chip —
    zone headers + labels do the work. Only views that exist are listed; idempotent. */
{
  const nav = (label, vid) => (C.views[vid] ? ['', label, vid] : null);
  const delivGroup = C.sidebar.find((x) => x.group === 'Deliverables');
  const delivItems = (delivGroup ? delivGroup.items : []).map((it) => ['', it[1], it[2]]);
  C.sidebar = [
    { group: 'Overview', items: [nav('Overview', 'v-overview'), nav('Executive summary', 'v-exec'), nav('GTM readout', 'v-gtm-readout')].filter(Boolean) },
    { group: 'Research', items: [
        nav('Product desk', 'v-product'), nav('Customer desk', 'v-personas'), nav('Competitive desk', 'v-competitive'),
        nav('Market desk', 'v-market'), nav('Pricing desk', 'v-pricing'), nav('Channels desk', 'v-channels'),
        nav('KOL desk', 'v-analysts'), nav('GTM desk', 'v-gtm'), nav('Events desk', 'v-events'),
        nav('Findings', 'v-db-findings'), nav('Evidence / Sources', 'v-db-sources')
      ].filter(Boolean) },
    { group: 'Strategy', items: [
        nav('Positioning', 'v-positioning'), nav('Messaging', 'v-messaging'), nav('Narrative', 'v-narrative'),
        nav('Campaign', 'v-campaign'), nav('Launch plan', 'v-launch'), nav('PLG & loops', 'v-plg'), nav('Coach review', 'v-coach')
      ].filter(Boolean) },
    ...(delivItems.length ? [{ group: 'Deliverables', items: delivItems }] : []),
    { group: 'Appendix', items: [nav('Exports', 'v-exports'), nav('Evidence appendix', 'v-evidence')].filter(Boolean) }
  ].filter((g) => g.items.length);
}

writeFileSync(KIT, JSON.stringify(C, null, 2) + '\n');
console.log('✓ hydrated ' + hydrated + ' desk views + GTM readout + evidence appendix from report.json → kit-content.json');
console.log('  events: ' + ((R.events || []).length) + ' · desks: ' + ((R.desks || []).length) + ' · citations: ' + (R.counts ? R.counts.citations : '?'));
