import Image from "next/image";
import { getDictionary, type Locale } from "@/content";
import { media } from "@/content/media";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { CornerPattern } from "@/components/site/pattern";
import { href, routes } from "@/lib/paths";
import { HowSteps } from "./how-steps";
import { Band, deva, Figure, H1, Lead, PageHero, PrimaryLink, SectionHead, TextLink, TICK, Wrap } from "./ui";

/**
 * How we work: the four-step process (from the homepage's "How we work" steps, with what we do and
 * what we need at each), the six live modules, the eLetter screen, the citizen side, and the roadmap.
 */
export function HowWeWorkPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.how;
  const steps = t.how.steps.map((s, i) => ({ ...s, ...p.process.steps[i] }));
  const [a, b, c, d, e, f] = p.modules.items;

  return (
    <>
      {/* Hero: the promise on the left, the office it produces on the right */}
      <PageHero className="grid items-center gap-10 pt-10 pb-16 md:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:pb-24">
        <div>
          <Kicker className="rise text-leaf">{t.nav.labels.how}</Kicker>
          <H1 className="rise mt-4 [--i:1]">{p.title}</H1>
          <Lead className="rise mt-5 [--i:2]">{p.sub}</Lead>
          <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3]">
            <PrimaryLink href={href(locale, routes.contact)}>{p.primary}</PrimaryLink>
            <TextLink href="#modules">{p.secondary}</TextLink>
          </div>
        </div>
        <Figure img="officeTeam" alt={p.heroAlt} priority sizes="(min-width: 1024px) 640px, 100vw" className="rise [--i:2] shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--accent)_45%,transparent)]" />
      </PageHero>

      {/* The process: a step list that follows the reader, and the steps themselves */}
      <Band tone="surface" labelledBy="process-title" corner={{ kind: "kolam", fx: 100, fy: 0 }}>
        <SectionHead kicker={p.process.kicker} title={p.process.title} id="process-title" lead={p.process.sub} className="max-w-[760px]" />
        <HowSteps className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <ol className="relative hidden self-start lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:block">
            <span aria-hidden className="absolute top-3 bottom-3 left-[15px] w-px bg-line" />
            <span aria-hidden data-rail className="absolute top-3 bottom-3 left-[15px] w-px origin-top scale-y-0 bg-accent" />
            {steps.map((s, i) => (
              <li key={s.t}>
                <a href={`#step-${i + 1}`} data-step-link className="group relative flex items-start gap-4 py-3 text-muted transition-colors data-[on]:text-ink">
                  <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[13px] transition-colors group-data-[on]:border-accent group-data-[on]:bg-accent group-data-[on]:text-accent-ink">{i + 1}</span>
                  <span className="pt-1">
                    <span className="block text-[17px] font-semibold leading-snug">{s.t}</span>
                    <span className="mt-0.5 block text-[14px] text-muted">{s.time}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <div className="divide-y divide-line border-y border-line">
            {steps.map((s, i) => (
              <article key={s.t} id={`step-${i + 1}`} data-step className="relative scroll-mt-28 py-10 first:pt-8 md:py-12">
                {/* the step number as a Devanagari watermark, like the story cards */}
                <span aria-hidden="true" className="font-deva pointer-events-none absolute top-6 right-0 select-none text-[72px] leading-none font-bold text-accent opacity-[.08] max-sm:hidden">{deva(i + 1)}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display-tight text-[clamp(24px,2.6vw,32px)] leading-tight">{s.t}</h3>
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-[13px] font-medium text-accent"><I.Clock aria-hidden />{s.time}</span>
                </div>
                <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">{s.d}</p>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                  <div>
                    <h4 className="text-[13px] font-semibold text-ink">{p.process.doLabel}</h4>
                    <ul className="mt-3 space-y-2.5 text-[15px] leading-snug">
                      {s.does.map((x) => (
                        <li key={x} className="flex gap-2.5"><I.ArrowRight size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-ink">{p.process.needLabel}</h4>
                    <p className="mt-3 text-[15px] leading-snug text-muted">{s.needs}</p>
                  </div>
                </div>
                <p className="mt-8 flex items-start gap-3 rounded-xl bg-leaf-soft px-4 py-3.5 text-[15px] font-medium text-ink">
                  <I.SealCheck size={20} weight="fill" className="mt-px shrink-0 text-leaf" aria-hidden />
                  <span><span className="text-leaf">{t.how.get}:</span> {s.get}</span>
                </p>
              </article>
            ))}
          </div>
        </HowSteps>
      </Band>

      {/* The six live modules, as a bento with the module's own illustration */}
      <section id="modules" aria-labelledby="modules-title" className="scroll-mt-20">
        <Wrap className="py-20 md:py-28">
          <SectionHead kicker={p.modules.kicker} title={p.modules.title} id="modules-title" lead={p.modules.sub} className="max-w-[720px]" />
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <ModuleCard m={a} className="md:col-span-4" ratio="16 / 9" sizes="(min-width: 768px) 820px, 100vw" />
            <ModuleCard m={b} className="md:col-span-2" ratio="4 / 3" fill sizes="(min-width: 768px) 410px, 100vw" />
            <ModuleCard m={c} className="md:col-span-2" ratio="4 / 3" sizes="(min-width: 768px) 410px, 100vw" />
            <ModuleCard m={d} className="md:col-span-2" ratio="4 / 3" sizes="(min-width: 768px) 410px, 100vw" />
            <ModuleCard m={e} className="md:col-span-2" ratio="4 / 3" sizes="(min-width: 768px) 410px, 100vw" />
            {/* the last one runs the full width, picture beside the text */}
            <article className="reveal grid overflow-hidden rounded-3xl border border-line bg-surface md:col-span-6 md:grid-cols-2">
              <div className="illo relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
                <Image src={media[f.img]} alt={f.alt} fill sizes="(min-width: 768px) 620px, 100vw" placeholder="blur" className="object-cover" />
              </div>
              <div className="relative flex flex-col justify-center overflow-hidden p-7 md:p-10">
                <CornerPattern kind="buti" fx={100} fy={100} radius={320} className="inset-0 text-accent opacity-[.14]" />
                <p className="relative text-[14px] font-semibold text-accent">{f.t}</p>
                <h3 className="font-display-tight relative mt-2 text-[clamp(24px,2.4vw,30px)] leading-tight">{f.h}</h3>
                <p className="relative mt-3 max-w-[44ch] text-[16px] leading-relaxed text-muted">{f.d}</p>
              </div>
            </article>
          </div>
        </Wrap>
      </section>

      {/* The real product: the eLetter screen */}
      <Band tone="tint" labelledBy="screen-title">
        <SectionHead kicker={p.screen.kicker} title={p.screen.title} id="screen-title" lead={p.screen.body} className="max-w-[680px]" />
        {/* framed like the homepage's package screens, with corner marks */}
        <div className="reveal relative mt-12 rounded-[28px] border border-accent/15 bg-surface/50 p-2 sm:p-3">
        {["top-0 left-0 border-t-2 border-l-2 rounded-tl-[28px]", "top-0 right-0 border-t-2 border-r-2 rounded-tr-[28px]", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[28px]", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-[28px]"].map((c) => (
          <span key={c} aria-hidden="true" className={`absolute h-8 w-8 border-accent/50 ${c}`} />
        ))}
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_40px_100px_-50px_color-mix(in_srgb,var(--accent)_60%,transparent)]">
          <Image src={media.eletterScreen} alt={p.screen.alt} sizes="(min-width: 1280px) 1216px, 100vw" placeholder="blur" className="h-auto w-full" />
        </div>
        </div>
      </Band>

      {/* The citizen side */}
      <Wrap className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
        <div className="lg:order-2">
          <SectionHead kicker={p.citizens.kicker} title={p.citizens.title} lead={p.citizens.body} />
          <ul className="mt-8 space-y-3">
            {p.citizens.points.map((x) => (
              <li key={x} className="flex items-center gap-3 text-[16px] font-medium">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-leaf-ink"><I.Check size={13} weight="bold" aria-hidden /></span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <Figure img="citizenApp" alt={p.citizens.alt} sizes="(min-width: 1024px) 600px, 100vw" className="reveal lg:order-1" />
      </Wrap>

      {/* What's next */}
      <Band tone="surface" id="roadmap" labelledBy="roadmap-title" corner={{ kind: "jaali", fx: 0, fy: 100 }} className="scroll-mt-20">
        <SectionHead kicker={p.roadmap.kicker} title={p.roadmap.title} id="roadmap-title" lead={p.roadmap.sub} className="max-w-[680px]" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold"><I.Clock className="text-accent" aria-hidden />{p.roadmap.nowLabel}</h3>
            <ul className="mt-5 grid gap-3">
              {p.roadmap.now.map((x) => (
                <li key={x.t} className="relative overflow-hidden rounded-xl border border-line bg-bg p-5 pl-6 before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:rounded-full before:bg-leaf-mark">
                  <p className="text-[17px] font-semibold">{x.t}</p>
                  <p className="mt-1 text-[15px] leading-snug text-muted">{x.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold"><I.CalendarDots className="text-accent" aria-hidden />{p.roadmap.nextLabel}</h3>
            <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
              {p.roadmap.next.map((x) => (
                <li key={x.t} className={`${TICK} border-line pb-4`}>
                  <p className="text-[15px] font-semibold">{x.t}</p>
                  <p className="mt-1 text-[14px] leading-snug text-muted">{x.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Band>
    </>
  );
}

/** `fill`: the picture grows to the row's height (set by its wider neighbour) instead of keeping its ratio */
function ModuleCard({ m, className, ratio, sizes, fill = false }: { m: { t: string; h: string; d: string; img: keyof typeof media; alt: string }; className: string; ratio: string; sizes: string; fill?: boolean }) {
  return (
    <article className={`reveal flex flex-col overflow-hidden rounded-3xl border border-line bg-surface ${className}`}>
      <div className={`illo relative ${fill ? "md:aspect-auto! md:flex-1" : ""}`} style={{ aspectRatio: ratio }}>
        <Image src={media[m.img]} alt={m.alt} fill sizes={sizes} placeholder="blur" className="object-cover" />
      </div>
      <div className={`flex flex-col p-6 md:p-7 ${fill ? "" : "flex-1"}`}>
        <p className="text-[14px] font-semibold text-accent">{m.t}</p>
        <h3 className="font-display-tight mt-2 text-[22px] leading-tight">{m.h}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{m.d}</p>
      </div>
    </article>
  );
}
