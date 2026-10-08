import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content";
import { media } from "@/content/media";
import * as I from "@/components/icons";
import { href, routes } from "@/lib/paths";
import { Faqs } from "./faq-list";
import { H1, H2, Lead, TextLink, Wrap } from "./ui";

const PRICING_ICONS = [I.CalendarDots, I.UsersThree, I.HourglassMedium, I.Clock];

/**
 * Engagements: the three packages (the homepage's), each with the house it suits, a comparison of
 * what's included, how pricing works, and the questions people ask before choosing.
 */
export function EngagementsPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.engagements;
  const pkgs = t.engage.pkgs;

  return (
    <>
      <Wrap className="pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-[760px]">
          <H1 className="rise">{p.title}</H1>
          <Lead className="rise mt-5 [--i:1]">{p.sub}</Lead>
        </div>
      </Wrap>

      {/* The packages; the recommended one carries an accent ring and the badge */}
      <Wrap>
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {pkgs.map((k, i) => {
            const pick = i === 1;
            return (
              <article key={k.t} className={`rise relative flex flex-col rounded-3xl border bg-surface p-3 ${pick ? "border-accent shadow-[0_30px_70px_-40px_color-mix(in_srgb,var(--accent)_70%,transparent)] ring-1 ring-accent" : "border-line"}`} style={{ ["--i" as string]: i + 1 }}>
                <div className="illo relative aspect-[16/9] overflow-hidden rounded-[18px]">
                  <Image src={media[p.art[i].img]} alt={p.art[i].alt} fill sizes="(min-width: 1024px) 400px, 100vw" placeholder="blur" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col px-4 pt-5 pb-4 sm:px-5">
                  {/* every card keeps the badge's row, so the three titles line up */}
                  <p className={`mb-3 min-h-[26px] items-start ${pick ? "flex" : "hidden lg:flex"}`}>
                    {pick && <span className="rounded-full bg-leaf px-3 py-1 text-[12px] leading-snug font-semibold text-leaf-ink">{t.engage.pick}</span>}
                  </p>
                  <h2 className="font-display-tight text-[28px] leading-tight">{k.t}</h2>
                  <p className="mt-2 text-[15px] leading-snug text-muted"><b className="font-semibold text-ink">{t.engage.forLabel}:</b> {k.for}</p>
                  <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6 text-[15px]">
                    {k.inc.map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-leaf-ink"><I.Check size={12} weight="bold" aria-hidden /></span>
                        <span className="leading-snug">{x}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[14px] text-muted">{t.engage.price}</span>
                    <Link href={href(locale, routes.contact)} className={`press inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-[14px] font-semibold ${pick ? "bg-accent text-accent-ink hover:brightness-110" : "border border-line hover:border-ink"}`}>
                      {t.engage.cta}
                      <I.ArrowRight aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-[13px] text-muted"><I.Info aria-hidden />{t.engage.draft}</p>
      </Wrap>

      {/* What's included, side by side */}
      <section aria-labelledby="compare-title">
        <Wrap className="py-20 md:py-28">
          <H2 id="compare-title">{p.compare.title}</H2>
          <div className="reveal mt-10 overflow-x-auto rounded-3xl border border-line bg-surface">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
              <caption className="sr-only">{p.compare.title}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-[40%] px-6 py-5 text-[13px] font-semibold text-muted">{p.compare.feature}</th>
                  {pkgs.map((k, i) => (
                    <th key={k.t} scope="col" className={`px-4 py-5 text-center text-[16px] font-semibold ${i === 1 ? "bg-accent-soft text-accent" : ""}`}>{k.t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.compare.rows.map((r, ri) => (
                  <tr key={r.t} className={`border-line ${ri > 0 && p.compare.rows[ri - 1].from !== r.from ? "border-t-2" : "border-t"} first:border-t-0`}>
                    <th scope="row" className="px-6 py-3.5 font-medium">{r.t}</th>
                    {pkgs.map((k, i) => (
                      <td key={k.t} className={`px-4 py-3.5 text-center ${i === 1 ? "bg-accent-soft/60" : ""}`}>
                        {i >= r.from
                          ? <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-leaf text-leaf-ink"><I.Check size={13} weight="bold" aria-label={p.compare.included} /></span>
                          : <I.Minus size={16} className="inline text-muted/50" aria-label={p.compare.notIncluded} />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrap>
      </section>

      {/* How pricing works */}
      <section aria-labelledby="pricing-title" className="border-y border-line bg-surface">
        <Wrap className="grid gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <H2 id="pricing-title">{p.pricing.title}</H2>
            <Lead className="mt-4">{p.pricing.body}</Lead>
          </div>
          <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {p.pricing.items.map((x, i) => {
              const Ico = PRICING_ICONS[i];
              return (
                <div key={x.t} className="reveal flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Ico size={20} aria-hidden /></span>
                  <div>
                    <dt className="text-[17px] font-semibold">{x.t}</dt>
                    <dd className="mt-1 text-[15px] leading-snug text-muted">{x.d}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </Wrap>
      </section>

      {/* Questions before choosing */}
      <Wrap className="grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <H2>{p.faqTitle}</H2>
          <TextLink href={href(locale, routes.faqs)} className="mt-5">{p.allFaqs}</TextLink>
        </div>
        <Faqs items={p.faqs} />
      </Wrap>
    </>
  );
}
