/**
 * Content model for the homepage. Every locale implements `Dictionary`, so a missing
 * or misspelt key in a translation is a type error, not a blank on the page.
 * Source of truth for wording and its status (site / brief / draft / placeholder):
 * ../SETUK-CONTENT.md in the prototype folder.
 */

export type Locale = "en" | "hi";

export type NavKey = "home" | "about" | "features" | "roadmap" | "contact" | "legal" | "voterList";

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
  nav: { labels: Record<NavKey, string>; demo: string; menu: string; close: string; language: string; chapters: string };
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
  faq: { eyebrow: string; title: string; more: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string };
  footer: {
    company: string;
    guides: string;
    legal: string;
    address: string;
    rights: string;
    model: string;
    guideItems: Link[];
    legalItems: Link[];
  };
  scene: SceneLabels;
}
