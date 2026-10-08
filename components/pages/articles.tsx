import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content";
import { articles } from "@/content/articles";
import { media } from "@/content/media";
import { site } from "@/content/site";
import type { Article, TopicKey } from "@/content/types";
import * as I from "@/components/icons";
import { href, routes } from "@/lib/paths";
import { ArticleFilter } from "./article-filter";
import { ArticleToc } from "./article-toc";
import { headingIds, Prose } from "./prose";
import { Crumbs, H1, Lead, PrimaryLink, Wrap } from "./ui";

const minRead = (tpl: string, n: number) => tpl.replace("{n}", String(n));

/** Some descriptions are the article's own first lines; then the lead would say it twice */
const repeatsOpening = (a: Article) => {
  const first = a.blocks.find((b) => b.t === "p");
  return !!first && "x" in first && first.x.slice(0, 40) === a.description.slice(0, 40);
};

export function findArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

/** Articles: one featured guide, then the rest as an editorial list, filterable by topic */
export function ArticlesPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = t.pages.articles;
  const [featured, ...rest] = articles;
  const topics = (Object.keys(p.topics) as TopicKey[])
    .map((key) => ({ key, t: p.topics[key], n: articles.filter((a) => a.topic === key).length }))
    .filter((x) => x.n > 0);

  return (
    <Wrap className="pt-10 pb-12 md:pt-16">
      <div className="max-w-[760px]">
        <H1 className="rise">{p.title}</H1>
        <Lead className="rise mt-5 [--i:1]">{p.sub}</Lead>
      </div>

      <div className="rise mt-10 [--i:2]">
        <ArticleFilter topics={topics} all={p.all} label={p.filterLabel} empty={p.empty}>
          {/* the most complete guide leads */}
          <Link href={href(locale, routes.article(featured.slug))} data-topic={featured.topic}
            className="group mt-8 grid overflow-hidden rounded-3xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_30px_80px_-50px_color-mix(in_srgb,var(--accent)_60%,transparent)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="illo relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[400px]">
              <Image src={media[featured.cover]} alt="" fill priority sizes="(min-width: 1024px) 720px, 100vw" placeholder="blur" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
            </div>
            <div className="flex flex-col p-7 md:p-10">
              <Meta a={featured} topic={p.topics[featured.topic]} tpl={t.pages.common.minRead} />
              <h2 lang="en" className="font-display-tight mt-4 text-balance text-[clamp(26px,2.6vw,36px)] leading-[1.12] group-hover:text-accent">{featured.title}</h2>
              <p lang="en" className="mt-4 line-clamp-4 text-[16px] leading-relaxed text-muted">{featured.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 font-semibold text-accent">
                {t.pages.common.read}
                <I.ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
          </Link>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {rest.map((a) => (
              <li key={a.slug} data-topic={a.topic}>
                <Row a={a} locale={locale} topic={p.topics[a.topic]} tpl={t.pages.common.minRead} />
              </li>
            ))}
          </ul>
        </ArticleFilter>
      </div>
    </Wrap>
  );
}

function Meta({ a, topic, tpl }: { a: Article; topic: string; tpl: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
      <span className="font-semibold text-accent">{topic}</span>
      <span className="inline-flex items-center gap-1.5"><I.Clock aria-hidden />{minRead(tpl, a.minutes)}</span>
    </p>
  );
}

function Row({ a, locale, topic, tpl }: { a: Article; locale: Locale; topic: string; tpl: string }) {
  return (
    <Link href={href(locale, routes.article(a.slug))} className="group grid items-center gap-5 py-7 sm:grid-cols-[minmax(0,1fr)_200px] sm:gap-10 md:grid-cols-[minmax(0,1fr)_240px]">
      <div>
        <Meta a={a} topic={topic} tpl={tpl} />
        <h3 lang="en" className="mt-3 text-balance text-[clamp(19px,1.8vw,23px)] font-semibold leading-snug transition-colors group-hover:text-accent">{a.title}</h3>
        <p lang="en" className="mt-2 line-clamp-2 max-w-[70ch] text-[15px] leading-relaxed text-muted">{a.description}</p>
      </div>
      <div className="illo relative order-first aspect-[16/10] overflow-hidden rounded-xl border border-line sm:order-none">
        <Image src={media[a.cover]} alt="" fill sizes="(min-width: 640px) 240px, 100vw" placeholder="blur" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </div>
    </Link>
  );
}

