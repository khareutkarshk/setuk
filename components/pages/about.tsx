import Image, { type StaticImageData } from "next/image";
import { getDictionary, type Locale } from "@/content";
import type { Dictionary } from "@/content/types";
import * as I from "@/components/icons";
import { Kicker } from "@/components/site/kicker";
import { SetukMark } from "@/components/site/setuk-mark";
import { CornerPattern, Lotus } from "@/components/site/pattern";
import { Band, Figure, H1, Lead, PageHero, Panel, SectionHead, TICK, Wrap } from "./ui";

/**
 * About: the founder's account from setuk.org, set as an editorial page. The origin, the moment that
 * made it real, what we believe, where the name comes from, and the founder's note beside his portrait.
 */

/**
 * The founder's portrait, beside his note. Until it arrives the frame says what to shoot
 * (`letter.placeholder`). To place it: save it as assets/media/founder.webp (1600 × 2000, 4:5),
 * `import founder from "@/assets/media/founder.webp"` here and set FOUNDER to it.
 */
const FOUNDER: StaticImageData | null = null;
export function AboutPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.about;

  return (
    <>
      {/* Title, then the war room and who we are in three facts */}
      <PageHero className="pt-10 pb-20 md:pt-16 md:pb-28">
        <Kicker className="rise text-leaf">{t.nav.labels.about}</Kicker>
        <H1 className="rise mt-4 max-w-[920px] [--i:1]">{p.title}</H1>
        <Lead className="rise mt-6 [--i:2]">{p.sub}</Lead>
        <div className="grid items-end gap-8 pt-12 md:pt-16 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-12">
          <Figure img="warRoom" alt={p.heroAlt} priority sizes="(min-width: 1024px) 800px, 100vw" className="rise [--i:3]" />
          <dl className="rise grid gap-6 [--i:4] sm:grid-cols-3 lg:grid-cols-1">
            {p.company.map((c) => (
              <div key={c.t} className={`${TICK} border-line`}>
                <dt className="text-[13px] text-muted">{c.t}</dt>
                <dd className="mt-1 text-[17px] font-semibold">{c.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHero>

      {/* The origin, in the founder's words */}
      <Band tone="surface" labelledBy="origin-title" corner={{ kind: "jaali", fx: 0, fy: 100 }}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <SectionHead kicker={p.origin.kicker} title={p.origin.title} id="origin-title" className="lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:self-start" />
          <div className="max-w-[64ch] space-y-6 text-[18px] leading-[1.7] md:text-[19px]">
            {p.origin.paras.map((x, i) => (
              <p key={i} className={i === 0 ? "text-ink" : "text-muted"}>{x}</p>
            ))}
          </div>
        </div>
      </Band>

      {/* The moment that made it real */}
      <Wrap className="py-20 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <figure className="reveal relative">
            {/* the story cards' lotus, behind the opening quote mark */}
            <Lotus className="absolute -top-16 -left-14 w-[150px] text-leaf opacity-30" />
            <blockquote className="relative font-display-tight text-balance text-[clamp(28px,3.4vw,44px)] leading-[1.12]">
              <span aria-hidden className="mr-1 text-accent">“</span>{p.moment.quote}<span aria-hidden className="text-accent">”</span>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-[15px] text-muted">
              <span className="w-8"><SetukMark /></span>{p.moment.by}
            </figcaption>
          </figure>
          <Figure img="officeBeforeAfter" alt={p.moment.alt} sizes="(min-width: 1024px) 600px, 100vw" className="reveal" />
        </div>
        {/* the story behind the quote, in the same column as the origin text above */}
        <div className="mt-14 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div className="max-w-[64ch] space-y-6 text-[18px] leading-[1.7] text-muted lg:col-start-2">
            {p.moment.paras.map((x, i) => (
              <p key={i} className={i === p.moment.paras.length - 1 ? "font-semibold text-ink" : ""}>{x}</p>
            ))}
          </div>
        </div>
      </Wrap>

      {/* What we believe: six plain statements on the dark band, as Data and trust on the homepage */}
      <Band tone="ink" labelledBy="beliefs-title">
        <SectionHead kicker={p.beliefs.kicker} title={p.beliefs.title} id="beliefs-title" inverse />
        <ul className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {p.beliefs.items.map((x, i) => (
            <li key={x} className={`reveal ${TICK} border-bg/15 pt-6`}>
              <span className="font-mono text-[13px] text-accent-soft">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 text-[clamp(20px,1.9vw,24px)] font-semibold leading-snug">{x}</p>
            </li>
          ))}
        </ul>
      </Band>

      {/* Where the name comes from */}
      <Wrap className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHead kicker={p.name.kicker} title={p.name.title} />
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-muted">
            {p.name.paras.map((x, i) => <p key={i}>{x}</p>)}
          </div>
        </div>
        <Figure img="setu" alt={p.name.alt} sizes="(min-width: 1024px) 700px, 100vw" className="reveal" />
      </Wrap>

      {/* The founder's note, set as a letter on the homepage's panel, his portrait beside it */}
      <section aria-labelledby="letter-title">
        <Wrap className="pb-20 md:pb-28">
          <Panel corner="kolam" fx={0} fy={0} chakra className="reveal mx-auto max-w-[1120px] px-6 pt-14 pb-10 sm:px-12 md:px-16 md:pt-16 md:pb-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
            <Portrait photo={FOUNDER} alt={p.letter.photoAlt} placeholder={p.letter.placeholder} />
            <div className="max-w-[680px]">
              <Kicker as="h2" id="letter-title">{p.letter.title}</Kicker>
              <div className="mt-6 space-y-6 text-[clamp(20px,2vw,24px)] leading-[1.55]">
                {p.letter.paras.map((x, i) => <p key={i} className={i === p.letter.paras.length - 1 ? "font-semibold" : ""}>{x}</p>)}
              </div>
              <p className="mt-10 flex items-center gap-3 border-t border-line pt-6 text-[15px] text-muted">
                <span className="w-9"><SetukMark /></span>
                {p.letter.by}
              </p>
            </div>
            </div>
          </Panel>
        </Wrap>
      </section>
    </>
  );
}

/** The portrait's frame: the photo when there is one, otherwise a placeholder that says what to shoot */
function Portrait({ photo, alt, placeholder }: { photo: StaticImageData | null; alt: string; placeholder: Dictionary["pages"]["about"]["letter"]["placeholder"] }) {
  const frame = "relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-line lg:max-w-none";
  if (photo) {
    return (
      <div className={`${frame} aspect-[4/5]`}>
        <Image src={photo} alt={alt} fill sizes="(min-width: 1024px) 420px, 100vw" placeholder="blur" className="object-cover" />
      </div>
    );
  }
  /* at least 4:5: a 4:5 spacer shares the grid cell with the content, so the specs can make it taller on a narrow screen */
  return (
    <div className={`${frame} grid grid-cols-[minmax(0,1fr)] bg-accent-soft`}>
      <span aria-hidden="true" className="block aspect-[4/5] [grid-area:1/1]" />
      <CornerPattern kind="lehar" fx={50} fy={100} radius={420} className="inset-0 text-accent opacity-[.18]" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[18px] border border-dashed border-accent/35" />
      <div className="relative flex flex-col p-6 [grid-area:1/1] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-accent"><I.Camera size={22} aria-hidden /></span>
          <span>
            <span className="block text-[15px] font-semibold text-ink">{placeholder.title}</span>
            <span className="block text-[13px] text-muted">{placeholder.note}</span>
          </span>
        </div>
        {/* where the head and shoulders sit */}
        <div aria-hidden="true" className="grid min-h-[96px] flex-1 place-items-center text-accent/30">
          <I.User weight="thin" className="size-[clamp(96px,40%,168px)]" />
        </div>
        <dl className="space-y-2.5">
          {placeholder.specs.map((x) => (
            <div key={x.t} className="grid grid-cols-[72px_minmax(0,1fr)] gap-2 text-[12.5px] leading-snug">
              <dt className="font-semibold text-accent">{x.t}</dt>
              <dd className="text-ink/80">{x.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
