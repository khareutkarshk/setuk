/**
 * The shapes the voter list pages render. They are the contract with the backend: lib/voter-list/api.ts
 * returns these, today from mock.ts, later from the real API. Names and the generated prose are
 * English (as printed in the official rolls); the page labels around them come from the dictionaries.
 */

/** Where an area sits: a state (or UT), a district in it, or an assembly constituency in that */
export type Level = "state" | "district" | "ac";

interface AreaBase {
  /** URL segment, e.g. "bihar", "patna", "181-digha-excel-voter-list" */
  slug: string;
  name: string;
  /** The roll the files were built from, e.g. "SIR FinalRoll - 2026" */
  roll: string;
  /** Polling booths (parts). Each booth is one sheet in the Excel files */
  booths: number;
}

export interface StateSummary extends AreaBase {
  level: "state";
  districts: number;
  acs: number;
  pcs: number;
}

export interface DistrictSummary extends AreaBase {
  level: "district";
  acs: number;
  pcs: number;
}

export interface AcSummary extends AreaBase {
  level: "ac";
  /** Assembly constituency number */
  no: number;
  /** The Lok Sabha seat it belongs to */
  pc: { no: number; name: string };
}

export type AreaSummary = StateSummary | DistrictSummary | AcSummary;

/** A row in a "related" table, linking to another area's page */
export interface RelatedRow {
  name: string;
  /** Slugs from the state down, e.g. ["bihar", "patna", "181-digha-excel-voter-list"] */
  slugs: string[];
  booths: number;
  /** An extra column, such as the district for Lok Sabha segments */
  meta?: string;
}

/**
 * The write-up under the cards, for every level (including the landing page). Everything here is
 * per-area content the backend generates; the section headings are page labels from the dictionaries.
 */
export interface AreaDetail {
  title: string;
  summary: string[];
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

/** Everything one page needs. `trail` is the chosen state, district and constituency, in order */
export interface VoterListView {
  level: "all" | Level;
  trail: { state?: StateSummary; district?: DistrictSummary; ac?: AcSummary };
  /** The cards: states, the state's districts, or the district's constituencies (on a constituency's page, it comes first) */
  cards: AreaSummary[];
  /** Options for the three pickers. Empty when the level above is not chosen */
  options: { states: Option[]; districts: Option[]; acs: Option[] };
  /** Coverage figures for the hero, for the area in view */
  totals: { states?: number; districts?: number; acs?: number; pcs?: number; booths: number };
  /** Rupees per booth, for the price lines and the order message */
  ratePerBooth: number;
  detail: AreaDetail;
}

export interface Option {
  slug: string;
  name: string;
}
