/**
 * The shapes the voter list pages render. They are the contract with the backend: lib/voter-list/api.ts
 * returns these, today from mock.ts (built on the catalogue exported from the live site, data/catalogue.json),
 * later from the real API. Names and the generated prose are English (as printed in the official rolls);
 * the page labels around them come from the dictionaries.
 *
 * The pages and their addresses, as on the live site (every path under /voter-list-excel):
 *   /                                      all       every state
 *   /{state}                               state     the state's districts
 *   /{state}/all-districts                 districts every district in the state
 *   /{state}/all-assembly-constituencies   acs       every assembly constituency in the state
 *   /{state}/all-parliamentary-constituencies  pcs   every Lok Sabha constituency in the state
 *   /{state}/{pc}                          pc        a Lok Sabha constituency and its assembly segments
 *   /{state}/{district}                    district  the district's assembly constituencies
 *   /{state}/{district}/{ac}               ac        one assembly constituency
 * A Lok Sabha slug ("30-patna-sahib-excel-voter-list") and a district slug ("patna") share the second
 * segment; the catalogue tells them apart.
 */

/** Where an area sits: a state (or UT), a district in it, an assembly constituency (AC), or a Lok Sabha constituency (PC) */
export type Level = "state" | "district" | "ac" | "pc";

/** The three lists of a state, each with its own page */
export type IndexKind = "districts" | "acs" | "pcs";

/** The kind of page: the landing page, one area, or one of a state's lists */
export type PageLevel = "all" | Level | IndexKind;

/** An area named in another's card or list, with its page */
export interface AreaRef {
  name: string;
  /** Path under /voter-list-excel, from the state down: ["bihar", "patna", "181-digha-excel-voter-list"] */
  slugs: string[];
}

interface AreaBase extends AreaRef {
  /** The last URL segment: "bihar", "patna", "181-digha-excel-voter-list", "30-patna-sahib-excel-voter-list" */
  slug: string;
  /** The roll the files were built from, e.g. "SIR FinalRoll - 2026" */
  roll: string;
  /** Polling booths (parts). Each booth is one sheet in the Excel files */
  booths: number;
}

export interface StateSummary extends AreaBase {
  level: "state";
  /** The Election Commission's code: S01 to S29 for states, U01 to U09 for union territories */
  code: string;
  /** The roll's languages when they are not English and Hindi; empty for the usual pair */
  languages: string;
  districts: number;
  acs: number;
  pcs: number;
}

export interface DistrictSummary extends AreaBase {
  level: "district";
  state: AreaRef;
  acs: number;
  /** Lok Sabha seats its constituencies belong to */
  pcs: number;
}

export interface AcSummary extends AreaBase {
  level: "ac";
  /** Assembly constituency number */
  no: number;
  state: AreaRef;
  district: AreaRef;
  /** The Lok Sabha seat it belongs to, when the roll names one */
  pc?: AreaRef & { no: number };
}

export interface PcSummary extends AreaBase {
  level: "pc";
  /** Lok Sabha constituency number */
  no: number;
  state: AreaRef;
  /** Its assembly segments, in number order */
  segments: (AreaRef & { no: number; district: string })[];
}

export type AreaSummary = StateSummary | DistrictSummary | AcSummary | PcSummary;

/** A row in a "related" table, linking to another area's page */
export interface RelatedRow extends AreaRef {
  booths: number;
  /** An extra column, such as the district for Lok Sabha segments */
  meta?: string;
}

/** One block of rich copy from a page's own article */
export type CopyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

/**
 * The write-up under the cards, for every page. Everything here is per-area content the backend
 * generates or an editor writes; the section headings are page labels from the dictionaries.
 */
export interface AreaDetail {
  title: string;
  summary: string[];
  /** A state's own editorial article (state pages only), as written on the live site */
  article: CopyBlock[];
  /** "At a glance": short label and value pairs */
  facts: { label: string; value: string }[];
  /** What the Excel file contains */
  includes: string[];
  /** An illustrative row of the sheet, never a real voter */
  sample: { columns: string[]; rows: string[][]; note: string };
  /** Tables of neighbouring areas, e.g. other constituencies in the district */
  related: { title: string; columns: { name: string; booths: string; meta?: string }; rows: RelatedRow[] }[];
  faqs: { q: string; a: string }[];
  disclaimer: string;
}

/**
 * A state's lists, for the index at the foot of the page (every page within a state shows its own;
 * the landing page shows every state's). Each list links to its own page as well.
 */
export interface StateIndex {
  state: AreaRef;
  districts: AreaRef[];
  acs: (AreaRef & { no: number })[];
  pcs: (AreaRef & { no: number })[];
}

/** Everything one page needs. `trail` is the chosen state and the area within it, in order */
export interface VoterListView {
  level: PageLevel;
  trail: { state?: StateSummary; district?: DistrictSummary; ac?: AcSummary; pc?: PcSummary };
  /**
   * The cards: states; a state's districts; one of its lists; a district's constituencies; a Lok
   * Sabha seat and then its segments; or a constituency and then the rest of its district
   */
  cards: AreaSummary[];
  /** Options for the three pickers. Empty when the level above is not chosen */
  options: { states: Option[]; districts: Option[]; acs: Option[] };
  /** Coverage figures for the hero, for the area in view */
  totals: { states?: number; districts?: number; acs?: number; pcs?: number; booths: number };
  /** Rupees per booth, for the price lines and the order message */
  ratePerBooth: number;
  /**
   * What editors wrote for the hero (a state's page and its lists): `lead` shows under the heading on
   * English pages; `title` is the long search title the live site used as its h1, for metadata
   */
  hero?: { title: string; lead: string };
  detail: AreaDetail;
  /** The index at the foot of the page */
  index: StateIndex[];
}

export interface Option {
  slug: string;
  name: string;
}
