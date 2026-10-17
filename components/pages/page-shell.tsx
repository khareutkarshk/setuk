import { ViewTransition, type ReactNode } from "react";
import { getDictionary, type Locale } from "@/content";
import { Cta } from "@/components/home/sections";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { productMenu } from "@/components/pages/products/look";
import { roleMenu } from "@/components/pages/roles/look";

/**
 * The frame every inner page shares: skip link, header, the page, the closing call to action and
 * the footer. `path` is the page's locale-free path, for the header's active link and language links.
 * `cta={false}` leaves the closing band out (the contact page is already the call to action); an object
 * puts the page's own words in it (the role pages).
 * The page and its footer are one view transition, keyed by path, so moving between pages fades the
 * new one in (vt-page in globals.css) while the header, named on its own, stays put.
 */
export function PageShell({ locale, path, cta = true, jsonLd, children }: { locale: Locale; path: string; cta?: boolean | { title: string; body: string; primary?: string }; jsonLd?: object; children: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        {t.skip}
      </a>
      <SiteHeader t={{ nav: t.nav, brand: t.brand }} roles={roleMenu(t)} products={productMenu(t)} locale={locale} path={path} />
      <ViewTransition key={path} enter="vt-page-in" exit="vt-page-out" default="none">
        <main id="main" className="pt-(--header-h)">
          {children}
          {cta && <div className="pt-8 md:pt-12"><Cta t={t} locale={locale} own={typeof cta === "object" ? cta : undefined} /></div>}
        </main>
        <SiteFooter t={t} locale={locale} />
      </ViewTransition>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    </>
  );
}
