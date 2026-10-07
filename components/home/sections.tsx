import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/content";
import { site } from "@/content/site";
import * as I from "@/components/icons";
import { SetukMark } from "@/components/site/setuk-mark";
import { AshokaChakra, CornerPattern, Pattern } from "@/components/site/pattern";

/* Sections after the scroll story. All server-rendered; the FAQ uses <details>, so no JS.
   Each section carries its own Indian pattern (components/site/pattern.tsx): a toran over
   Engagements, a jaali screen behind Data and trust, block-print buti in the FAQ panel and
   the jaali with सेतु on the closing call to action. */

const bigJaali = { "--s": "64px", "--r": "45px", "--w": "1.6px" } as CSSProperties;
const sadanWall = { "--s": "56px" } as CSSProperties;

function Kicker({ children, className = "text-accent" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[.08em] ${className}`}>
      <Pattern kind="temple" className="w-[24px] shrink-0" />
      {children}
    </p>
  );
}
function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display-tight mt-3 text-balance text-[clamp(32px,4.2vw,52px)] leading-[1.04] ${className}`}>{children}</h2>;
}

export function Engagements({ t }: { t: Dictionary }) {
  return (
    <section id="engagements" aria-labelledby="engagements-title" className="relative z-10 overflow-hidden border-t border-line bg-bg">
      <Pattern kind="toran" className="absolute inset-x-0 top-0 text-accent opacity-60" />
      <AshokaChakra className="absolute -top-40 -right-48 w-[380px] md:w-[640px] animate-[spin_120s_linear_infinite] text-accent opacity-[.08] motion-reduce:animate-none" />
      <div className="relative mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-16">
          <div>
            <Kicker>{t.engage.eyebrow}</Kicker>
            <Title><span id="engagements-title">{t.engage.title}</span></Title>
          </div>
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-muted">{t.engage.body}</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.engage.pkgs.map((p, i) => {
            const pick = i === 1;
            return (
              <article key={p.t} className={`relative flex flex-col overflow-hidden rounded-3xl border p-6 pt-9 sm:p-7 sm:pt-9 md:last:odd:col-span-2 lg:last:odd:col-span-1 ${pick ? "border-ink bg-ink text-bg shadow-[0_30px_70px_-35px_rgb(0_0_0/.6)]" : "border-line bg-surface"}`}>
                <Pattern kind="temple" className={`absolute inset-x-0 top-0 -scale-y-100 ${pick ? "text-accent-soft" : "text-accent"}`} />
                {pick ? <Pattern kind="jaali" className="absolute inset-0 text-bg opacity-[.07]" /> : <CornerPattern kind="kolam" className="top-0 right-0 h-[200px] w-[200px] text-accent opacity-[.12]" radius={200} />}
                <p className="relative min-h-[26px]">
                  {pick && <span className="inline-block rounded-2xl bg-accent px-3 py-1 text-[12px] leading-snug font-semibold text-balance text-accent-ink">{t.engage.pick}</span>}
                </p>
                <h3 className="font-display-tight relative mt-3 text-[26px]">{p.t}</h3>
                <p className={`relative mt-3 text-[14px] ${pick ? "text-bg/70" : "text-muted"}`}>
                  <b className="font-semibold">{t.engage.forLabel}:</b> {p.for}
                </p>
                <ul className="relative mt-6 flex-1 space-y-3 text-[15px]">
                  {p.inc.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <I.CheckCircle size={18} className={`mt-0.5 shrink-0 ${pick ? "text-accent-soft" : "text-accent"}`} aria-hidden />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <div className={`relative mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5 ${pick ? "border-bg/20" : "border-line"}`}>
                  <span className={`text-[14px] ${pick ? "text-bg/70" : "text-muted"}`}>{t.engage.price}</span>
                  <a
                    href="#contact"
                    className={`press inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold ${pick ? "bg-accent text-accent-ink" : "border border-line hover:border-ink"}`}
                  >
                    {t.engage.cta}
                    <I.ArrowRight aria-hidden />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5"><I.CurrencyInr aria-hidden />{t.engage.price}</span>
          <span className="inline-flex items-center gap-1.5"><I.HourglassMedium aria-hidden />{t.engage.trial}</span>
          <span className="inline-flex items-center gap-1.5"><I.Info aria-hidden />{t.engage.draft}</span>
        </p>
      </div>
    </section>
  );
}

const TRUST_ICONS = [I.MapPin, I.IdentificationBadge, I.Prohibit, I.BellRinging, I.Export, I.ClockCounterClockwise];

export function Trust({ t }: { t: Dictionary }) {
  return (
    <section id="trust" aria-labelledby="trust-title" className="relative z-10 overflow-hidden bg-ink text-bg">
      <Pattern kind="sadan" className="absolute inset-0 opacity-[.07]" style={sadanWall} />
      <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent-soft opacity-50" />
      <Pattern kind="temple" className="absolute inset-x-0 bottom-0 text-accent-soft opacity-50" />
      <div className="relative mx-auto grid max-w-page gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <Kicker className="text-accent-soft">{t.trust.eyebrow}</Kicker>
          <Title><span id="trust-title">{t.trust.title}</span></Title>
          <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-bg/70">{t.trust.body}</p>
          <a href={site.legalHref} className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-accent-soft">
            <I.Scales aria-hidden />
            {t.trust.legal}
            <I.ArrowUpRight aria-hidden />
          </a>
          <p className="mt-3 max-w-[40ch] text-[14px] text-bg/60">{t.trust.dpa}</p>
        </div>
        <ul className="grid gap-x-10 gap-y-8 self-center sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {t.trust.items.map((x, i) => {
            const Ico = TRUST_ICONS[i];
            return (
              <li key={x.t} className="flex gap-4 border-t border-bg/15 pt-5">
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

export function Faq({ t }: { t: Dictionary }) {
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
              <a href={site.whatsapp.href} className="inline-flex min-h-11 items-center gap-2 hover:text-accent"><I.WhatsappLogo aria-hidden />WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="border-t border-line">
          {t.faq.items.map((x, i) => (
            <details key={x.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex gap-4">
                  <span className="mt-0.5 font-mono text-[13px] font-medium text-accent">{String(i + 1).padStart(2, "0")}</span>
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

export function Cta({ t }: { t: Dictionary }) {
  return (
    <section id="contact" aria-labelledby="cta-title" className="relative z-10 bg-bg">
      <div className="mx-auto max-w-page px-5 pb-20 md:px-8 md:pb-28">
        <div className="relative grid items-end gap-10 overflow-hidden rounded-[32px] bg-accent px-6 py-14 text-accent-ink sm:px-10 sm:py-16 lg:grid-cols-[1fr_auto] lg:px-16 lg:py-24">
          <Pattern kind="jaali" className="absolute inset-0 opacity-[.1]" style={bigJaali} />
          <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 opacity-35" />
          <Pattern kind="temple" className="absolute inset-x-0 bottom-0 opacity-35" />
          <span aria-hidden="true" className="font-deva pointer-events-none absolute right-[3vw] -bottom-[0.22em] select-none text-[34vw] leading-none font-bold opacity-[.12] lg:text-[300px]">सेतु</span>
          <div className="relative max-w-[640px]">
            <span className="block w-14 [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)]"><SetukMark /></span>
            <Title className="mt-8"><span id="cta-title">{t.cta.title}</span></Title>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed opacity-80">{t.cta.body}</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <a href={site.demoHref} className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent-ink px-6 font-semibold text-accent focus-visible:outline-accent-ink hover:brightness-95">
              {t.cta.primary}
              <I.ArrowRight weight="bold" aria-hidden />
            </a>
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
