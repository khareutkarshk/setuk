import type { Locale } from "@/content";
import type { Pages } from "@/content/types";
import { href, routes } from "@/lib/paths";
import { count } from "@/lib/voter-list/order";
import { india } from "@/lib/voter-list/india";
import type { StateSummary } from "@/lib/voter-list/types";
import { SectionHead, Wrap } from "./ui";
import { fill } from "./voter-list-card";
import { VoterListMapHost, type MapState } from "./voter-list-map-host";

type MapCopy = Pages["voterList"]["map"];

/**
 * The landing page's map of India: every state a link to its page, shaded in four soft steps by how
 * many booths it has, the small UTs ringed so they can be tapped. The shapes are drawn here, on the
 * server (lib/voter-list/india.ts), and reach the page as markup; VoterListMapHost only adds the
 * lit state and the panel that counts up its figures. Each link carries the figures in its label,
 * and the index at the foot of the page keeps every state's link besides.
 */
export function VoterListMap({ locale, c, states }: { locale: Locale; c: MapCopy; states: StateSummary[] }) {
  const list: MapState[] = states
    .filter((s) => india.states[s.slug])
    .map((s) => ({ slug: s.slug, name: s.name, href: href(locale, routes.voterListArea(s.slugs)), districts: s.districts, acs: s.acs, booths: s.booths }));
  const totals = list.reduce((t, s) => ({ districts: t.districts + s.districts, acs: t.acs + s.acs, booths: t.booths + s.booths }), { districts: 0, acs: 0, booths: 0 });

  /* the four steps: quarters of the states by booths */
  const sorted = list.map((s) => s.booths).sort((a, b) => a - b);
  const cut = [0.25, 0.5, 0.75].map((q) => sorted[Math.floor(q * (sorted.length - 1))]);
  const tone = (b: number) => cut.filter((x) => b > x).length;
  /* small UTs last, so their rings sit on top of their neighbours */
  const order = [...list].sort((a, b) => Number(!!india.states[a.slug].small) - Number(!!india.states[b.slug].small));

  return (
    <section aria-labelledby="map-title" className="border-t border-line">
      <Wrap className="py-16 md:py-20">
        <SectionHead kicker={c.kicker} title={c.title} id="map-title" lead={c.sub} className="max-w-[680px]" />
        <a href="#lists-title" className="sr-only focus:not-sr-only focus:mt-4 focus:inline-flex focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">{c.skip}</a>
        <VoterListMapHost c={c} states={list} totals={totals}>
          <svg viewBox={india.viewBox} className="vl-map mx-auto block h-auto max-h-[min(78vh,700px)] w-full" aria-label={c.title}>
            {order.map((s) => {
              const g = india.states[s.slug];
              return (
                <a key={s.slug} href={s.href} data-slug={s.slug} aria-label={fill(c.label, { name: s.name, districts: count(s.districts), acs: count(s.acs), booths: count(s.booths) })}>
                  <path d={g.d} className={`vl-tone-${tone(s.booths)}`} />
                  {g.small && <circle cx={g.c[0]} cy={g.c[1]} r={11} className="vl-ring" />}
                </a>
              );
            })}
          </svg>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12px] text-muted">
            <span className="inline-flex items-center gap-2" aria-hidden>
              {[0, 1, 2, 3].map((k) => <span key={k} className={`vl-swatch vl-tone-${k}`} />)}
              {c.scale}
            </span>
            <span>{c.note}</span>
          </div>
        </VoterListMapHost>
      </Wrap>
    </section>
  );
}
