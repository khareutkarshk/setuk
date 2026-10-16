import Link from "next/link";
import { getDictionary, type Locale } from "@/content";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { href, routes } from "@/lib/paths";
import { site } from "@/content/site";
import { count, inr, orderHref } from "@/lib/voter-list/order";
import { areaHighlight, stateShape, type Highlight, type StateShape } from "@/lib/voter-list/shapes";
import type { AreaDetail, AreaSummary, CopyBlock, StateIndex, VoterListView } from "@/lib/voter-list/types";
import { Faqs } from "./faq-list";
import { Band, Crumbs, H1, H2, IconTile, Lead, PageHero, Panel, SectionHead, TICK, Wrap } from "./ui";
import { VoterListFinder } from "./voter-list-finder";
import { OrderHost, type OrderPayload, type StatKey } from "./voter-list-order";

type Copy = ReturnType<typeof getDictionary>["pages"]["voterList"];

/** The second URL segment of a state's three lists, as on the live site */
const LIST_SLUG = { districts: "all-districts", acs: "all-assembly-constituencies", pcs: "all-parliamentary-constituencies" } as const;

/*
 * The cards' icons, drawn once per page and referenced by each card (<use>), so a state's list of
 * hundreds of cards doesn't carry hundreds of copies of the same paths. They come from
 * components/icons.ts like every other icon, and take the text colour.
 */
const SPRITE = {
  xls: <I.FileXls size={24} />,
  download: <I.DownloadSimple size={24} weight="bold" />,
  arrow: <I.ArrowRight size={24} />,
  bank: <I.Bank size={24} />
};
/* within a state, its outline too: every card's map draws it from here and adds only its own area */
function Sprite({ map }: { map?: StateShape }) {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute size-0 overflow-hidden">
      <defs>
        {Object.entries(SPRITE).map(([id, icon]) => <symbol key={id} id={`vl-${id}`} viewBox="0 0 24 24">{icon}</symbol>)}
        {map && <path id="vl-state" d={map.d} fillRule="evenodd" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
      </defs>
    </svg>
  );
}
function Use({ id, size, className = "" }: { id: keyof typeof SPRITE; size?: number; className?: string }) {
  return <svg aria-hidden="true" width={size ?? "1em"} height={size ?? "1em"} className={`shrink-0 ${className}`}><use href={`#vl-${id}`} /></svg>;
}

/** "{name} voter list" + { name: "Bihar" } → "Bihar voter list" */
export function fill(s: string, vars: Record<string, string | number | undefined>) {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : typeof vars[k] === "number" ? count(vars[k]) : String(vars[k])));
}

/** The area a page is about: the constituency or seat, else the district, else the state */
const areaOf = (view: VoterListView) => view.trail.ac ?? view.trail.pc ?? view.trail.district ?? view.trail.state;

/** The placeholders an area's titles and descriptions can use */
export function areaVars(view: VoterListView) {
  const { state, district, ac, pc } = view.trail;
  const area = areaOf(view);
  return {
    name: area?.name, state: state?.name, district: district?.name, no: ac?.no ?? pc?.no, roll: area?.roll,
    booths: view.totals.booths, acs: view.totals.acs, pcs: view.totals.pcs, districts: view.totals.districts, states: view.totals.states
  };
}

/**
 * Voter list in Excel. One template for every page (see lib/voter-list/types.ts for the addresses):
 * the landing page lists states, a state its districts (with tabs to its assembly and Lok Sabha
 * lists), a district its constituencies, a Lok Sabha seat its segments, and a constituency shows its
 * own card first. Under the cards, the area's write-up, a state's own article where it has one, and
 * the index of every list in the state. All data comes in as `view` (lib/voter-list/api.ts).
 */
