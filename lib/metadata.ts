import type { Metadata, Viewport } from "next";
import { getDictionary, type Locale } from "@/content";
import { localePath, site } from "@/content/site";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f18" }
  ],
  colorScheme: "light dark"
};
