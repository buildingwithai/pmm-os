"use client";

/**
 * ⌘K palette for the cloud workspace: jump to any section of the current
 * product instantly, and full-text search across every kit + the evidence
 * ledger via /api/cloud/search (debounced). Same interaction grammar as the
 * local kit's palette: arrows, enter, escape.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { kind: string; label: string; detail?: string; href: string };

export function WorkspacePalette({ local }: { local: Item[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<Item[]>([]);
  const [cur, setCur] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQ(""); setRemote([]); setCur(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 10); }, [open]);

  const search = useCallback((value: string) => {
    setQ(value); setCur(0);
    clearTimeout(debounce.current);
    if (value.trim().length < 2) { setRemote([]); return; }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cloud/search?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setRemote(Array.isArray(data.results) ? data.results : []);
      } catch { setRemote([]); }
    }, 220);
  }, []);

  const needle = q.toLowerCase().trim();
  const localHits = needle ? local.filter((i) => i.label.toLowerCase().includes(needle)) : local;
  const seen = new Set(localHits.map((i) => i.href));
  const items = [...localHits, ...remote.filter((r) => !seen.has(r.href))].slice(0, 25);

  function choose(i: number) {
    const it = items[i];
    if (!it) return;
    setOpen(false);
    router.push(it.href);
  }

  if (!open) {
    return (
      <button className="ck-palette-hint" onClick={() => setOpen(true)} type="button" aria-label="Open command palette">
        Search <kbd>⌘K</kbd>
      </button>
    );
  }
  return (
    <div className="ck-scrim" onClick={() => setOpen(false)} role="presentation">
      <div aria-label="Command palette" className="ck-palette" onClick={(e) => e.stopPropagation()} role="dialog">
        <input
          aria-label="Search sections and evidence"
          onChange={(e) => search(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setCur((c) => Math.min(c + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setCur((c) => Math.max(c - 1, 0)); }
            else if (e.key === "Enter") choose(cur);
          }}
          placeholder="Jump to a section, or search every kit and the evidence ledger…"
          ref={inputRef}
          value={q}
        />
        <div className="ck-palette-res">
          {items.length === 0 ? (
            <div className="pitem is-none">{needle.length >= 2 ? "No matches across your products" : "Type to search"}</div>
          ) : (
            items.map((it, i) => (
              <button className={`pitem ${i === cur ? "cur" : ""}`} key={it.href + i} onClick={() => choose(i)} type="button">
                <span className="pi">{it.kind === "evidence" ? "“" : "§"}</span>
                <span className="pl">{it.label}{it.detail ? <small>{it.detail}</small> : null}</span>
                <span className="pk">{it.kind}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
