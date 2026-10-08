import { routes } from "@/lib/paths";
import type { Locale, NavKey } from "./types";

/**
 * Site-wide facts that do not change with language. Contact details are from setuk.org/contact.
 * Paths are locale-free; build links with `href(locale, path)` from lib/paths.
 */
export const site = {
  url: "https://setuk.org",
  name: "Setuk",
  legalName: "Setuk Private Limited",
  email: "contact@setuk.org",
  phone: { href: "tel:+917739039777", label: "+91 77390 39777" },
  whatsapp: { href: "https://wa.me/919155609667", label: "+91 91556 09667" },
  /* Still served by the live site until it is migrated */
  voterListHref: "https://setuk.org/voter-list-excel/",
  address: {
    street: "H.No. 413, Nehru Nagar, Patliputra, Phulwari",
    city: "Patna",
    postalCode: "800013",
    region: "Bihar",
    country: "IN"
  },
  social: [
    { key: "x", label: "X", href: "https://twitter.com/setukindia" },
    { key: "facebook", label: "Facebook", href: "https://www.facebook.com/setukindia" },
    { key: "instagram", label: "Instagram", href: "https://www.instagram.com/setukindia" },
    { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@SetukIndia" }
  ],
  nav: [
    { key: "home", path: routes.home },
    { key: "how", path: routes.how },
    { key: "engagements", path: routes.engagements },
    { key: "about", path: routes.about },
    { key: "articles", path: routes.articles },
    { key: "faqs", path: routes.faqs },
    { key: "contact", path: routes.contact }
  ] satisfies { key: NavKey; path: string }[]
} as const;

/**
 * Proof strip figures. [placeholder] These are illustrative; replace them with real totals
 * (and add an "as of" date to the label) before launch.
 */
export const proof: { value: number; suffix: Record<Locale, string> }[] = [
  { value: 48000, suffix: { en: "+", hi: "+" } },
  { value: 21000, suffix: { en: "+", hi: "+" } },
  { value: 1.2, suffix: { en: " lakh+", hi: " लाख+" } },
  { value: 9500, suffix: { en: "+", hi: "+" } }
];
