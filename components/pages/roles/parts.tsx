import Image from "next/image";
import type { ReactNode } from "react";
import { getDictionary, type Locale } from "@/content";
import { media } from "@/content/media";
import type { QA, RoleHead, RoleKey, RoleModule, TitledItem } from "@/content/types";
import * as I from "@/components/icons";
import { Hairline } from "@/components/site/hairline";
import { Kicker } from "@/components/site/kicker";
import { CornerPattern, Pattern } from "@/components/site/pattern";
import { href, routes } from "@/lib/paths";
import { Faqs } from "../faq-list";
import { deva, H2, Lead, PageHero, Panel, PrimaryLink, SectionHead, TextLink, Wrap } from "../ui";
import { ROLE_LOOK } from "./look";

/*
 * Sections the role pages share. Each page composes them in its own order around the one section
 * only it has (own.tsx), so the four read as one family with four faces.
 */

/** A short accent rule above an item: the problems' mark (leaf stays for outcomes) */
const RULE = "relative border-t border-line pt-5 before:absolute before:-top-px before:left-0 before:h-px before:w-10 before:bg-accent";

/** The hero: the promise on the left, the role's line figure on a plate on the right */
export function RoleHero({ role, r, locale, anchor }: { role: RoleKey; r: RoleHead; locale: Locale; anchor: string }) {
  const look = ROLE_LOOK[role];
  return (
    <PageHero routes={false} pattern={look.pattern} className="grid items-center gap-10 pt-8 pb-16 md:pt-14 lg:grid-cols-[minmax(0,11fr)_minmax(0,10fr)] lg:gap-12 lg:pb-24">
      <div>
        <Kicker className="rise text-leaf">{r.kicker}</Kicker>
        <h1 className="rise font-display-tight mt-4 text-balance text-[clamp(34px,4.3vw,56px)] leading-[1.04] [--i:1]">{r.title}</h1>
        <Lead className="rise mt-5 [--i:2]">{r.sub}</Lead>
        <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 [--i:3]">
          <PrimaryLink href={href(locale, routes.contact)}>{r.primary}</PrimaryLink>
          <TextLink href={`#${anchor}`}>{r.secondary}</TextLink>
        </div>
      </div>
      <div className="rise relative [--i:2]">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-44px_color-mix(in_srgb,var(--accent)_50%,transparent)]">
          <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent opacity-25" />
          {/* the role in Devanagari, faint in the corner; the figure's plates cover it where they stand */}
          <span aria-hidden="true" className="font-deva pointer-events-none absolute right-6 bottom-3 select-none text-[clamp(56px,6.4vw,92px)] leading-none font-bold text-accent opacity-[.08]">{r.word}</span>
          <Hairline name={look.figure} label={r.figure.label} hint={r.figure.hint} nouns={r.figure.read} />
        </div>
      </div>
    </PageHero>
  );
}

