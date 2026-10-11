"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import * as I from "@/components/icons";
import type { Option } from "@/lib/voter-list/types";

type Labels = { title: string; state: string; district: string; ac: string; allStates: string; allDistricts: string; allAcs: string; pickState: string; pickDistrict: string; reset: string };

/**
 * The three pickers over the voter list cards. Each choice moves to that area's page (state, then
 * district, then constituency), so every list has its own address. `base` is the locale's
 * /voter-list-excel path. Without script the cards' own links lead to the same pages.
 */
export function VoterListFinder({ base, options, selected, labels }: { base: string; options: { states: Option[]; districts: Option[]; acs: Option[] }; selected: { state?: string; district?: string; ac?: string }; labels: Labels }) {
  const id = useId();
  const router = useRouter();
  const [pending, start] = useTransition();
  const go = (slugs: (string | undefined)[]) => {
    const path = [base, ...slugs.filter(Boolean)].join("/");
    start(() => router.push(path, { scroll: false }));
  };

  const fields = [
    { key: "state", label: labels.state, value: selected.state, list: options.states, all: labels.allStates, off: false, pick: (v: string) => go([v]) },
    { key: "district", label: labels.district, value: selected.district, list: options.districts, all: selected.state ? labels.allDistricts : labels.pickState, off: !selected.state || !options.districts.length, pick: (v: string) => go([selected.state, v]) },
    { key: "ac", label: labels.ac, value: selected.ac, list: options.acs, all: selected.district ? labels.allAcs : labels.pickDistrict, off: !selected.district || !options.acs.length, pick: (v: string) => go([selected.state, selected.district, v]) }
  ];

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
      <div className={`mt-4 grid gap-4 md:grid-cols-3 ${pending ? "opacity-70 transition-opacity" : ""}`}>
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`${id}-${f.key}`} className="text-[13px] font-semibold text-muted">{f.label}</label>
            <div className="relative mt-1.5">
              <select id={`${id}-${f.key}`} value={f.value ?? ""} disabled={f.off} onChange={(e) => f.pick(e.target.value)}
                className="block h-12 w-full appearance-none truncate rounded-xl border border-line bg-bg pr-10 pl-4 text-[16px] text-ink transition-colors hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25 disabled:cursor-not-allowed disabled:text-muted disabled:hover:border-line">
                <option value="">{f.all}</option>
                {f.list.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}
              </select>
              <I.CaretRight className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-90 text-muted" aria-hidden />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
