// Server-side kit view renderer — drives the VENDORED block registry with the
// same ctx contract build-kit.mjs injects locally. Port, not a rewrite: block
// HTML is byte-identical to the local kit. Widgets render as labeled
// placeholders this phase (full widget parity is the next slice).
// @ts-ignore vendored untyped module
import { REGISTRY, resolveType, blockMenu, transformMap } from "./block-registry.mjs";

// Cloud-only block extension: inline image (registry file is a vendored
// byte-copy — extend here, never there). `/image` in the editor and the studio
// both emit this shape: { type:"image", src, alt?, caption?, assetId? }.
(REGISTRY as Record<string, unknown>)["image"] = {
  detect: (b: Record<string, unknown>) => b.src != null && b.widget == null,
  render: (b: Record<string, unknown>, p: string, x: { attr: (s: unknown) => string; esc: (s: unknown) => string }) =>
    `<figure class="kimg"><img src="${x.attr(b.src)}" alt="${x.attr(b.alt || b.caption || "generated image")}" loading="lazy"/>` +
    (b.caption ? `<figcaption data-path="${p}.caption">${b.caption}</figcaption>` : "") + `</figure>`,
  markdown: (b: Record<string, unknown>, x: { strip: (s: unknown) => string }) =>
    `![${x.strip(b.alt || b.caption || "image")}](${b.src})`,
};

/** editor metadata for the client — registry slash menu + cloud PMM commands */
export function editorMeta(): { menu: unknown[]; transform: Record<string, string[]> } {
  return { menu: blockMenu(), transform: transformMap() };
}

function renderBlock(b: Record<string, unknown>, path: string, ctx: unknown): string {
  const type = resolveType(b);
  const entry = type ? (REGISTRY as Record<string, { render?: (b: unknown, p: string, x: unknown) => string }>)[type] : null;
  if (!entry?.render) return "";
  return entry.render(b, path, ctx);
}

