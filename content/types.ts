import type { MediaKey } from "./media";

/**
 * Content model for the site. Every locale implements `Dictionary`, so a missing
 * or misspelt key in a translation is a type error, not a blank on the page.
 * Source of truth for wording and its status (site / brief / draft / placeholder):
 * ../SETUK-CONTENT.md in the prototype folder.
 */

export type Locale = "en" | "hi";

export type NavKey = "home" | "how" | "engagements" | "about" | "articles" | "faqs" | "contact";
/** The role pages under "By role" in the header: /for-mps, /for-mlas, /for-mayors, /for-consultants */
export type RoleKey = "mps" | "mlas" | "mayors" | "consultants";
export type TopicKey = "office" | "constituency" | "party" | "appointments" | "governance";
export type LegalGroup = "use" | "data" | "billing" | "voterList";
export type LegalSlug = "terms" | "privacy" | "consent" | "declaration-accuracy" | "disclaimer" | "data-retention" | "dpa" | "refund" | "voter-list-excel-disclaimer";

export interface TitledItem {
  t: string;
  d: string;
}

/** A card on How we work: name, headline, line, and its illustration */
export interface ModuleItem extends TitledItem {
  h: string;
  img: MediaKey;
  alt: string;
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
export type CalloutKind = "note" | "tip" | "warning";

/** Text in blocks may carry inline [links](/path or https://…), **bold** and [^id] citations */
export type ArticleBlock =
  | { t: "h2" | "h3" | "p"; x: string }
  | { t: "quote"; x: string; by?: string }
  | { t: "callout"; kind: CalloutKind; title?: string; x: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "steps"; items: { title: string; x: string }[] }
  | { t: "table"; rows: string[][] }
  | { t: "img"; img: MediaKey; alt: string }
  | { t: "video"; youtube: string; title: string }
  | { t: "refs"; items: { id: string; x: string }[] };

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
    /** Labels inside article text: callouts without their own title, the video frame, citations */
    /** Reader tools under an article: sharing, the helpful prompt and the newsletter sign-up */
    engage: {
      share: string;
      /** "{name}" is replaced with the network, e.g. "Share on WhatsApp" */
      shareOn: string;
      email: string;
      copy: string;
      copied: string;
      more: string;
      helpful: string;
      yes: string;
      no: string;
      thanksYes: string;
      thanksNo: string;
      tellUs: string;
      newsletter: { kicker: string; title: string; body: string; label: string; placeholder: string; submit: string; note: string; error: string; sentTitle: string; sentBody: string; again: string };
    };
    prose: { note: string; tip: string; warning: string; video: string; cite: string; back: string; external: string };
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
      kicker: string;
      title: string;
      sub: string;
      doLabel: string;
      needLabel: string;
      /** Pairs with how.steps by index */
      steps: { does: string[]; needs: string }[];
    };
    /** Grouped as the office, the election, and what's in progress (`soon`, badged with soonLabel) */
    modules: { kicker: string; title: string; sub: string; soonLabel: string; groups: { t: string; d: string; soon?: boolean; items: ModuleItem[] }[] };
    screen: { kicker: string; title: string; body: string; alt: string };
    citizens: { kicker: string; title: string; body: string; points: string[]; alt: string };
    roadmap: { kicker: string; title: string; sub: string; nextLabel: string; next: TitledItem[] };
  };
  engagements: {
    meta: PageMeta;
    title: string;
    sub: string;
    /** Illustration per package, in package order */
    art: { img: MediaKey; alt: string }[];
    compare: { kicker: string; title: string; feature: string; included: string; notIncluded: string; rows: { t: string; from: number }[] };
    pricing: { kicker: string; title: string; body: string; items: TitledItem[] };
    faqTitle: string;
    faqKicker: string;
    faqs: QA[];
    allFaqs: string;
  };
  about: {
    meta: PageMeta;
    title: string;
    sub: string;
    heroAlt: string;
    origin: { kicker: string; title: string; paras: string[] };
    moment: { quote: string; by: string; paras: string[]; alt: string };
    beliefs: { kicker: string; title: string; items: string[] };
    name: { kicker: string; title: string; paras: string[]; alt: string };
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
    expect: { kicker: string; title: string; items: string[] };
    /** Questions about getting in touch; the full list is on the FAQs page */
    faq: { kicker: string; title: string; lead: string; items: QA[]; all: string };
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
  /**
   * The voter list in Excel pages. Areas and their write-ups come from lib/voter-list (English); these
   * are the labels around them. Placeholders in braces are filled per area: {name}, {state},
   * {district}, {no}, {roll}, {booths}, {acs}, {states}, {n}, {price}, {rate}.
   */
  voterList: {
    meta: PageMeta;
    /** Title and description for an area's page, by level */
    metaArea: Record<VoterListLevel, PageMeta>;
    kicker: string;
    title: string;
    sub: string;
    titleArea: Record<VoterListLevel, string>;
    subArea: Record<VoterListLevel, string>;
    enquire: string;
    howLink: string;
    crumbs: string;
    root: string;
    finder: { title: string; state: string; district: string; ac: string; allStates: string; allDistricts: string; allAcs: string; pickState: string; pickDistrict: string; reset: string };
    stats: { states: string; districts: string; acs: string; pcs: string; booths: string; files: string };
    /** Card eyebrows */
    levels: Record<VoterListLevel, string>;
    /** Badge on the chosen constituency's card */
    selected: string;
    preview: { title: string; summary: string; part: string; more: string; note: string };
    cards: {
      heading: Record<"all" | VoterListLevel, string>;
      count: Record<"all" | VoterListLevel, string>;
      roll: string;
      order: string;
      orderNote: string;
      explore: { state: string; district: string };
      perBooth: string;
      total: string;
      pc: string;
      empty: { title: string; body: string; cta: string };
    };
    detail: {
      kicker: string;
      glance: string;
      includes: string;
      sample: string;
      related: string;
      faq: string;
      faqTitle: string;
      disclaimer: string;
    };
    order: { kicker: string; title: string; body: string; steps: TitledItem[]; cta: string };
  };
  roles: Roles;
}

