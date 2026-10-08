"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import * as I from "@/components/icons";

/**
 * Search over the FAQ page. The questions are server-rendered disclosures ([data-faq], grouped in
 * [data-faq-group]); typing hides the ones that don't match, opens the ones that do, and hides
 * groups left empty. The count is announced politely. Without script the full list shows.
 */
export function FaqSearch({ label, clear, results, none, children }: { label: string; clear: string; results: string; none: string; children: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    root.querySelectorAll<HTMLElement>("[data-faq-group]").forEach((g) => {
      let inGroup = 0;
      g.querySelectorAll<HTMLDetailsElement>("[data-faq]").forEach((d) => {
        const text = d.textContent?.toLowerCase() ?? "";
        const on = terms.every((t) => text.includes(t));
        d.hidden = !on;
        if (terms.length) d.open = on;
        if (on) inGroup++;
      });
      g.hidden = inGroup === 0;
      count += inGroup;
    });
    setN(terms.length ? count : null);
  }, [q]);

  return (
    <div ref={ref}>
      <div className="relative max-w-[560px]">
        <label htmlFor={id} className="sr-only">{label}</label>
        <I.MagnifyingGlass size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
        <input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={label} autoComplete="off"
          className="h-13 w-full rounded-full border border-line bg-surface pr-12 pl-12 text-[16px] transition-colors placeholder:text-muted hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25" />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label={clear} className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-bg hover:text-ink">
            <I.X size={16} aria-hidden />
          </button>
        )}
      </div>
      <p role="status" className="mt-3 min-h-6 text-[14px] text-muted">{n === null ? "" : n ? results.replace("{n}", String(n)) : ""}</p>
      {children}
      {n === 0 && <p className="mt-4 rounded-3xl border border-dashed border-line p-10 text-center text-muted">{none}</p>}
    </div>
  );
}
