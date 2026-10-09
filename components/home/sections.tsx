import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { Dictionary, Locale } from "@/content";
import { site } from "@/content/site";
import * as I from "@/components/icons";
import { SetukMark } from "@/components/site/setuk-mark";
import { Kicker } from "@/components/site/kicker";
import { AshokaChakra, CornerPattern, Pattern } from "@/components/site/pattern";
import { href, routes } from "@/lib/paths";
import engage from "./engage.module.css";

/* Sections after the scroll story. All server-rendered; the FAQ uses <details>, so no JS.
   Each section carries its own Indian pattern (components/site/pattern.tsx): a toran over
   Engagements (whose package cards stack as they scroll, engage.module.css), a jaali screen behind Data and trust, block-print buti in the FAQ panel and
   the jaali with सेतुक on the closing call to action. */

const bigJaali = { "--s": "64px", "--r": "45px", "--w": "1.6px" } as CSSProperties;
const sadanWall = { "--s": "56px" } as CSSProperties;

function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display-tight mt-3 text-balance text-[clamp(32px,4.2vw,52px)] leading-[1.04] ${className}`}>{children}</h2>;
}

/* One look per package card, from light to dark to the brand colour, so the stack reads as three layers */
const LOOKS = [
  { card: "border-line bg-surface text-ink", soft: "text-muted", key: "text-accent", hi: "border-accent bg-accent text-accent-ink", cta: "bg-accent text-accent-ink hover:brightness-110" },
  { card: "border-ink bg-ink text-bg", soft: "text-bg/70", key: "text-accent-soft", hi: "border-accent bg-accent text-accent-ink", cta: "bg-accent text-accent-ink hover:brightness-110" },
  { card: "border-accent bg-accent text-accent-ink", soft: "text-accent-ink/75", key: "text-accent-ink", hi: "border-accent-ink bg-accent-ink text-accent", cta: "bg-accent-ink text-accent hover:brightness-95" }
];

export function Engagements({ t, locale }: { t: Dictionary; locale: Locale }) {
  const pkgs = t.engage.pkgs, n = pkgs.length;
  const pad = (k: number) => String(k).padStart(2, "0");
  const scope = { timelineScope: pkgs.map((_, i) => `--eng-${i}`).join(", ") } as CSSProperties;
  return (
    <section id="engagements" aria-labelledby="engagements-title" className="relative z-10 overflow-clip border-t border-line bg-bg">
      <Pattern kind="toran" className="absolute inset-x-0 top-0 text-leaf opacity-50" />
      <AshokaChakra className="absolute -top-40 -right-48 w-[380px] md:w-[640px] animate-[spin_120s_linear_infinite] text-accent opacity-[.08] motion-reduce:animate-none" />
      <div className="relative mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-16">
          <div>
            <Kicker>{t.engage.eyebrow}</Kicker>
            <Title><span id="engagements-title">{t.engage.title}</span></Title>
          </div>
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-muted">{t.engage.body}</p>
        </div>
        <div className={`${engage.stack} mt-12`} style={scope}>
          {pkgs.map((p, i) => {
            const look = LOOKS[i % LOOKS.length], pick = i === 1;
            const vars = { "--i": i, "--self": `--eng-${i}`, "--next": i < n - 1 ? `--eng-${i + 1}` : "none" } as CSSProperties;
            return (
              <article key={p.t} style={vars} className={`${engage.card} relative flex flex-col overflow-hidden rounded-[28px] border shadow-[0_-18px_60px_-34px_rgb(0_0_0/.45)] ${look.card}`}>
                <Pattern kind="temple" className={`absolute inset-x-0 top-0 -scale-y-100 opacity-70 ${look.key}`} />
                <Pattern kind="jaali" className="absolute inset-0 opacity-[.05]" />
                <CornerPattern kind="kolam" fx={0} fy={100} radius={320} className={`inset-0 opacity-[.1] ${look.key}`} />
                {/* header: number, the recommendation, and where this card sits in the stack */}
                <div className="relative flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-current/10 px-6 pt-5 pb-3 font-mono text-[12px] tracking-[.18em] uppercase sm:px-9">
                  <p className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-3 ${look.key}`}>{pad(i + 1)}<span className="h-[5px] w-[5px] rounded-full bg-leaf-mark" /></span>
                    <span className={look.soft}>{t.engage.eyebrow}</span>
                    {pick && <span className="rounded-full bg-leaf px-3 py-1 font-sans text-[12px] font-semibold tracking-normal normal-case text-leaf-ink">{t.engage.pick}</span>}
                  </p>
                  <p className={`flex items-center gap-3 ${look.soft}`} aria-hidden="true">
                    <span className="flex items-center gap-1.5">
                      {pkgs.map((q, k) => <span key={q.t} className={`h-[3px] rounded-full ${k === i ? "w-8 bg-current" : "w-3 bg-current/25"}`} />)}
                    </span>
                    <span className="tnum">{pad(i + 1)} / {pad(n)}</span>
                  </p>
                </div>
                <div className="relative grid flex-1 gap-8 p-6 sm:p-9 md:grid-cols-[1fr_1.15fr] md:gap-10">
                  <div className="relative flex flex-col">
                    {/* the package number as a Devanagari watermark, like the story cards */}
                    <span aria-hidden="true" className={`font-deva pointer-events-none absolute -bottom-2 right-0 select-none text-[120px] leading-none font-bold opacity-[.07] max-md:hidden ${look.key}`}>{pad(i + 1).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)])}</span>
                    <h3 className="font-display-tight text-balance text-[clamp(32px,4vw,52px)] leading-[1.04]">{p.t}</h3>
                    <p className={`mt-5 max-w-[42ch] text-[17px] leading-relaxed ${look.soft}`}>
                      <b className="font-semibold">{t.engage.forLabel}:</b> {p.for}
                    </p>
                    {/* terms: price and trial, each with its icon */}
                    <ul className="mt-7 max-w-[360px] divide-y divide-current/10 border-y border-current/10 text-[15px]">
                      {([[I.CurrencyInr, t.engage.price], [I.HourglassMedium, t.engage.trial]] as const).map(([Ico, label]) => (
                        <li key={label} className="flex items-center gap-3 py-3">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-current/[.06] ${look.key}`}><Ico size={16} aria-hidden /></span>
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-8">
                      <Link href={href(locale, routes.contact)} className={`press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full px-6 text-[15px] font-semibold ${look.cta}`}>
                        {t.engage.cta}
                        <I.ArrowRight weight="bold" aria-hidden />
                      </Link>
                    </div>
                  </div>
                  {/* what's included, framed like a screen with corner marks */}
                  <div className="relative flex items-center rounded-3xl border border-current/12 bg-current/[.03] p-5 sm:p-7">
                    <Pattern kind="buti" className="absolute inset-0 rounded-3xl opacity-[.06]" />
                    {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map((c) => (
                      <span key={c} aria-hidden="true" className={`absolute h-4 w-4 border-current/40 ${c} ${look.key}`} />
                    ))}
                    <ul className="relative grid w-full gap-2.5 sm:grid-cols-2">
                      {p.inc.map((x, k) => (
                        <li key={x} className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-[15px] leading-snug ${k === 0 ? look.hi : "border-current/12 bg-current/[.04]"} ${k === 0 && p.inc.length % 2 ? "sm:col-span-2" : ""}`}>
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-leaf-ink"><I.Check size={12} weight="bold" aria-hidden /></span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5"><I.Info aria-hidden />{t.engage.draft}</span>
        </p>
      </div>
    </section>
  );
}