export type VoterListLevel = "state" | "district" | "ac";

/**
 * The role pages. Each opens with its own line figure (public/hairline/v1) and carries one section
 * no other role has; the rest share shapes so the four read as one family.
 */
export interface RoleHead {
  meta: PageMeta;
  /** The header's "By role" menu: the page's name and one line under it */
  menu: TitledItem;
  kicker: string;
  title: string;
  sub: string;
  primary: string;
  secondary: string;
  /** Set large and faint in Devanagari behind the figure */
  word: string;
  /**
   * The hero figure: what it shows (its accessible name), the hint shown until the pointer arrives,
   * and the read-out's nouns, by the word the figure writes ("seat 3·12" → read.seat + " 3·12")
   */
  figure: { label: string; hint: string; read: Record<string, string> };
  faq: { title: string; items: QA[] };
  cta: { title: string; body: string };
}

/** One of Setuk's modules put in a role's words. `img` when it has an illustration; `soon` while it's being built */
export interface RoleModule {
  t: string;
  d: string;
  img?: MediaKey;
  alt?: string;
  soon?: boolean;
}

/** The shared body of an office's page (MPs, MLAs, Mayors) */
export interface OfficeRole extends RoleHead {
  challenges: { title: string; items: TitledItem[] };
  modules: { title: string; sub: string; items: RoleModule[] };
  /** Four steps with one real case running through them (`eg`) */
  flow: { title: string; sub: string; steps: { t: string; d: string; eg: string }[] };
  oversight: { kicker: string; title: string; body: string; items: string[]; alt: string };
  team: { title: string; sub: string; rows: TitledItem[] };
}

/** MPs: the offices an MP runs at once, around one record */
export interface MpRole extends OfficeRole {
  offices: { kicker: string; title: string; body: string; centre: TitledItem; items: TitledItem[] };
}

/** MLAs: from the constituency office down to the booth and the karyakarta */
export interface MlaRole extends OfficeRole {
  ground: { kicker: string; title: string; body: string; levels: TitledItem[] };
}

/** Mayors: civic issues by ward and kind, and where the Mayor's office ends */
export interface MayorRole extends OfficeRole {
  wards: { kicker: string; title: string; body: string; categories: string[]; note: string };
}

/** Political consultants: a partnership page, not an office's */
export interface ConsultantRole extends RoleHead {
  tribute: { kicker: string; title: string; paras: string[]; alt: string };
  challenges: { title: string; items: TitledItem[] };
  /** Your practice, Setuk's platform, your clients' offices */
  model: { title: string; sub: string; parts: TitledItem[] };
  offer: { title: string; sub: string; items: RoleModule[] };
  /** The ways to partner. Terms are agreed per partner; `note` says so */
  paths: { kicker: string; title: string; sub: string; items: TitledItem[]; note: string };
  steps: { title: string; items: TitledItem[] };
  data: { title: string; body: string; items: TitledItem[] };
  who: { title: string; items: TitledItem[] };
}

export interface Roles {
  /** Shared by the office pages: setup (with the homepage's four steps) and data */
  common: {
    eg: string;
    soon: string;
    setup: { title: string; sub: string; link: string };
    trust: { title: string; items: TitledItem[]; link: string };
    allFaqs: string;
  };
  mps: MpRole;
  mlas: MlaRole;
  mayors: MayorRole;
  consultants: ConsultantRole;
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
  nav: { labels: Record<NavKey, string>; byRole: string; demo: string; menu: string; close: string; language: string; chapters: string; toDark: string; toLight: string };
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
    voterList: string;
    /** Short labels for the articles, by slug */
    guideItems: { t: string; slug: string }[];
    legalItems: { t: string; slug: LegalSlug }[];
  };
  pages: Pages;
  scene: SceneLabels;
}
