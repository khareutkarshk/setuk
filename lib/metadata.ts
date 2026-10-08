import type { Metadata, Viewport } from "next";
import { getDictionary, type Locale } from "@/content";
import type { PageMeta } from "@/content/types";
import { site } from "@/content/site";
import { href } from "./paths";
import { THEME_BG } from "./theme";

/**
 * Metadata for a page. `path` is locale-free ("/about"); canonical and hreflang alternates are built
 * from it, so every page links to its own English and Hindi versions. Root layouts call it with the
 * homepage defaults; inner pages pass their own title and description.
 */
export function buildMetadata(locale: Locale, path = "/", page?: PageMeta & { type?: "website" | "article"; image?: string }): Metadata {
  const t = getDictionary(locale);
  const title = page?.title ?? t.meta.title;
  const description = page?.description ?? t.meta.description;
  const url = href(locale, path);
  return {
    metadataBase: new URL(site.url),
    title,
    description,
    applicationName: site.name,
    alternates: {
      canonical: url,
      languages: { "en-IN": href("en", path), "hi-IN": href("hi", path), "x-default": href("en", path) }
    },
    openGraph: {
      type: page?.type ?? "website",
      siteName: site.name,
      title,
      description,
      url,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      ...(page?.image ? { images: [{ url: page.image }] } : {})
    },
    twitter: { card: "summary_large_image", site: "@setukindia", title, description }
  };
}

export const viewport: Viewport = {
  /* Light by default; the theme toggle updates this meta when the user switches */
  themeColor: THEME_BG.light,
  colorScheme: "light"
};
