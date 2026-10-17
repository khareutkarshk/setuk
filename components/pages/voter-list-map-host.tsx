"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import type { Pages } from "@/content/types";
import * as I from "@/components/icons";
import { useEased } from "@/lib/use-eased";

export type MapState = { slug: string; name: string; href: string; districts: number; acs: number; booths: number };

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * The map's behaviour (voter-list-map.tsx draws it): pointing at a state, or reaching it with Tab,
 * lights it and the panel counts up its districts, constituencies and booths; leaving the map goes
 * back to all of India. A click opens the state's page. On a touch screen the first tap lights a
 * state and a second tap, or the panel's link, opens it. The lit state is marked on the SVG
 * directly (data-on), so the map's markup never re-renders.
 */
export function VoterListMapHost({ c, states, totals, children }: { c: Pages["voterList"]["map"]; states: MapState[]; totals: { districts: number; acs: number; booths: number }; children: ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef("mouse");
  /* what was lit when the finger went down: a tap focuses the link (lighting it) before its click */
  const before = useRef<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const on = states.find((s) => s.slug === slug) ?? null;
  const t = useEased(true, { duration: 700, key: slug });
  const shown = on ?? totals;

  useEffect(() => {
    ref.current?.querySelectorAll("a[data-slug]").forEach((a) => a.toggleAttribute("data-on", a.getAttribute("data-slug") === slug));
  }, [slug]);

  const at = (target: EventTarget) => (target as Element).closest?.("a[data-slug]");

  const onClick = (e: MouseEvent) => {
    const a = at(e.target);
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const s = a.getAttribute("data-slug");
    if (pointer.current === "touch" && s !== before.current) { setSlug(s); before.current = s; return; }
    router.push(a.getAttribute("href") ?? "");
  };

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-14">
      <div
        ref={ref}
        onPointerDown={(e) => { pointer.current = e.pointerType; before.current = slug; }}
        onPointerOver={(e) => { if (e.pointerType === "mouse") { const a = at(e.target); if (a) setSlug(a.getAttribute("data-slug")); } }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") setSlug(null); }}
        onFocus={(e) => { const a = at(e.target); if (a) setSlug(a.getAttribute("data-slug")); }}
        onClick={onClick}
      >
        {children}
      </div>

      {/* on phones it sits above the map, compact, and stays in view while the map passes under it */}
      <aside className="sticky top-[calc(var(--header-h)+8px)] z-10 order-first overflow-hidden rounded-3xl border border-line bg-surface/95 p-4 shadow-[0_20px_40px_-30px_color-mix(in_srgb,var(--ink)_45%,transparent)] backdrop-blur-sm sm:p-6 lg:order-none lg:top-[calc(var(--header-h)+32px)] lg:bg-surface lg:p-8 lg:shadow-none">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-leaf">
          <I.MapPin size={16} aria-hidden />{on ? c.kicker : c.all}
        </p>
        <h3 className="font-display-tight mt-1 text-[22px] leading-tight lg:mt-2 lg:text-[clamp(26px,2.6vw,34px)]">{on ? on.name : c.all}</h3>
        <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:mt-6 lg:grid-cols-1">
          {([[c.districts, shown.districts, I.MapTrifold], [c.acs, shown.acs, I.UsersThree], [c.booths, shown.booths, I.HouseLine]] as const).map(([label, v, Ico]) => (
            <div key={label} className="flex items-center gap-4 bg-surface px-3 py-2.5 lg:px-5 lg:py-4">
              <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent lg:grid"><Ico size={19} aria-hidden /></span>
              <span className="flex min-w-0 flex-1 flex-col-reverse">
                <dt className="text-[12px] leading-snug text-muted lg:text-[14px]">{label}</dt>
                <dd className="font-display-tight text-[19px] leading-tight tabular-nums lg:text-[28px]">{fmt(v * t)}</dd>
              </span>
            </div>
          ))}
        </dl>
        {on ? (
          <Link href={on.href} className="press mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-semibold text-accent-ink hover:brightness-110 lg:mt-6 lg:min-h-12 lg:px-6 lg:text-[16px]">
            {c.open.replace("{name}", on.name)}<I.ArrowRight weight="bold" aria-hidden />
          </Link>
        ) : (
          <p className="mt-3 text-[13.5px] leading-snug text-muted lg:mt-6 lg:text-[14.5px] lg:leading-relaxed">
            <span className="[@media(hover:none)]:hidden">{c.hint}</span>
            <span className="hidden [@media(hover:none)]:inline">{c.touchHint}</span>
          </p>
        )}
      </aside>
    </div>
  );
}
