import Link from "next/link";
import type { getDictionary, Locale } from "@/content";
import * as I from "@/components/icons";
import { href, routes } from "@/lib/paths";
import { count, inr, orderHref } from "@/lib/voter-list/order";
import type { Highlight } from "@/lib/voter-list/shapes";
import type { AreaSummary } from "@/lib/voter-list/types";
import type { OrderPayload, StatKey } from "./voter-list-order";

/*
 * One voter list card, shared by the server (the first cards of a list, and every card of a short
 * one) and the client (the rest of a long list, VoterListMore). It takes everything ready-made: the
 * copy it shows, the rate, and its map, already cut from lib/voter-list/shapes.ts on the server, so
 * that data never reaches the browser.
 */

type Copy = ReturnType<typeof getDictionary>["pages"]["voterList"];
/** The part of the page's copy a card shows, so a client list carries no more than that */
export type CardCopy = Pick<Copy, "levels" | "stats" | "selected"> & {
  cards: Pick<Copy["cards"], "roll" | "pc" | "segments" | "order" | "explore"> & { dialog: Pick<Copy["cards"]["dialog"], "title"> };
};
export const cardCopy = (p: Copy): CardCopy => ({
  levels: p.levels, stats: p.stats, selected: p.selected,
  cards: { roll: p.cards.roll, pc: p.cards.pc, segments: p.cards.segments, order: p.cards.order, explore: p.cards.explore, dialog: { title: p.cards.dialog.title } }
});

/** A card's map: a state's own outline, or its state's (the page's sprite, #vl-state) with the card's area lit */
export type CardArt =
  | { kind: "outline"; viewBox: string; d: string; marks?: number[][] }
  | { kind: "locator"; viewBox: string; area?: Highlight };

/** The icons in the page's sprite (voter-list.tsx), drawn once and used by every card */
export type SpriteId = "xls" | "download" | "arrow" | "bank";
export function Use({ id, size, className = "" }: { id: SpriteId; size?: number; className?: string }) {
  return <svg aria-hidden="true" width={size ?? "1em"} height={size ?? "1em"} className={`shrink-0 ${className}`}><use href={`#vl-${id}`} /></svg>;
}

/** "{name} voter list" + { name: "Bihar" } → "Bihar voter list" */
export function fill(s: string, vars: Record<string, string | number | undefined>) {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : typeof vars[k] === "number" ? count(vars[k]) : String(vars[k])));
}

