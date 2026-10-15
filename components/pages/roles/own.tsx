import type { CSSProperties } from "react";
import type { MayorRole, MlaRole, MpRole } from "@/content/types";
import * as I from "@/components/icons";
import { Pattern } from "@/components/site/pattern";
import { SetukMark } from "@/components/site/setuk-mark";
import { Band, IconTile, SectionHead } from "../ui";

/*
 * The one section each office's page has to itself. Drawn in HTML and CSS around the copy, each a
 * picture of how that office is shaped: an MP's offices feeding one record, an assembly seat spreading
 * from the office to its booths, a city's complaints landing ward by ward. Their motion is in
 * globals.css (office-pulse, ground-dot, ward-pop) and stops under reduced motion.
 */

const OFFICE_ICONS = [I.Bank, I.MapPin, I.HouseLine];

/** MPs: Delhi, the constituency and home, each sending its work down into one record */
export function MpOffices({ o }: { o: MpRole["offices"] }) {
  return (
    <Band tone="surface" labelledBy="offices-title" corner={{ kind: "sadan", fx: 100, fy: 0 }}>
      <SectionHead kicker={o.kicker} title={o.title} id="offices-title" lead={o.body} className="max-w-[760px]" />
      <div className="mt-14">
        <ul className="grid gap-4 md:grid-cols-3">
          {o.items.map((x, i) => (
            <li key={x.t} className="reveal relative flex flex-col rounded-3xl border border-line bg-bg p-6 md:p-7">
              <IconTile icon={OFFICE_ICONS[i % OFFICE_ICONS.length]} />
              <h3 className="mt-5 text-[19px] font-semibold">{x.t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{x.d}</p>
              {/* the line down to the record, with a request travelling along it */}
              <span aria-hidden="true" className="absolute top-full left-1/2 hidden h-12 w-px -translate-x-1/2 bg-accent/35 md:block">
                <span className="office-pulse" style={{ "--i": i } as CSSProperties} />
              </span>
            </li>
          ))}
        </ul>
        <div className="reveal relative mt-4 flex items-center gap-5 overflow-hidden rounded-3xl bg-accent px-6 py-6 text-accent-ink md:mt-12 md:px-8">
          <Pattern kind="jaali" className="absolute inset-0 opacity-[.1]" />
          <span className="relative w-14 shrink-0 [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)]"><SetukMark /></span>
          <p className="relative">
            <span className="font-display-tight block text-[24px] leading-tight">{o.centre.t}</span>
            <span className="mt-0.5 block text-[15px] opacity-80">{o.centre.d}</span>
          </p>
        </div>
      </div>
    </Band>
  );
}

/* A hex lattice of 37 dots: rings 0 to 3 hold 1, 7, 19 and 37 dots in all */
const HEX = (() => {
  const out: { x: number; y: number; ring: number }[] = [];
  for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) {
    const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
    if (ring <= 3) out.push({ x: 60 + 15 * (q + r / 2), y: 60 + 15 * r * 0.866, ring });
  }
  return out.sort((a, b) => a.ring - b.ring);
})();

/** One level of the seat as a cluster: the dots it reaches are lit, the rest of the lattice waits */
function Reach({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 120 112" aria-hidden="true" className="h-24 w-24">
      {HEX.map((d, k) => {
        const on = d.ring <= level;
        return (
          <circle key={k} cx={d.x} cy={d.y - 4} r={d.ring === 0 ? 5 : 3.4}
            className={on ? "ground-dot fill-accent" : "fill-line"}
            style={on ? ({ "--i": d.ring, opacity: 1 - d.ring * 0.16 } as CSSProperties) : undefined} />
        );
      })}
    </svg>
  );
}

/** MLAs: from the office out to every booth and karyakarta, one ring further each step */
export function MlaGround({ g }: { g: MlaRole["ground"] }) {
  return (
    <Band tone="surface" labelledBy="ground-title" corner={{ kind: "kolam", fx: 100, fy: 0 }}>
      <SectionHead kicker={g.kicker} title={g.title} id="ground-title" lead={g.body} className="max-w-[760px]" />
      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {g.levels.map((x, i) => (
          <li key={x.t} className="reveal ground-card relative flex flex-col rounded-3xl border border-line bg-bg p-6">
            <Reach level={i} />
            <h3 className="mt-4 text-[19px] font-semibold">{x.t}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{x.d}</p>
            {i < g.levels.length - 1 && (
              <span aria-hidden="true" className="absolute top-[60px] -right-[14px] z-10 hidden h-6 w-6 place-items-center rounded-full border border-line bg-surface text-accent lg:grid">
                <I.CaretRight size={12} weight="bold" />
              </span>
            )}
          </li>
        ))}
      </ol>
    </Band>
  );
}

const WARD_ICONS = [I.RoadHorizon, I.Waves, I.Broom, I.Lamp, I.Drop, I.Barricade];
/* where each kind of complaint lands on the 24-ward grid (0-based), for the picture only */
const LANDS = [13, 2, 8, 19, 16, 5];

/** Mayors: a city of 24 wards with complaints landing in them by kind, and where the office's role ends */
export function MayorWards({ w }: { w: MayorRole["wards"] }) {
  return (
    <Band tone="surface" labelledBy="wards-title" corner={{ kind: "jaali", fx: 100, fy: 0 }}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div>
          <SectionHead kicker={w.kicker} title={w.title} id="wards-title" lead={w.body} />
          <p className="mt-8 flex items-start gap-3 rounded-xl bg-accent-soft px-4 py-3.5 text-[15px] leading-snug">
            <I.Info size={20} className="mt-px shrink-0 text-accent" aria-hidden />
            {w.note}
          </p>
        </div>
        <div className="reveal self-center">
          <div aria-hidden="true" className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {Array.from({ length: 24 }, (_, k) => {
              const c = LANDS.indexOf(k);
              const Ico = c >= 0 ? WARD_ICONS[c] : null;
              return (
                <span key={k} className={`relative grid aspect-square place-items-center rounded-xl border ${Ico ? "ward-pop border-accent/40 bg-accent-soft text-accent" : "border-line bg-bg"}`} style={Ico ? ({ "--i": c } as CSSProperties) : undefined}>
                  {Ico ? <Ico size={22} /> : <span className="font-mono text-[11px] text-muted/70">{String(k + 1).padStart(2, "0")}</span>}
                </span>
              );
            })}
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {w.categories.map((x, i) => {
              const Ico = WARD_ICONS[i % WARD_ICONS.length];
              return (
                <li key={x} className="flex items-center gap-2.5 text-[15px] font-medium">
                  <Ico size={18} className="shrink-0 text-accent" aria-hidden />{x}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Band>
  );
}
