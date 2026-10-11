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
  voterList: "/voter-list-excel",
  article: (slug: string) => `/articles/${slug}`,
  legalDoc: (slug: string) => `/legal/${slug}`,
  /** ["bihar", "patna"] → "/voter-list-excel/bihar/patna" */
  voterListArea: (slugs: string[]) => ["/voter-list-excel", ...slugs].join("/")
} as const;
