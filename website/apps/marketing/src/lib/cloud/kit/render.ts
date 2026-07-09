// Server-side kit view renderer — drives the VENDORED block registry with the
// same ctx contract build-kit.mjs injects locally. Port, not a rewrite: block
// HTML is byte-identical to the local kit. Widgets render as labeled
// placeholders this phase (full widget parity is the next slice).
// @ts-ignore vendored untyped module
import { REGISTRY, resolveType } from "./block-registry.mjs";

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

function makeCtx() {
  const ctx = {
    esc,
    attr,
    strip,
    widget(name: string): string {
      return `<div class="cwk-widget" role="note">widget · ${esc(name)} <span>interactive widgets land with the editor phase</span></div>`;
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

export function renderView(kit: KitContent, viewId: string): { head: string; bodyHtml: string } | null {
  const view = kit.views?.[viewId];
  if (!view) return null;
  const ctx = makeCtx();
  const blocks = (view.blocks || [])
    .map((b, i) => {
      try {
        return renderBlock(b, `views.${viewId}.blocks.${i}`, ctx);
      } catch {
        return `<div class="cwk-widget">unrenderable block (${esc(resolveType?.(b) ?? "unknown")})</div>`;
      }
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
