"use client";

/**
 * The cloud kit editor — a PORT of the local .kit-app.js editing layer
 * (modeless contenteditable, bubble bar, slash insert, turn-into, drag
 * reorder, markdown triggers, anchored comments) adapted to the cloud's
 * per-view server rendering. Text edits POST {edits}; structural ops mutate
 * a client copy of kit-content and POST {full}; both land as new kit
 * versions with block history. The server page re-renders after refresh().
 *
 * Vanilla-DOM by design (same event-delegation code shape as the local
 * editor) — this is the "port, don't rewrite" rule applied literally.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = { type: string; label: string; icon: string; template: Record<string, unknown> };
type Comment = { id: string; bid: string; path: string; quote: string; body: string; view: string; ts: number; resolved?: boolean };
type KitDoc = {
  views: Record<string, { blocks?: Array<Record<string, unknown>> }>;
  sidebar: unknown;
  comments?: Comment[];
  [k: string]: unknown;
};

export function KitEditor({
  engagementId, viewId, content, menu, transform, viewList,
}: {
  engagementId: string;
  viewId: string;
  content: KitDoc;
  menu: MenuItem[];
  transform: Record<string, string[]>;
  viewList: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const [pill, setPill] = useState<{ text: string; ok: boolean } | null>(null);
  const [comments, setComments] = useState<Comment[]>(Array.isArray(content.comments) ? content.comments : []);
  const [panelOpen, setPanelOpen] = useState(false);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const doc = useRef<KitDoc>(JSON.parse(JSON.stringify(content)));
  const pillT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commentsRef = useRef(comments);
  commentsRef.current = comments;

  function flash(text: string, ok = false) {
    setPill({ text, ok });
    clearTimeout(pillT.current);
    pillT.current = setTimeout(() => setPill(null), 1600);
  }

  async function post(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    try {
      const res = await fetch(`/api/cloud/kits/${engagementId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || "save failed");
      return data;
    } catch (e) {
      flash("Save failed: " + (e as Error).message);
      return null;
    }
  }

  function saveComments(next: Comment[]) {
    setComments(next);
    doc.current.comments = next;
    void post({ comments: next });
  }

  async function saveFull(label = "Saved") {
    flash("Saving…");
    const r = await post({ full: doc.current });
    if (r) { flash(label + " ✓ v" + r.version, true); router.refresh(); }
  }
  function snapshot() {
    undoStack.current.push(JSON.stringify(doc.current));
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  }
  async function undo() {
    const prev = undoStack.current.pop();
    if (!prev) { flash("Nothing to undo"); return; }
    redoStack.current.push(JSON.stringify(doc.current));
    doc.current = JSON.parse(prev);
    await saveFull("Undone");
  }
  async function redo() {
    const next = redoStack.current.pop();
    if (!next) { flash("Nothing to redo"); return; }
    undoStack.current.push(JSON.stringify(doc.current));
    doc.current = JSON.parse(next);
    await saveFull("Redone");
  }

  useEffect(() => {
    const $ = (s: string, r: ParentNode = document) => r.querySelector(s) as HTMLElement | null;
    const $$ = (s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as HTMLElement[];
    const workMaybe = $(".cwk-blocks");
    if (!workMaybe) return;
    const work: HTMLElement = workMaybe;
    const abort = new AbortController();
    const { signal } = abort;
    const on = <K extends keyof DocumentEventMap>(t: K, fn: (e: DocumentEventMap[K]) => void) =>
      document.addEventListener(t, fn as EventListener, { signal });

    /* ── chrome: contenteditable + grips + block menus ── */
    $$("[data-path]", work).forEach((el) => el.setAttribute("contenteditable", "true"));
    $$(".blk", work).forEach((b) => {
      if (!b.querySelector(".blk-grip")) {
        const g = document.createElement("button");
        g.className = "blk-grip"; g.textContent = "⠿"; g.setAttribute("draggable", "true");
        g.setAttribute("aria-label", "Drag to reorder"); b.insertBefore(g, b.firstChild);
      }
      if (!b.querySelector(".blk-menu")) {
        const m = document.createElement("button");
        m.className = "blk-menu"; m.textContent = "⋯"; m.title = "Block options";
        m.setAttribute("aria-label", "Block options"); b.appendChild(m);
      }
    });

    const dirty: Record<string, string> = {};
    const locOf = (el: Element | null): { view: string; idx: number } | null => {
      const b = el?.closest?.(".blk");
      const m = /^views\.([^.]+)\.blocks\.(\d+)$/.exec(b?.getAttribute("data-block") || "");
      return m ? { view: m[1], idx: +m[2] } : null;
    };

    /* ── text edits: type → buffer, leave block → save ── */
    on("input", (e) => {
      const el = (e.target as Element).closest?.(".cwk-blocks [data-path]");
      if (el) dirty[el.getAttribute("data-path")!] = (el as HTMLElement).innerHTML.trim();
    });
    on("focusout", (e) => {
      const el = (e.target as Element).closest?.(".cwk-blocks [data-path]");
      if (!el) return;
      const p = el.getAttribute("data-path")!;
      if (!(p in dirty)) return;
      const value = dirty[p];
      delete dirty[p];
      void post({ edits: [{ path: p, value }] }).then((r) => {
        if (r) flash(r.applied ? "Saved ✓ v" + r.version : "Saved ✓", true);
      });
    });

    /* ── bubble format bar on selection ── */
    const bubble = document.createElement("div");
    bubble.className = "ck-bubble";
    bubble.innerHTML = '<button data-cmd="bold" title="Bold"><b>B</b></button><button data-cmd="italic" title="Italic"><i>I</i></button><button data-cmd="underline" title="Underline"><u>U</u></button><button data-cmd="createLink" title="Link">↗</button><button data-cmd="__comment" title="Comment">💬</button>';
    document.body.appendChild(bubble);
    on("selectionchange", () => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { bubble.classList.remove("open"); return; }
      const n = sel.anchorNode;
      const host = (n && (n.nodeType === 1 ? (n as Element) : n.parentElement))?.closest?.(".cwk-blocks [data-path]");
      if (!host) { bubble.classList.remove("open"); return; }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      bubble.style.left = Math.max(8, r.left + r.width / 2 - 90) + "px";
      bubble.style.top = Math.max(8, r.top - 46) + "px";
      bubble.classList.add("open");
    });
    bubble.addEventListener("mousedown", (e) => e.preventDefault(), { signal });
    bubble.addEventListener("click", (e) => {
      const btn = (e.target as Element).closest("button");
      if (!btn) return;
      const cmd = btn.getAttribute("data-cmd")!;
      const sel = document.getSelection();
      const host = (sel?.anchorNode && (sel.anchorNode.nodeType === 1 ? (sel.anchorNode as Element) : sel.anchorNode.parentElement))
        ?.closest?.(".cwk-blocks [data-path]") as HTMLElement | null;
      if (cmd === "__comment") { startComment(); return; }
      if (cmd === "createLink") {
        const u = prompt("Link URL:");
        if (u) document.execCommand("createLink", false, u);
      } else document.execCommand(cmd, false, undefined);
      if (host) {
        const p = host.getAttribute("data-path")!;
        void post({ edits: [{ path: p, value: host.innerHTML.trim() }] }).then((r) => r && flash("Saved ✓", true));
      }
    }, { signal });

    /* ── slash menu: registry blocks + PMM OS commands ── */
    const slash = document.createElement("div");
    slash.className = "ck-slash";
    document.body.appendChild(slash);
    type SlashItem = { label: string; icon: string; kind: "block" | "image" | "generate"; template?: Record<string, unknown> };
    const ITEMS: SlashItem[] = [
      ...menu.map((m) => ({ label: m.label, icon: m.icon, kind: "block" as const, template: m.template })),
      { label: "Image — generate from a prompt", icon: "▦", kind: "image" },
      { label: "Generate with AI (from evidence)", icon: "✦", kind: "generate" },
    ];
    let slashHost: HTMLElement | null = null, slashIdx = 0, slashQuery = "", filtered: SlashItem[] = ITEMS;
    function renderSlash() {
      const q = slashQuery.toLowerCase().trim();
      filtered = q ? ITEMS.filter((s) => s.label.toLowerCase().includes(q)) : ITEMS;
      if (slashIdx >= filtered.length) slashIdx = Math.max(0, filtered.length - 1);
      slash.innerHTML = '<div class="sh">Insert block' + (slashQuery ? " · " + slashQuery.replace(/[<>&]/g, "") : "") + "</div>" +
        (filtered.length
          ? filtered.map((s, i) => `<div class="si ${i === slashIdx ? "cur" : ""}" data-i="${i}"><span class="ic">${s.icon}</span>${s.label}</div>`).join("")
          : '<div class="si is-none">No blocks match</div>');
      $$(".si[data-i]", slash).forEach((el) =>
        el.addEventListener("mousedown", (ev) => { ev.preventDefault(); void pickSlash(+el.dataset.i!); }, { signal }));
    }
    function closeSlash() { slash.classList.remove("open"); slashHost = null; }
    async function pickSlash(i: number) {
      const item = filtered[i];
      const host = slashHost;
      closeSlash();
      if (!item || !host) return;
      const l = locOf(host);
      if (!l) return;
      const cleanHtml = host.innerHTML.replace(/\/[^<>]*$/, "").trim();
      const cleanPath = host.getAttribute("data-path")!;

      if (item.kind === "generate") {
        const instr = prompt("Generate from the research evidence — what should this block say?");
        if (!instr?.trim()) return;
        const r = await post({ generate: { view: l.view, index: l.idx + 1, instruction: instr.trim(), mode: "generate", clean: { path: cleanPath, value: cleanHtml } } });
        if (r) { flash(`Generation queued ✓ (${r.queued} pending)`, true); router.refresh(); }
        return;
      }
      if (item.kind === "image") {
        const p = prompt("Describe the image (the studio generates it and files it under this product):");
        if (!p?.trim()) return;
        flash("Generating image…");
        try {
          const res = await fetch("/api/cloud/assets", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "image", prompt: p.trim(), engagementId }),
          });
          const data = await res.json();
          snapshot();
          setPathValue(doc.current, cleanPath, cleanHtml);
          const blocks = doc.current.views[l.view].blocks!;
          if (data.ok && data.url && !data.mock) {
            blocks.splice(l.idx + 1, 0, { type: "image", id: newId(), src: data.url, caption: p.trim().slice(0, 120), assetId: data.assetId });
          } else {
            blocks.splice(l.idx + 1, 0, {
              type: "callout", id: newId(),
              callout: data.ok
                ? "<b>Image generated (mock mode).</b> It's filed under this product's Assets — real rendering starts when the generation keys are enabled."
                : "<b>Image request failed.</b> No credits were charged — try again from the Studio.",
            });
          }
          await saveFull("Inserted");
        } catch { flash("Couldn't reach the server — nothing charged."); }
        return;
      }
      // registry block
      snapshot();
      setPathValue(doc.current, cleanPath, cleanHtml);
      const nb = JSON.parse(JSON.stringify(item.template)); nb.id = newId();
      doc.current.views[l.view].blocks!.splice(l.idx + 1, 0, nb);
      await saveFull("Inserted");
    }
    on("keydown", (e) => {
      if (slash.classList.contains("open")) {
        if (e.key === "ArrowDown") { e.preventDefault(); slashIdx = Math.min(slashIdx + 1, filtered.length - 1); renderSlash(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); slashIdx = Math.max(slashIdx - 1, 0); renderSlash(); }
        else if (e.key === "Enter") { e.preventDefault(); void pickSlash(slashIdx); }
        else if (e.key === "Escape") closeSlash();
        return;
      }
      if (e.key === "/") {
        const host = (document.activeElement as Element | null)?.closest?.(".cwk-blocks [data-path]") as HTMLElement | null;
        if (host && !host.closest("table")) {
          slashHost = host; slashIdx = 0; slashQuery = "";
          setTimeout(() => {
            renderSlash();
            const r = host.getBoundingClientRect();
            slash.style.left = Math.max(8, r.left) + "px";
            slash.style.top = r.bottom + 6 + "px";
            slash.classList.add("open");
          }, 0);
        }
      }
      /* structural undo/redo when not typing inside a block */
      const inText = (document.activeElement as HTMLElement | null)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !inText) {
        e.preventDefault();
        if (e.shiftKey) void redo(); else void undo();
      }
    });
    on("input", (e) => {
      if (!slash.classList.contains("open") || !slashHost) return;
      if ((e.target as Element).closest?.(".cwk-blocks [data-path]") !== slashHost) return;
      const t = slashHost.textContent || "", k = t.lastIndexOf("/");
      if (k < 0) { closeSlash(); return; }
      slashQuery = t.slice(k + 1); slashIdx = 0; renderSlash();
    });
    on("click", (e) => { if (!slash.contains(e.target as Node)) slash.classList.remove("open"); });

    /* ── markdown triggers on plain-text blocks ── */
    const MD: Array<[RegExp, (keep: Record<string, unknown>) => Record<string, unknown>]> = [
      [/^###\s$/, (keep) => ({ type: "heading", level: 3, ...keep, h: "Heading 3" })],
      [/^##\s$/, (keep) => ({ type: "heading", level: 2, ...keep, h: "Heading 2" })],
      [/^#\s$/, (keep) => ({ type: "heading", level: 1, ...keep, h: "Heading 1" })],
      [/^[-*]\s$/, (keep) => ({ type: "list", ...keep, list: ["New item"] })],
      [/^>\s$/, (keep) => ({ type: "quote", ...keep, quote: "New quote" })],
      [/^\[\]\s$/, (keep) => ({ type: "todo", ...keep, todo: [["New to-do", false]] })],
      [/^```\s?$/, (keep) => ({ type: "code", ...keep, code: "command --flag" })],
    ];
    on("input", (e) => {
      if (slash.classList.contains("open")) return;
      const host = (e.target as Element).closest?.(".cwk-blocks [data-path]") as HTMLElement | null;
      if (!host) return;
      const l = locOf(host);
      if (!l) return;
      const b = doc.current.views[l.view]?.blocks?.[l.idx];
      if (!b || b.p == null) return;
      const t = host.textContent || "";
      for (const [re, make] of MD) {
        if (re.test(t)) {
          snapshot();
          doc.current.views[l.view].blocks![l.idx] = make(b.id ? { id: b.id } : {});
          void saveFull("Converted");
          return;
        }
      }
    });

    /* ── block menu (⋯): turn into · move to · AI · duplicate · delete ── */
    const blkMenu = document.createElement("div");
    blkMenu.className = "ck-blkmenu";
    document.body.appendChild(blkMenu);
    let menuLoc: { view: string; idx: number } | null = null;
    function openBlkMenu(btn: Element) {
      const l = locOf(btn);
      if (!l) return;
      const b = doc.current.views[l.view]?.blocks?.[l.idx];
      if (!b) return;
      const type = (b.type as string) || (b.p != null ? "text" : b.h != null ? "heading" : b.quote != null ? "quote" : b.callout != null ? "callout" : Array.isArray(b.list) ? "list" : Array.isArray(b.todo) ? "todo" : b.code != null ? "code" : "");
      const tos = transform[type] || [];
      let html = tos.length ? '<div class="bm-h">Turn into</div>' + tos.map((t) => `<div class="bm-i" data-act="turn" data-to="${t}"><span class="bm-ic">⤳</span>${t}</div>`).join("") : "";
      const others = viewList.filter((v) => v.id !== l.view);
      if (others.length) html += '<div class="bm-h">Move to</div>' + others.map((v) => `<div class="bm-i" data-act="move" data-to="${v.id}"><span class="bm-ic">→</span>${v.label}</div>`).join("");
      html += '<div class="bm-h">AI</div><div class="bm-i" data-act="gen"><span class="bm-ic">✦</span>Regenerate from evidence</div>';
      html += '<div class="bm-h">Block</div><div class="bm-i" data-act="dup"><span class="bm-ic">⧉</span>Duplicate</div><div class="bm-i bm-del" data-act="del"><span class="bm-ic">✕</span>Delete</div>';
      blkMenu.innerHTML = html;
      const r = btn.getBoundingClientRect();
      blkMenu.style.left = Math.max(8, Math.min(window.innerWidth - 216, r.left - 160)) + "px";
      blkMenu.style.top = r.bottom + 4 + "px";
      blkMenu.classList.add("open");
      menuLoc = l;
    }
    on("click", (e) => {
      const btn = (e.target as Element).closest?.(".blk-menu");
      if (btn) { e.stopPropagation(); openBlkMenu(btn); return; }
      const item = (e.target as Element).closest?.(".ck-blkmenu .bm-i");
      if (item && menuLoc) {
        const l = menuLoc;
        menuLoc = null;
        blkMenu.classList.remove("open");
        const arr = doc.current.views[l.view].blocks!;
        const b = arr[l.idx];
        const act = item.getAttribute("data-act");
        if (act === "gen") {
          const gInstr = prompt("Regenerate this block from the evidence — any specific direction? (optional)");
          if (gInstr === null) return;
          void post({ generate: { view: l.view, index: l.idx, blockId: (b.id as string) || null, mode: "regenerate", instruction: gInstr.trim() || "Regenerate this block from the evidence, keeping its role in the page" } })
            .then((r) => { if (r) flash(`Regeneration queued ✓ (${r.queued} pending)`, true); });
          return;
        }
        snapshot();
        if (act === "turn") arr[l.idx] = convertBlock(b, item.getAttribute("data-to")!);
        else if (act === "dup") { const cl = JSON.parse(JSON.stringify(b)); cl.id = newId(); arr.splice(l.idx + 1, 0, cl); }
        else if (act === "move") { const to = item.getAttribute("data-to")!; if (doc.current.views[to]) { const mv = arr.splice(l.idx, 1)[0]; (doc.current.views[to].blocks ||= []).push(mv); } }
        else if (act === "del") { if (!confirm("Delete this block?")) { undoStack.current.pop(); return; } arr.splice(l.idx, 1); }
        void saveFull();
        return;
      }
      if (!blkMenu.contains(e.target as Node)) { blkMenu.classList.remove("open"); menuLoc = null; }
    });

    /* ── drag reorder within the view ── */
    let dragFrom: string | null = null;
    on("dragstart", (e) => {
      const g = (e.target as Element).closest?.(".blk-grip");
      if (!g) return;
      const b = g.closest(".blk")!;
      dragFrom = b.getAttribute("data-block");
      b.classList.add("dragging");
      e.dataTransfer!.effectAllowed = "move";
    });
    on("dragover", (e) => {
      if (!dragFrom) return;
      const b = (e.target as Element).closest?.(".blk");
      if (!b) return;
      e.preventDefault();
      $$(".blk").forEach((x) => x.classList.remove("dropbefore", "dropafter"));
      const r = b.getBoundingClientRect();
      b.classList.add(e.clientY < r.top + r.height / 2 ? "dropbefore" : "dropafter");
    });
    on("drop", (e) => {
      if (!dragFrom) return;
      e.preventDefault();
      const b = (e.target as Element).closest?.(".blk");
      const before = b ? e.clientY < b.getBoundingClientRect().top + b.getBoundingClientRect().height / 2 : false;
      $$(".blk").forEach((x) => x.classList.remove("dropbefore", "dropafter", "dragging"));
      const f = /^views\.([^.]+)\.blocks\.(\d+)$/.exec(dragFrom);
      const t = b ? /^views\.([^.]+)\.blocks\.(\d+)$/.exec(b.getAttribute("data-block") || "") : null;
      dragFrom = null;
      if (!f || !t || f[1] !== t[1]) return;
      snapshot();
      const arr = doc.current.views[f[1]].blocks!;
      const fi = +f[2]; let ti = +t[2];
      const it = arr.splice(fi, 1)[0];
      if (fi < ti) ti--;
      if (!before) ti++;
      arr.splice(ti, 0, it);
      void saveFull("Reordered");
    });
    on("dragend", () => $$(".blk").forEach((x) => x.classList.remove("dropbefore", "dropafter", "dragging")));

    /* ── comments: selection → anchored, marks + panel ── */
    const cmPop = document.createElement("div");
    cmPop.className = "ck-cmpop";
    cmPop.innerHTML = '<div class="q"></div><textarea rows="3" placeholder="Add a comment…"></textarea><div class="acts"><button class="ghost" data-cm="cancel">Cancel</button><button data-cm="save">Comment</button></div>';
    document.body.appendChild(cmPop);
    let pending: { path: string; bid: string; quote: string } | null = null;
    function startComment() {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      const n = sel.anchorNode;
      const host = (n && (n.nodeType === 1 ? (n as Element) : n.parentElement))?.closest?.(".cwk-blocks [data-path]");
      if (!host) return;
      const blk = host.closest(".blk");
      pending = {
        path: host.getAttribute("data-path")!,
        bid: blk?.getAttribute("data-bid") || "",
        quote: sel.toString().trim().slice(0, 240),
      };
      (cmPop.querySelector(".q") as HTMLElement).textContent = "“" + pending.quote + "”";
      (cmPop.querySelector("textarea") as HTMLTextAreaElement).value = "";
      const r = sel.getRangeAt(0).getBoundingClientRect();
      cmPop.style.left = Math.min(window.innerWidth - 320, Math.max(8, r.left)) + "px";
      cmPop.style.top = r.bottom + 10 + "px";
      bubble.classList.remove("open");
      cmPop.classList.add("open");
      setTimeout(() => (cmPop.querySelector("textarea") as HTMLTextAreaElement).focus(), 0);
    }
    cmPop.addEventListener("click", (e) => {
      const b = (e.target as Element).closest("button");
      if (!b) return;
      if (b.dataset.cm === "cancel") { cmPop.classList.remove("open"); pending = null; return; }
      const body = (cmPop.querySelector("textarea") as HTMLTextAreaElement).value.trim();
      cmPop.classList.remove("open");
      if (!pending || !body) { pending = null; return; }
      const c: Comment = { id: "c" + Date.now().toString(36), bid: pending.bid, path: pending.path, quote: pending.quote, body, view: viewId, ts: Date.now() };
      pending = null;
      saveComments([...commentsRef.current, c]);
      setPanelOpen(true);
      setTimeout(applyMarks, 50);
    }, { signal });

    function clearMarks() {
      $$(".cmark", work).forEach((m) => {
        const p = m.parentNode!;
        while (m.firstChild) p.insertBefore(m.firstChild, m);
        p.removeChild(m);
        (p as HTMLElement).normalize?.();
      });
    }
    function applyMarks() {
      clearMarks();
      for (const c of commentsRef.current) {
        if (!c.quote || c.resolved) continue;
        const host = (c.bid ? work!.querySelector(`.blk[data-bid="${c.bid}"]`) : work!.querySelector(`[data-path="${CSS.escape(c.path)}"]`)) as HTMLElement | null;
        if (!host) continue;
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const i = node.nodeValue!.indexOf(c.quote);
          if (i >= 0) {
            const range = document.createRange();
            range.setStart(node, i); range.setEnd(node, i + c.quote.length);
            const span = document.createElement("span");
            span.className = "cmark"; span.setAttribute("data-cmt", c.id);
            try { range.surroundContents(span); } catch { /* crosses elements — skip */ }
            break;
          }
        }
      }
    }
    applyMarks();
    on("click", (e) => {
      const m = (e.target as Element).closest?.(".cmark");
      if (m) setPanelOpen(true);
    });

    return () => {
      abort.abort();
      bubble.remove(); slash.remove(); blkMenu.remove(); cmPop.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId, engagementId]);

  const open = comments.filter((c) => !c.resolved);
  return (
    <>
      <button className="ck-cmt-toggle" onClick={() => setPanelOpen((o) => !o)} type="button" aria-expanded={panelOpen}>
        Comments{open.length ? ` (${open.length})` : ""}
      </button>
      {panelOpen ? (
        <aside className="ck-panel" aria-label="Comments">
          <div className="ck-panel-h">
            <strong>Comments</strong>
            <button onClick={() => setPanelOpen(false)} type="button" aria-label="Close comments">✕</button>
          </div>
          {comments.length === 0 ? (
            <p className="ck-panel-empty">No comments yet. Select text in the page, then hit 💬 in the toolbar that appears.</p>
          ) : (
            comments.slice().reverse().map((c) => (
              <div className={`ck-cmt ${c.resolved ? "is-resolved" : ""}`} key={c.id}>
                <div className="q">“{c.quote}”</div>
                <div className="b">{c.body}</div>
                <div className="m">
                  <span>{c.view}</span>
                  <button onClick={() => saveComments(comments.map((x) => x.id === c.id ? { ...x, resolved: !x.resolved } : x))} type="button">
                    {c.resolved ? "reopen" : "resolve"}
                  </button>
                  <button onClick={() => saveComments(comments.filter((x) => x.id !== c.id))} type="button">delete</button>
                </div>
              </div>
            ))
          )}
        </aside>
      ) : null}
      {pill ? <div className={`ck-pill ${pill.ok ? "ok" : ""}`} role="status">{pill.text}</div> : null}
    </>
  );
}

function newId(): string {
  return "blk_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
function setPathValue(obj: Record<string, unknown>, path: string, val: unknown): void {
  const s = path.split(".");
  let c: Record<string, unknown> = obj;
  for (let i = 0; i < s.length - 1; i++) {
    if (c[s[i]] == null) return;
    c = c[s[i]] as Record<string, unknown>;
  }
  c[s[s.length - 1]] = val;
}
function textOf(b: Record<string, unknown>): string {
  if (b.h != null) return String(b.h);
  if (b.p != null) return String(b.p);
  if (b.quote != null) return String(b.quote);
  if (b.callout != null) return String(b.callout);
  if (b.code != null) return String(b.code);
  if (Array.isArray(b.list)) return (b.list as string[]).join("\n");
  if (Array.isArray(b.todo)) return (b.todo as Array<[string, boolean]>).map((t) => t[0]).join("\n");
  return "";
}
function listOf(b: Record<string, unknown>): string[] {
  if (Array.isArray(b.list)) return (b.list as string[]).slice();
  if (Array.isArray(b.todo)) return (b.todo as Array<[string, boolean]>).map((t) => t[0]);
  const t = textOf(b);
  return t ? t.split("\n") : [""];
}
function convertBlock(b: Record<string, unknown>, to: string): Record<string, unknown> {
  const keep = b.id ? { id: b.id } : {};
  if (to === "heading") return { type: "heading", ...keep, h: textOf(b) };
  if (to === "text") return { type: "text", ...keep, p: textOf(b) };
  if (to === "quote") return { type: "quote", ...keep, quote: textOf(b) };
  if (to === "callout") return { type: "callout", ...keep, callout: textOf(b) };
  if (to === "list") return { type: "list", ...keep, list: listOf(b) };
  if (to === "todo") return { type: "todo", ...keep, todo: listOf(b).map((t) => [t, false]) };
  if (to === "code") return { type: "code", ...keep, code: textOf(b).replace(/<[^>]+>/g, "") };
  return b;
}
