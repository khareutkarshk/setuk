"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { Locale } from "@/content";
import type { AreaSummary } from "@/lib/voter-list/types";
import { AreaCard, type CardArt, type CardCopy } from "./voter-list-card";

/** The list's columns, as its grid has them: one, two from sm, three from lg */
const WIDE = ["(min-width: 64rem)", "(min-width: 40rem)"];
const columns = () => (matchMedia(WIDE[0]).matches ? 3 : matchMedia(WIDE[1]).matches ? 2 : 1);
const onColumns = (cb: () => void) => {
  const qs = WIDE.map((q) => matchMedia(q));
  qs.forEach((q) => q.addEventListener("change", cb));
  return () => qs.forEach((q) => q.removeEventListener("change", cb));
};

/** A first guess at a row's height, by the cards in it, until the row is measured */
const ROW = { state: 420, district: 420, ac: 360, pc: 520 } as const;
const GAP = 16;

/**
 * The rest of a long list, after the cards the server draws (voter-list.tsx). A state's list can
 * hold hundreds of cards, so they come as data, not markup, and only the rows near the screen are
 * drawn, a row of cards at a time, in the page's own scroll. Their links are all in the index at the
 * foot of the page as well, for search engines and for pages without script.
 */
export function VoterListMore({ locale, cards, p, rate }: { locale: Locale; cards: { c: AreaSummary; art?: CardArt }[]; p: CardCopy; rate: number }) {
  const cols = useSyncExternalStore(onColumns, columns, () => 3);
  const rows: (typeof cards)[] = [];
  for (let i = 0; i < cards.length; i += cols) rows.push(cards.slice(i, i + cols));

  /* where the list starts on the page, which moves as what's above it loads or wraps */
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setTop(ref.current ? ref.current.getBoundingClientRect().top + window.scrollY : 0);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  /* switched on a frame after mount: the virtualizer takes window.scrollY as its starting offset and
     scrolls the window there when it starts, and during a client navigation that is still the previous
     page's position. By the next frame Next has taken the new page to the top, so starting then reads
     the right offset (while it is off it holds none) */
  const [live, setLive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const rowsV = useWindowVirtualizer({
    enabled: live,
    count: rows.length,
    estimateSize: (i) => ROW[rows[i][0].c.level],
    /* a new column count makes new rows: their measured heights don't carry over */
    getItemKey: (i) => `${cols}:${i}`,
    gap: GAP,
    overscan: 2,
    scrollMargin: top
  });

  return (
    <div ref={ref} className="relative mt-4" style={{ height: rowsV.getTotalSize() }}>
      {rowsV.getVirtualItems().map((row) => (
        <ul key={row.key} data-index={row.index} ref={rowsV.measureElement}
          className="absolute inset-x-0 top-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ transform: `translateY(${row.start - top}px)` }}>
          {rows[row.index].map(({ c, art }) => (
            <li key={c.slugs.join("/")} className="flex">
              <AreaCard locale={locale} c={c} p={p} rate={rate} art={art} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
