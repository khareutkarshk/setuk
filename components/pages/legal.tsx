import Link from "next/link";
import { getDictionary, type Locale } from "@/content";
import { legalDocs } from "@/content/legal";
import type { LegalDoc, LegalGroup } from "@/content/types";
import * as I from "@/components/icons";
import { href, routes } from "@/lib/paths";
import { Prose } from "./prose";
import { Kicker } from "@/components/site/kicker";
import { Pattern } from "@/components/site/pattern";
import { Crumbs, H1, Lead, PageHero } from "./ui";

const GROUPS: LegalGroup[] = ["use", "data", "billing", "voterList"];
const GROUP_ICONS = { use: I.Scales, data: I.IdentificationBadge, billing: I.CurrencyInr, voterList: I.FileXls };

export function findLegalDoc(slug: string) {
  return legalDocs.find((d) => d.slug === slug);
}

/** The legal hub: every policy, grouped by what it covers */
export function LegalPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.legal;
  return (
    <PageHero className="pt-10 pb-12 md:pt-16">
      <div className="max-w-[760px]">
        <Kicker className="rise text-leaf">{t.footer.legal}</Kicker>
        <H1 className="rise mt-4 [--i:1]">{p.title}</H1>
        <Lead className="rise mt-5 [--i:2]">{p.sub}</Lead>
      </div>
      <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
        {GROUPS.map((g, gi) => {
          const docs = legalDocs.filter((d) => d.group === g);
          const Ico = GROUP_ICONS[g];
          return (
            <section key={g} aria-labelledby={`legal-${g}`} className="rise" style={{ ["--i" as string]: gi + 2 }}>
              <h2 id={`legal-${g}`} className="flex items-center gap-2.5 text-[15px] font-semibold">
                <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-accent-soft text-accent">
                  <Pattern kind="buti" className="absolute inset-0 opacity-[.18] [mask-size:24px_24px]" />
                  <Ico size={17} className="relative" aria-hidden />
                </span>
                {p.groups[g]}
              </h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {docs.map((d) => (
                  <li key={d.slug}>
                    <Link href={href(locale, routes.legalDoc(d.slug))} className="group flex items-center gap-4 py-4">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-semibold transition-colors group-hover:text-accent">{p.docs[d.slug].t}</span>
                        <span className="mt-0.5 block text-[15px] text-muted">{p.docs[d.slug].d}</span>
                      </span>
                      <I.ArrowRight className="shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageHero>
  );
}

/** One policy: the binding English text, with every other policy a click away */
export function LegalDocPage({ locale, doc }: { locale: Locale; doc: LegalDoc }) {
  const t = getDictionary(locale);
  const p = t.pages.legal;
  const c = t.pages.common;
  return (
    <PageHero mandala={false} className="pt-8 pb-20 md:pt-12 md:pb-28">
      <Crumbs label={c.home} items={[{ t: c.home, href: href(locale, routes.home) }, { t: p.all, href: href(locale, routes.legal) }, { t: p.docs[doc.slug].t }]} />
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={p.all} className="order-last lg:order-none lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
          <p className="text-[13px] font-semibold">{p.all}</p>
          <ul className="mt-4 space-y-1 border-l border-line">
            {legalDocs.map((d) => (
              <li key={d.slug}>
                <Link href={href(locale, routes.legalDoc(d.slug))} aria-current={d.slug === doc.slug ? "page" : undefined}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[14px] leading-snug text-muted transition-colors hover:text-ink aria-[current]:border-accent aria-[current]:font-medium aria-[current]:text-ink">
                  {p.docs[d.slug].t}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article>
          <H1 className="text-[clamp(32px,4vw,48px)]!">{p.docs[doc.slug].t}</H1>
          {c.englishOnly && <p className="mt-6 flex max-w-[68ch] items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-[15px]"><I.Info className="shrink-0 text-accent" aria-hidden />{c.englishOnly}</p>}
          <div lang="en" className="mt-10">
            <Prose blocks={doc.blocks} locale={locale} labels={c.prose} className="[&>*:first-child]:mt-0" />
          </div>
          <p className="mt-14 flex max-w-[68ch] items-center gap-3 border-t border-line pt-6 text-[15px] text-muted">
            <I.EnvelopeSimple className="shrink-0 text-accent" aria-hidden />{p.questions}
          </p>
        </article>
      </div>
    </PageHero>
  );
}
