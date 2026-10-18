import type { Locale } from "@/content";
import { getDictionary } from "@/content";
import { PageShell } from "@/components/pages/page-shell";
import { H1, Lead, PageHero, PrimaryLink, TextLink } from "@/components/pages/ui";
import { href, routes } from "@/lib/paths";

/**
 * The 404 page in the site's frame (header, footer, language links), so a missing address still has
 * its way back. Used by the not-found.tsx of the segments that call notFound() and, in English, by app/global-not-found.tsx.
 */
export function NotFoundPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const c = t.notFound;
  return (
    <PageShell locale={locale} path={routes.home} cta={false}>
      <PageHero className="pt-16 pb-24 md:pt-24 md:pb-32">
        <p className="font-mono text-[13px] text-muted">404</p>
        <H1 className="mt-4">{c.title}</H1>
        <Lead className="mt-5">{c.body}</Lead>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <PrimaryLink href={href(locale, routes.home)}>{c.home}</PrimaryLink>
          <TextLink href={href(locale, routes.contact)}>{c.contact}</TextLink>
        </div>
      </PageHero>
    </PageShell>
  );
}
