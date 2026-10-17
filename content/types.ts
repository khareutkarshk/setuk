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
      /** The first three weeks as a calendar, lit step by step as the reader goes; `week` has {n} */
      calendar: { title: string; days: string[]; week: string; ongoing: string };
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
    /** `compare`: the before/after slider on the picture; `valuetext` has {n}, the share shown with Setuk */
    moment: { quote: string; by: string; paras: string[]; alt: string; compare: { label: string; before: string; after: string; valuetext: string } };
    beliefs: { kicker: string; title: string; items: string[] };
    name: { kicker: string; title: string; paras: string[]; alt: string };
    /** `photoAlt` names the founder's portrait; `placeholder` stands in its frame until it arrives, saying what to shoot */
    letter: { title: string; paras: string[]; by: string; photoAlt: string; placeholder: { title: string; note: string; specs: { t: string; d: string }[] } };
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
    /** Card eyebrows, and the hero kicker of each page */
    levels: Record<VoterListLevel, string>;
    /** The tabs over a state's cards, each to one of its lists */
    tabs: { label: string; districts: string; acs: string; pcs: string };
    /** Badge on the chosen constituency's card */
    selected: string;
    preview: { title: string; summary: string; part: string; more: string; note: string };
    /**
     * The map of India on the landing page (voter-list-map.tsx). In `label`, {name}, {districts},
     * {acs} and {booths} are filled for each state; in `open`, {name}
     */
    map: { kicker: string; title: string; sub: string; hint: string; touchHint: string; all: string; districts: string; acs: string; booths: string; open: string; label: string; skip: string; scale: string; note: string };
    cards: {
      heading: Record<"all" | VoterListLevel, string>;
      count: Record<"all" | VoterListLevel, string>;
      roll: string;
      order: string;
      explore: { state: string; district: string; pc: string };
      /** A Lok Sabha card's list of its assembly segments */
      segments: string;
      perBooth: string;
      pc: string;
      /** The order dialog a card's button opens: the price lives here, not on the card */
      dialog: { title: string; from: string; price: string; buy: string; buyNote: string; or: string; chat: string; close: string };
      empty: { title: string; body: string; cta: string };
    };
    /** The index at the foot of every page: a state's districts, assembly and Lok Sabha constituencies */
    index: { kicker: string; title: string; titleState: string; districts: string; acs: string; pcs: string; open: string };
    detail: {
      /** Over a state's own article */
      article: string;
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
  products: Products;
}

/** Every voter list page but the landing one: an area (state, district, assembly or Lok Sabha constituency) or one of a state's three lists */
export type VoterListLevel = "state" | "district" | "ac" | "pc" | "districts" | "acs" | "pcs";

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
   * The hero figure: what it shows (its accessible name) and the read-out's nouns,
   *, by the word the figure writes ("seat 3·12" → read.seat + " 3·12")
   */
  figure: { label: string; read: Record<string, string> };
  /** The case the hero's card plays beside the figure: the office pages' Flow example in four short steps */
  case: RoleCase;
  faq: { title: string; items: QA[] };
  cta: { title: string; body: string };
}

/**
 * The hero's case card: a label over its title, then four steps that light up as the figure's tour
 * reaches them (the last when it comes to rest), and `done` on the card once the case has closed
 */
