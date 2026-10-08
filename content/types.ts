import type { MediaKey } from "./media";

/**
 * Content model for the site. Every locale implements `Dictionary`, so a missing
 * or misspelt key in a translation is a type error, not a blank on the page.
 * Source of truth for wording and its status (site / brief / draft / placeholder):
 * ../SETUK-CONTENT.md in the prototype folder.
 */

export type Locale = "en" | "hi";

export type NavKey = "home" | "how" | "engagements" | "about" | "articles" | "faqs" | "contact";
export type TopicKey = "office" | "constituency" | "party" | "appointments" | "governance";
export type LegalGroup = "use" | "data" | "billing" | "voterList";
export type LegalSlug = "terms" | "privacy" | "consent" | "declaration-accuracy" | "disclaimer" | "data-retention" | "dpa" | "refund" | "voter-list-excel-disclaimer";

export interface TitledItem {
  t: string;
  d: string;
}

export interface Module {
  t: string;
  /** Not shipped yet; rendered as a dashed "Coming" chip */
  soon?: boolean;
}

export interface Product {
  t: string;
  d: string;
  mods: Module[];
}

export interface Step {
  t: string;
  time: string;
  d: string;
  get: string;
}

export interface Package {
  t: string;
  for: string;
  inc: string[];
}

export interface Link {
  t: string;
  href: string;
}

export interface QA {
  q: string;
  a: string;
}

/** Long-form text (articles and legal documents), kept as structured blocks */
export type ArticleBlock =
  | { t: "h2" | "h3" | "p" | "quote"; x: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "table"; rows: string[][] }
  | { t: "img"; img: MediaKey; alt: string };

/** An article. English only for now; /hi shows it with Hindi navigation and a note */
export interface Article {
  slug: string;
  topic: TopicKey;
  cover: MediaKey;
  title: string;
  description: string;
  minutes: number;
  blocks: ArticleBlock[];
}

export interface LegalDoc {
  slug: LegalSlug;
  group: LegalGroup;
  title: string;
  description: string;
  blocks: ArticleBlock[];
}

export interface PageMeta {
  title: string;
  description: string;
}

/** Copy for the inner pages (everything except the homepage story) */
export interface Pages {
  common: {
    home: string;
    /** "{n}" is replaced with the number of minutes */
    minRead: string;
    onThisPage: string;
    /** Shown on /hi above English-only text */
    englishOnly: string;
    related: string;
    read: string;
    allArticles: string;
    demoTitle: string;
    demoBody: string;
  };
  how: {
    meta: PageMeta;
    title: string;
    sub: string;
    primary: string;
    secondary: string;
    heroAlt: string;
    process: {
      title: string;
      sub: string;
      doLabel: string;
      needLabel: string;
      /** Pairs with how.steps by index */
      steps: { does: string[]; needs: string }[];
    };
    modules: { title: string; sub: string; items: { t: string; h: string; d: string; img: MediaKey; alt: string }[] };
    screen: { title: string; body: string; alt: string };
    citizens: { title: string; body: string; points: string[]; alt: string };
    roadmap: { title: string; sub: string; nowLabel: string; nextLabel: string; now: TitledItem[]; next: TitledItem[] };
  };
  engagements: {
    meta: PageMeta;
    title: string;
    sub: string;
    /** Illustration per package, in package order */
    art: { img: MediaKey; alt: string }[];
    compare: { title: string; feature: string; included: string; notIncluded: string; rows: { t: string; from: number }[] };
    pricing: { title: string; body: string; items: TitledItem[] };
    faqTitle: string;
    faqs: QA[];
    allFaqs: string;
  };
  about: {
    meta: PageMeta;
    title: string;
    sub: string;
    heroAlt: string;
    origin: { title: string; paras: string[] };
    moment: { quote: string; by: string; paras: string[]; alt: string };
    beliefs: { title: string; items: string[] };
    name: { title: string; paras: string[]; alt: string };
    letter: { title: string; paras: string[]; by: string };
    company: { t: string; d: string }[];
  };
  articles: {
    meta: PageMeta;
    title: string;
    sub: string;
    all: string;
    topics: Record<TopicKey, string>;
    filterLabel: string;
    empty: string;
    count: string;
  };
  contact: {
    meta: PageMeta;
    title: string;
    sub: string;
    channels: { email: string; phone: string; whatsapp: string; office: string; emailNote: string; phoneNote: string; whatsappNote: string };
    form: {
      title: string;
      name: string;
      email: string;
      org: string;
      optional: string;
      topic: string;
      topics: string[];
      message: string;
      messageHint: string;
      consent: string;
      privacy: string;
      submit: string;
      submitNote: string;
      errors: { name: string; email: string; message: string; consent: string };
      sentTitle: string;
      sentBody: string;
      again: string;
    };
    expect: { title: string; items: string[] };
    alt: string;
  };
  legal: {
    meta: PageMeta;
    title: string;
    sub: string;
    groups: Record<LegalGroup, string>;
    docs: Record<LegalSlug, TitledItem>;
    all: string;
    questions: string;
  };
  faqs: {
    meta: PageMeta;
    title: string;
    sub: string;
    search: string;
    clear: string;
    /** "{n}" is replaced with the number of matches */
    results: string;
    noResults: string;
    groups: { t: string; items: QA[] }[];
    still: string;
    stillBody: string;
  };
}

