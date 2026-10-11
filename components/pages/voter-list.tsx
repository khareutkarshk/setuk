import Link from "next/link";
import { getDictionary, type Locale } from "@/content";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { href, routes } from "@/lib/paths";
import { count, inr, orderHref } from "@/lib/voter-list/order";
import type { AreaDetail, AreaSummary, VoterListView } from "@/lib/voter-list/types";
import { Faqs } from "./faq-list";
import { Band, Crumbs, H1, H2, IconTile, Lead, PageHero, Panel, SectionHead, TICK, Wrap } from "./ui";
import { VoterListFinder } from "./voter-list-finder";

type Copy = ReturnType<typeof getDictionary>["pages"]["voterList"];

/** "{name} voter list" + { name: "Bihar" } → "Bihar voter list" */
export function fill(s: string, vars: Record<string, string | number | undefined>) {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : typeof vars[k] === "number" ? count(vars[k]) : String(vars[k])));
}

/** The placeholders an area's titles and descriptions can use */
export function areaVars(view: VoterListView) {
  const { state, district, ac } = view.trail;
  const area = ac ?? district ?? state;
  return {
    name: area?.name, state: state?.name, district: district?.name, no: ac?.no, roll: area?.roll,
    booths: view.totals.booths, acs: view.totals.acs, states: view.totals.states
  };
}

/**
 * Voter list in Excel. One template for every level: the landing page lists states, a state lists
 * its districts, a district its constituencies, and a constituency shows its own card. Under the
 * cards, the area's write-up from lib/voter-list. All data comes in as `view` (lib/voter-list/api.ts).
 */