const TRUST_ICONS = [I.MapPin, I.IdentificationBadge, I.Prohibit, I.BellRinging, I.Export, I.ClockCounterClockwise];

export function Trust({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="trust" aria-labelledby="trust-title" className="relative z-10 overflow-hidden bg-ink text-bg">
      <Pattern kind="sadan" className="absolute inset-0 opacity-[.07]" style={sadanWall} />
      <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent-soft opacity-50" />
      <Pattern kind="temple" className="absolute inset-x-0 bottom-0 text-accent-soft opacity-50" />
      <div className="relative mx-auto grid max-w-page gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <Kicker className="text-leaf-inverse" ornament="text-accent-soft">{t.trust.eyebrow}</Kicker>
          <Title><span id="trust-title">{t.trust.title}</span></Title>
          <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-bg/70">{t.trust.body}</p>
          <Link href={href(locale, routes.legal)} className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-accent-soft">
            <I.Scales aria-hidden />
            {t.trust.legal}
            <I.ArrowRight aria-hidden />
          </Link>
          <p className="mt-3 max-w-[40ch] text-[14px] text-bg/60">{t.trust.dpa}</p>
        </div>
        <ul className="grid gap-x-10 gap-y-8 self-center sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {t.trust.items.map((x, i) => {
            const Ico = TRUST_ICONS[i];
            return (
              <li key={x.t} className="relative flex gap-4 border-t border-bg/15 pt-5 before:absolute before:-top-px before:left-0 before:h-px before:w-10 before:bg-leaf-mark">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-accent-soft text-accent">
                  <Pattern kind="buti" className="absolute inset-0 opacity-[.18] [mask-size:24px_24px]" />
                  <Ico size={22} className="relative" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold">{x.t}</h3>
                  <p className="mt-1 leading-relaxed text-bg/65">{x.d}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Faq({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative z-10 border-t border-line bg-bg">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
        <div className="relative self-start overflow-hidden rounded-3xl border border-line bg-surface p-7 pt-9 lg:sticky lg:top-28">
          <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent" />
          <CornerPattern kind="buti" className="inset-0 h-full w-full text-accent opacity-[.16]" fx={100} fy={100} radius={360} />
          <div className="relative">
            <Kicker>{t.faq.eyebrow}</Kicker>
            <Title><span id="faq-title">{t.faq.title}</span></Title>
            <p className="mt-6 text-muted">{t.faq.more}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-medium">
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center gap-2 break-all hover:text-accent"><I.EnvelopeSimple aria-hidden />{site.email}</a>
              <a href={site.whatsapp.href} className="inline-flex min-h-11 items-center gap-2 hover:text-accent"><I.WhatsappLogo className="text-leaf" aria-hidden />WhatsApp</a>
            </div>
            <Link href={href(locale, routes.faqs)} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline">
              {t.pages.engagements.allFaqs}
              <I.ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
        <div className="border-t border-line">
          {t.faq.items.map((x, i) => (
            <details key={x.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex gap-4">
                  <span className="mt-0.5 font-mono text-[13px] font-medium text-accent transition-colors group-open:text-leaf">{String(i + 1).padStart(2, "0")}</span>
                  <span>{x.q}</span>
                </span>
                <I.Plus size={20} className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="-mt-1 max-w-[68ch] pb-6 pl-9 leading-relaxed text-muted">{x.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The closing call to action, shared by every page */
export function Cta({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section aria-labelledby="cta-title" className="relative z-10 bg-bg">
      <div className="mx-auto max-w-page px-5 pb-20 md:px-8 md:pb-28">
        <div className="relative grid items-end gap-10 overflow-hidden rounded-[32px] bg-accent px-6 py-14 text-accent-ink sm:px-10 sm:py-16 lg:grid-cols-[1fr_auto] lg:px-16 lg:py-24">
          <Pattern kind="jaali" className="absolute inset-0 opacity-[.1]" style={bigJaali} />
          <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 opacity-35" />
          <Pattern kind="temple" className="absolute inset-x-0 bottom-0 opacity-35" />
          <span aria-hidden="true" className="font-deva pointer-events-none absolute right-[3vw] bottom-[0.06em] select-none text-[26vw] leading-none font-bold opacity-[.12] lg:text-[230px]">सेतुक</span>
          <div className="relative max-w-[640px]">
            <span className="block w-14 [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)]"><SetukMark /></span>
            <Title className="mt-8"><span id="cta-title">{t.cta.title}</span></Title>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed opacity-80">{t.cta.body}</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <Link href={href(locale, routes.contact)} className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent-ink px-6 font-semibold text-accent focus-visible:outline-accent-ink hover:brightness-95">
              {t.cta.primary}
              <I.ArrowRight weight="bold" aria-hidden />
            </Link>
            <a href={site.whatsapp.href} className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full border border-accent-ink/40 px-6 font-semibold focus-visible:outline-accent-ink hover:border-accent-ink">
              <I.WhatsappLogo size={18} aria-hidden />
              {t.cta.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