/** What gets in the way: four problems under one headline, in ruled columns */
export function Challenges({ title, items }: { title: string; items: TitledItem[] }) {
  return (
    <Wrap className="py-20 md:py-28">
      <H2 className="max-w-[780px]">{title}</H2>
      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((x) => (
          <li key={x.t} className={`reveal ${RULE}`}>
            <h3 className="text-[18px] leading-snug font-semibold">{x.t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.d}</p>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

/**
 * Column spans that fill every row exactly: on lg three columns, with a wide tile first and last
 * as needed; on md two, widening the last single tile when the singles don't pair up.
 */
function spans(n: number) {
  const wide = (3 - (n % 3)) % 3;
  const lg = Array.from({ length: n }, (_, i) => (wide >= 1 && i === 0) || (wide === 2 && i === n - 1));
  const singles = lg.filter((w) => !w).length;
  const lastSingle = lg.lastIndexOf(false);
  return lg.map((w, i) => ({ lg: w, md: w || (singles % 2 === 1 && i === lastSingle) }));
}

/** The modules, as a bento: illustrated tiles, and quiet patterned tiles for the rest */
export function ModuleBento({ id, title, sub, items, soon, pattern }: { id: string; title: string; sub: string; items: RoleModule[]; soon: string; pattern: Parameters<typeof Pattern>[0]["kind"] }) {
  const s = spans(items.length);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <Wrap className="py-20 md:py-28">
        <SectionHead title={title} id={`${id}-title`} lead={sub} className="max-w-[720px]" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((m, i) => (
            <ModuleTile key={m.t} m={m} n={i + 1} soon={soon} wide={s[i].lg} className={`${s[i].md ? "md:col-span-2" : ""} ${s[i].lg ? "lg:col-span-2" : "lg:col-span-1"}`} pattern={pattern} />
          ))}
        </div>
      </Wrap>
    </section>
  );
}

function ModuleTile({ m, n, soon, wide, className, pattern }: { m: RoleModule; n: number; soon: string; wide: boolean; className: string; pattern: Parameters<typeof Pattern>[0]["kind"] }) {
  const text = (
    <div className={`relative flex flex-col p-6 md:p-7 ${m.img ? "flex-1" : ""}`}>
      {m.soon && <span className="mb-4 inline-flex h-7 w-fit items-center gap-1.5 rounded-full border border-dashed border-accent/50 px-3 text-[13px] font-medium text-accent"><I.Clock aria-hidden />{soon}</span>}
      <h3 className="font-display-tight text-[22px] leading-tight">{m.t}</h3>
      <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted">{m.d}</p>
    </div>
  );
  if (m.img) {
    return (
      <article className={`reveal flex flex-col overflow-hidden rounded-3xl border border-line bg-surface ${wide ? "md:flex-row" : ""} ${className}`}>
        <div className={`illo relative shrink-0 ${wide ? "aspect-[16/10] md:aspect-auto md:min-h-[300px] md:w-[56%]" : "aspect-[16/10]"}`}>
          <Image src={media[m.img]} alt={m.alt ?? ""} fill sizes={wide ? "(min-width: 1024px) 480px, (min-width: 768px) 56vw, 100vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"} placeholder="blur" className="object-cover" />
        </div>
        <div className={`flex flex-1 flex-col ${wide ? "md:justify-end" : ""}`}>{text}</div>
      </article>
    );
  }
  return (
    <article className={`reveal relative flex flex-col justify-end overflow-hidden rounded-3xl ${m.soon ? "border border-dashed border-accent/40 bg-surface" : "bg-accent-soft"} ${wide ? "min-h-[220px]" : "min-h-[260px]"} ${className}`}>
      <CornerPattern kind={pattern} fx={100} fy={0} radius={320} className="inset-0 text-accent opacity-[.16]" />
      {/* its place in the list as a Devanagari numeral, like the steps on How we work */}
      <span aria-hidden="true" className="font-deva pointer-events-none absolute top-5 right-6 select-none text-[64px] leading-none font-bold text-accent opacity-[.12]">{deva(n)}</span>
      {text}
    </article>
  );
}

const COLS: Record<number, string> = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" };

/** Steps on a rail; on the office pages one real case runs under them (`eg`), the last step closes it */
export function Flow({ title, sub, steps, eg }: { title: string; sub?: string; steps: { t: string; d: string; eg?: string }[]; eg?: string }) {
  return (
    <section aria-labelledby="flow-title" className="relative overflow-clip border-t border-line bg-surface">
      <Wrap className="py-20 md:py-28">
        <SectionHead title={title} id="flow-title" lead={sub} className="max-w-[720px]" />
        <ol className={`relative mt-14 grid gap-10 md:grid-cols-2 lg:gap-6 ${COLS[steps.length] ?? "lg:grid-cols-4"}`}>
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={s.t} className="reveal relative flex flex-col">
                {/* the rail to the next step, drawn as it comes into view (flow-rail in globals.css) */}
                {!last && <span aria-hidden="true" className="flow-rail absolute top-[19px] left-12 -right-4 hidden h-px origin-left bg-accent/40 lg:block" />}
                <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border font-mono text-[14px] ${last ? "border-leaf bg-leaf text-leaf-ink" : "border-accent bg-surface text-accent"}`}>
                  {last ? <I.Check size={18} weight="bold" aria-hidden /> : i + 1}
                </span>
                <h3 className="mt-5 text-[19px] font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{s.d}</p>
                {s.eg && (
                  <p className="mt-5 flex-1 rounded-xl border border-line bg-bg px-4 py-3.5 text-[14px] leading-relaxed">
                    {eg && <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[.06em] text-muted">{eg}</span>}
                    {s.eg}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </Wrap>
    </section>
  );
}

/** The ink band: what the representative can see, beside the real eLetter screen */
export function Oversight({ o }: { o: { kicker: string; title: string; body: string; items: string[]; alt: string } }) {
  return (
    <section aria-labelledby="oversight-title" className="relative overflow-clip bg-ink text-bg">
      <Pattern kind="sadan" className="absolute inset-0 opacity-[.06]" style={{ ["--s" as string]: "56px" }} />
      <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent-soft opacity-50" />
      <Pattern kind="temple" className="absolute inset-x-0 bottom-0 text-accent-soft opacity-50" />
      <Wrap className="relative grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <SectionHead kicker={o.kicker} title={o.title} id="oversight-title" lead={o.body} inverse />
          <ul className="mt-8 space-y-3">
            {o.items.map((x) => (
              <li key={x} className="flex items-start gap-3 text-[16px]">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-inverse text-ink"><I.Check size={13} weight="bold" aria-hidden /></span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal overflow-hidden rounded-3xl border border-bg/15 bg-surface p-1.5 shadow-[0_40px_100px_-50px_rgba(0,0,0,.6)]">
          <Image src={media.eletterScreen} alt={o.alt} sizes="(min-width: 1024px) 700px, 100vw" placeholder="blur" className="h-auto w-full rounded-[18px]" />
        </div>
      </Wrap>
    </section>
  );
}

const TEAM_ICONS = [I.IdentificationBadge, I.CalendarCheck, I.ListChecks, I.UsersThree];

/** Who uses it: the headline beside the office's roles */
export function Team({ title, sub, rows }: { title: string; sub: string; rows: TitledItem[] }) {
  return (
    <Wrap className="grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <SectionHead title={title} lead={sub} />
      <dl className="grid gap-x-10 gap-y-8 self-center sm:grid-cols-2">
        {rows.map((x, i) => {
          const Ico = TEAM_ICONS[i % TEAM_ICONS.length];
          return (
            <div key={x.t} className="reveal flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-accent"><Ico size={20} aria-hidden /></span>
              <div>
                <dt className="text-[17px] font-semibold">{x.t}</dt>
                <dd className="mt-1 text-[15px] leading-snug text-muted">{x.d}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </Wrap>
  );
}

const TRUST_ICONS = [I.Key, I.CloudCheck, I.Export, I.BellRinging];

/** Setup (the homepage's four steps) beside the data promises, both linking on */
export function SetupAndTrust({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const c = t.pages.roles.common;
  return (
    <section aria-labelledby="setup-title" className="relative overflow-clip border-t border-line">
      <Wrap className="grid gap-14 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <div>
          <H2 id="setup-title" className="text-[clamp(26px,2.8vw,36px)]!">{c.setup.title}</H2>
          <Lead className="mt-4 text-[17px]!">{c.setup.sub}</Lead>
          <ol className="mt-8 border-t border-line">
            {t.how.steps.map((s, i) => (
              <li key={s.t} className="reveal flex items-baseline gap-4 border-b border-line py-4">
                <span className="w-6 shrink-0 font-mono text-[14px] text-accent">{i + 1}</span>
                <span className="flex-1 text-[16px] font-semibold">{s.t}</span>
                <span className="text-[14px] text-muted">{s.time}</span>
              </li>
            ))}
          </ol>
          <TextLink href={href(locale, routes.how)} className="mt-4">{c.setup.link}</TextLink>
        </div>
        <div>
          <H2 className="text-[clamp(26px,2.8vw,36px)]!">{c.trust.title}</H2>
          <dl className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {c.trust.items.map((x, i) => {
              const Ico = TRUST_ICONS[i];
              return (
                <div key={x.t} className="reveal">
                  <dt className="flex items-center gap-2.5 text-[16px] font-semibold"><Ico size={20} className="text-accent" aria-hidden />{x.t}</dt>
                  <dd className="mt-1.5 text-[15px] leading-snug text-muted">{x.d}</dd>
                </div>
              );
            })}
          </dl>
          <TextLink href={href(locale, routes.legalDoc("privacy"))} className="mt-6">{c.trust.link}</TextLink>
        </div>
      </Wrap>
    </section>
  );
}

/** Questions, beside the FAQ panel (as on Engagements), in the role's own pattern */
export function RoleFaq({ title, items, locale, pattern, children }: { title: string; items: QA[]; locale: Locale; pattern: Parameters<typeof Pattern>[0]["kind"]; children?: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <Wrap className="grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <Panel corner={pattern} className="self-start p-7 pt-9 lg:sticky lg:top-[calc(var(--header-h)+32px)]">
        <H2>{title}</H2>
        {children}
        <TextLink href={href(locale, routes.faqs)} className="mt-5">{t.pages.roles.common.allFaqs}</TextLink>
      </Panel>
      <Faqs items={items} />
    </Wrap>
  );
}
