import type { ReactNode } from "react";
import { getDictionary, type Locale } from "@/content";
import { Cta } from "@/components/home/sections";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";

/**
 * The frame every inner page shares: skip link, header, the page, the closing call to action and
 * the footer. `path` is the page's locale-free path, for the header's active link and language links.
 * `cta={false}` leaves the closing band out (the contact page is already the call to action).
 */
export function PageShell({ locale, path, cta = true, jsonLd, children }: { locale: Locale; path: string; cta?: boolean; jsonLd?: object; children: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        {t.skip}
      </a>
      <SiteHeader t={t} locale={locale} path={path} />
      <main id="main" className="pt-(--header-h)">
        {children}
        {cta && <div className="pt-8 md:pt-12"><Cta t={t} locale={locale} /></div>}
      </main>
      <SiteFooter t={t} locale={locale} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    </>
  );
}