export interface RoleCase {
  label: string;
  title: string;
  done: string;
  steps: [TitledItem, TitledItem, TitledItem, TitledItem];
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
/** What gets in the way: a headline, the line beside it, and four problems (their icons are in roles/look.ts) */
export type RoleChallenges = { title: string; sub: string; items: TitledItem[] };

export interface OfficeRole extends RoleHead {
  challenges: RoleChallenges;
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
  challenges: RoleChallenges;
  /** Your practice, Setuk's platform, your clients' offices */
  model: { title: string; sub: string; parts: TitledItem[] };
  offer: { title: string; sub: string; items: RoleModule[] };
  /** The ways to partner. Terms are agreed per partner; `note` says so */
  paths: { kicker: string; title: string; sub: string; items: TitledItem[]; note: string };
  steps: { title: string; items: TitledItem[] };
  data: { title: string; body: string; items: TitledItem[] };
  who: { title: string; items: TitledItem[] };
}

/**
 * The two product pages (components/pages/products/): the office software and the election software.
 * They share one layout; each draws its own product screen in the hero from `screen`. Names, numbers
 * and file numbers in a screen are illustrative, and the page says so under it.
 */
export type ProductKey = "office" | "election";

export type StatusTone = "leaf" | "accent" | "muted" | "warn";

/** The office product's hero screen: the letter queue, with an appointment, a citizen's SMS and the overdue count beside it */
export interface OfficeScreen {
  app: string;
  /** The sidebar, in the product's own order */
  nav: string[];
  title: string;
  date: string;
  search: string;
  tabs: { t: string; n: string }[];
  cols: [string, string, string, string];
  rows: { no: string; name: string; dept: string; status: string; tone: StatusTone }[];
  meeting: { kicker: string; time: string; t: string; status: string };
  sms: { from: string; body: string; when: string };
  pending: { label: string; value: string; note: string };
  /** What the story on the hero ends with: the first row dispatched, the tabs (follow-up, dispatched) and the overdue count one lower */
  after: { status: string; tone: StatusTone; tabs: [string, string]; pending: string };
}

/** The election product's hero screen: every booth of a constituency by how well it is covered, the roll beside it */
export interface ElectionScreen {
  app: string;
  nav: string[];
  title: string;
  area: string;
  /** Covered, partly covered, not yet: in that order, with their counts */
  legend: [{ t: string; n: string }, { t: string; n: string }, { t: string; n: string }];
  voters: { title: string; total: string; groups: { t: string; v: number }[]; women: string; men: string; womenShare: number };
  booth: { kicker: string; t: string; d: string };
  survey: { kicker: string; t: string; v: string };
  roll: { label: string; value: string; note: string };
}

/** One module told at length, beside its illustration; `chip` is the status card laid over the picture */
export interface ProductFeature {
  t: string;
  h: string;
  d: string;
  points: string[];
  img: MediaKey;
  alt: string;
  chip: { k: string; v: string };
}

export interface ProductCopy<S> {
  meta: PageMeta;
  /** The header's Products menu */
  menu: TitledItem;
  name: string;
  title: string;
  sub: string;
  primary: string;
  secondary: string;
  /** Three short facts under the buttons */
  facts: string[];
  screen: S;
  /** What the hero screen shows, for screen readers */
  screenLabel: string;
  shift: { kicker: string; title: string; before: string; after: string; items: { before: string; after: string }[] };
  features: { title: string; sub: string; items: ProductFeature[] };
  /** Every module in the product, as How we work lists them; `soon` while it's being built */
  modules: { kicker: string; title: string; sub: string; items: { t: string; d: string; soon?: boolean }[] };
  /** The page's one feature band: the real eLetter screen (office), the voter list (election) */
  band: { kicker: string; title: string; body: string; points: string[]; alt?: string; link?: string };
  faq: { title: string; lead: string; items: QA[] };
  cta: { title: string; body: string };
  /** The card that points to the other product */
  other: { kicker: string; t: string; d: string; link: string };
}

export interface Products {
  common: {
    /** The header's menu label and the breadcrumb */
    label: string;
    illustrative: string;
    live: string;
    soon: string;
    setup: { kicker: string; title: string; sub: string; link: string };
    trust: { title: string; link: string };
    faqAll: string;
    /** Replays the hero screen's story */
    replay: string;
  };
  office: ProductCopy<OfficeScreen>;
  election: ProductCopy<ElectionScreen>;
}

export interface Roles {
  /** Shared by the office pages: setup (with the homepage's four steps) and data */
  common: {
    eg: string;
    soon: string;
    /** The hero card's buttons: play the case again, and jump to the Flow section that tells it in full */
    hero: { more: string };
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

/** The request-a-demo dialog, opened by every demo button (components/site/demo-dialog.tsx) */
export interface DemoCopy {
  kicker: string;
  title: string;
  body: string;
  /** What happens after they send it, in order */
  steps: TitledItem[];
  /** The line over the phone and WhatsApp links */
  direct: string;
  /** The memo line over the form: "To", "The Setuk team, Patna" */
  to: string;
  toValue: string;
  name: string;
  email: string;
  phone: string;
  office: string;
  optional: string;
  role: string;
  /** In the order of the role pages (MPs, MLAs, mayors, consultants), then the rest */
  roles: string[];
  staff: string;
  staffs: string[];
  note: string;
  noteHint: string;
  consent: string;
  privacy: string;
  submit: string;
  errors: { name: string; email: string; consent: string };
  /** The email's subject, before the sender's name */
  subject: string;
  sentTitle: string;
  sentBody: string;
  done: string;
  close: string;
}

/**
 * "Try it" on the homepage (components/home/try-it*.tsx): the visitor's own request, followed from
 * logged to closed, with the messages they would get. In the steps and messages {name}, {no} (the file
 * number) and {dept} are filled in; nothing typed leaves the page.
 */
export interface TryItCopy {
  kicker: string;
  title: string;
  sub: string;
  name: { label: string; placeholder: string };
  request: { label: string; samples: { t: string; dept: string }[] };
  button: string;
  again: string;
  another: string;
  privacy: string;
  /** The panel's heading over the steps, with {no} */
  file: string;
  steps: TitledItem[];
  /** When each step happens, beside it */
  when: string[];
  phone: { title: string; from: string; messages: [string, string, string] };
  /** The name the finished example shows before anyone types */
  sample: string;
  /** Announced when the journey ends */
  done: string;
}

export interface Dictionary {
  meta: { title: string; description: string };
  brand: { name: string; line: string };
  skip: string;
  chapters: string[];
  nav: { labels: Record<NavKey, string>; byRole: string; products: string; demo: string; menu: string; close: string; language: string; chapters: string; toDark: string; toLight: string };
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
  demo: DemoCopy;
  tryIt: TryItCopy;
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
