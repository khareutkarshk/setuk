import { getDictionary, type Locale } from "@/content";
import type { ProductKey } from "@/content/types";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";
import { href, routes } from "@/lib/paths";
import { PageShell } from "../page-shell";
import { ProductPage } from "./product-page";

/** Metadata for a product page, in either language */
export function productMetadata(locale: Locale, product: ProductKey) {
  return buildMetadata(locale, routes.products[product], getDictionary(locale).pages.products[product].meta);
}

/**
 * A product page in its shell: the page's own closing call to action, and the product and its
 * questions as structured data. The app routes only name the product and the locale.
 */
export function ProductRoute({ locale, product }: { locale: Locale; product: ProductKey }) {
  const p = getDictionary(locale).pages.products[product];
  const inLanguage = locale === "hi" ? "hi-IN" : "en-IN";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: p.name,
        description: p.meta.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: site.url + href(locale, routes.products[product]),
        inLanguage,
        featureList: p.modules.items.filter((m) => !m.soon).map((m) => m.t),
        provider: { "@type": "Organization", name: site.legalName, url: site.url }
      },
      {
        "@type": "FAQPage",
        inLanguage,
        mainEntity: p.faq.items.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } }))
      }
    ]
  };
  return (
    <PageShell locale={locale} path={routes.products[product]} cta={{ ...p.cta, primary: p.primary }} jsonLd={jsonLd}>
      <ProductPage product={product} locale={locale} />
    </PageShell>
  );
}