/** One article: crumbs, title, cover, a sticky contents list beside the text, then a demo prompt and related reading */
export function ArticlePage({ locale, article: a }: { locale: Locale; article: Article }) {
  const t = getDictionary(locale);
  const c = t.pages.common;
  const p = t.pages.articles;
  const toc = headingIds(a.blocks);
  const related = [...articles.filter((x) => x.slug !== a.slug && x.topic === a.topic), ...articles.filter((x) => x.slug !== a.slug && x.topic !== a.topic)].slice(0, 3);

  return (
    <>
      <Wrap className="pt-8 md:pt-12">
        <Crumbs label={c.home} items={[{ t: c.home, href: href(locale, routes.home) }, { t: t.nav.labels.articles, href: href(locale, routes.articles) }, { t: a.title }]} />
        <div className="mt-8 max-w-[880px]">
          <Meta a={a} topic={p.topics[a.topic]} tpl={c.minRead} />
          <div lang="en">
            <H1 className="mt-4 text-[clamp(32px,4.2vw,52px)]!">{a.title}</H1>
            {!repeatsOpening(a) && <Lead className="mt-5">{a.description}</Lead>}
          </div>
        </div>
        <div className="illo relative mt-10 aspect-[2/1] overflow-hidden rounded-3xl border border-line md:aspect-[21/9]">
          <Image src={media[a.cover]} alt="" fill priority sizes="(min-width: 1280px) 1216px, 100vw" placeholder="blur" className="object-cover" />
        </div>
      </Wrap>

      <Wrap className="grid grid-cols-[minmax(0,1fr)] gap-10 pt-12 pb-16 md:pt-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:max-h-[calc(100dvh-var(--header-h)-64px)] lg:self-start lg:overflow-y-auto">
          {/* on small screens the contents fold away above the text */}
          <details className="group rounded-xl border border-line bg-surface p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
              {c.onThisPage}<I.CaretRight className="transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <ol className="mt-3 space-y-2 text-[14px] text-muted" lang="en">
              {toc.map((i) => <li key={i.id}><a href={`#${i.id}`} className="hover:text-ink">{i.text}</a></li>)}
            </ol>
          </details>
          <div className="hidden lg:block" lang="en"><ArticleToc items={toc} label={c.onThisPage} /></div>
        </aside>
        <div>
          {c.englishOnly && <p className="mb-8 flex max-w-[68ch] items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-[15px]"><I.Info className="shrink-0 text-accent" aria-hidden />{c.englishOnly}</p>}
          <div lang="en"><Prose blocks={a.blocks} className="[&>*:first-child]:mt-0" /></div>
          <div className="mt-16 max-w-[68ch] rounded-3xl border border-line bg-surface p-7 md:p-9">
            <p className="font-display-tight text-[clamp(22px,2.2vw,28px)] leading-tight">{c.demoTitle}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.demoBody}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <PrimaryLink href={href(locale, routes.contact)}>{t.nav.demo}</PrimaryLink>
              <a href={site.whatsapp.href} className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-accent"><I.WhatsappLogo size={18} className="text-leaf" aria-hidden />{t.cta.secondary}</a>
            </div>
          </div>
        </div>
      </Wrap>

      <section aria-labelledby="related-title" className="border-t border-line bg-surface">
        <Wrap className="py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="related-title" className="font-display-tight text-[clamp(24px,2.6vw,32px)]">{c.related}</h2>
            <Link href={href(locale, routes.articles)} className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent hover:underline">{c.allArticles}<I.ArrowRight aria-hidden /></Link>
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {related.map((r) => <li key={r.slug}><Row a={r} locale={locale} topic={p.topics[r.topic]} tpl={c.minRead} /></li>)}
          </ul>
        </Wrap>
      </section>
    </>
  );
}
