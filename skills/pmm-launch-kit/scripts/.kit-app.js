(function () {
  "use strict";
  var KIT = window.KIT || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var load = function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var safe = function (fn) { try { fn(); } catch (e) { console.error('[pmm-kit]', e); } };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };

  var VIEWS = $$('.view'), NAV = $$('.nav a'), defaults = {}, curView = 'v-overview', curDetail = null;
  var STATUS = load('kit_status', {}), STORDER = ['none', 'draft', 'review', 'approved'];
  var SLABEL = { none: 'no status', draft: 'draft', review: 'review', approved: 'approved' };
  var fillEl = function (w, html) { var el = $('[data-w="' + w + '"]'); if (el) el.innerHTML = html; return el; };

  /* ---------------- widgets (data-driven from KIT) ---------------- */
  safe(function () { fillEl('stats', (KIT.stats || []).map(function (s) { return '<div><div class="n" data-count="' + s[2] + '">' + s[0] + '</div><div class="l">' + s[1] + '</div></div>'; }).join('')); });

  safe(function () {
    var el = fillEl('kitrows', (KIT.kit || []).map(function (k) { return '<div class="row sel-able" data-go="' + k[2] + '"><div><div class="t">' + k[0] + ' · ' + k[1] + '</div></div><div class="meta">open →</div></div>'; }).join(''));
    if (el) $$('[data-go]', el).forEach(function (r) { r.addEventListener('click', function () { go(r.dataset.go); }); });
  });

  safe(function () {
    var stars = load('kit_stars', {});
    var el = fillEl('taglines', (KIT.taglines || []).map(function (t, i) { return '<div class="copyline"><span><button class="star ' + (stars[i] ? 'on' : '') + '" data-star="' + i + '">★</button> ' + t + '</span><button class="cbtn" data-copy="' + esc(t) + '">Copy</button></div>'; }).join(''));
    if (el) $$('[data-star]', el).forEach(function (s) { s.addEventListener('click', function () { var i = s.dataset.star; stars[i] = !stars[i]; s.classList.toggle('on'); save('kit_stars', stars); }); });
    bindCopy();
  });

  safe(function () {
    var MV = KIT.msgVariants || [];
    fillEl('msgtabs', MV.map(function (m, i) { return '<button class="' + (i ? '' : 'active') + '" data-t="' + i + '">' + m[0] + '</button>'; }).join(''));
    function show(i) { $$('[data-w="msgtabs"] button').forEach(function (b, j) { b.classList.toggle('active', i === j); }); fillEl('msgvariant', '<span>"' + MV[i][1] + '"</span><button class="cbtn" data-copy="' + esc(MV[i][1]) + '">Copy</button>'); bindCopy(); }
    $$('[data-w="msgtabs"] button').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.t); }); });
    if (MV.length) show(0);
  });

  safe(function () {
    var P = KIT.pricing; if (!P) return;
    function render(b) {
      var idx = b === 'mo' ? 1 : 2;
      var html = '<thead><tr><th>Capability</th>' + P.tiers.map(function (t) { return '<th>' + t[0] + '</th>'; }).join('') + '</tr></thead><tbody>';
      html += '<tr><td>Price</td>' + P.tiers.map(function (t) { return '<td class="num"><b style="color:var(--accent)">' + t[idx] + '</b> <span class="dim">/' + (b === 'mo' ? 'mo' : 'yr') + '</span></td>'; }).join('') + '</tr>';
      html += P.features.map(function (f) { return '<tr>' + f.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('');
      var tbl = $('[data-w="pricetable"]'); if (tbl) tbl.innerHTML = html + '</tbody>';
    }
    render('mo');
    $$('[data-w="billtoggle"] button').forEach(function (b) { b.addEventListener('click', function () { $$('[data-w="billtoggle"] button').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); render(b.dataset.b); }); });
  });

  safe(function () {
    var d = $('#days'); if (!d) return;
    function calc() { var c = $('[data-w="calculator"]'); var uc = c ? (+c.dataset.unitcost || 0) : 0, ours = c ? (+c.dataset.ours || 0) : 0; var n = +d.value || 0, r = n * uc; var rc = $('#rentCost'), sv = $('#savings'); if (rc) rc.textContent = '$' + r.toLocaleString(); if (sv) sv.textContent = '$' + (r - ours).toLocaleString(); }
    d.addEventListener('input', calc); calc();
  });

  function checklist(w, key, items) {
    var host = $('[data-w="' + w + '"]'); if (!host) return;
    var done = load(key, {});
    function render() {
      host.innerHTML = items.map(function (a, i) { return '<label class="chk ' + (done[i] ? 'done' : '') + '"><input type="checkbox" data-i="' + i + '" ' + (done[i] ? 'checked' : '') + '><span class="ct">' + a + '</span></label>'; }).join('');
      $$('input[data-i]', host).forEach(function (c) { c.addEventListener('change', function () { done[c.dataset.i] = c.checked; save(key, done); render(); refreshSidebar(); }); });
    }
    render();
  }
  safe(function () { checklist('checklist-launch', 'kit_acts', KIT.launchActs || []); });
  safe(function () { checklist('checklist-rev', 'kit_rev', KIT.revisions || []); });

  safe(function () { fillEl('scorecard', (KIT.scorecard || []).map(function (s) { return '<div class="scrow"><span>' + s[0] + '</span><div class="track"><div class="fill" data-w-fill="' + (s[1] / 5 * 100) + '"></div></div><b style="color:var(--accent)">' + s[1] + '</b></div>'; }).join('')); });
  function animateBars() { $$('[data-w-fill]').forEach(function (f) { f.style.width = f.getAttribute('data-w-fill') + '%'; }); }

  safe(function () {
    var G = KIT.gallery || [];
    var el = fillEl('gallery', G.map(function (g, i) { return '<div class="gframe" data-g="' + i + '"><div class="gpane" style="aspect-ratio:' + g[1].replace(':', '/') + '"><div class="rr">' + g[1] + '</div><div><div class="nm">' + g[0] + '</div><div class="hh">drop a reference here</div></div></div></div>'; }).join(''));
    if (el) $$('.gframe', el).forEach(function (f) { f.addEventListener('click', function () { pickGal(+f.dataset.g); }); });
    defaults['v-gallery'] = { fn: function () { pickGal(0); } };
  });
  function pickGal(i) {
    var g = (KIT.gallery || [])[i]; if (!g) return;
    $('#ins-eye').textContent = 'Image prompt'; $('#ins-title').textContent = g[0] + ' · ' + g[1];
    $('#inspector-body').innerHTML = '<p class="small">' + g[2] + '</p><div class="copyline"><span class="small dim">aspect ' + g[1] + '</span><button class="cbtn" data-copy="' + esc(g[2]) + '">Copy prompt</button></div>'; bindCopy();
    $$('.gframe').forEach(function (f) { f.classList.remove('sel-frame'); }); var fr = $('.gframe[data-g="' + i + '"]'); if (fr) fr.classList.add('sel-frame');
  }

  safe(function () {
    fillEl('exportFiles', (KIT.exportFiles || []).map(function (e) { return '<a class="row sel-able" href="exports/' + e[0] + '" download><div><div class="t">' + e[0] + '</div><div class="d">' + e[1] + '</div></div><div class="meta">⤓</div></a>'; }).join(''));
    fillEl('exportDocs', (KIT.exportDocs || []).map(function (x) { return '<a class="row sel-able" href="' + x + '.md"><div><div class="t">' + x + '.md</div></div><div class="meta">→</div></a>'; }).join(''));
  });

  /* ---------------- research databases + side peek (record → right inspector) ----------------
     KIT.research = { findings[], sources[] (deduped, backs[]), events[] } — strings pre-escaped
     by report-to-kit, so they render as-is (never re-escape). */
  function peek(eye, title, html) {
    $('#ins-eye').textContent = eye; $('#ins-title').textContent = title;
    $('#inspector-body').innerHTML = html; bindCopy();
    if (window.__showInspectTab) window.__showInspectTab();
  }
  function peekSource(s) {
    var backs = (s.backs || []).map(function (b) { return '<a class="bl-i" href="#" data-peek-go="' + b.view + '">' + b.insight + '</a>'; }).join('');
    peek('Source · ' + (s.src || 'unlinked'), s.who || s.src || 'Source',
      '<p class="peek-q">“' + s.q + '”</p><div class="peek-fields">'
      + (s.who ? '<div class="pf"><span>Author</span><b>' + s.who + '</b></div>' : '')
      + (s.src ? '<div class="pf"><span>Channel</span><b>' + s.src + '</b></div>' : '')
      + (s.metric ? '<div class="pf"><span>Engagement</span><b>' + s.metric + '</b></div>' : '')
      + (s.date ? '<div class="pf"><span>Captured</span><b>' + s.date + '</b></div>' : '')
      + '</div>'
      + (backs ? '<div class="peek-h">Backs these findings</div>' + backs : '')
      + (s.url ? '<div style="margin-top:16px"><a class="peek-open" href="' + s.url + '" target="_blank" rel="noopener noreferrer">Open original ↗</a></div>'
               : '<p class="small dim" style="margin-top:16px">Captured at channel level — no per-post URL. Re-run the search with URL capture to link it.</p>'));
  }
  function peekFinding(f) {
    var srcs = ((KIT.research || {}).sources || []).filter(function (s) { return (s.backs || []).some(function (b) { return b.id === f.id; }); });
    peek('Finding · ' + f.deskTitle, f.sourced + '/' + f.evTotal + ' sourced',
      '<p class="peek-q" style="font-style:normal">' + f.insight + '</p>'
      + (f.implication ? '<p class="small" style="color:var(--muted)"><b>Implication →</b> ' + f.implication + '</p>' : '')
      + (srcs.length ? '<div class="peek-h">Evidence</div>' + srcs.map(function (s) { return '<a class="bl-i" href="#" data-peek-src="' + s.id + '">' + s.q.slice(0, 90) + '…</a>'; }).join('') : '<p class="small dim">No captured evidence — flagged as inferred/unsourced.</p>')
      + '<div style="margin-top:16px"><a class="bl-i" href="#" data-peek-go="' + f.view + '">Open the ' + f.deskTitle + ' →</a></div>');
  }
  function peekEvent(ev) {
    peek('Event · ' + (ev.area || ''), ev.event.replace(/<[^>]+>/g, '').slice(0, 60),
      '<div class="peek-fields">'
      + (ev.date ? '<div class="pf"><span>When</span><b>' + ev.date + '</b></div>' : '')
      + (ev.quarter ? '<div class="pf"><span>Quarter</span><b>' + ev.quarter + '</b></div>' : '')
      + (ev.area ? '<div class="pf"><span>Area</span><b>' + ev.area + '</b></div>' : '')
      + '</div>'
      + (ev.audience ? '<p class="small" style="margin-top:12px">' + ev.audience + '</p>' : '')
      + (ev.fit ? '<p class="small" style="color:var(--muted)"><b>Why it fits →</b> ' + ev.fit + '</p>' : '')
      + (ev.url ? '<div style="margin-top:16px"><a class="peek-open" href="' + ev.url + '" target="_blank" rel="noopener noreferrer">Open listing ↗</a></div>' : ''));
  }
  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('[data-peek-go]');
    if (g) { e.preventDefault(); go(g.getAttribute('data-peek-go')); return; }
    var ps = e.target.closest && e.target.closest('[data-peek-src]');
    if (ps) { e.preventDefault(); var s0 = ((KIT.research || {}).sources || []).filter(function (x) { return x.id === ps.getAttribute('data-peek-src'); })[0]; if (s0) peekSource(s0); return; }
    /* a citation pill opens the source record in the peek; "Open original" lives inside it */
    var pill = e.target.closest && e.target.closest('.evidence .ev-src');
    if (pill && KIT.research) {
      var srcs = KIT.research.sources || [], s = null;
      if (pill.tagName === 'A') { var href = pill.getAttribute('href'); s = srcs.filter(function (x) { var d = document.createElement('div'); d.innerHTML = x.url; return d.textContent === href; })[0]; }
      if (!s) { var row = pill.closest('.ev'); var qEl = row && $('.ev-q', row); var qt = qEl ? qEl.textContent.slice(0, 40) : ''; s = srcs.filter(function (x) { var d = document.createElement('div'); d.innerHTML = x.q; return d.textContent.slice(0, 40) === qt; })[0]; }
      if (s) { e.preventDefault(); peekSource(s); }
    }
  });
  safe(function () {
    var R = KIT.research; if (!R) return;
    function uniq(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i; }); }
    function opts(vals, all) { return '<option value="">' + all + '</option>' + vals.map(function (v) { return '<option>' + v + '</option>'; }).join(''); }
    $$('.dbv[data-w="db"]').forEach(function (host) {
      var coll = host.getAttribute('data-coll');
      var st = { a: '', b: '', si: -1, dir: 1 };
      function render() {
        var head, rows, bar, total;
        if (coll === 'findings') {
          total = R.findings.length; head = ['Finding', 'Desk', 'Sourced'];
          rows = R.findings.filter(function (f) { return (!st.a || f.deskTitle === st.a) && (!st.b || (st.b === 'unsourced only' ? f.sourced === 0 : f.sourced > 0)); })
            .map(function (f) { return { rid: f.id, kind: 'f', cells: [f.insight, f.deskTitle, f.sourced + '/' + f.evTotal + (f.sourced === 0 ? ' <span class="db-flag">unsourced</span>' : '')] }; });
          bar = '<select data-f="a">' + opts(uniq(R.findings.map(function (f) { return f.deskTitle; })), 'All desks') + '</select>'
              + '<select data-f="b"><option value="">Sourced: all</option><option>sourced only</option><option>unsourced only</option></select>';
        } else if (coll === 'sources') {
          total = R.sources.length; head = ['Quote', 'Who', 'Channel', 'Backs'];
          rows = R.sources.filter(function (s) { return (!st.a || s.src === st.a) && (!st.b || (st.b === 'unlinked only' ? !s.url : !!s.url)); })
            .map(function (s) { return { rid: s.id, kind: 's', cells: ['“' + s.q.slice(0, 110) + (s.q.length > 110 ? '…' : '') + '”', s.who || '—', s.src + (s.url ? '' : ' <span class="db-flag">no URL</span>'), String((s.backs || []).length)] }; });
          bar = '<select data-f="a">' + opts(uniq(R.sources.map(function (s) { return s.src; })), 'All channels') + '</select>'
              + '<select data-f="b"><option value="">Linked: all</option><option>linked only</option><option>unlinked only</option></select>';
        } else {
          total = R.events.length; head = ['Event', 'Area', 'When', 'Audience'];
          rows = R.events.filter(function (ev) { return (!st.a || ev.area === st.a) && (!st.b || ev.quarter === st.b); })
            .map(function (ev, i) { return { rid: String(R.events.indexOf(ev)), kind: 'e', cells: [ev.event, ev.area, [ev.date, ev.quarter].filter(Boolean).join(' · '), ev.audience.slice(0, 80)] }; });
          bar = '<select data-f="a">' + opts(uniq(R.events.map(function (ev) { return ev.area; })), 'All areas') + '</select>'
              + '<select data-f="b">' + opts(uniq(R.events.map(function (ev) { return ev.quarter; })), 'All quarters') + '</select>';
        }
        if (st.si >= 0) rows.sort(function (x, y) { var a = x.cells[st.si].replace(/<[^>]+>/g, ''), b = y.cells[st.si].replace(/<[^>]+>/g, ''); return a < b ? -st.dir : a > b ? st.dir : 0; });
        var sel = { a: st.a, b: st.b };
        host.innerHTML = '<div class="db-bar">' + bar + '<span class="db-count">' + rows.length + ' of ' + total + '</span></div>'
          + (rows.length
            ? '<table class="db-table"><thead><tr>' + head.map(function (h, i) { return '<th data-si="' + i + '">' + h + (st.si === i ? (st.dir > 0 ? ' ▴' : ' ▾') : '') + '</th>'; }).join('') + '</tr></thead><tbody>'
              + rows.map(function (r) { return '<tr class="sel-able" data-rid="' + r.rid + '" data-kind="' + r.kind + '">' + r.cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'
            : '<div class="db-empty">No rows match these filters. <button class="cbtn" data-db-reset>Reset</button></div>');
        $$('select[data-f]', host).forEach(function (s) { s.value = sel[s.getAttribute('data-f')] || ''; s.addEventListener('change', function () { st[s.getAttribute('data-f')] = s.value; render(); }); });
        $$('th[data-si]', host).forEach(function (th) { th.addEventListener('click', function () { var i = +th.dataset.si; if (st.si === i) st.dir = -st.dir; else { st.si = i; st.dir = 1; } render(); }); });
        var rst = $('[data-db-reset]', host); if (rst) rst.addEventListener('click', function () { st.a = ''; st.b = ''; render(); });
        $$('tr[data-rid]', host).forEach(function (tr) { tr.addEventListener('click', function () {
          var k = tr.dataset.kind, id = tr.dataset.rid;
          if (k === 'f') { var f = R.findings.filter(function (x) { return x.id === id; })[0]; if (f) peekFinding(f); }
          else if (k === 's') { var s = R.sources.filter(function (x) { return x.id === id; })[0]; if (s) peekSource(s); }
          else { var ev = R.events[+id]; if (ev) peekEvent(ev); }
        }); });
      }
      render();
    });
  });

  /* ---------------- IA: crumb / status / sidebar ---------------- */
  function crumb() {
    var v = $('#' + curView), name = v ? v.dataset.title : '';
    var html = '<b>' + esc(name) + '</b>';
    if (curDetail) { var d = $('#details [data-id="' + curDetail + '"]'); var t = d ? d.dataset.title : ''; if (t) html += '<span class="arw">›</span>' + esc(t); }
    $('#crumb').innerHTML = html;
    var st = STATUS[curView] || 'none'; var b = $('#statusBtn'); b.className = 'statusbtn tb-extra ' + (st === 'none' ? '' : st); b.textContent = SLABEL[st];
  }
  function hash() { var h = '#' + curView + (curDetail ? ('~' + curDetail) : ''); if (location.hash !== h) history.replaceState(null, '', h); }
  function refreshSidebar() {
    NAV.forEach(function (a) {
      var v = a.dataset.v, st = STATUS[v] || 'none';
      var dot = $('.sdot', a); if (dot) dot.className = 'sdot ' + (st === 'none' ? '' : st);
      var cnt = $('.scnt', a); if (cnt) {
        cnt.textContent = '';
        if (v === 'v-launch') { var d1 = load('kit_acts', {}); cnt.textContent = Object.keys(d1).filter(function (k) { return d1[k]; }).length + '/' + (KIT.launchActs || []).length; }
        if (v === 'v-coach') { var d2 = load('kit_rev', {}); cnt.textContent = Object.keys(d2).filter(function (k) { return d2[k]; }).length + '/' + (KIT.revisions || []).length; }
      }
    });
  }

  /* ---------------- view switching + inspector ---------------- */
  function resetInspector() { $('#ins-eye').textContent = 'Inspector'; $('#ins-title').textContent = 'Select an item'; $('#inspector-body').innerHTML = '<p class="muted small">Select a row in this section to inspect its details here.</p>'; }
  function selectDetail(id) {
    var el = $('#details [data-id="' + id + '"]'); if (!el) return;
    curDetail = id;
    $('#ins-eye').textContent = el.dataset.eye || 'Detail'; $('#ins-title').textContent = el.dataset.title || '';
    $('#inspector-body').innerHTML = el.innerHTML; bindCopy(); if (window.__showInspectTab) window.__showInspectTab();
    $$('.row.selected').forEach(function (r) { r.classList.remove('selected'); });
    var row = $('.row[data-detail="' + id + '"]'); if (row) row.classList.add('selected');
    crumb(); hash();
  }
  function setView(id, detail) {
    if (!$('#' + id)) id = 'v-overview';
    curView = id; curDetail = null;
    VIEWS.forEach(function (v) { v.classList.toggle('active', v.id === id); });
    NAV.forEach(function (a) { a.classList.toggle('active', a.dataset.v === id); });
    $('.work').scrollTop = 0; resetInspector();
    var d = defaults[id];
    if (detail) selectDetail(detail);
    else if (d && d.detail) selectDetail(d.detail);
    else if (d && d.fn) safe(d.fn);
    crumb(); hash(); save('kit_last', id);
    if (id === 'v-coach') animateBars();
    if (present) deckLabel();
    (window.__viewHooks || []).forEach(function (fn) { try { fn(id); } catch (e) {} });
  }
  function go(id, detail) { if (present) { var i = VIEWS.findIndex(function (v) { return v.id === id; }); if (i >= 0) slide = i; } setView(id, detail); }
  NAV.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); go(a.dataset.v); }); });
  $('#home').addEventListener('click', function () { go('v-overview'); });
  document.addEventListener('click', function (e) { if (document.body.classList.contains('editing')) return; var r = e.target.closest('.row[data-detail]'); if (r) selectDetail(r.dataset.detail); });

  defaults['v-personas'] = { detail: 'p-mason' };
  defaults['v-messaging'] = { detail: 'm-0' };
  defaults['v-competitive'] = { detail: 'c-manual' };

  $('#statusBtn').addEventListener('click', function () {
    var st = STATUS[curView] || 'none'; var nx = STORDER[(STORDER.indexOf(st) + 1) % STORDER.length];
    if (nx === 'none') delete STATUS[curView]; else STATUS[curView] = nx;
    save('kit_status', STATUS); crumb(); refreshSidebar();
  });

  /* ---------------- copy ---------------- */
  function bindCopy() { $$('.cbtn').forEach(function (b) { if (b._b) return; b._b = 1; b.addEventListener('click', function (e) { e.stopPropagation(); if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy || ''); var o = b.textContent; b.textContent = '✓'; setTimeout(function () { b.textContent = o; }, 1000); }); }); }
  bindCopy();

  /* ---------------- count-up ---------------- */
  function up(el, attr) { var tgt = +el.dataset[attr]; if (!tgt) return; var raw = el.textContent, cur = 0, st = tgt / 35; var t = setInterval(function () { cur += st; if (cur >= tgt) { el.textContent = (attr === 'count' ? raw : tgt.toLocaleString()); clearInterval(t); } else { el.textContent = tgt >= 1000 ? Math.round(cur).toLocaleString() : Math.round(cur); } }, 22); }
  safe(function () { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { up(e.target, 'count'); io.unobserve(e.target); } }); }); $$('[data-count]').forEach(function (el) { io.observe(el); }); });

  /* ---------------- command palette ---------------- */
  var IDX = [];
  NAV.forEach(function (a) { IDX.push({ label: $('.nl', a).textContent, view: a.dataset.v, kind: 'Section' }); });
  (KIT.palette || []).forEach(function (x) { IDX.push({ label: x[0], view: x[1], detail: x[2], kind: 'Item' }); });
  var pCur = 0, pList = [];
  function openPal() { $('#scrim').classList.add('open'); $('#palette').classList.add('open'); $('#pInput').value = ''; renderPal(''); setTimeout(function () { $('#pInput').focus(); }, 10); }
  function closePal() { $('#scrim').classList.remove('open'); $('#palette').classList.remove('open'); }
  function renderPal(q) {
    q = q.toLowerCase(); pList = IDX.filter(function (it) { return it.label.toLowerCase().indexOf(q) >= 0; }); if (pCur >= pList.length) pCur = 0;
    $('#pRes').innerHTML = pList.map(function (it, i) { return '<div class="pitem ' + (i === pCur ? 'cur' : '') + '" data-i="' + i + '"><span class="pi">' + (it.kind === 'Section' ? '§' : '·') + '</span>' + esc(it.label) + '<span class="pk">' + it.kind + '</span></div>'; }).join('') || '<div class="pitem">No matches</div>';
    $$('#pRes .pitem[data-i]').forEach(function (el) { el.addEventListener('click', function () { choosePal(+el.dataset.i); }); });
  }
  function choosePal(i) { var it = pList[i]; if (!it) return; closePal(); go(it.view, it.detail); }
  $('#cmdkBtn').addEventListener('click', openPal);
  $('#scrim').addEventListener('click', closePal);
  $('#pInput').addEventListener('input', function (e) { pCur = 0; renderPal(e.target.value); });
  $('#pInput').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); pCur = Math.min(pCur + 1, pList.length - 1); renderPal($('#pInput').value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pCur = Math.max(pCur - 1, 0); renderPal($('#pInput').value); }
    else if (e.key === 'Enter') choosePal(pCur);
    else if (e.key === 'Escape') closePal();
  });
  document.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPal(); } });

  /* ---------------- Notebook: TipTap, modeless (markdown shortcuts + bubble + slash) ---------------- */
  safe(function () {
    var KEY = 'kit_notebook', nbEditor = null, built = false;
    var doc = $('#noteDoc');
    var SEED = load(KEY, '') || '<h2>Notebook</h2><p>Write freely. Type <code>#</code> / <code>-</code> / <code>&gt;</code> / <code>[]</code> at the start of a line for blocks, hit <code>/</code> for the menu, or select text to format.</p><ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>a checkbox to tick</p></div></li></ul>';
    function openNb() { $('#notes').classList.add('open'); if (!built) { built = true; build(); } }
    function closeNb() { $('#notes').classList.remove('open'); }
    $('#notesBtn').addEventListener('click', function () { $('#notes').classList.contains('open') ? closeNb() : openNb(); });
    $('#notesClose').addEventListener('click', closeNb);
    $('#notesClear').addEventListener('click', function () { if (confirm('Clear the notebook?')) { save(KEY, ''); if (nbEditor) nbEditor.commands.setContent('<p></p>'); else doc.innerHTML = ''; } });
    window.__nbOpen = openNb;

    // floating bubble for the notebook (TipTap BubbleMenu drives show/hide + position)
    var nbBubble = document.createElement('div');
    nbBubble.className = 'bubble'; nbBubble.id = 'nbBubble';
    nbBubble.innerHTML = '<button data-c="bold" title="Bold"><b>B</b></button><button data-c="italic" title="Italic"><i>I</i></button><button data-c="h2" title="Heading">H</button><button data-c="bullet" title="List">•</button><button data-c="task" title="Checklist">☑</button><button data-c="quote" title="Quote">❝</button><button data-c="link" title="Link">↗</button>';
    document.body.appendChild(nbBubble);

    // notebook slash menu (own element — no collision with the middle-pane slash)
    var nbSlash = document.createElement('div');
    nbSlash.className = 'slash'; nbSlash.id = 'nbSlash';
    document.body.appendChild(nbSlash);

    function build() {
      var names = ['core', 'starter-kit', 'extension-link', 'extension-task-list', 'extension-task-item', 'extension-table', 'extension-table-row', 'extension-table-header', 'extension-table-cell', 'extension-placeholder', 'extension-bubble-menu'];
      var U = names.map(function (n) { return 'https://esm.sh/@tiptap/' + n + '@2?deps=@tiptap/core@2,@tiptap/pm@2'; });
      Promise.all(U.map(function (u) { return import(u); })).then(function (m) {
        var Editor = m[0].Editor, SK = m[1].default, Link = m[2].default, TaskList = m[3].default, TaskItem = m[4].default,
          Table = m[5].default, TR = m[6].default, TH = m[7].default, TD = m[8].default, Placeholder = m[9].default, BubbleMenu = m[10].default;
        nbEditor = new Editor({
          element: doc, content: SEED,
          extensions: [
            SK, Link.configure({ openOnClick: false }), TaskList, TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }), TR, TH, TD,
            Placeholder.configure({ placeholder: 'Type “/” for blocks, or just write…' }),
            BubbleMenu.configure({ element: nbBubble, tippyOptions: { duration: 80 } })
          ],
          onUpdate: function (o) { save(KEY, o.editor.getHTML()); }
        });
        window.__nbEditor = nbEditor;
        wireBubble(); wireSlash();
      }).catch(function () {
        doc.setAttribute('contenteditable', 'true'); doc.innerHTML = SEED;
        doc.addEventListener('input', function () { save(KEY, doc.innerHTML); });
      });
    }

    function wireBubble() {
      nbBubble.addEventListener('mousedown', function (e) { e.preventDefault(); });
      $$('button', nbBubble).forEach(function (b) {
        b.addEventListener('click', function () {
          var c = nbEditor.chain().focus(), k = b.getAttribute('data-c');
          if (k === 'bold') c.toggleBold().run();
          else if (k === 'italic') c.toggleItalic().run();
          else if (k === 'h2') c.toggleHeading({ level: 2 }).run();
          else if (k === 'bullet') c.toggleBulletList().run();
          else if (k === 'task') c.toggleTaskList().run();
          else if (k === 'quote') c.toggleBlockquote().run();
          else if (k === 'link') { var u = prompt('Link URL:'); if (u) c.extendMarkRange('link').setLink({ href: u }).run(); else c.run(); }
        });
      });
    }

    function wireSlash() {
      var NB = [
        ['Heading 1', function (c) { c.toggleHeading({ level: 1 }).run(); }, 'H'],
        ['Heading 2', function (c) { c.toggleHeading({ level: 2 }).run(); }, 'H'],
        ['Text', function (c) { c.setParagraph().run(); }, '¶'],
        ['Bulleted list', function (c) { c.toggleBulletList().run(); }, '•'],
        ['Numbered list', function (c) { c.toggleOrderedList().run(); }, '1'],
        ['Checklist', function (c) { c.toggleTaskList().run(); }, '☑'],
        ['Table', function (c) { c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }, '⊞'],
        ['Quote', function (c) { c.toggleBlockquote().run(); }, '❝'],
        ['Divider', function (c) { c.setHorizontalRule().run(); }, '—']
      ];
      var idx = 0, open = false;
      function render() { nbSlash.innerHTML = '<div class="sh">Notebook block</div>' + NB.map(function (s, i) { return '<div class="si ' + (i === idx ? 'cur' : '') + '" data-i="' + i + '"><span class="ic">' + s[2] + '</span>' + s[0] + '</div>'; }).join(''); $$('.si', nbSlash).forEach(function (el) { el.addEventListener('mousedown', function (ev) { ev.preventDefault(); pick(+el.dataset.i); }); }); }
      function pick(i) { close(); try { var f = nbEditor.state.selection.from; nbEditor.chain().focus().deleteRange({ from: f - 1, to: f }).run(); } catch (e) {} NB[i][1](nbEditor.chain().focus()); }
      function show() {
        open = true; idx = 0; render();
        var sel = window.getSelection(); var r = (sel && sel.rangeCount) ? sel.getRangeAt(0).getBoundingClientRect() : doc.getBoundingClientRect();
        nbSlash.style.left = Math.max(8, r.left) + 'px'; nbSlash.style.top = (r.bottom + 6) + 'px'; nbSlash.classList.add('open');
      }
      function close() { open = false; nbSlash.classList.remove('open'); }
      doc.addEventListener('keyup', function (e) { if (e.key === '/') setTimeout(show, 0); });
      doc.addEventListener('keydown', function (e) {
        if (!open) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, NB.length - 1); render(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); render(); }
        else if (e.key === 'Enter') { e.preventDefault(); pick(idx); }
        else if (e.key === 'Escape') close();
      });
      doc.addEventListener('blur', function () { setTimeout(close, 150); });
    }
  });

  /* ---------------- cinematic intro ---------------- */
  safe(function () {
    var intro = $('#intro'), panels = KIT.intro || [], stats = KIT.stats || [];
    var html = panels.map(function (p) {
      if (p.kind === 'title') return '<section class="ipanel"><div><div class="eyebrow" style="color:var(--accent);font-size:11px;letter-spacing:.16em;text-transform:uppercase">' + p.eyebrow + '</div><h1 style="margin-top:12px">' + p.h + '</h1><p class="s">' + p.s + '</p></div></section>';
      if (p.kind === 'stats') return '<section class="ipanel"><div><p class="eyebrow" style="color:var(--accent);font-size:11px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:18px">' + p.eyebrow + '</p><div class="ibig">' + stats.slice(0, 3).map(function (s) { return '<div><div class="n" data-icount="' + s[2] + '">0</div><div class="l">' + s[1] + '</div></div>'; }).join('') + '</div></div></section>';
      if (p.kind === 'line') return '<section class="ipanel"><h1 style="font-size:clamp(28px,6vw,58px)">' + p.h + '</h1><p class="s">' + p.s + '</p></section>';
      if (p.kind === 'cta') return '<section class="ipanel"><div><h1 class="black" style="font-size:clamp(28px,6vw,58px);color:var(--accent);-webkit-text-fill-color:initial;background:none">' + p.h + '</h1><p class="s">' + p.s + '</p><div class="iact"><button class="tbtn on" id="introEnter">Enter the kit →</button></div></div></section>';
      return '';
    }).join('');
    $('#introPanels').innerHTML = html;
    var iio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); $$('[data-icount]', e.target).forEach(function (el) { if (!el._d) { el._d = 1; up(el, 'icount'); } }); } }); }, { root: intro, threshold: .4 });
    $$('.ipanel', intro).forEach(function (p) { iio.observe(p); });
    function open() { intro.classList.add('open'); intro.scrollTop = 0; var f = $('.ipanel', intro); if (f) f.classList.add('in'); }
    function close() { intro.classList.remove('open'); save('kit_intro_seen', 1); }
    $('#introBtn').addEventListener('click', open);
    $('#introSkip').addEventListener('click', close);
    intro.addEventListener('click', function (e) { if (e.target && e.target.id === 'introEnter') close(); });
    if (!load('kit_intro_seen', 0)) open();
  });

  /* ---------------- present mode ---------------- */
  var present = false, slide = 0;
  function deckLabel() { $('#slideCt').textContent = (slide + 1) + ' / ' + VIEWS.length; }
  function deck(i) { slide = (i + VIEWS.length) % VIEWS.length; setView(VIEWS[slide].id); }
  function toggle(on) { present = on; document.body.classList.toggle('present', on); $('#presentBtn').textContent = on ? 'Exit' : 'Present'; $('#presentBtn').classList.toggle('on', on); if (on) deck(slide); }
  $('#presentBtn').addEventListener('click', function () { toggle(!present); });
  $('#exitPresent').addEventListener('click', function () { toggle(false); });
  $('#nextSlide').addEventListener('click', function () { deck(slide + 1); });
  $('#prevSlide').addEventListener('click', function () { deck(slide - 1); });
  document.addEventListener('keydown', function (e) { if (!present) return; if (e.key === 'ArrowRight' || e.key === ' ') deck(slide + 1); if (e.key === 'ArrowLeft') deck(slide - 1); if (e.key === 'Escape') toggle(false); });

  $('#pdfBtn').addEventListener('click', function () { window.print(); });

  /* ---------------- resizable + collapsible panels ---------------- */
  safe(function () {
    var root = document.documentElement;
    var sidew = load('kit_sidew', 248), insw = load('kit_insw', 336);
    root.style.setProperty('--sidew', sidew + 'px'); root.style.setProperty('--insw', insw + 'px');
    if (load('kit_side_col', 0)) document.body.classList.add('sidebar-collapsed');
    if (load('kit_ins_col', 0)) document.body.classList.add('inspector-collapsed');
    function drag(handle, which) {
      if (!handle) return;
      handle.addEventListener('mousedown', function (e) {
        e.preventDefault(); handle.classList.add('drag');
        var startX = e.clientX, start = which === 'l' ? sidew : insw;
        function mv(ev) {
          var dx = ev.clientX - startX, w = which === 'l' ? start + dx : start - dx;
          w = Math.max(0, Math.min(which === 'l' ? 460 : 520, w));
          if (which === 'l') { sidew = w; root.style.setProperty('--sidew', w + 'px'); document.body.classList.toggle('sidebar-collapsed', w < 120); }
          else { insw = w; root.style.setProperty('--insw', w + 'px'); document.body.classList.toggle('inspector-collapsed', w < 150); }
        }
        function done() {
          document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', done); handle.classList.remove('drag');
          if (which === 'l') { var c = document.body.classList.contains('sidebar-collapsed'); save('kit_side_col', c ? 1 : 0); if (!c) { sidew = Math.max(170, sidew); root.style.setProperty('--sidew', sidew + 'px'); save('kit_sidew', sidew); } }
          else { var c2 = document.body.classList.contains('inspector-collapsed'); save('kit_ins_col', c2 ? 1 : 0); if (!c2) { insw = Math.max(240, insw); root.style.setProperty('--insw', insw + 'px'); save('kit_insw', insw); } }
        }
        document.addEventListener('mousemove', mv); document.addEventListener('mouseup', done);
      });
    }
    drag($('#rszL'), 'l'); drag($('#rszR'), 'r');
    var rl = $('#reopenL'), rr = $('#reopenR');
    if (rl) rl.addEventListener('click', function () { document.body.classList.remove('sidebar-collapsed'); sidew = Math.max(200, sidew); root.style.setProperty('--sidew', sidew + 'px'); save('kit_side_col', 0); save('kit_sidew', sidew); });
    if (rr) rr.addEventListener('click', function () { document.body.classList.remove('inspector-collapsed'); insw = Math.max(280, insw); root.style.setProperty('--insw', insw + 'px'); save('kit_ins_col', 0); save('kit_insw', insw); });
  });

  /* ---------------- modeless inline editor (always-on under the server) ---------------- */
  safe(function () {
    var bubble = $('#bubble'), slash = $('#slash'), pill = $('#savePill');
    var CONTENT = null, dirty = {};
    var underServer = location.protocol !== 'file:';

    function flashPill(t, ok) { if (!pill) return; pill.textContent = t; pill.classList.toggle('ok', !!ok); pill.classList.add('show'); clearTimeout(pill._t); pill._t = setTimeout(function () { pill.classList.remove('show'); }, 1400); }
    function setCE() { $$('.view.active [data-path]').forEach(function (el) { el.setAttribute('contenteditable', 'true'); }); }
    function addChrome() {
      $$('.view.active .blk').forEach(function (b) {
        if (!$('.blk-grip', b)) { var g = document.createElement('button'); g.className = 'blk-grip'; g.textContent = '⠿'; g.setAttribute('draggable', 'true'); b.insertBefore(g, b.firstChild); }
        if (!$('.blk-menu', b)) { var m = document.createElement('button'); m.className = 'blk-menu'; m.textContent = '⋯'; m.title = 'Block options'; b.appendChild(m); }
      });
    }
    function refresh() { setCE(); addChrome(); }

    if (underServer) fetch('kit-content.json').then(function (r) { return r.json(); }).then(function (j) { CONTENT = j; }).catch(function () { CONTENT = null; });
    refresh();
    (window.__viewHooks = window.__viewHooks || []).push(function () { refresh(); });

    var setByPath = function (obj, path, val) { var s = path.split('.'), c = obj; for (var i = 0; i < s.length - 1; i++) { if (c[s[i]] == null) return; c = c[s[i]]; } c[s[s.length - 1]] = val; };
    var loc = function (el) { var b = el && el.closest ? el.closest('.blk') : null; if (!b) return null; var m = /^views\.([^.]+)\.blocks\.(\d+)$/.exec(b.getAttribute('data-block') || ''); return m ? { view: m[1], idx: +m[2], blk: b } : null; };
    var persistLocal = function (p, h) { var e = load('kit_edits', {}); e[p] = h; save('kit_edits', e); };

    function pushSave(path, html) {
      persistLocal(path, html);
      if (!underServer) { flashPill('Saved locally'); return; }
      window.__lastSelfSave = Date.now();
      fetch('api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edits: [{ path: path, value: html }] }) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function () { window.__lastSelfSave = Date.now(); flashPill('Saved ✓', true); })
        .catch(function () { flashPill('Saved locally'); });
    }

    /* type → buffer; leave a block → save (no reload) */
    document.addEventListener('input', function (e) {
      var el = e.target.closest && e.target.closest('.work [data-path]'); if (!el) return;
      dirty[el.getAttribute('data-path')] = el.innerHTML.trim();
    });
    document.addEventListener('focusout', function (e) {
      var el = e.target.closest && e.target.closest('.work [data-path]'); if (!el) return;
      var p = el.getAttribute('data-path'); if (!(p in dirty)) return;
      pushSave(p, el.innerHTML.trim()); delete dirty[p];
    });

    /* paste an image inline → compress to base64 (keeps the file self-contained) → save.
       ponytail: inline base64 has a size ceiling — we downscale to 1600px + webp/jpeg ~0.8
       (~50-150KB). For very large libraries the upgrade path is an assets/ sidecar folder. */
    function compressImagePaste(file, cb) {
      try {
        var url = URL.createObjectURL(file), img = new Image();
        img.onload = function () {
          var max = 1600, w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
          if (w > max || h > max) { var s = Math.min(max / w, max / h); w = Math.round(w * s); h = Math.round(h * s); }
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          var out = null; try { out = c.toDataURL('image/webp', 0.82); } catch (er) { out = null; }
          if (!out || out.indexOf('data:image/webp') !== 0) { try { out = c.toDataURL('image/jpeg', 0.85); } catch (er2) { out = null; } }
          cb(out);
        };
        img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
        img.src = url;
      } catch (er) { cb(null); }
    }
    document.addEventListener('paste', function (e) {
      var el = e.target.closest && e.target.closest('.work [data-path]'); if (!el) return;
      var items = (e.clipboardData && e.clipboardData.items) || [], imgItem = null;
      for (var i = 0; i < items.length; i++) { if (items[i].type && items[i].type.indexOf('image') === 0) { imgItem = items[i]; break; } }
      if (!imgItem) return; /* not an image → let the normal text paste proceed */
      e.preventDefault();
      var file = imgItem.getAsFile(); if (!file) return;
      flashPill('Compressing image…');
      compressImagePaste(file, function (dataURL) {
        if (!dataURL) { flashPill('Image paste failed'); return; }
        el.focus();
        document.execCommand('insertHTML', false, '<img src="' + dataURL + '" alt="pasted image" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;display:block"/>');
        var p = el.getAttribute('data-path');
        pushSave(p, el.innerHTML.trim()); delete dirty[p];
        flashPill(underServer ? 'Image saved ✓' : 'Image pasted (local)', underServer);
      });
    });

    /* bubble format bar on selection (native execCommand) */
    document.addEventListener('selectionchange', function () {
      var sel = document.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { bubble.classList.remove('open'); return; }
      var n = sel.anchorNode, host = n && (n.nodeType === 1 ? n : n.parentNode); host = host && host.closest ? host.closest('.work [data-path]') : null;
      if (!host) { bubble.classList.remove('open'); return; }
      var r = sel.getRangeAt(0).getBoundingClientRect();
      bubble.style.left = Math.max(8, r.left + r.width / 2 - 72) + 'px'; bubble.style.top = Math.max(8, r.top - 42) + 'px'; bubble.classList.add('open');
    });
    bubble.addEventListener('mousedown', function (e) { e.preventDefault(); });
    $$('button', bubble).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = btn.getAttribute('data-cmd'), sel = document.getSelection();
        var host = sel && sel.anchorNode ? (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode) : null;
        host = host && host.closest ? host.closest('.work [data-path]') : null;
        if (cmd === 'createLink') { var u = prompt('Link URL:'); if (u) document.execCommand('createLink', false, u); }
        else document.execCommand(cmd, false, null);
        if (host) pushSave(host.getAttribute('data-path'), host.innerHTML.trim());
      });
    });

    /* slash — insert a structural block (needs server) */
    // slash menu is registry-driven: [label, type, icon, template]
    var SLASH = (window.KITBLOCKMENU || []).map(function (m) { return [m.label, m.type, m.icon, m.template]; });
    SLASH.push(['Generate with AI', '__generate', '✦', null]); /* queues a block for the CC session to write from the evidence */
    var slashHost = null, slashIdx = 0, slashQuery = '', SLASHF = SLASH.slice();
    function filterSlash() {
      var q = slashQuery.toLowerCase().trim();
      SLASHF = q ? SLASH.filter(function (s) { return s[0].toLowerCase().indexOf(q) > -1 || (s[1] && String(s[1]).toLowerCase().indexOf(q) > -1); }) : SLASH.slice();
      if (slashIdx >= SLASHF.length) slashIdx = Math.max(0, SLASHF.length - 1);
    }
    function renderSlash() {
      filterSlash();
      var head = '<div class="sh">Insert block' + (slashQuery ? ' · ' + slashQuery.replace(/[<>&]/g, '') : '') + '</div>';
      slash.innerHTML = head + (SLASHF.length
        ? SLASHF.map(function (s, i) { return '<div class="si ' + (i === slashIdx ? 'cur' : '') + '" data-i="' + i + '"><span class="ic">' + s[2] + '</span>' + s[0] + '</div>'; }).join('')
        : '<div class="si" style="opacity:.55;cursor:default">No blocks match</div>');
      $$('.si', slash).forEach(function (el) { el.addEventListener('mousedown', function (ev) { ev.preventDefault(); if (el.dataset.i != null) insertBlock(+el.dataset.i); }); });
    }
    function insertBlock(i) {
      slash.classList.remove('open'); var item = SLASHF[i]; var l = slashHost && loc(slashHost); if (!l || !item) return;
      if (!CONTENT) { flashPill('Insert needs the editor server'); return; }
      var html = slashHost.innerHTML.replace(/\/[^<>]*$/, '').trim();
      if (item[1] === '__generate') {
        /* queue for AI generation: one server round-trip cleans the slash text, plants the
           placeholder, rebuilds, reloads. Fulfilled by a CC session ("process the generation queue"). */
        var instr = prompt('Generate from the research evidence — what should this block say?');
        if (!instr || !instr.trim()) return;
        fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ view: l.view, index: l.idx + 1, instruction: instr.trim(), mode: 'generate',
            clean: { path: slashHost.getAttribute('data-path'), value: html } }) })
          .then(function (r) { return r.json(); })
          .then(function (j) { if (!j.ok) throw new Error(j.error || 'queue failed'); flashPill('Generation queued ✓ (' + j.queued + ' pending)', true); })
          .catch(function (e) { flashPill('Queue failed: ' + e.message); });
        return;
      }
      setByPath(CONTENT, slashHost.getAttribute('data-path'), html);
      var nb = JSON.parse(JSON.stringify(item[3])); nb.id = newId();
      CONTENT.views[l.view].blocks.splice(l.idx + 1, 0, nb); saveFull();
    }
    document.addEventListener('keydown', function (e) {
      if (slash.classList.contains('open')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); slashIdx = Math.min(slashIdx + 1, Math.max(0, SLASHF.length - 1)); renderSlash(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); slashIdx = Math.max(slashIdx - 1, 0); renderSlash(); }
        else if (e.key === 'Enter') { e.preventDefault(); insertBlock(slashIdx); }
        else if (e.key === 'Escape') { slash.classList.remove('open'); }
        return;
      }
      if (e.key === '/') { var host = (document.activeElement && document.activeElement.closest) ? document.activeElement.closest('.work [data-path]') : null; if (host && !host.closest('table')) { slashHost = host; slashIdx = 0; slashQuery = ''; setTimeout(function () { renderSlash(); var r = host.getBoundingClientRect(); slash.style.left = Math.max(8, r.left) + 'px'; slash.style.top = (r.bottom + 6) + 'px'; slash.classList.add('open'); }, 0); } }
    });
    /* type-to-filter: read the text typed after the trigger "/" and filter the menu live */
    document.addEventListener('input', function (e) {
      if (!slash.classList.contains('open') || !slashHost) return;
      if (!(e.target.closest && e.target.closest('.work [data-path]') === slashHost)) return;
      var t = slashHost.textContent || '', k = t.lastIndexOf('/');
      if (k < 0) { slash.classList.remove('open'); return; }
      slashQuery = t.slice(k + 1); slashIdx = 0; renderSlash();
    });
    document.addEventListener('click', function (e) { if (!slash.contains(e.target) && !$('#cmAdd').contains(e.target)) slash.classList.remove('open'); });

    /* ---------------- @-mention → link to another page + auto-backlinks ---------------- */
    var atMenu = document.createElement('div'); atMenu.className = 'slash atmenu'; atMenu.id = 'atMenu'; document.body.appendChild(atMenu);
    var atHost = null, atIdx = 0, atQuery = '', ATF = [];
    function mentionTargets() { return $$('.nav a').filter(function (a) { return a.dataset.v; }).map(function (a) { var nl = $('.nl', a); return { id: a.dataset.v, label: (nl ? nl.textContent : a.textContent).trim() }; }); }
    function filterAt() { var all = mentionTargets(), q = atQuery.toLowerCase().trim(); ATF = q ? all.filter(function (t) { return t.label.toLowerCase().indexOf(q) > -1; }) : all; if (atIdx >= ATF.length) atIdx = Math.max(0, ATF.length - 1); }
    function renderAt() {
      filterAt();
      atMenu.innerHTML = '<div class="sh">Link to page' + (atQuery ? ' · ' + atQuery.replace(/[<>&]/g, '') : '') + '</div>' + (ATF.length
        ? ATF.map(function (t, i) { return '<div class="si ' + (i === atIdx ? 'cur' : '') + '" data-i="' + i + '"><span class="ic">@</span>' + t.label + '</div>'; }).join('')
        : '<div class="si" style="opacity:.55;cursor:default">No pages match</div>');
      $$('.si', atMenu).forEach(function (el) { el.addEventListener('mousedown', function (ev) { ev.preventDefault(); if (el.dataset.i != null) insertMention(+el.dataset.i); }); });
    }
    function insertMention(i) {
      atMenu.classList.remove('open'); var t = ATF[i], host = atHost; if (!t || !host) return;
      host.focus();
      var html = host.innerHTML.replace(/@[^<>@]*$/, '');
      host.innerHTML = html + '<a class="mention" href="#' + t.id + '" data-mention="' + t.id + '" contenteditable="false">@' + t.label + '</a>&nbsp;';
      var rng = document.createRange(); rng.selectNodeContents(host); rng.collapse(false); var sel = document.getSelection(); sel.removeAllRanges(); sel.addRange(rng);
      var p = host.getAttribute('data-path'); pushSave(p, host.innerHTML.trim()); delete dirty[p];
      flashPill('Linked → ' + t.label, true);
    }
    document.addEventListener('keydown', function (e) {
      if (atMenu.classList.contains('open')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); atIdx = Math.min(atIdx + 1, Math.max(0, ATF.length - 1)); renderAt(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); atIdx = Math.max(atIdx - 1, 0); renderAt(); }
        else if (e.key === 'Enter') { e.preventDefault(); insertMention(atIdx); }
        else if (e.key === 'Escape') { atMenu.classList.remove('open'); }
        return;
      }
      if (e.key === '@') { var host = (document.activeElement && document.activeElement.closest) ? document.activeElement.closest('.work [data-path]') : null; if (host && !host.closest('table')) { atHost = host; atIdx = 0; atQuery = ''; setTimeout(function () { renderAt(); var r = host.getBoundingClientRect(); atMenu.style.left = Math.max(8, r.left) + 'px'; atMenu.style.top = (r.bottom + 6) + 'px'; atMenu.classList.add('open'); }, 0); } }
    });
    document.addEventListener('input', function (e) {
      if (!atMenu.classList.contains('open') || !atHost) return;
      if (!(e.target.closest && e.target.closest('.work [data-path]') === atHost)) return;
      var t = atHost.textContent || '', k = t.lastIndexOf('@');
      if (k < 0) { atMenu.classList.remove('open'); return; }
      atQuery = t.slice(k + 1); atIdx = 0; renderAt();
    });
    document.addEventListener('click', function (e) { if (!atMenu.contains(e.target)) atMenu.classList.remove('open'); });

    /* markdown shortcuts — Notion muscle memory: at the START of a text block,
       "# " → H1 · "## " → H2 · "### " → H3 · "- "/"* " → list · "> " → quote · "``` " → code.
       Structural (needs the editor server); fires once, keeps the block id. */
    var MD_RULES = [
      [/^###\s$/, function (rest, keep) { return Object.assign({ type: 'heading', level: 3 }, keep, { h: rest || 'Heading 3' }); }],
      [/^##\s$/, function (rest, keep) { return Object.assign({ type: 'heading', level: 2 }, keep, { h: rest || 'Heading 2' }); }],
      [/^#\s$/, function (rest, keep) { return Object.assign({ type: 'heading', level: 1 }, keep, { h: rest || 'Heading 1' }); }],
      [/^[-*]\s$/, function (rest, keep) { return Object.assign({ type: 'list' }, keep, { list: [rest || 'New item'] }); }],
      [/^>\s$/, function (rest, keep) { return Object.assign({ type: 'quote' }, keep, { quote: rest || 'New quote' }); }],
      [/^```\s?$/, function (rest, keep) { return Object.assign({ type: 'code' }, keep, { code: rest || 'command --flag' }); }]
    ];
    document.addEventListener('input', function (e) {
      if (!CONTENT) return;
      if (slash.classList.contains('open') || atMenu.classList.contains('open')) return;
      var host = e.target.closest && e.target.closest('.work [data-path]'); if (!host) return;
      var l = loc(host); if (!l) return;
      var b = CONTENT.views[l.view] && CONTENT.views[l.view].blocks[l.idx];
      if (!b || b.p == null) return; /* only plain text blocks convert */
      var t = host.textContent || '';
      for (var i = 0; i < MD_RULES.length; i++) {
        var m2 = t.match(MD_RULES[i][0]);
        if (m2) {
          var keep = b.id ? { id: b.id } : {};
          CONTENT.views[l.view].blocks[l.idx] = MD_RULES[i][1]('', keep);
          saveFull();
          return;
        }
      }
    });

    /* backlinks: "Referenced by" — computed across all views on view activation (not persisted) */
    function renderBacklinks() {
      var av = $('.view.active'); if (!av) return;
      var old = $('.backlinks', av); if (old) old.remove();
      var id = av.id, src = {};
      $$('a.mention[data-mention="' + id + '"]').forEach(function (a) { var v = a.closest('.view'); if (v && v.id !== id) src[v.id] = true; });
      var ids = Object.keys(src); if (!ids.length) return;
      var labelFor = function (vid) { var a = $('.nav a[data-v="' + vid + '"]'), nl = a && $('.nl', a); return nl ? nl.textContent.trim() : vid; };
      av.insertAdjacentHTML('beforeend', '<div class="backlinks"><div class="bl-h">Referenced by</div>' + ids.map(function (vid) { return '<a class="bl-i" href="#' + vid + '">' + labelFor(vid) + '</a>'; }).join('') + '</div>');
    }
    (window.__viewHooks = window.__viewHooks || []).push(function () { setTimeout(renderBacklinks, 0); });
    setTimeout(renderBacklinks, 30);

    /* block menu (⋯): turn into · duplicate · delete — registry-driven */
    function newId() { return 'blk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
    function textOf(b) { if (b.h != null) return b.h; if (b.p != null) return b.p; if (b.quote != null) return b.quote; if (b.callout != null) return b.callout; if (b.code != null) return b.code; if (Array.isArray(b.list)) return b.list.join('\n'); if (Array.isArray(b.todo)) return b.todo.map(function (t) { return t[0]; }).join('\n'); return ''; }
    function listOf(b) { if (Array.isArray(b.list)) return b.list.slice(); if (Array.isArray(b.todo)) return b.todo.map(function (t) { return t[0]; }); var t = textOf(b); return t ? t.split('\n') : ['']; }
    function convertBlock(b, to) {
      var keep = b.id ? { id: b.id } : {};
      if (to === 'heading') return Object.assign({ type: 'heading' }, keep, { h: textOf(b) });
      if (to === 'text') return Object.assign({ type: 'text' }, keep, { p: textOf(b) });
      if (to === 'quote') return Object.assign({ type: 'quote' }, keep, { quote: textOf(b) });
      if (to === 'callout') return Object.assign({ type: 'callout' }, keep, { callout: textOf(b) });
      if (to === 'list') return Object.assign({ type: 'list' }, keep, { list: listOf(b) });
      if (to === 'todo') return Object.assign({ type: 'todo' }, keep, { todo: listOf(b).map(function (t) { return [t, false]; }) });
      if (to === 'code') return Object.assign({ type: 'code' }, keep, { code: textOf(b).replace(/<[^>]+>/g, '') });
      return b;
    }
    var TRANSFORM = window.KITTRANSFORM || {};
    var blkMenu = document.createElement('div'); blkMenu.className = 'blkmenu'; blkMenu.id = 'blkMenu'; document.body.appendChild(blkMenu);
    function openBlkMenu(btn) {
      var l = loc(btn); if (!l) return; if (!CONTENT) { flashPill('Block options need the editor server'); return; }
      var b = CONTENT.views[l.view].blocks[l.idx]; if (!b) return;
      var tos = TRANSFORM[b.type] || [];
      var html = tos.length ? '<div class="bm-h">Turn into</div>' + tos.map(function (t) { return '<div class="bm-i" data-act="turn" data-to="' + t + '"><span class="bm-ic">⤳</span>' + t + '</div>'; }).join('') : '';
      var sections = $$('.nav a').filter(function (a) { return a.dataset.v && a.dataset.v !== l.view; }).map(function (a) { var nl = $('.nl', a); return [a.dataset.v, (nl ? nl.textContent : a.textContent).trim()]; });
      if (sections.length) html += '<div class="bm-h">Move to</div>' + sections.map(function (s) { return '<div class="bm-i" data-act="move" data-to="' + s[0] + '"><span class="bm-ic">→</span>' + s[1] + '</div>'; }).join('');
      html += '<div class="bm-h">AI</div><div class="bm-i" data-act="gen"><span class="bm-ic">✦</span>Regenerate from evidence</div>';
      html += '<div class="bm-h">Block</div><div class="bm-i" data-act="dup"><span class="bm-ic">⧉</span>Duplicate</div><div class="bm-i bm-del" data-act="del"><span class="bm-ic">✕</span>Delete</div>';
      blkMenu.innerHTML = html;
      var r = btn.getBoundingClientRect(); blkMenu.style.left = Math.max(8, Math.min(window.innerWidth - 196, r.left - 150)) + 'px'; blkMenu.style.top = (r.bottom + 4) + 'px';
      blkMenu.classList.add('open'); blkMenu._loc = l;
    }
    function closeBlkMenu() { blkMenu.classList.remove('open'); blkMenu._loc = null; }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.blk-menu');
      if (btn) { e.stopPropagation(); openBlkMenu(btn); return; }
      var item = e.target.closest && e.target.closest('.blkmenu .bm-i');
      if (item && blkMenu._loc) {
        var l = blkMenu._loc, arr = CONTENT.views[l.view].blocks, b = arr[l.idx], act = item.getAttribute('data-act');
        if (act === 'gen') {
          /* regenerate in place: queue only — the fulfiller rewrites this block from the evidence */
          var gInstr = prompt('Regenerate this block from the evidence — any specific direction? (optional)');
          if (gInstr === null) { closeBlkMenu(); return; }
          fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ view: l.view, index: l.idx, blockId: b.id || null, mode: 'regenerate',
              instruction: (gInstr.trim() || 'Regenerate this block from the evidence, keeping its role in the page') }) })
            .then(function (r) { return r.json(); })
            .then(function (j) { if (!j.ok) throw new Error(j.error || 'queue failed'); flashPill('Regeneration queued ✓ (' + j.queued + ' pending)', true); })
            .catch(function (er) { flashPill('Queue failed: ' + er.message); });
          closeBlkMenu(); return;
        }
        if (act === 'turn') arr[l.idx] = convertBlock(b, item.getAttribute('data-to'));
        else if (act === 'dup') { var cl = JSON.parse(JSON.stringify(b)); cl.id = newId(); arr.splice(l.idx + 1, 0, cl); }
        else if (act === 'move') { var to = item.getAttribute('data-to'); if (CONTENT.views[to]) { var mv = arr.splice(l.idx, 1)[0]; CONTENT.views[to].blocks.push(mv); } }
        else if (act === 'del') { if (!confirm('Delete this block?')) { closeBlkMenu(); return; } arr.splice(l.idx, 1); }
        closeBlkMenu(); saveFull(); return;
      }
      if (!blkMenu.contains(e.target)) closeBlkMenu();
    });

    /* toggle (nested block) collapse */
    document.addEventListener('click', function (e) { var x = e.target.closest && e.target.closest('.tgl-x'); if (!x) return; var t = x.closest('.toggle'); if (t) t.classList.toggle('collapsed'); });

    /* drag reorder (structural) */
    var dragFrom = null;
    document.addEventListener('dragstart', function (e) { var g = e.target.closest && e.target.closest('.blk-grip'); if (!g) return; var b = g.closest('.blk'); dragFrom = b.getAttribute('data-block'); b.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    document.addEventListener('dragover', function (e) { if (!dragFrom) return; var b = e.target.closest && e.target.closest('.blk'); if (!b) return; e.preventDefault(); $$('.blk').forEach(function (x) { x.classList.remove('dropbefore', 'dropafter'); }); var r = b.getBoundingClientRect(); b.classList.add(e.clientY < r.top + r.height / 2 ? 'dropbefore' : 'dropafter'); });
    document.addEventListener('drop', function (e) {
      if (!dragFrom) return; e.preventDefault();
      var b = e.target.closest && e.target.closest('.blk'); var before = b && e.clientY < (b.getBoundingClientRect().top + b.getBoundingClientRect().height / 2);
      $$('.blk').forEach(function (x) { x.classList.remove('dropbefore', 'dropafter', 'dragging'); });
      var f = /^views\.([^.]+)\.blocks\.(\d+)$/.exec(dragFrom), t = b ? /^views\.([^.]+)\.blocks\.(\d+)$/.exec(b.getAttribute('data-block') || '') : null; dragFrom = null;
      if (!f || !t || f[1] !== t[1]) return; if (!CONTENT) { flashPill('Reorder needs the editor server'); return; }
      var arr = CONTENT.views[f[1]].blocks, fi = +f[2], ti = +t[2]; var it = arr.splice(fi, 1)[0]; if (fi < ti) ti--; if (!before) ti++; arr.splice(ti, 0, it); saveFull();
    });
    document.addEventListener('dragend', function () { $$('.blk').forEach(function (x) { x.classList.remove('dropbefore', 'dropafter', 'dragging'); }); });

    function saveFull() { if (!CONTENT) return; flashPill('Saving…'); fetch('api/save-full', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(CONTENT) }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function () { save('kit_edits', {}); flashPill('Saved ✓ rebuilding…', true); setTimeout(function () { location.reload(); }, 600); }).catch(function () { flashPill('Structural edits need the editor server'); }); }
  });

  /* ---------------- comments: highlight → anchored comment (tab + notebook feed) ---------------- */
  safe(function () {
    var underServer = location.protocol !== 'file:';
    var seeded = (window.KITCOMMENTS && window.KITCOMMENTS.length) ? window.KITCOMMENTS : load('kit_comments', []);
    var COMMENTS = Array.isArray(seeded) ? seeded.slice() : [];
    var addBtn = $('#cmAdd'), pop = $('#cmPop'), qEl = $('#cmQuote'), txt = $('#cmText');
    var body = $('#comments-body'), countEl = $('#cmtCount');
    var pending = null;

    function persist() { save('kit_comments', COMMENTS); if (underServer) fetch('api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(COMMENTS) }).catch(function () {}); }
    function nearestPath(node) { var el = node && (node.nodeType === 1 ? node : node.parentNode); return el && el.closest ? el.closest('.work [data-path]') : null; }
    function sectionName(vid) { var a = $('.nav a[data-v="' + vid + '"]'); return a ? a.textContent.trim() : vid; }
    function flash(el) { el.classList.remove('cflash'); void el.offsetWidth; el.classList.add('cflash'); }

    /* comment chip on selection */
    document.addEventListener('selectionchange', function () {
      if (pop.classList.contains('open')) return;
      var sel = document.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { addBtn.classList.remove('open'); return; }
      var host = nearestPath(sel.anchorNode); if (!host) { addBtn.classList.remove('open'); return; }
      var r = sel.getRangeAt(0).getBoundingClientRect();
      addBtn.style.left = Math.min(window.innerWidth - 120, r.left + r.width / 2 - 40) + 'px';
      addBtn.style.top = (r.bottom + 8) + 'px'; addBtn.classList.add('open');
    });
    addBtn.addEventListener('mousedown', function (e) { e.preventDefault(); });
    addBtn.addEventListener('click', function () {
      var sel = document.getSelection(); if (!sel || sel.isCollapsed) return;
      var host = nearestPath(sel.anchorNode); if (!host) return;
      var blk0 = host.closest('.blk');
      pending = { path: host.getAttribute('data-path'), bid: blk0 ? (blk0.getAttribute('data-bid') || '') : '', quote: sel.toString().trim().slice(0, 240), view: (host.closest('.view') || {}).id || curView };
      qEl.textContent = '“' + pending.quote + '”'; txt.value = '';
      var r = sel.getRangeAt(0).getBoundingClientRect();
      pop.style.left = Math.min(window.innerWidth - 320, Math.max(8, r.left)) + 'px'; pop.style.top = (r.bottom + 10) + 'px';
      addBtn.classList.remove('open'); pop.classList.add('open'); setTimeout(function () { txt.focus(); }, 0);
    });
    $('#cmCancel').addEventListener('click', function () { pop.classList.remove('open'); pending = null; });
    $('#cmSave').addEventListener('click', function () {
      if (!pending || !txt.value.trim()) { pop.classList.remove('open'); pending = null; return; }
      var c = { id: 'c' + Date.now().toString(36), bid: pending.bid, path: pending.path, quote: pending.quote, body: txt.value.trim(), view: pending.view, ts: Date.now() };
      COMMENTS.push(c); persist(); pop.classList.remove('open'); pending = null;
      renderAll(); applyMarks(); feedNotebook(c); showTab('comments');
    });

    function clearMarks() { $$('.cmark').forEach(function (m) { var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); if (p.normalize) p.normalize(); }); }
    function wrapText(host, quote, id) {
      var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, null), node;
      while ((node = walker.nextNode())) {
        var i = node.nodeValue.indexOf(quote);
        if (i >= 0) { var range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + quote.length); var span = document.createElement('span'); span.className = 'cmark'; span.setAttribute('data-cmt', id); try { range.surroundContents(span); } catch (e) {} return true; }
      }
      return false;
    }
    function applyMarks() { clearMarks(); COMMENTS.forEach(function (c) { if (!c.quote) return; var host = c.bid ? $('.view.active .blk[data-bid="' + c.bid + '"]') : $('.view.active [data-path="' + c.path + '"]'); if (host) wrapText(host, c.quote, c.id); }); }

    document.addEventListener('click', function (e) { var m = e.target.closest('.cmark'); if (!m) return; showTab('comments'); var card = $('.cmt[data-id="' + m.getAttribute('data-cmt') + '"]'); if (card) { card.scrollIntoView({ block: 'center' }); flash(card); } });

    function renderAll() {
      if (countEl) countEl.textContent = COMMENTS.length ? '(' + COMMENTS.length + ')' : '';
      if (!body) return;
      if (!COMMENTS.length) { body.innerHTML = '<div class="cmt-empty">No comments yet. Select text in a section, then click “💬 Comment”.</div>'; return; }
      body.innerHTML = COMMENTS.slice().reverse().map(function (c) { return '<div class="cmt" data-id="' + c.id + '"><div class="q">“' + esc(c.quote) + '”</div><div class="b">' + esc(c.body) + '</div><div class="m"><span>' + esc(sectionName(c.view)) + '</span><button class="del" data-del="' + c.id + '">delete</button></div></div>'; }).join('');
    }
    if (body) body.addEventListener('click', function (e) {
      var del = e.target.closest('.del');
      if (del) { e.stopPropagation(); var id = del.getAttribute('data-del'); COMMENTS = COMMENTS.filter(function (x) { return x.id !== id; }); persist(); renderAll(); applyMarks(); return; }
      var card = e.target.closest('.cmt'); if (!card) return;
      var cid = card.getAttribute('data-id'), c = COMMENTS.filter(function (x) { return x.id === cid; })[0]; if (!c) return;
      var realView = c.view;
      if (c.bid) { var blk = $('.blk[data-bid="' + c.bid + '"]'); if (blk) { var vw = (blk.closest('.view') || {}).id; if (vw) realView = vw; } }
      if (realView !== c.view) { c.view = realView; persist(); renderAll(); }
      if (realView !== curView) setView(realView);
      setTimeout(function () { var mk = $('.cmark[data-cmt="' + cid + '"]'); $$('.cmark').forEach(function (x) { x.classList.remove('active'); }); if (mk) { mk.scrollIntoView({ block: 'center' }); flash(mk); mk.classList.add('active'); } }, 70);
    });

    function showTab(which) {
      var insp = which === 'inspect';
      $('#pane-inspect').style.display = insp ? '' : 'none';
      $('#pane-comments').style.display = insp ? 'none' : '';
      $('#tabInspect').classList.toggle('on', insp);
      $('#tabComments').classList.toggle('on', !insp);
    }
    $('#tabInspect').addEventListener('click', function () { showTab('inspect'); });
    $('#tabComments').addEventListener('click', function () { showTab('comments'); });
    window.__showInspectTab = function () { showTab('inspect'); };

    function feedNotebook(c) {
      var html = '<blockquote><p>💬 <em>“' + esc(c.quote.slice(0, 90)) + '”</em> — ' + esc(c.body) + ' <span style="opacity:.6">(' + esc(sectionName(c.view)) + ')</span></p></blockquote>';
      var ed = window.__nbEditor;
      if (ed) { try { ed.chain().focus('end').insertContent(html).run(); } catch (e) {} }
      else { try { save('kit_notebook', (load('kit_notebook', '') || '') + html); } catch (x) {} }
    }

    (window.__viewHooks = window.__viewHooks || []).push(function () { applyMarks(); });
    renderAll(); applyMarks();
    if (window.KITCOMMENTS && window.KITCOMMENTS.length) save('kit_comments', COMMENTS);
  });

  /* ---------------- live reload (under kit-server) ---------------- */
  safe(function () { if (location.protocol === 'file:') return; try { var es = new EventSource('api/events'); es.onmessage = function (ev) { if (ev.data === 'reload' && Date.now() - (window.__lastSelfSave || 0) > 4000) location.reload(); }; } catch (e) {} });

  /* ---------- apply offline edits saved locally (survive reload without server) ---------- */
  safe(function () { var e = load('kit_edits', {}); Object.keys(e).forEach(function (p) { var el = $('[data-path="' + p + '"]'); if (el && el.innerHTML !== e[p]) el.innerHTML = e[p]; }); });

  /* ---------- in-content to-do checkboxes (toggle + persist) ---------- */
  safe(function () {
    var st = load('kit_todos', {});
    $$('.todock').forEach(function (c) { var k = c.getAttribute('data-todo'); if (k in st) c.checked = st[k]; var li = c.closest('.todoi'); if (li) li.classList.toggle('done', c.checked); });
    document.addEventListener('change', function (e) { var c = e.target.closest ? e.target.closest('.todock') : null; if (!c) return; var k = c.getAttribute('data-todo'); st[k] = c.checked; save('kit_todos', st); var li = c.closest('.todoi'); if (li) li.classList.toggle('done', c.checked); });
  });

  /* ---------- first-run hint ---------- */
  safe(function () {
    if (load('kit_hint_seen', 0)) return;
    var h = document.createElement('div'); h.className = 'hint';
    h.innerHTML = 'Tip — click <b>Edit</b> to change any text inline, or <b>Notes</b> for a notebook.<button id="hintX">got it</button>';
    document.body.appendChild(h);
    function dismiss() { if (h.parentNode) h.remove(); save('kit_hint_seen', 1); }
    var x = $('#hintX'); if (x) x.addEventListener('click', dismiss); setTimeout(dismiss, 11000);
  });

  /* ---------------- boot ---------------- */
  refreshSidebar();
  document.body.classList.add('ready');
  var h = (location.hash || '').replace('#', '');
  if (h) { var parts = h.split('~'); setView(parts[0], parts[1]); }
  else setView(load('kit_last', 'v-overview'));
})();
