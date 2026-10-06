import type { Metadata, Viewport } from "next";
import { getDictionary, type Locale } from "@/content";
import { localePath, site } from "@/content/site";
import { THEME_BG } from "./theme";

export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: site.name,
    alternates: {
      canonical: localePath[locale],
      languages: { "en-IN": localePath.en, "hi-IN": localePath.hi, "x-default": localePath.en }
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      url: localePath[locale],
      locale: locale === "hi" ? "hi_IN" : "en_IN"
    },
    twitter: { card: "summary_large_image", site: "@setukindia", title: t.meta.title, description: t.meta.description }
  };
}

export const viewport: Viewport = {
  /* Light by default; the theme toggle updates this meta when the user switches */
  themeColor: THEME_BG.light,
  colorScheme: "light"
};
