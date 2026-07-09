"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A living terminal that replays a real research run — the product demonstrating
 * itself. Starts when scrolled into view; respects prefers-reduced-motion by
 * rendering the finished transcript immediately.
 */

type Line = { text: string; tone?: "cmd" | "dim" | "ok" | "accent" };

const LINES: Line[] = [
  { text: "$ take Plotline to market", tone: "cmd" },
  { text: "── research brief · scope locked: PMs at self-serve SaaS · US · Q3", tone: "dim" },
  { text: "── plan gate: hypothesis.md + issue-tree.md written · 10 desks queued", tone: "dim" },
  { text: "▸ customer desk    reddit ✓ 14 threads · x ✓ · yt ✓ 8 transcripts", tone: "ok" },
  { text: "▸ competitive desk 6 rivals read · roadmaps ✓ · linkedin ✓ · github ✓", tone: "ok" },
  { text: "▸ reviews desk     store reviews ✓ · trustpilot ✓ · objection bank: 12", tone: "ok" },
  { text: "▸ events desk      18 in-geo events ranked · saturation logged", tone: "ok" },
  { text: "▸ kol desk         tiktok ✓ · instagram ✓ · top-10 ranked by reach", tone: "ok" },
  { text: "… 5 more desks · every claim typed + dated + cited", tone: "dim" },
  { text: "── adversarial pass: 1 finding refined · 0 refuted", tone: "dim" },
  { text: "✓ evidence ledger: 89 records → positioning · messaging · pricing", tone: "accent" },
  { text: "✓ launch kit built → plotline-launch-kit.html (⌘K · present · export)", tone: "accent" },
];

export function TerminalRun() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(LINES.length);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || count >= LINES.length) return;
    const delay = count === 0 ? 350 : LINES[count - 1]?.tone === "dim" ? 420 : 620;
    const timer = setTimeout(() => setCount((current) => current + 1), delay);
    return () => clearTimeout(timer);
  }, [started, count]);

  return (
    <div aria-label="A PMM OS research run, replayed" className="ut-terminal" ref={ref} role="img">
      <div className="ut-terminal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <em>claude — pmm-os</em>
      </div>
      <div className="ut-terminal-body">
        {LINES.slice(0, count).map((line) => (
          <p className={`is-${line.tone || "plain"}`} key={line.text}>
            {line.text}
          </p>
        ))}
        {count < LINES.length ? <span aria-hidden="true" className="ut-terminal-caret" /> : null}
      </div>
    </div>
  );
}
