import type { Locale } from "@/content";

/**
 * Internal links. Pages are written once with a locale-free path ("/about"); Hindi lives under /hi.
 * `href("hi", "/about")` is "/hi/about", `href("hi", "/")` is "/hi".
 */
export function href(locale: Locale, path: string) {
  if (locale === "en") return path;
  return path === "/" ? "/hi" : `/hi${path}`;
}

/** The site's routes, locale-free */
export const routes = {
  home: "/",
  how: "/how-we-work",
  engagements: "/engagements",
  about: "/about",
  articles: "/articles",
  faqs: "/faqs",
  contact: "/contact",
  legal: "/legal",
  article: (slug: string) => `/articles/${slug}`,
  legalDoc: (slug: string) => `/legal/${slug}`
} as const;
