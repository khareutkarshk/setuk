"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { Dictionary } from "@/content";
import * as I from "@/components/icons";
import type { Option } from "@/lib/voter-list/types";

type Labels = Dictionary["pages"]["voterList"]["finder"];
type Key = "state" | "district" | "ac";

/* which picker to focus once a pick has moved to its page (the page remounts, so focus would fall to <body>) */
const FOCUS_KEY = "setuk-finder-focus";

/**
 * The three pickers over the voter list cards. A choice moves to that area's page (state, then
 * district, then constituency), so every list has its own address. `base` is the locale's
 * /voter-list-excel path. Without script the cards' own links lead to the same pages.
 *
 * A pick made with a mouse or touch opens its page at once, as the hint says. With the keyboard the
 * arrows only change the choice (on Windows each arrow press fires `change`, so moving on change would
 * open a page per key press); Enter or the Show button opens it. Focus then returns to the picker that
 * comes next.
 */
export function VoterListFinder({ base, options, selected, labels }: { base: string; options: { states: Option[]; districts: Option[]; acs: Option[] }; selected: { state?: string; district?: string; ac?: string }; labels: Labels }) {
  const id = useId();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<{ key: Key; value: string } | null>(null);
  const via = useRef<"pointer" | "keys">("pointer");

  useEffect(() => {
    try {
      const k = sessionStorage.getItem(FOCUS_KEY);
      if (!k) return;
      sessionStorage.removeItem(FOCUS_KEY);
      document.querySelector<HTMLSelectElement>(`[data-finder="${k}"]:not(:disabled)`)?.focus({ preventScroll: true });
    } catch { /* storage blocked: focus stays where the browser puts it */ }
  }, []);

  const go = (slugs: (string | undefined)[], next: Key) => {
    try { sessionStorage.setItem(FOCUS_KEY, next); } catch { /* storage blocked */ }
    const path = [base, ...slugs.filter(Boolean)].join("/");
    setDraft(null);
    start(() => router.push(path, { scroll: false }));
  };

  const fields: { key: Key; label: string; value?: string; list: Option[]; all: string; off: boolean; pick: (v: string) => void }[] = [
    { key: "state", label: labels.state, value: selected.state, list: options.states, all: labels.allStates, off: false, pick: (v) => go([v], v ? "district" : "state") },
    { key: "district", label: labels.district, value: selected.district, list: options.districts, all: selected.state ? labels.allDistricts : labels.pickState, off: !selected.state || !options.districts.length, pick: (v) => go([selected.state, v], v ? "ac" : "district") },
    { key: "ac", label: labels.ac, value: selected.ac, list: options.acs, all: selected.district ? labels.allAcs : labels.pickDistrict, off: !selected.district || !options.acs.length, pick: (v) => go([selected.state, selected.district, v], "ac") }
  ];
  /* a pending keyboard choice on a picker greys out the ones after it, whose options belong to the old choice */
  const draftAt = draft ? fields.findIndex((f) => f.key === draft.key) : -1;
  const commit = () => { if (draft) fields.find((f) => f.key === draft.key)?.pick(draft.value); };

  return (
    <div aria-busy={pending} className="rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_60px_-40px_color-mix(in_srgb,var(--accent)_45%,transparent)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[15px] font-semibold"><I.MagnifyingGlass className="text-accent" aria-hidden />{labels.title}</p>
        {selected.state && (
          <Link href={base} scroll={false} className="inline-flex min-h-9 items-center gap-1.5 text-[14px] font-medium text-muted transition-colors hover:text-ink">
            <I.ClockCounterClockwise aria-hidden />{labels.reset}
          </Link>
        )}
      </div>
      <p id={`${id}-hint`} className="mt-1 text-[13px] text-muted">{labels.hint}</p>
      <div className={`mt-4 grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] md:items-end ${pending ? "opacity-70 transition-opacity" : ""}`}>
        {fields.map((f, i) => (
          <div key={f.key}>
            <label htmlFor={`${id}-${f.key}`} className="text-[13px] font-semibold text-muted">{f.label}</label>
            <div className="relative mt-1.5">
              <select id={`${id}-${f.key}`} data-finder={f.key} aria-describedby={`${id}-hint`}
                value={draft?.key === f.key ? draft.value : f.value ?? ""}
                disabled={f.off || (draftAt >= 0 && i > draftAt)}
                onPointerDown={() => { via.current = "pointer"; }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft?.key === f.key) { e.preventDefault(); commit(); }
                  else if (e.key !== "Tab") via.current = "keys";
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  if (via.current === "pointer") f.pick(v);
                  else setDraft(v === (f.value ?? "") ? null : { key: f.key, value: v });
                }}
                className="block h-12 w-full appearance-none truncate rounded-xl border border-line bg-bg pr-10 pl-4 text-[16px] text-ink transition-colors hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25 disabled:cursor-not-allowed disabled:text-muted disabled:hover:border-line">
                <option value="">{f.all}</option>
                {f.list.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}
              </select>
              <I.CaretRight className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-90 text-muted" aria-hidden />
            </div>
          </div>
        ))}
        <button type="button" onClick={commit} aria-disabled={!draft}
          className="press inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:brightness-100">
          {labels.go}<I.ArrowRight weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}