type Block = Record<string, unknown>;
export type KitContent = {
  meta?: { title?: string; wordmark?: string };
  sidebar?: Array<{ group: string; items: Array<[string, string, string]> }>;
  views?: Record<string, { eyebrow?: string; title?: string; h1?: string; sub?: string; blocks?: Block[] }>;
  data?: Record<string, unknown>;
};

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function attr(s: unknown): string {
  return esc(s).replace(/"/g, "&quot;");
}
function strip(s: unknown): string {
  return String(s ?? "").replace(/<[^>]*>/g, "");
}

type W = Record<string, unknown>;
function widgetHtml(name: string, data: W, viewHref: (id: string) => string): string {
  const rows = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  switch (name) {
    case "stats":
      return `<div class="stats" data-w="stats">${rows<[string, string, number]>(data.stats)
        .map((s) => `<div><div class="n">${esc(s[0])}</div><div class="l">${esc(s[1])}</div></div>`).join("")}</div>`;
    case "kitrows":
      return `<div class="rows">${rows<[string, string, string]>(data.kit)
        .map((k) => `<a class="row sel-able" href="${attr(viewHref(k[2]))}" style="text-decoration:none;color:inherit"><div><div class="t">${esc(k[0])} · ${esc(k[1])}</div></div><div class="meta">open →</div></a>`).join("")}</div>`;
    case "taglines":
      return rows<string>(data.taglines)
        .map((t) => `<div class="copyline"><span>${t}</span></div>`).join("");
    case "msgvariants": {
      const mv = rows<[string, string]>(data.msgVariants);
      return `<div class="tabs">${mv.map((m, i) => `<button class="${i ? "" : "active"}" disabled>${esc(m[0])}</button>`).join("")}</div>` +
        mv.map((m, i) => `<div class="copyline"${i ? ' style="margin-top:8px"' : ""}><span><b>${esc(m[0])}:</b> "${m[1]}"</span></div>`).join("");
    }
    case "pricing": {
      const P = data.pricing as { tiers?: string[][]; features?: string[][] } | undefined;
      if (!P?.tiers) return "";
      let html = `<table><thead><tr><th>Capability</th>${P.tiers.map((t) => `<th>${esc(t[0])}</th>`).join("")}</tr></thead><tbody>`;
      html += `<tr><td>Price</td>${P.tiers.map((t) => `<td class="num"><b style="color:var(--accent)">${esc(t[1])}</b> <span class="dim">/mo</span></td>`).join("")}</tr>`;
      html += (P.features || []).map((f) => `<tr>${f.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
      return html + "</tbody></table>";
    }
    case "checklist-launch":
    case "checklist-rev": {
      const items = rows<string>(name === "checklist-launch" ? data.launchActs : data.revisions);
      return items.map((a) => `<label class="chk"><input type="checkbox" disabled><span class="ct">${a}</span></label>`).join("");
    }
    case "scorecard":
      return rows<[string, number]>(data.scorecard)
        .map((sc) => `<div class="scrow"><span>${esc(sc[0])}</span><div class="track"><div class="fill" style="width:${(sc[1] / 5) * 100}%"></div></div><b style="color:var(--accent)">${sc[1]}</b></div>`).join("");
    case "gallery":
      return `<div class="gal">${rows<[string, string, string]>(data.gallery)
        .map((g) => `<div class="gframe"><div class="gpane" style="aspect-ratio:${attr((g[1] || "1:1").replace(":", "/"))}"><div class="rr">${esc(g[1])}</div><div><div class="nm">${esc(g[0])}</div></div></div></div>`).join("")}</div>`;
    case "exportFiles":
      return `<div class="rows">${rows<[string, string]>(data.exportFiles)
        .map((f) => `<div class="row"><div><div class="t">${esc(f[0])}</div></div><div class="meta">${esc(f[1])}</div></div>`).join("")}</div>`;
    case "exportDocs":
      return `<div class="rows">${rows<string>(data.exportDocs)
        .map((d) => `<div class="row"><div><div class="t">${esc(d)}.md</div></div><div class="meta">markdown</div></div>`).join("")}</div>`;
    default:
      return `<div class="cwk-widget" role="note">widget · ${esc(name)} <span>interactive in the editor phase</span></div>`;
  }
}

function makeCtx(data: W, viewHref: (id: string) => string) {
  const ctx = {
    esc,
    attr,
    strip,
    widget(name: string): string {
      return widgetHtml(name, data, viewHref);
    },
    widgetMd(name: string): string {
      return `*(widget: ${strip(name)})*`;
    },
    block(b: Block, path: string): string {
      return renderBlock(b, path, ctx);
    },
    blockMd(b: Block): string {
      return strip((b as { p?: string }).p || (b as { h?: string }).h || "");
    },
  };
  return ctx;
}

export function renderView(
  kit: KitContent,
  viewId: string,
  viewHref: (id: string) => string = (id) => `?view=${encodeURIComponent(id)}`,
): { head: string; bodyHtml: string } | null {
  const view = kit.views?.[viewId];
  if (!view) return null;
  const ctx = makeCtx((kit.data || {}) as W, viewHref);
  // same .blk chrome contract as build-kit.mjs line 41 — the editor's block
  // grips, menus, and drag targets hang off data-block/data-bid
  const blocks = (view.blocks || [])
    .map((b, i) => {
      let inner: string;
      try {
        inner = renderBlock(b, `views.${viewId}.blocks.${i}`, ctx);
      } catch {
        inner = `<div class="cwk-widget">unrenderable block (${esc(resolveType?.(b) ?? "unknown")})</div>`;
      }
      return `<div class="blk" data-block="views.${viewId}.blocks.${i}" data-bid="${attr((b as { id?: string }).id || "")}">${inner}</div>`;
    })
    .join("\n");
  const head = `
    ${view.eyebrow ? `<span class="eyebrow">${esc(view.eyebrow)}</span>` : ""}
    <h1>${view.h1 || view.title || ""}</h1>
    ${view.sub ? `<p class="sub">${view.sub}</p>` : ""}`;
  return { head, bodyHtml: blocks };
}

export function firstViewId(kit: KitContent): string | null {
  const fromSidebar = kit.sidebar?.[0]?.items?.[0]?.[2];
  if (fromSidebar && kit.views?.[fromSidebar]) return fromSidebar;
  const keys = Object.keys(kit.views || {});
  return keys[0] || null;
}
