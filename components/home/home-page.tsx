import { getDictionary, type Locale } from "@/content";
import { site } from "@/content/site";
import { HeroChapter, HowChapters, ProblemChapter, ProductsChapter, ServeChapter, SolutionChapter } from "./story/chapters";
import { StoryController } from "./story/story-controller";
import { Cta, Engagements, Faq, Trust } from "./sections";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * The homepage, in the section order of the brief: header, hero and proof strip, who we serve,
 * problems, solutions, products and how we work (the scroll story), then engagements, data and
 * trust, FAQs, the closing CTA and the footer. Server-rendered; the client islands are the header,
 * the proof counters and the story controller (which lazy-loads the 3D chamber).
 */
export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/icon.png`,
    email: site.email,
    telephone: site.phone.label,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressRegion: site.address.region,
      addressCountry: site.address.country
    },
    sameAs: site.social.map((s) => s.href)
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        {t.skip}
      </a>
      <SiteHeader t={t} locale={locale} />
      <main id="main">
        <StoryController chapters={t.chapters} railLabel={t.nav.chapters} labels={t.scene} ariaLabel={t.meta.title} brand={t.brand}>
          <HeroChapter t={t} locale={locale} />
          <ServeChapter t={t} />
          <ProblemChapter t={t} />
          <SolutionChapter t={t} />
          <ProductsChapter t={t} />
          <HowChapters t={t} />
        </StoryController>
        <Engagements t={t} />
        <Trust t={t} />
        <Faq t={t} />
        <Cta t={t} />
      </main>
      <SiteFooter t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