/** One area: its roll, its figures, its links, and the order button. The price is in the dialog the button opens */
export function AreaCard({ locale, c, p, rate, art, selected = false }: { locale: Locale; c: AreaSummary; p: CardCopy; rate: number; art?: CardArt; selected?: boolean }) {
  const at = (slugs: string[]) => href(locale, routes.voterListArea(slugs));
  const more = selected ? undefined : at(c.slugs);
  const stats: [number, string][] =
    c.level === "state" ? [[c.districts, p.stats.districts], [c.acs, p.stats.acs], [c.pcs, p.stats.pcs], [c.booths, p.stats.booths]]
    : c.level === "district" ? [[c.acs, p.stats.acs], [c.pcs, p.stats.pcs], [c.booths, p.stats.booths], [c.booths, p.stats.files]]
    : c.level === "pc" ? [[c.segments.length, p.stats.acs], [c.booths, p.stats.booths]]
    : [[c.booths, p.stats.booths], [c.booths, p.stats.files]];
  const order: OrderPayload = {
    code: `${p.levels[c.level]}${c.level === "ac" ? ` · AC ${c.no}` : c.level === "pc" ? ` · PC ${c.no}` : ""}`,
    title: fill(p.cards.dialog.title, { name: c.name }), roll: c.roll, price: inr(c.booths * rate),
    stats: orderStats(c), seat: c.level === "ac" && c.pc ? `${c.pc.no} · ${c.pc.name}` : undefined
  };
  return (
    <article aria-current={selected || undefined} className={`reveal group relative flex w-full flex-col overflow-hidden rounded-3xl border bg-bg p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_24px_60px_-40px_color-mix(in_srgb,var(--accent)_55%,transparent)] ${selected ? "border-accent ring-1 ring-accent" : "border-line"}`}>
      {/* the badge takes the corner, unless the map has it; then it leads the card */}
      {selected && <span className={`inline-flex h-6 items-center gap-1 self-start rounded-full bg-leaf-soft px-2.5 text-[12px] font-semibold text-leaf ${art ? "mb-3" : "absolute top-5 right-5"}`}><I.Check size={12} weight="bold" aria-hidden />{p.selected}</span>}
      {art?.kind === "outline" && <Outline shape={art} className="absolute top-5 right-5 h-[84px] w-[92px]" />}
      {art?.kind === "locator" && <Locator viewBox={art.viewBox} area={art.area} className="absolute top-5 right-5 h-[84px] w-[92px]" />}
      <p className={`text-[12px] font-semibold uppercase tracking-[.08em] text-muted ${selected || art ? "pr-24" : ""}`}>
        {p.levels[c.level]}{(c.level === "ac" || c.level === "pc") && <span className="font-mono normal-case tracking-normal"> · {c.level === "ac" ? "AC" : "PC"} {c.no}</span>}
      </p>
      <h3 className={`font-display-tight mt-1.5 text-[24px] leading-tight ${art ? "pr-24" : ""}`}>
        {more ? <Link href={more} className="transition-colors hover:text-accent">{c.name}</Link> : c.name}
      </h3>
      <p className="mt-3 inline-flex max-w-full items-center gap-1.5 self-start rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent">
        <Use id="xls" /><span className="sr-only">{p.cards.roll}: </span><span className="truncate">{c.roll}</span>
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        {stats.map(([v, l]) => (
          <div key={l} className="flex flex-col-reverse rounded-xl bg-surface px-3.5 py-3">
            <dt className="mt-1.5 text-[13px] leading-snug text-muted">{l}</dt>
            <dd className="text-[20px] leading-none font-semibold tabular-nums">{count(v)}</dd>
          </div>
        ))}
      </dl>
      {c.level === "ac" && c.pc && (
        <Link href={at(c.pc.slugs)} className="mt-3 flex items-center gap-2 rounded-xl bg-surface px-3.5 py-3 text-[14px] transition-colors hover:text-accent">
          <Use id="bank" className="text-accent" /><span className="text-muted">{p.cards.pc}</span><span className="min-w-0 truncate font-semibold">{c.pc.no} · {c.pc.name}</span>
          <Use id="arrow" size={14} className="ml-auto text-muted" />
        </Link>
      )}
      {c.level === "pc" && c.segments.length > 0 && (
        <div className="mt-3 rounded-xl bg-surface px-3.5 py-3">
          <p className="text-[13px] text-muted">{p.cards.segments}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {c.segments.map((s) => (
              <li key={s.no}>
                <Link href={at(s.slugs)} className="inline-flex min-h-8 items-center rounded-full border border-line bg-bg px-2.5 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent">
                  <span className="mr-1 font-mono text-[12px] text-muted">{s.no}</span>{s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-auto flex flex-col gap-1 pt-5">
        {/* a WhatsApp link without script; with it, the page's order dialog (OrderHost) opens instead */}
        <a href={orderHref({ trail: {}, ratePerBooth: rate }, c)} target="_blank" rel="noopener noreferrer" data-order={JSON.stringify(order)} aria-haspopup="dialog"
          className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 text-center text-[15px] font-semibold text-accent-ink hover:brightness-110">
          <Use id="download" />{fill(p.cards.order, { name: c.name })}
        </a>
        {more && c.level !== "ac" && (
          <Link href={more} className="group/more inline-flex min-h-11 items-center justify-center gap-2 text-[15px] font-semibold text-accent">
            {p.cards.explore[c.level]}
            <Use id="arrow" className="transition-transform duration-300 group-hover/more:translate-x-0.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

/**
 * A state's outline in the corner of its card (lib/voter-list/shapes.ts): a hairline in the accent
 * with a faint fill that deepens with the card's hover, and a ring round each piece of a scattered UT
 */
function Outline({ shape, className = "" }: { shape: { viewBox: string; d: string; marks?: number[][] }; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox={shape.viewBox} preserveAspectRatio="xMaxYMin meet" overflow="visible"
      className={`pointer-events-none text-accent ${className}`}>
      <path d={shape.d} fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth={1.25} strokeLinejoin="round" vectorEffect="non-scaling-stroke"
        className="transition-[fill-opacity] duration-300 [fill-opacity:.08] group-hover:[fill-opacity:.16]" />
      {shape.marks?.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={6} fill="none" stroke="currentColor" strokeWidth={1} strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}

/**
 * A card's map within a state: the state's outline from the page's sprite (#vl-state), and the
 * card's own district, constituency or seat filled in, ringed when it is too small to find. Where the
 * boundary data lacks the area (the constituencies and seats of Assam and Jammu and Kashmir, which
 * were redrawn, and Assam's districts split since) only the state shows.
 */
function Locator({ viewBox, area, className = "" }: { viewBox: string; area?: Highlight; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox={viewBox} preserveAspectRatio="xMaxYMin meet" overflow="visible"
      className={`pointer-events-none text-accent ${className}`}>
      <use href="#vl-state" fill="currentColor" fillOpacity={0.07} stroke="currentColor" strokeOpacity={0.45} strokeWidth={1} />
      {area && <path d={area.d} fill="currentColor" className="transition-opacity duration-300 [opacity:.8] group-hover:[opacity:1]" />}
      {area?.ring && <circle cx={area.ring[0]} cy={area.ring[1]} r={area.ring[2]} fill="none" stroke="currentColor" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/** The dialog's figures for an area: what its file covers */
function orderStats(c: AreaSummary): [StatKey, string][] {
  const booths: [StatKey, string] = ["booths", count(c.booths)];
  if (c.level === "state") return [["districts", count(c.districts)], ["acs", count(c.acs)], ["pcs", count(c.pcs)], booths];
  if (c.level === "district") return [["acs", count(c.acs)], ["pcs", count(c.pcs)], booths, ["files", count(c.booths)]];
  if (c.level === "pc") return [["acs", count(c.segments.length)], booths];
  return [booths, ["files", count(c.booths)]];
}
