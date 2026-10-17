import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content";
import { media } from "@/content/media";
import type { ProductKey } from "@/content/types";
import * as I from "@/components/icons";
import { CornerPattern, Pattern } from "@/components/site/pattern";
import { href, routes } from "@/lib/paths";
import { Faqs } from "../faq-list";
import { Band, Figure, IconTile, Lead, PageHero, PrimaryLink, SectionHead, TextLink, TICK, Wrap } from "../ui";
import { PRODUCT_LOOK } from "./look";
import { ScreenPlay } from "./screen-play";
import { ElectionScreen, OfficeScreen } from "./screens";

/**
 * A product page, one layout for both products:
 *   the hero, with the product's own screen drawn beside the promise, its story looping while in view
 *   what changes, today against with Setuk
 *   the four modules that carry the product, each beside its illustration with a status card on it
 *   every module, live or in progress (as How we work lists them)
 *   the one feature band: the real eLetter screen (office) or the voter list in Excel (election)
 *   how it's set up, from How we work's four steps, and what we commit to about data
 *   the product's questions, then the other product
 * The closing call to action comes from the shell, in the page's own words (product-route.tsx).
 */
export function ProductPage({ product, locale }: { product: ProductKey; locale: Locale }) {
  const t = getDictionary(locale);
  const c = t.pages.products.common;
  const p = t.pages.products[product];
  const look = PRODUCT_LOOK[product];
  const other: ProductKey = product === "office" ? "election" : "office";
  const OtherIcon = PRODUCT_LOOK[other].icon;
  const Icon = look.icon;

  return (
    <>
      {/* Hero: the promise on the left, the product at work on the right */}
      <PageHero pattern={look.pattern} className="grid items-center gap-6 pt-8 pb-12 md:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8 lg:pb-16">
        <div className="max-w-[600px]">
          <h1 className="font-display-tight text-balance">
            <span className="rise inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1.5 pr-4 pl-1.5 text-[13px] font-semibold tracking-normal text-ink backdrop-blur-sm">
              <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-ink"><Icon size={15} aria-hidden /></span>
              {p.name}
            </span>
            <span className="rise mt-6 block text-[clamp(38px,5.4vw,66px)] leading-[1.02] [--i:1]">{p.title}</span>
          </h1>
          <Lead className="rise mt-6 [--i:2]">{p.sub}</Lead>
          <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3]">
            <PrimaryLink href={href(locale, routes.contact)} demo>{p.primary}</PrimaryLink>
            <TextLink href="#modules">{p.secondary}</TextLink>
          </div>
          <ul className="rise mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-[14px] font-medium [--i:4]">
            {p.facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf"><I.Check size={11} weight="bold" aria-hidden /></span>{f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          {/* a block-printed plate behind the window, so the screen sits on the page's own ornament */}
          <div aria-hidden className="absolute inset-x-6 top-16 bottom-6 -z-0 overflow-hidden rounded-[28px] bg-accent-soft/70 lg:-right-10 lg:left-12">
            <Pattern kind={look.pattern} className="absolute inset-0 text-accent opacity-[.12]" />
          </div>
          <ScreenPlay>
            {product === "office"
              ? <OfficeScreen s={t.pages.products.office.screen} label={p.screenLabel} />
              : <ElectionScreen s={t.pages.products.election.screen} label={p.screenLabel} />}
          </ScreenPlay>
        </div>
      </PageHero>

      {/* What changes: today against with Setuk, row by row */}
      <Wrap className="py-20 md:py-28">
        <SectionHead kicker={p.shift.kicker} title={p.shift.title} className="max-w-[760px]" />
        <div className="reveal relative mt-12 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="hidden grid-cols-2 border-b border-line text-[13px] font-semibold md:grid">
            <p className="flex items-center gap-2 px-8 py-4 text-muted"><I.X size={14} weight="bold" aria-hidden />{p.shift.before}</p>
            <p className="flex items-center gap-2 bg-accent-soft/50 px-8 py-4 text-accent"><I.SealCheck size={16} weight="fill" aria-hidden />{p.shift.after}</p>
          </div>
          <ul>
            {p.shift.items.map((x) => (
              <li key={x.after} className="relative grid border-b border-line last:border-b-0 md:grid-cols-2">
                <p className="flex gap-3 px-6 pt-6 pb-3 text-[16px] leading-snug text-muted md:px-8 md:py-7">
                  <span className="sr-only md:hidden">{p.shift.before}: </span>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line"><I.Minus size={10} weight="bold" aria-hidden /></span>
                  {x.before}
                </p>
                <p className="flex gap-3 px-6 pt-3 pb-6 text-[16px] leading-snug font-medium md:bg-accent-soft/50 md:px-8 md:py-7">
                  <span className="sr-only md:hidden">{p.shift.after}: </span>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf text-leaf-ink"><I.Check size={11} weight="bold" aria-hidden /></span>
                  {x.after}
                </p>
                {/* the turn from one to the other, on the seam */}
                <span aria-hidden className="absolute top-1/2 left-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-accent md:grid">
                  <I.ArrowRight size={14} weight="bold" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>

      {/* The modules that carry the product, each beside its picture */}
      <Band tone="surface" labelledBy="features-title" corner={{ kind: look.pattern, fx: 100, fy: 0 }}>
        <SectionHead title={p.features.title} id="features-title" lead={p.features.sub} className="max-w-[720px]" />
        <div className="mt-16 space-y-24 md:mt-20 md:space-y-32">
          {p.features.items.map((f, i) => {
            const FIcon = look.features[i];
            return (
              <article key={f.t} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <p className="flex items-center gap-3 text-[15px] font-semibold text-accent"><IconTile icon={FIcon} />{f.t}</p>
                  <h3 className="font-display-tight mt-6 text-balance text-[clamp(26px,2.9vw,38px)] leading-[1.06]">{f.h}</h3>
                  <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-muted">{f.d}</p>
                  <ul className="mt-7 space-y-3">
                    {f.points.map((x) => (
                      <li key={x} className="flex items-start gap-3 text-[16px] leading-snug">
                        <I.Check size={16} weight="bold" className="mt-0.5 shrink-0 text-leaf" aria-hidden />{x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="reveal relative">
                  <Figure img={f.img} alt={f.alt} ratio="4 / 3" sizes="(min-width: 1024px) 560px, 100vw" />
                  <p className="absolute -bottom-6 left-5 flex max-w-[calc(100%-40px)] items-center gap-3 rounded-2xl border border-line bg-surface py-3 pr-5 pl-3.5 shadow-[0_24px_50px_-24px_color-mix(in_srgb,var(--ink)_45%,transparent)] sm:left-8">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf"><I.Check size={16} weight="bold" aria-hidden /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] text-muted">{f.chip.k}</span>
                      <span className="block truncate text-[14px] font-semibold">{f.chip.v}</span>
                    </span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Band>

      {/* Every module, live first, then what's being built */}
      <section id="modules" aria-labelledby="modules-title" className="scroll-mt-20">
        <Wrap className="py-20 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <SectionHead kicker={p.modules.kicker} title={p.modules.title} id="modules-title" lead={p.modules.sub} className="max-w-[680px]" />
            <TextLink href={`${href(locale, routes.how)}#modules`}>{c.setup.link}</TextLink>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.modules.items.map((m, i) => {
              const MIcon = look.modules[i];
              return (
                <li key={m.t} className={`reveal flex flex-col rounded-3xl border p-6 ${m.soon ? "border-dashed border-line" : "border-line bg-surface"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <IconTile icon={MIcon} className={m.soon ? "opacity-60" : ""} />
                    {m.soon
                      ? <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-accent-soft px-2.5 text-[12px] font-medium text-accent"><I.Clock size={12} aria-hidden />{c.soon}</span>
                      : <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-leaf-soft px-2.5 text-[12px] font-medium text-leaf"><span className="size-1.5 rounded-full bg-leaf" aria-hidden />{c.live}</span>}
                  </div>
                  <h3 className="mt-6 text-[17px] leading-snug font-semibold">{m.t}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{m.d}</p>
                </li>
              );
            })}
          </ul>
        </Wrap>
      </section>

      {/* The one feature band */}
      <Band tone="tint" labelledBy="band-title">
        {product === "office" ? (
          <>
            <SectionHead kicker={p.band.kicker} title={p.band.title} id="band-title" lead={p.band.body} className="max-w-[680px]" />
            <div className="reveal relative mt-12 rounded-[28px] border border-accent/15 bg-surface/50 p-2 sm:p-3">
              {["top-0 left-0 border-t-2 border-l-2 rounded-tl-[28px]", "top-0 right-0 border-t-2 border-r-2 rounded-tr-[28px]", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[28px]", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-[28px]"].map((k) => (
                <span key={k} aria-hidden="true" className={`absolute h-8 w-8 border-accent/50 ${k}`} />
              ))}
              <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_40px_100px_-50px_color-mix(in_srgb,var(--accent)_60%,transparent)]">
                <Image src={media.eletterScreen} alt={p.band.alt ?? ""} sizes="(min-width: 1280px) 1216px, 100vw" placeholder="blur" className="h-auto w-full" />
              </div>
            </div>
          </>
        ) : (
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            <div>
              <SectionHead kicker={p.band.kicker} title={p.band.title} id="band-title" lead={p.band.body} />
              <ul className="mt-8 space-y-3">
                {p.band.points.map((x) => (
                  <li key={x} className="flex items-center gap-3 text-[16px] font-medium">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-leaf text-leaf-ink"><I.Check size={13} weight="bold" aria-hidden /></span>{x}
                  </li>
                ))}
              </ul>
              {p.band.link && <TextLink href={href(locale, routes.voterList)} className="mt-8">{p.band.link}</TextLink>}
            </div>
            <Sheet />
          </div>
        )}
      </Band>

      {/* How it's set up, and what we commit to about data */}
      <Band tone="surface" labelledBy="setup-title" corner={{ kind: "jaali", fx: 0, fy: 0 }}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <SectionHead kicker={c.setup.kicker} title={c.setup.title} id="setup-title" lead={c.setup.sub} className="max-w-[680px]" />
          <TextLink href={href(locale, routes.how)}>{c.setup.link}</TextLink>
        </div>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((s, i) => (
            <li key={s.t} className="reveal flex flex-col bg-surface p-6 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-accent font-mono text-[14px] font-semibold text-accent-ink">{i + 1}</span>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-[12.5px] font-medium text-accent"><I.Clock size={13} aria-hidden />{s.time}</span>
              </div>
              <h3 className="mt-6 text-[18px] leading-snug font-semibold">{s.t}</h3>
              <p className="mt-auto flex items-start gap-2 pt-5 text-[14.5px] leading-snug text-muted">
                <I.SealCheck size={17} weight="fill" className="mt-px shrink-0 text-leaf" aria-hidden />{s.get}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-16 grid gap-8 border-t border-line pt-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div>
            <p className="flex items-center gap-3"><IconTile icon={I.Lock} leaf /><span className="font-display-tight text-[24px] leading-tight">{c.trust.title}</span></p>
            <TextLink href={href(locale, routes.legal)} className="mt-4">{c.trust.link}</TextLink>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.trust.items.map((x) => (
              <li key={x.t} className={`${TICK} border-line`}>
                <p className="text-[15px] font-semibold">{x.t}</p>
                <p className="mt-1 text-[14px] leading-snug text-muted">{x.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Band>

      {/* The product's questions */}
      <Wrap className="py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
            <SectionHead title={p.faq.title} id="product-faq-title" lead={p.faq.lead} />
            <TextLink href={href(locale, routes.faqs)} className="mt-6">{c.faqAll}</TextLink>
          </div>
          <Faqs items={p.faq.items} />
        </div>
      </Wrap>

      {/* The other product */}
      <Wrap className="pb-4">
        <Link href={href(locale, routes.products[other])}
          className="group reveal relative grid items-center gap-6 overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-accent sm:p-10 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8">
          <CornerPattern kind={PRODUCT_LOOK[other].pattern} fx={100} fy={50} radius={420} className="inset-0 text-accent opacity-[.1]" />
          <span className="relative grid size-16 place-items-center rounded-2xl bg-accent text-accent-ink"><OtherIcon size={28} aria-hidden /></span>
          <span className="relative">
            <span className="block text-[13px] font-semibold text-leaf">{p.other.kicker}</span>
            <span className="font-display-tight mt-1 block text-[clamp(22px,2.4vw,30px)] leading-tight">{p.other.t}</span>
            <span className="mt-2 block text-[16px] leading-relaxed text-muted">{p.other.d}</span>
          </span>
          <span className="relative inline-flex h-12 w-fit items-center gap-2 whitespace-nowrap rounded-full border border-line bg-bg px-6 font-semibold transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
            {p.other.link}<I.ArrowRight weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </Wrap>
    </>
  );
}

/**
 * A voter list workbook, drawn without words: the header row in the spreadsheet's green, one row per
 * voter as bars, the booth sheets as tabs along the foot. Decoration beside the band's own words.
 */
function Sheet() {
  const widths = [72, 54, 88, 61, 79, 47, 66, 83, 58, 70];
  return (
    <div aria-hidden className="reveal relative">
      <div className="absolute -inset-4 -z-0 rotate-2 rounded-[28px] border border-accent/15 bg-surface/40" />
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_40px_90px_-50px_color-mix(in_srgb,var(--accent)_60%,transparent)]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="grid size-8 place-items-center rounded-lg bg-leaf text-leaf-ink"><I.FileXls size={18} /></span>
          <span className="h-2.5 w-40 rounded-full bg-ink/15" />
          <span className="ml-auto h-2.5 w-14 rounded-full bg-ink/10" />
        </div>
        <div className="grid grid-cols-[40px_1.4fr_1.4fr_0.6fr_0.7fr] bg-leaf-soft text-leaf">
          {[0, 1, 2, 3, 4].map((k) => <span key={k} className="border-r border-leaf/15 px-3 py-2.5 last:border-r-0"><span className="block h-2 w-3/4 rounded-full bg-current opacity-60" /></span>)}
        </div>
        {widths.map((w, r) => (
          <div key={r} className="grid grid-cols-[40px_1.4fr_1.4fr_0.6fr_0.7fr] border-t border-line">
            <span className="border-r border-line px-3 py-2.5 text-right font-mono text-[11px] text-muted">{r + 1}</span>
            <span className="border-r border-line px-3 py-3"><span className="block h-2 rounded-full bg-ink/15" style={{ width: `${w}%` }} /></span>
            <span className="border-r border-line px-3 py-3"><span className="block h-2 rounded-full bg-accent/25" style={{ width: `${widths[(r + 3) % widths.length]}%` }} /></span>
            <span className="border-r border-line px-3 py-3"><span className="block h-2 w-1/2 rounded-full bg-ink/10" /></span>
            <span className="px-3 py-3"><span className="block h-2 w-2/3 rounded-full bg-ink/10" /></span>
          </div>
        ))}
        <div className="flex gap-1 border-t border-line bg-surface-2/60 px-3 pt-1.5">
          {[0, 1, 2, 3, 4].map((k) => <span key={k} className={`h-7 w-16 rounded-t-md ${k === 0 ? "border-x border-t border-line bg-surface" : "bg-ink/5"}`} />)}
        </div>
      </div>
    </div>
  );
}
