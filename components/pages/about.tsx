import { getDictionary, type Locale } from "@/content";
import { SetukMark } from "@/components/site/setuk-mark";
import { CornerPattern, Pattern } from "@/components/site/pattern";
import { Figure, H1, H2, Lead, Wrap } from "./ui";

/**
 * About: the founder's account from setuk.org, set as an editorial page. The origin, the moment that
 * made it real, what we believe, where the name comes from, and the founder's note.
 */
export function AboutPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.about;

  return (
    <>
      <Wrap className="pt-10 md:pt-16">
        <H1 className="rise max-w-[920px]">{p.title}</H1>
        <Lead className="rise mt-6 [--i:1]">{p.sub}</Lead>
      </Wrap>

      {/* The war room, and who we are in three facts */}
      <Wrap className="grid items-end gap-8 pt-12 pb-20 md:pt-16 md:pb-28 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-12">
        <Figure img="warRoom" alt={p.heroAlt} priority sizes="(min-width: 1024px) 800px, 100vw" className="rise [--i:2]" />
        <dl className="rise grid gap-6 border-t border-line pt-6 [--i:3] sm:grid-cols-3 lg:grid-cols-1">
          {p.company.map((c) => (
            <div key={c.t}>
              <dt className="text-[13px] text-muted">{c.t}</dt>
              <dd className="mt-1 text-[17px] font-semibold">{c.d}</dd>
            </div>
          ))}
        </dl>
      </Wrap>

      {/* The origin, in the founder's words */}
      <section aria-labelledby="origin-title" className="border-t border-line bg-surface">
        <Wrap className="grid gap-8 py-20 md:py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <H2 id="origin-title" className="lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:self-start">{p.origin.title}</H2>
          <div className="max-w-[64ch] space-y-6 text-[18px] leading-[1.7] md:text-[19px]">
            {p.origin.paras.map((x, i) => (
              <p key={i} className={i === 0 ? "text-ink" : "text-muted"}>{x}</p>
            ))}
          </div>
        </Wrap>
      </section>

      {/* The moment that made it real */}
      <Wrap className="py-20 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <figure className="reveal">
            <blockquote className="font-display-tight text-balance text-[clamp(28px,3.4vw,44px)] leading-[1.12]">
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

      {/* What we believe: six plain statements, on the accent tint (which stays in the page's theme) */}
      <section aria-labelledby="beliefs-title" className="relative overflow-hidden border-y border-line bg-accent-soft">
        <Pattern kind="sadan" className="absolute inset-0 text-accent opacity-[.07]" />
        <Wrap className="relative py-20 md:py-28">
          <H2 id="beliefs-title">{p.beliefs.title}</H2>
          <ul className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {p.beliefs.items.map((x) => (
              <li key={x} className="reveal relative border-t border-accent/20 pt-6 text-[clamp(20px,1.9vw,24px)] font-semibold leading-snug before:absolute before:-top-px before:left-0 before:h-0.5 before:w-10 before:bg-leaf">
                {x}
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      {/* Where the name comes from */}
      <Wrap className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <H2>{p.name.title}</H2>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-muted">
            {p.name.paras.map((x, i) => <p key={i}>{x}</p>)}
          </div>
        </div>
        <Figure img="setu" alt={p.name.alt} sizes="(min-width: 1024px) 700px, 100vw" className="reveal" />
      </Wrap>

      {/* The founder's note */}
      <section aria-labelledby="letter-title" className="relative overflow-hidden border-t border-line bg-surface">
        <CornerPattern kind="kolam" fx={0} fy={0} radius={420} className="inset-0 text-accent opacity-[.1]" />
        <Wrap className="relative py-20 md:py-28">
          <div className="mx-auto max-w-[680px]">
            <h2 id="letter-title" className="text-[15px] font-semibold text-leaf">{p.letter.title}</h2>
            <div className="mt-6 space-y-6 text-[clamp(20px,2vw,24px)] leading-[1.55]">
              {p.letter.paras.map((x, i) => <p key={i} className={i === p.letter.paras.length - 1 ? "font-semibold" : ""}>{x}</p>)}
            </div>
            <p className="mt-10 flex items-center gap-3 border-t border-line pt-6 text-[15px] text-muted">
              <span className="w-9"><SetukMark /></span>
              {p.letter.by}
            </p>
          </div>
        </Wrap>
      </section>
    </>
  );
}