export function VoterListPage({ locale, view }: { locale: Locale; view: VoterListView }) {
  const t = getDictionary(locale);
  const p = t.pages.voterList;
  const { state, district, ac } = view.trail;
  const area = ac ?? district ?? state;
  const vars = areaVars(view);
  const base = href(locale, routes.voterList);
  const crumbs = [
    { t: t.pages.common.home, href: href(locale, routes.home) },
    { t: p.root, href: area ? base : undefined },
    ...(state ? [{ t: state.name, href: district ? href(locale, routes.voterListArea([state.slug])) : undefined }] : []),
    ...(district ? [{ t: district.name, href: ac ? href(locale, routes.voterListArea([state!.slug, district.slug])) : undefined }] : []),
    ...(ac ? [{ t: ac.name }] : [])
  ];
  const level = view.level;
  /* the area's own slugs, for the cards' links one level down */
  const trailSlugs = [state?.slug, district?.slug].filter(Boolean) as string[];

  return (
    <>
      <PageHero className="pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div>
            <div className="rise"><Crumbs items={crumbs} label={p.crumbs} /></div>
            <Kicker className="rise mt-6 text-leaf [--i:1]">{area ? p.levels[area.level] : p.kicker}</Kicker>
            <H1 className="rise mt-4 [--i:1]">{area ? fill(p.titleArea[area.level], vars) : p.title}</H1>
            <Lead className="rise mt-5 [--i:2]">{fill(area ? p.subArea[area.level] : p.sub, vars)}</Lead>
            <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3]">
              <a href={orderHref(view, area)} target="_blank" rel="noopener noreferrer" className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
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

      {/* The cards: states, districts or constituencies, each with its order button */}
      <section aria-labelledby="lists-title" className="border-t border-line bg-surface">
        <Wrap className="py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <H2 id="lists-title" className="text-[clamp(26px,3vw,36px)]!">{fill(p.cards.heading[level], { name: area?.name, district: district?.name })}</H2>
            {view.cards.length > 0 && (
              <span className="inline-flex h-8 items-center rounded-full bg-accent-soft px-3.5 font-mono text-[13px] text-accent">{fill(p.cards.count[level], { n: view.cards.length })}</span>
            )}
          </div>
          {view.cards.length ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {view.cards.map((c) => (
                <li key={c.slug} className="flex">
                  <AreaCard c={c} p={p} view={view} selected={c === ac}
                    more={c === ac ? undefined : href(locale, routes.voterListArea([...trailSlugs, c.slug]))} />
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

/** One area: its roll, its figures, the price, and the order button (plus a link one level down) */
function AreaCard({ c, p, view, more, selected = false }: { c: AreaSummary; p: Copy; view: VoterListView; more?: string; selected?: boolean }) {
  const stats =
    c.level === "state" ? [[c.districts, p.stats.districts], [c.acs, p.stats.acs], [c.pcs, p.stats.pcs], [c.booths, p.stats.booths]]
    : c.level === "district" ? [[c.acs, p.stats.acs], [c.pcs, p.stats.pcs], [c.booths, p.stats.booths], [c.booths, p.stats.files]]
    : [[c.booths, p.stats.booths], [c.booths, p.stats.files]];
  return (
    <article aria-current={selected || undefined} className={`reveal group relative flex w-full flex-col overflow-hidden rounded-3xl border bg-bg p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_24px_60px_-40px_color-mix(in_srgb,var(--accent)_55%,transparent)] ${selected ? "border-accent ring-1 ring-accent" : "border-line"}`}>
      {selected && <span className="absolute top-5 right-5 inline-flex h-6 items-center gap-1 rounded-full bg-leaf-soft px-2.5 text-[12px] font-semibold text-leaf"><I.Check size={12} weight="bold" aria-hidden />{p.selected}</span>}
      <p className={`text-[12px] font-semibold uppercase tracking-[.08em] text-muted ${selected ? "pr-24" : ""}`}>
        {p.levels[c.level]}{c.level === "ac" && <span className="font-mono normal-case tracking-normal"> · AC {c.no}</span>}
      </p>
      <h3 className="font-display-tight mt-1.5 text-[24px] leading-tight">
        {more ? <Link href={more} className="transition-colors hover:text-accent">{c.name}</Link> : c.name}
      </h3>
      <p className="mt-3 inline-flex max-w-full items-center gap-1.5 self-start rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent">
        <I.FileXls className="shrink-0" aria-hidden /><span className="sr-only">{p.cards.roll}: </span><span className="truncate">{c.roll}</span>
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        {stats.map(([v, l]) => (
          <div key={l as string} className="flex flex-col-reverse rounded-xl bg-surface px-3.5 py-3">
            <dt className="mt-1.5 text-[13px] leading-snug text-muted">{l}</dt>
            <dd className="text-[20px] leading-none font-semibold tabular-nums">{count(v as number)}</dd>
          </div>
        ))}
      </dl>
      {c.level === "ac" && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-surface px-3.5 py-3 text-[14px]">
          <I.Bank className="shrink-0 text-accent" aria-hidden /><span className="text-muted">{p.cards.pc}</span><span className="font-semibold">{c.pc.no} · {c.pc.name}</span>
        </p>
      )}
      <p className="mt-4 text-[14px] text-muted">
        {fill(p.cards.perBooth, { rate: inr(view.ratePerBooth) })} <span aria-hidden>·</span> <span className="font-semibold text-ink">{fill(p.cards.total, { price: inr(c.booths * view.ratePerBooth) })}</span>
      </p>
      <div className="mt-auto flex flex-col gap-1 pt-5">
        <a href={orderHref(view, c)} target="_blank" rel="noopener noreferrer" title={p.cards.orderNote}
          className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 text-center text-[15px] font-semibold text-accent-ink hover:brightness-110">
          <I.DownloadSimple className="shrink-0" weight="bold" aria-hidden />{fill(p.cards.order, { name: c.name })}
        </a>
        {more && c.level !== "ac" && (
          <Link href={more} className="group/more inline-flex min-h-11 items-center justify-center gap-2 text-[15px] font-semibold text-accent">
            {p.cards.explore[c.level]}
            <I.ArrowRight className="transition-transform duration-300 group-hover/more:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}

/**
 * The write-up under the cards, the same template at every level: summary and facts, what's in the
 * file with a sample sheet, how to order, related lists, and questions. Its text is English, from
 * the data, so /hi marks it lang="en".
 */
function Detail({ locale, view, d, p, englishOnly }: { locale: Locale; view: VoterListView; d: AreaDetail; p: Copy; englishOnly: string }) {
  const { state, district, ac } = view.trail;
  const area = ac ?? district ?? state;
  const lang = locale === "en" ? undefined : "en";
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

      {/* How to order: the page's one feature band */}
      <Band tone="tint" labelledBy="order-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHead kicker={p.order.kicker} title={p.order.title} id="order-title"
              lead={area ? fill(p.order.body, { price: inr(area.booths * view.ratePerBooth), rate: inr(view.ratePerBooth) }) : undefined} />
            <a href={orderHref(view, area)} target="_blank" rel="noopener noreferrer" className="press mt-8 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
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
                  <div className="max-h-[440px] overflow-y-auto">
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