/** Strings drawn onto the 3D scene's screens (canvas textures) */
export interface SceneLabels {
  loading: string;
  sample: string;
  dashboard: {
    title: string;
    booths: string;
    letters: string;
    appts: string;
    byType: string;
    types: string[];
  };
  chaos: {
    title: string;
    sub: string;
    pending: string;
    owner: string;
    unknown: string;
    rows: string[];
    status: string[];
  };
  report: {
    title: string;
    handled: string;
    pending: string;
    week: string;
    quarter: string;
    quarters: string[];
  };
  desk: {
    office: string;
    election: string;
    appts: string;
    letters: string;
    pnr: string;
    next: string;
    booths: string;
    agents: string;
    workers: string;
    booth: string;
    assigned: string;
    pendingR: string;
    queue: string[];
  };
  /** Who we serve: labels over the three seat bands, front to back */
  bands: string[];
  /** The problem: floating badges over the cluttered table, in the card's order, each with how it fails */
  fail: { t: string; why: string }[];
  /** The solution: the single badge the four merge into */
  fixed: { t: string; why: string };
  /** The office laptop: a frozen spreadsheet */
  excel: { file: string; frozen: string; locked: string; cols: string[]; names: string[]; ref: string };
  /** The office phones: a flooded group chat, and missed calls */
  wa: { group: string; members: string; unread: string; msgs: string[]; missed: string; calls: string };
  /** The office laptop and phone once Setuk is in: one inbox with owners, and a citizen update */
  inbox: { title: string; from: string[]; owners: string[]; status: string[]; logged: string; sms: string };
  /** How we work, step 2: the consultant's laptop during setup */
  setup: { title: string; roles: string; roleNames: string[]; access: string; perms: string[]; importing: string; sops: string; sopNames: string[] };
  /** Step 3: a role-by-role training call */
  meet: { title: string; live: string; trainer: string; roles: string[]; topic: string; steps: string[] };
  /** Step 4: the month's numbers */
  run: { title: string; tiles: string[]; trend: string; vs: string };
}

export interface Dictionary {
  meta: { title: string; description: string };
  brand: { name: string; line: string };
  skip: string;
  chapters: string[];
  nav: { labels: Record<NavKey, string>; demo: string; menu: string; close: string; language: string; chapters: string; toDark: string; toLight: string };
  hero: { eyebrow: string; titleA: string; titleB: string; sub: string; primary: string; secondary: string };
  proof: { label: string; note: string; items: string[] };
  serve: {
    eyebrow: string;
    title: string;
    body: string;
    reps: string;
    pols: string;
    tiers: { t: string; d: string; n: string }[];
  };
  problem: { eyebrow: string; title: string; body: string; items: TitledItem[] };
  solution: { eyebrow: string; title: string; body: string; items: TitledItem[] };
  products: { eyebrow: string; title: string; soon: string; items: Product[] };
  how: { eyebrow: string; title: string; get: string; steps: Step[] };
  engage: {
    eyebrow: string;
    title: string;
    body: string;
    forLabel: string;
    pick: string;
    cta: string;
    price: string;
    trial: string;
    draft: string;
    pkgs: Package[];
  };
  trust: { eyebrow: string; title: string; body: string; items: TitledItem[]; legal: string; dpa: string };
  faq: { eyebrow: string; title: string; more: string; items: QA[] };
  cta: { title: string; body: string; primary: string; secondary: string };
  footer: {
    company: string;
    guides: string;
    legal: string;
    address: string;
    rights: string;
    model: string;
    /** Attribution for third-party 3D models (CC BY 4.0) */
    credits: Link[];
    voterList: string;
    /** Short labels for the articles, by slug */
    guideItems: { t: string; slug: string }[];
    legalItems: { t: string; slug: LegalSlug }[];
  };
  pages: Pages;
  scene: SceneLabels;
}
