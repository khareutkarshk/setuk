import type { Locale, NavKey } from "./types";

/**
 * Site-wide facts that do not change with language. Contact details are from setuk.org/contact.
 * Menu links point at the live setuk.org pages until each page is migrated to this app;
 * when one is, change its href to the internal path (e.g. "/about").
 */
export const site = {
  url: "https://setuk.org",
  name: "Setuk",
  legalName: "Setuk Private Limited",
  email: "contact@setuk.org",
  phone: { href: "tel:+917739039777", label: "+91 77390 39777" },
  whatsapp: { href: "https://wa.me/919155609667", label: "+91 91556 09667" },
  demoHref: "https://setuk.org/contact",
  legalHref: "https://setuk.org/legal",
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
    { key: "home", href: "https://setuk.org/" },
    { key: "about", href: "https://setuk.org/about" },
    { key: "features", href: "https://setuk.org/features" },
    { key: "roadmap", href: "https://setuk.org/roadmap" },
    { key: "contact", href: "https://setuk.org/contact" },
    { key: "legal", href: "https://setuk.org/legal" },
    { key: "voterList", href: "https://setuk.org/voter-list-excel/" }
  ] satisfies { key: NavKey; href: string }[]
} as const;

export const localePath: Record<Locale, string> = { en: "/", hi: "/hi" };

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