export function VoterListPage({ locale, view }: { locale: Locale; view: VoterListView }) {
  const t = getDictionary(locale);
  const p = t.pages.voterList;
  const { state, district, ac, pc } = view.trail;
  const area = areaOf(view);
  const vars = areaVars(view);
  const level = view.level;
  const base = href(locale, routes.voterList);
  const at = (slugs: string[]) => href(locale, routes.voterListArea(slugs));
  const isList = level === "districts" || level === "acs" || level === "pcs";
  const crumbs = [
    { t: t.pages.common.home, href: href(locale, routes.home) },
    { t: p.root, href: area ? base : undefined },
    ...(state ? [{ t: state.name, href: level === "state" ? undefined : at(state.slugs) }] : []),
    ...(isList ? [{ t: p.levels[level] }] : []),
    ...(pc ? [{ t: pc.name }] : []),
    ...(district ? [{ t: district.name, href: ac ? at(district.slugs) : undefined }] : []),
    ...(ac ? [{ t: ac.name }] : [])
  ];
  /* the heading is always the dictionary's short one; the editors' lead, where they wrote one, goes
     under it (it is English, so /hi keeps the dictionary's). Their long titles are for search, in view.hero */
  const title = level === "all" ? p.title : fill(p.titleArea[level], vars);
  const lead = level === "all" ? fill(p.sub, vars) : (locale === "en" && view.hero?.lead) || fill(p.subArea[level], vars);
  const lists = view.index.length === 1 ? view.index[0] : undefined;
  /* the state's outline, for the map on each card within it */
  const map = state ? stateShape(state.slug) : undefined;

  return (
    <>
      <Sprite map={map} />
      <PageHero className="pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div>
            <div className="rise"><Crumbs items={crumbs} label={p.crumbs} /></div>
            <Kicker className="rise mt-6 text-leaf [--i:1]">{level === "all" ? p.kicker : p.levels[level]}</Kicker>
            <H1 className="rise mt-4 [--i:1]">{title}</H1>
            <Lead className="rise mt-5 [--i:2]">{lead}</Lead>
            <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3]">
              <a href={orderHref(view, level === "all" || isList ? undefined : area)} target="_blank" rel="noopener noreferrer" className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
                <I.WhatsappLogo size={20} aria-hidden />{p.enquire}
              </a>
              <a href="#about" className="group inline-flex min-h-11 items-center gap-2 font-semibold text-accent">
                <span className="underline decoration-accent/30 underline-offset-4 transition-colors group-hover:decoration-accent">{p.howLink}</span>
                <I.ArrowDown className="transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
            </div>
          </div>
          <Workbook view={view} p={p} className="rise [--i:2]" />
        </div>
        <div className="rise mt-12 [--i:3]">
          <VoterListFinder base={base} options={view.options} selected={{ state: state?.slug, district: district?.slug, ac: ac?.slug }} labels={p.finder} />
        </div>
      </PageHero>

      {/* The cards: states, districts, constituencies or seats, each with its order button */}
      <section aria-labelledby="lists-title" className="border-t border-line bg-surface">
        <Wrap className="py-16 md:py-20">
          {lists && (level === "state" || isList) && <ListTabs locale={locale} p={p} lists={lists} level={level} />}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <H2 id="lists-title" className="text-[clamp(26px,3vw,36px)]!">{fill(p.cards.heading[level], { name: area?.name, district: district?.name, state: state?.name })}</H2>
            {view.cards.length > 0 && (
              <span className="inline-flex h-8 items-center rounded-full bg-accent-soft px-3.5 font-mono text-[13px] text-accent">{fill(p.cards.count[level], { n: level === "pc" ? view.cards.length - 1 : view.cards.length })}</span>
            )}
          </div>
          {view.cards.length ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {view.cards.map((c) => (
                <li key={c.slugs.join("/")} className="flex">
                  <AreaCard locale={locale} c={c} p={p} view={view} map={map} selected={c === ac || c === pc} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent"><I.FileXls size={24} aria-hidden /></span>
              <p className="font-display-tight mt-5 text-[22px]">{p.cards.empty.title}</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-muted">{p.cards.empty.body}</p>
              <a href={orderHref(view, area)} target="_blank" rel="noopener noreferrer" className="press mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 font-semibold hover:border-ink">
                <I.WhatsappLogo className="text-leaf" aria-hidden />{p.cards.empty.cta}
              </a>
            </div>
          )}
        </Wrap>
      </section>

      <Detail locale={locale} view={view} d={view.detail} p={p} englishOnly={t.pages.common.englishOnly} />
      <ListIndex locale={locale} p={p} index={view.index} />
      <OrderHost copy={p.cards.dialog} chat={{ href: site.whatsapp.href, label: fill(p.cards.dialog.chat, { number: site.whatsapp.label }) }}
        labels={{ stats: p.stats, seat: p.cards.pc, rate: fill(p.cards.perBooth, { rate: inr(view.ratePerBooth) }) }} />
    </>
  );
}

/** The hero's picture: the workbook this page sells, with the area's figures and a strip of sheet tabs */
function Workbook({ view, p, className = "" }: { view: VoterListView; p: Copy; className?: string }) {
  const { totals } = view;
  const stats = [
    { v: totals.states, l: p.stats.states },
    { v: totals.districts, l: p.stats.districts },
    { v: totals.acs, l: p.stats.acs },
    { v: totals.pcs, l: p.stats.pcs },
    { v: totals.booths, l: p.stats.booths },
    { v: totals.booths, l: p.stats.files }
  ].filter((s): s is { v: number; l: string } => s.v !== undefined).slice(0, 4);
  const shown = 3;
  return (
    <Panel fx={100} fy={0} className={`shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--accent)_45%,transparent)] ${className}`}>
      <div className="p-6 pt-8 sm:p-7 sm:pt-9">
        <p className="flex items-center gap-2 text-[14px] font-semibold"><I.FileXls size={20} className="text-leaf" aria-hidden />{p.preview.title}</p>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          {stats.map((s) => (
            <div key={s.l} className={TICK + " border-line"}>
              <dt className="text-[13px] text-muted">{s.l}</dt>
              <dd className="font-display-tight mt-1 text-[clamp(26px,3vw,34px)] leading-none tabular-nums">{count(s.v)}</dd>
            </div>
          ))}
        </dl>
        {/* a sheet: a header row and a few blank rows, then its tabs */}
        <div aria-hidden className="mt-7 overflow-hidden rounded-xl border border-line bg-bg">
          <div className="grid grid-cols-[48px_1fr_1fr_56px] border-b border-line bg-accent-soft font-mono text-[11px] text-accent">
            {["#", "EPIC", "Name", "Age"].map((h) => <span key={h} className="border-r border-line px-2.5 py-1.5 last:border-r-0">{h}</span>)}
          </div>
          {[70, 55, 82].map((w, i) => (
            <div key={w} className="grid grid-cols-[48px_1fr_1fr_56px] border-b border-line last:border-b-0">
              <span className="border-r border-line px-2.5 py-2 font-mono text-[11px] text-muted">{i + 1}</span>
              <span className="border-r border-line px-2.5 py-2.5"><span className="block h-1.5 rounded-full bg-line" style={{ width: `${w}%` }} /></span>
              <span className="border-r border-line px-2.5 py-2.5"><span className="block h-1.5 rounded-full bg-line" style={{ width: `${100 - w / 2}%` }} /></span>
              <span className="px-2.5 py-2.5"><span className="block h-1.5 w-1/2 rounded-full bg-line" /></span>
            </div>
          ))}
          <div className="flex items-center gap-1 overflow-hidden border-t border-line bg-surface px-1.5 pt-1.5 text-[12px] whitespace-nowrap">
            <span className="rounded-t-md border border-b-0 border-line bg-bg px-2.5 py-1 font-semibold text-leaf">{p.preview.summary}</span>
            {Array.from({ length: Math.min(shown, totals.booths) }, (_, i) => (
              <span key={i} className="px-2.5 py-1 text-muted">{fill(p.preview.part, { n: i + 1 })}</span>
            ))}
            {totals.booths > shown && <span className="px-2.5 py-1 text-muted">{fill(p.preview.more, { n: totals.booths - shown })}</span>}
          </div>
        </div>
        <p className="mt-3 text-[13px] text-muted">{p.preview.note}</p>
      </div>
    </Panel>
  );
}

/** Tabs over a state's cards: its districts (the state page), every assembly constituency, every Lok Sabha seat */
function ListTabs({ locale, p, lists, level }: { locale: Locale; p: Copy; lists: StateIndex; level: VoterListView["level"] }) {
  const st = lists.state.slugs;
  const tabs = [
    { key: "districts", t: p.tabs.districts, n: lists.districts.length, slugs: st, on: level === "state" || level === "districts" },
    { key: "acs", t: p.tabs.acs, n: lists.acs.length, slugs: [...st, LIST_SLUG.acs], on: level === "acs" },
    { key: "pcs", t: p.tabs.pcs, n: lists.pcs.length, slugs: [...st, LIST_SLUG.pcs], on: level === "pcs" }
  ].filter((x) => x.n > 0);
  if (tabs.length < 2) return null;
  return (
    <nav aria-label={fill(p.tabs.label, { name: lists.state.name })} className="-mx-1 mb-8 overflow-x-auto px-1 pb-1">
      <ul className="flex w-max gap-1 rounded-full border border-line bg-bg p-1">
        {tabs.map((x) => (
          <li key={x.key}>
            <Link href={href(locale, routes.voterListArea(x.slugs))} aria-current={x.on ? "page" : undefined}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold whitespace-nowrap text-muted transition-colors hover:text-ink aria-[current]:bg-accent aria-[current]:text-accent-ink">
              {x.t}<span className="font-mono text-[12px] font-normal opacity-75">{count(x.n)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** One area: its roll, its figures, its links, and the order button. The price is in the dialog the button opens */
function AreaCard({ locale, c, p, view, map, selected = false }: { locale: Locale; c: AreaSummary; p: Copy; view: VoterListView; map?: StateShape; selected?: boolean }) {
  const at = (slugs: string[]) => href(locale, routes.voterListArea(slugs));
  const more = selected ? undefined : at(c.slugs);
  const stats: [number, string][] =
    c.level === "state" ? [[c.districts, p.stats.districts], [c.acs, p.stats.acs], [c.pcs, p.stats.pcs], [c.booths, p.stats.booths]]
    : c.level === "district" ? [[c.acs, p.stats.acs], [c.pcs, p.stats.pcs], [c.booths, p.stats.booths], [c.booths, p.stats.files]]
    : c.level === "pc" ? [[c.segments.length, p.stats.acs], [c.booths, p.stats.booths]]
    : [[c.booths, p.stats.booths], [c.booths, p.stats.files]];
  const order: OrderPayload = {
    code: `${p.levels[c.level]}${c.level === "ac" ? ` · AC ${c.no}` : c.level === "pc" ? ` · PC ${c.no}` : ""}`,
    title: fill(p.cards.dialog.title, { name: c.name }), roll: c.roll, price: inr(c.booths * view.ratePerBooth),
    stats: orderStats(c), seat: c.level === "ac" && c.pc ? `${c.pc.no} · ${c.pc.name}` : undefined
  };
  /* a state card shows its outline; a card within a state, that state with the card's own area lit */
  const shape = c.level === "state" ? stateShape(c.slug) : undefined;
  const local = c.level !== "state" ? map : undefined;
  const corner = shape || local;
  return (
    <article aria-current={selected || undefined} className={`reveal group relative flex w-full flex-col overflow-hidden rounded-3xl border bg-bg p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_24px_60px_-40px_color-mix(in_srgb,var(--accent)_55%,transparent)] ${selected ? "border-accent ring-1 ring-accent" : "border-line"}`}>
      {/* the badge takes the corner, unless the map has it; then it leads the card */}
      {selected && <span className={`inline-flex h-6 items-center gap-1 self-start rounded-full bg-leaf-soft px-2.5 text-[12px] font-semibold text-leaf ${corner ? "mb-3" : "absolute top-5 right-5"}`}><I.Check size={12} weight="bold" aria-hidden />{p.selected}</span>}
      {shape && <Outline shape={shape} className="absolute top-5 right-5 h-[84px] w-[92px]" />}
      {local && <Locator map={local} area={areaHighlight(c)} className="absolute top-5 right-5 h-[84px] w-[92px]" />}
      <p className={`text-[12px] font-semibold uppercase tracking-[.08em] text-muted ${selected || corner ? "pr-24" : ""}`}>
        {p.levels[c.level]}{(c.level === "ac" || c.level === "pc") && <span className="font-mono normal-case tracking-normal"> · {c.level === "ac" ? "AC" : "PC"} {c.no}</span>}
      </p>
      <h3 className={`font-display-tight mt-1.5 text-[24px] leading-tight ${corner ? "pr-24" : ""}`}>
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
        <a href={orderHref(view, c)} target="_blank" rel="noopener noreferrer" data-order={JSON.stringify(order)} aria-haspopup="dialog"
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
function Outline({ shape, className = "" }: { shape: StateShape; className?: string }) {
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
 * boundary data lacks the area (Assam and Jammu and Kashmir, whose seats were redrawn) only the
 * state shows.
 */
function Locator({ map, area, className = "" }: { map: StateShape; area?: Highlight; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox={map.viewBox} preserveAspectRatio="xMaxYMin meet" overflow="visible"
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

/**
 * The write-up under the cards, the same template at every level: summary and facts, what's in the
 * file with a sample sheet, a state's own article, how to order, related lists, and questions. Its
 * text is English, from the data, so /hi marks it lang="en".
 */
function Detail({ locale, view, d, p, englishOnly }: { locale: Locale; view: VoterListView; d: AreaDetail; p: Copy; englishOnly: string }) {
  const area = areaOf(view);
  const level = view.level;
  const lang = locale === "en" ? undefined : "en";
  /* the order band names a price for one area's page, not for the landing page or a state's lists */
  const priced = level === "all" || level === "districts" || level === "acs" || level === "pcs" ? undefined : area;
  return (
    <>
      <section id="about" aria-labelledby="about-title" className="scroll-mt-24">
        <Wrap className="py-20 md:py-28">
          {englishOnly && <p className="mb-10 flex max-w-[68ch] items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-[15px]"><I.Info className="shrink-0 text-accent" aria-hidden />{englishOnly}</p>}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div lang={lang}>
              <SectionHead kicker={p.detail.kicker} title={d.title} id="about-title" />
              <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-muted">
                {d.summary.map((x) => <p key={x} className="max-w-[62ch]">{x}</p>)}
              </div>
              <h3 className="mt-12 flex items-center gap-2 text-[17px] font-semibold"><I.ListChecks className="text-accent" aria-hidden />{p.detail.includes}</h3>
              <ul className="mt-5 space-y-3">
                {d.includes.map((x) => (
                  <li key={x} className="flex gap-3 text-[16px] leading-snug">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf"><I.Check size={13} weight="bold" aria-hidden /></span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <Panel corner="jaali" fx={100} fy={100} className="self-start lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <div className="p-6 pt-8 sm:p-7 sm:pt-9" lang={lang}>
                <p className="flex items-center gap-2 text-[15px] font-semibold"><I.Info className="text-accent" aria-hidden /><span lang={locale}>{p.detail.glance}</span></p>
                <dl className="mt-4 divide-y divide-line">
                  {d.facts.map((f) => (
                    <div key={f.label} className="flex items-baseline justify-between gap-6 py-3">
                      <dt className="text-[14px] text-muted">{f.label}</dt>
                      <dd className="text-right text-[15px] font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Panel>
          </div>

          {/* the sample sheet */}
          <h3 className="mt-16 flex items-center gap-2 text-[17px] font-semibold"><I.Table className="text-accent" aria-hidden />{p.detail.sample}</h3>
          <div lang={lang} className="reveal mt-5 overflow-x-auto rounded-3xl border border-line bg-surface">
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <thead>
                <tr className="bg-accent-soft text-accent">
                  {d.sample.columns.map((c) => <th key={c} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {d.sample.rows.map((r) => (
                  <tr key={r.join()}>
                    {r.map((v, i) => <td key={i} className={`px-4 py-3 whitespace-nowrap ${i < 3 || i > 6 ? "font-mono text-[13px]" : ""}`}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p lang={lang} className="mt-3 flex items-center gap-2 text-[14px] text-muted"><I.Translate className="shrink-0" aria-hidden />{d.sample.note}</p>
        </Wrap>
      </section>

      {/* a state's own article, as its editors wrote it */}
      {d.article.length > 0 && (
        <section aria-labelledby="article-title" className="border-t border-line">
          <Wrap className="py-20 md:py-28">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:self-start">
                <Kicker as="h2" id="article-title">{p.detail.article}</Kicker>
                <p lang={lang} className="font-display-tight mt-3 text-[clamp(24px,2.6vw,32px)] leading-tight">{area?.name ?? p.root}</p>
              </div>
              <Article blocks={d.article} lang={lang} />
            </div>
          </Wrap>
        </section>
      )}

      {/* How to order: the page's one feature band */}
      <Band tone="tint" labelledBy="order-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHead kicker={p.order.kicker} title={p.order.title} id="order-title"
              lead={priced ? fill(p.order.body, { price: inr(priced.booths * view.ratePerBooth), rate: inr(view.ratePerBooth) }) : undefined} />
            <a href={orderHref(view, priced)} target="_blank" rel="noopener noreferrer" className="press mt-8 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
              <I.WhatsappLogo size={20} aria-hidden />{p.order.cta}
            </a>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {p.order.steps.map((s, i) => (
              <li key={s.t} className="reveal flex gap-4 rounded-3xl border border-accent/15 bg-surface/70 p-5">
                <IconTile icon={[I.CursorClick, I.SealCheck, I.FileXls][i]} leaf={i === 2} />
                <div>
                  <p className="text-[17px] font-semibold"><span className="font-mono text-[13px] text-muted">0{i + 1} </span>{s.t}</p>
                  <p className="mt-1 text-[15px] leading-snug text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Band>

      {/* Related lists and questions */}
      <Wrap className="py-20 md:py-28">
        {d.related.length > 0 && (
          <section aria-labelledby="related-title">
            <Kicker as="h2" id="related-title">{p.detail.related}</Kicker>
            <div className={`mt-8 grid gap-6 ${d.related.length > 1 ? "lg:grid-cols-2" : ""}`}>
              {d.related.map((r) => (
                <div key={r.title} lang={lang} className="reveal overflow-hidden rounded-3xl border border-line bg-surface">
                  <h3 className="font-display-tight border-b border-line px-6 py-4 text-[20px]">{r.title}</h3>
                  {/* data-lenis-prevent: a wheel over the table scrolls the table, not the page */}
                  <div data-lenis-prevent className="max-h-[440px] overflow-y-auto">
                    <table className="w-full text-left text-[15px]">
                      <thead className="sticky top-0 bg-surface text-[13px] text-muted">
                        <tr className="border-b border-line">
                          <th scope="col" className="px-6 py-2.5 font-medium">{r.columns.name}</th>
                          {r.columns.meta && <th scope="col" className="px-3 py-2.5 font-medium max-sm:hidden">{r.columns.meta}</th>}
                          <th scope="col" className="px-6 py-2.5 text-right font-medium">{r.columns.booths}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {r.rows.map((x) => (
                          <tr key={x.slugs.join("/")} className="group transition-colors hover:bg-bg">
                            <td className="px-6 py-3">
                              <Link href={href(locale, routes.voterListArea(x.slugs))} className="inline-flex items-center gap-2 font-medium transition-colors group-hover:text-accent">
                                {x.name}<I.ArrowRight size={14} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                              </Link>
                              {x.meta && <span className="block text-[13px] text-muted sm:hidden">{x.meta}</span>}
                            </td>
                            {r.columns.meta && <td className="px-3 py-3 text-muted max-sm:hidden">{x.meta}</td>}
                            <td className="px-6 py-3 text-right font-mono text-[14px] tabular-nums">{count(x.booths)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {d.faqs.length > 0 && (
          <section aria-labelledby="vl-faq-title" className={`grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 ${d.related.length ? "mt-20 md:mt-28" : ""}`}>
            <div>
              <Kicker>{p.detail.faq}</Kicker>
              <H2 id="vl-faq-title" className="mt-3 text-[clamp(26px,3vw,36px)]!">{p.detail.faqTitle}</H2>
            </div>
            <div lang={lang}><Faqs items={d.faqs} /></div>
          </section>
        )}

        <p className="mt-14 flex max-w-[80ch] flex-wrap items-start gap-x-3 gap-y-1 border-t border-line pt-6 text-[14px] leading-relaxed text-muted">
          <I.Scales className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <span lang={lang} className="min-w-0 flex-1">{d.disclaimer}</span>
          <Link href={href(locale, routes.legalDoc("voter-list-excel-disclaimer"))} className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent">{p.detail.disclaimer}</Link>
        </p>
      </Wrap>
    </>
  );
}

/** A state's article: headings, paragraphs and lists, in a reading column */
function Article({ blocks, lang }: { blocks: CopyBlock[]; lang?: string }) {
  return (
    <div lang={lang} className="max-w-[68ch] text-[17px] leading-[1.7] text-muted">
      {blocks.map((b, i) => {
        if (b.type === "heading") return <h3 key={i} className="font-display-tight mt-12 text-[clamp(22px,2.2vw,28px)] leading-tight text-ink first:mt-0">{b.text}</h3>;
        if (b.type === "paragraph") return <p key={i} className="mt-4 first:mt-0">{b.text}</p>;
        const List = b.ordered ? "ol" : "ul";
        return (
          <List key={i} className="mt-4 space-y-2">
            {b.items.map((x, k) => (
              <li key={k} className="flex gap-3">
                {b.ordered
                  ? <span aria-hidden className="w-5 shrink-0 font-mono text-[14px] leading-[1.7] text-accent">{k + 1}.</span>
                  : <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-leaf" />}
                <span>{x}</span>
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

/**
 * The index at the foot of every page: each state's districts, assembly constituencies and Lok
 * Sabha seats, every one a link, and each list linking to its own page. Within a state it is open;
 * on the landing page each state folds, so the page stays short while every link is in it.
 */
function ListIndex({ locale, p, index }: { locale: Locale; p: Copy; index: StateIndex[] }) {
  if (!index.length) return null;
  const one = index.length === 1;
  const lang = locale === "en" ? undefined : "en";
  const at = (slugs: string[]) => href(locale, routes.voterListArea(slugs));
  const groups = (s: StateIndex) => [
    { key: "districts", t: p.index.districts, all: [...s.state.slugs, LIST_SLUG.districts], items: s.districts as { name: string; slugs: string[]; no?: number }[] },
    { key: "acs", t: p.index.acs, all: [...s.state.slugs, LIST_SLUG.acs], items: s.acs },
    { key: "pcs", t: p.index.pcs, all: [...s.state.slugs, LIST_SLUG.pcs], items: s.pcs }
  ].filter((g) => g.items.length);
  const body = (s: StateIndex) => (
    <div className="space-y-6">
      {groups(s).map((g) => (
        <div key={g.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-[15px] font-semibold">{g.t} <span className="font-mono text-[13px] font-normal text-muted">{count(g.items.length)}</span></h3>
            <Link href={at(g.all)} className="inline-flex min-h-9 items-center gap-1.5 text-[14px] font-semibold text-accent">
              {p.index.open}<I.ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          {/* thousands of links on the landing page: plain anchors, styled from the list, so each one costs only its href and name */}
          <ul lang={lang} className="mt-2 flex flex-wrap gap-x-1 gap-y-0.5 text-[14px] leading-relaxed [&_a]:mr-1 [&_a]:text-muted [&_a]:transition-colors [&_a:hover]:text-accent [&_span]:font-mono [&_span]:text-[12px] [&>li]:after:text-line [&>li]:after:content-['·'] [&>li:last-child]:after:content-none">
            {g.items.map((x) => (
              <li key={x.slugs.join("/")}>
                <a href={at(x.slugs)}>{x.no !== undefined && <span>{x.no} </span>}{x.name}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <section aria-labelledby="vl-index-title" className="border-t border-line bg-surface">
      <Wrap className="py-16 md:py-20">
        <Kicker>{p.index.kicker}</Kicker>
        <H2 id="vl-index-title" className="mt-3 text-[clamp(26px,3vw,36px)]!">{one ? fill(p.index.titleState, { name: index[0].state.name }) : p.index.title}</H2>
        {one ? (
          <div className="mt-8 rounded-3xl border border-line bg-bg p-6 sm:p-8">{body(index[0])}</div>
        ) : (
          <ul className="mt-8 grid gap-3">
            {index.map((s) => (
              <li key={s.state.slugs[0]}>
                <details className="group rounded-3xl border border-line bg-bg open:border-accent/30">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-6 py-3 [&::-webkit-details-marker]:hidden">
                    <span lang={lang} className="min-w-0 flex-1 text-[17px] font-semibold">{s.state.name}</span>
                    <span className="hidden font-mono text-[12px] text-muted sm:inline">
                      {[s.districts.length && `${count(s.districts.length)} ${p.index.districts}`, s.acs.length && `${count(s.acs.length)} AC`, s.pcs.length && `${count(s.pcs.length)} PC`].filter(Boolean).join(" · ")}
                    </span>
                    <I.CaretRight className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-90" aria-hidden />
                  </summary>
                  <div className="border-t border-line px-6 pt-5 pb-6">
                    <Link href={at(s.state.slugs)} className="mb-5 inline-flex min-h-9 items-center gap-1.5 text-[15px] font-semibold text-accent">
                      <span lang={lang}>{s.state.name}</span><I.ArrowRight size={14} aria-hidden />
                    </Link>
                    {body(s)}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Wrap>
    </section>
  );
}
