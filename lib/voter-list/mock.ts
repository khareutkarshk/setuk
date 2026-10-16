import catalogueJson from "./data/catalogue.json";
import copyJson from "./data/copy.json";
import type { AcSummary, AreaDetail, AreaRef, CopyBlock, DistrictSummary, PcSummary, RelatedRow, StateIndex, StateSummary } from "./types";

/*
 * [mock] The voter list pages' data until the real API is connected (see api.ts). It is the live
 * site's own catalogue, exported from https://setuk.org/voter-list-excel/ by scripts/voter-list/export.sh:
 *   data/catalogue.json  every state, district, assembly constituency (AC) and Lok Sabha seat (PC), with
 *                        its roll and booth count, and which seat each AC belongs to
 *   data/copy.json       what editors wrote on the state pages and the state lists: hero, article, questions
 * This file turns those flat records into the summaries the pages draw, and writes each page's
 * write-up from the figures, the way the live site does. The backend can return the same shapes.
 */

type Raw = typeof catalogueJson;
type RawState = Raw["states"][number];
type RawPc = Raw["pcs"][number];
type PageCopy = { title: string; lead: string; article: CopyBlock[]; faqs: { q: string; a: string }[] };
const copy = copyJson as unknown as { landing: PageCopy; states: Record<string, Partial<Record<"state" | "all-districts" | "all-assembly-constituencies" | "all-parliamentary-constituencies", PageCopy>>> };

/** Rupees per booth. The order message and the price lines use it */
export const RATE_PER_BOOTH = catalogueJson.ratePerBooth;

/** The second URL segment of a state's three list pages, as on the live site */
export const INDEX_SLUGS = { districts: "all-districts", acs: "all-assembly-constituencies", pcs: "all-parliamentary-constituencies" } as const;

/* ---- the catalogue, as summaries ----------------------------------------------------------- */

const ref = (x: { name: string; slugs: string[] }): AreaRef => ({ name: x.name, slugs: x.slugs });

export const STATES: StateSummary[] = catalogueJson.states.map((s: RawState) => ({ level: "state", ...s, slugs: [s.slug] }));
const stateBy = new Map(STATES.map((s) => [s.slug, s]));

/* Lok Sabha seats first: the constituencies point at them */
const pcBy = new Map<string, RawPc>(catalogueJson.pcs.map((p) => [`${p.state}#${p.no}`, p]));

const rawDistrictBy = new Map(catalogueJson.districts.map((d) => [`${d.state}/${d.slug}`, d]));

const ACS_ALL: AcSummary[] = catalogueJson.acs.map((a) => {
  const st = stateBy.get(a.state)!;
  const di = rawDistrictBy.get(`${a.state}/${a.district}`)!;
  const pc = a.pc == null ? undefined : pcBy.get(`${a.state}#${a.pc}`);
  return {
    level: "ac", no: a.no, slug: a.slug, name: a.name, roll: a.roll, booths: a.booths,
    slugs: [a.state, a.district, a.slug],
    state: ref(st),
    district: { name: di.name, slugs: [a.state, a.district] },
    pc: pc ? { no: pc.no, name: pc.name, slugs: [a.state, pc.slug] } : undefined
  };
});

/** Keyed by "state/district", in number order */
export const ACS: Record<string, AcSummary[]> = group(ACS_ALL, (a) => a.slugs.slice(0, 2).join("/"));
/* the live index runs district by district; the pages list a state's constituencies in number order */
const acsByState = group([...ACS_ALL].sort((p, q) => p.no - q.no), (a) => a.slugs[0]);
const acBy = new Map(ACS_ALL.map((a) => [`${a.slugs[0]}#${a.no}`, a]));

/** Keyed by state slug, in the roll's order */
export const DISTRICTS: Record<string, DistrictSummary[]> = group(
  catalogueJson.districts.map((d) => {
    const acs = ACS[`${d.state}/${d.slug}`] ?? [];
    return {
      level: "district" as const, slug: d.slug, name: d.name, roll: d.roll, booths: d.booths,
      slugs: [d.state, d.slug],
      state: ref(stateBy.get(d.state)!),
      acs: d.acs || acs.length,
      pcs: new Set(acs.map((a) => a.pc?.no).filter((x) => x !== undefined)).size
    };
  }),
  (d) => d.slugs[0]
);

/** Keyed by state slug, in number order */
export const PCS: Record<string, PcSummary[]> = group(
  catalogueJson.pcs.map((p) => ({
    level: "pc" as const, no: p.no, slug: p.slug, name: p.name, roll: p.roll, booths: p.booths,
    slugs: [p.state, p.slug],
    state: ref(stateBy.get(p.state)!),
    segments: p.acs.map((no) => acBy.get(`${p.state}#${no}`)).filter((a): a is AcSummary => !!a)
      .map((a) => ({ no: a.no, name: a.name, slugs: a.slugs, district: a.district.name }))
  })),
  (p) => p.slugs[0]
);

export const stateAcs = (st: string) => acsByState[st] ?? [];

/** A state's lists for the index at the foot of the page */
export function stateIndex(st: StateSummary): StateIndex {
  return {
    state: ref(st),
    districts: (DISTRICTS[st.slug] ?? []).map(ref),
    acs: stateAcs(st.slug).map((a) => ({ ...ref(a), no: a.no })),
    pcs: (PCS[st.slug] ?? []).map((p) => ({ ...ref(p), no: p.no }))
  };
}

/** Editors' hero for a state page or one of its lists, when they wrote one */
export function heroCopy(st: string, page: "state" | keyof typeof INDEX_SLUGS) {
  const c = copy.states[st]?.[page === "state" ? "state" : INDEX_SLUGS[page]];
  return c?.title ? { title: c.title, lead: c.lead } : undefined;
}

/* ---- write-ups ---------------------------------------------------------------------------- */

const n = (x: number) => x.toLocaleString("en-IN");
const inr = (x: number) => `₹${n(x)}`;
const avg = (total: number, parts: number) => (parts ? Math.round(total / parts) : 0);
const pct = (x: number, of: number) => (of ? `${((x / of) * 100).toFixed(1)}%` : "0%");
/** 1-based place by booths, largest first */
const rank = <T extends { slug: string; booths: number }>(list: T[], x: T) => [...list].sort((p, q) => q.booths - p.booths).findIndex((y) => y.slug === x.slug) + 1;
const languages = (st: StateSummary) => st.languages || "English and Hindi";
const full = (booths: number) => `${inr(booths * RATE_PER_BOOTH)} at ${inr(RATE_PER_BOOTH)} per booth`;

const SAMPLE_COLUMNS = ["Part No.", "Sr. No.", "EPIC No.", "Name (Original)", "Name (English)", "Name (Hindi)", "Relation", "House No.", "Age", "Gender"];
const SAMPLE_NOTE = "Sample rows for illustration. Relative names, section and polling station follow in the next columns.";
const SAMPLE = { columns: SAMPLE_COLUMNS, rows: [["1", "1", "ABC1234567", "राम कुमार सिंह", "Ram Kumar Singh", "राम कुमार सिंह", "Father", "23", "45", "M"]], note: SAMPLE_NOTE };
const INCLUDES = [
  "A summary sheet listing every booth with men, women and third-gender totals",
  "One sheet per booth, with the polling station and section names in the header",
  "One row per voter: EPIC number, name, relative's name, relation, house number, age, gender and section",
  "Every name in the original script, plus English and Hindi, with transliteration reviewed by people",
  "Supplementary lists merged in, with deleted voters flagged",
  "Public roll data only. No phone numbers, photos or caste tags."
];
const disclaimer = (st?: StateSummary) => `Contains only data from the publicly available ${st ? `${st.name} ` : ""}electoral roll. For electoral, political and research use under ECI guidelines and the DPDP Act, 2023.`;

const rows = <T extends { name: string; slugs: string[]; booths: number }>(list: T[], meta?: (x: T) => string): RelatedRow[] =>
  list.map((x) => ({ name: x.name, slugs: x.slugs, booths: x.booths, meta: meta?.(x) }));
const acLabel = (a: { no: number; name: string }) => `${a.no} · ${a.name}`;

export function allDetail(): AreaDetail {
  const booths = STATES.reduce((t, x) => t + x.booths, 0);
  const acs = STATES.reduce((t, x) => t + x.acs, 0);
  const c = copy.landing;
  return {
    title: "The official voter list isn't searchable. Ours is.",
    summary: [
      "Download an electoral roll from a state CEO website and you get a PDF of scanned images. Ctrl+F finds nothing, copy-paste returns nothing, and the text is often in a script ordinary converters can't read.",
      "We turn those PDFs into a searchable voter list in Excel: one booth per sheet, one voter per row, with every name in the original script plus English and Hindi."
    ],
    article: c.article,
    facts: [
      { label: "States and UTs", value: String(STATES.length) },
      { label: "Districts", value: n(catalogueJson.districts.length) },
      { label: "Assembly constituencies", value: n(acs) },
      { label: "Lok Sabha constituencies", value: n(catalogueJson.pcs.length) },
      { label: "Polling booths", value: n(booths) },
      { label: "Price", value: `${inr(RATE_PER_BOOTH)} per booth` },
      { label: "Delivery", value: "Within 24 hours, often instantly" }
    ],
    includes: INCLUDES,
    sample: {
      columns: SAMPLE_COLUMNS,
      rows: [
        ["112", "1", "ABC1234567", "ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ", "Gurpreet Singh", "गुरप्रीत सिंह", "Father", "14", "34", "M"],
        ["112", "2", "ABC1234568", "ਹਰਪ੍ਰੀਤ ਕੌਰ", "Harpreet Kaur", "हरप्रीत कौर", "Husband", "14", "31", "F"]
      ],
      note: SAMPLE_NOTE
    },
    related: [{ title: "Every state we cover", columns: { name: "State", booths: "Booths", meta: "Roll" }, rows: rows(STATES, (x) => x.roll) }],
    faqs: c.faqs,
    disclaimer: disclaimer()
  };
}

export function stateDetail(st: StateSummary): AreaDetail {
  const districts = DISTRICTS[st.slug] ?? [];
  const pcs = PCS[st.slug] ?? [];
  const c = copy.states[st.slug]?.state;
  return {
    title: `${st.name} voter list in Excel`,
    summary: [
      `${st.name}'s ${st.roll} roll in searchable Excel for all ${st.acs} assembly constituencies: one workbook per constituency, one sheet per booth, every voter on one row.`,
      `The Chief Electoral Officer publishes the roll as one PDF per booth, ${n(st.booths)} of them across the state. Order one constituency, a district, a Lok Sabha seat or the whole state.`
    ],
    article: c?.article ?? [],
    facts: [
      { label: "State code", value: st.code },
      { label: "Districts", value: String(st.districts) },
      { label: "Assembly constituencies", value: String(st.acs) },
      { label: "Lok Sabha constituencies", value: String(st.pcs) },
      { label: "Polling booths", value: n(st.booths) },
      { label: "Roll", value: st.roll },
      { label: "Roll language", value: languages(st) },
      { label: "Full state", value: full(st.booths) }
    ],
    includes: INCLUDES,
    sample: SAMPLE,
    related: [
      ...(districts.length ? [{ title: `All districts in ${st.name}`, columns: { name: "District", booths: "Booths", meta: "Constituencies" }, rows: rows(districts, (x) => String(x.acs)) }] : []),
      ...(pcs.length ? [{ title: `Lok Sabha seats in ${st.name}`, columns: { name: "Seat", booths: "Booths", meta: "Segments" }, rows: rows(pcs, (x) => String(x.segments.length)) }] : [])
    ],
    faqs: c?.faqs.length ? c.faqs : [
      { q: `How can I get the ${st.name} voter list in Excel?`, a: `Choose a district or constituency above, or order the whole state. Files come as one workbook per assembly constituency and one sheet per booth.` },
      { q: `How many constituencies are there in ${st.name}?`, a: `${st.acs} assembly constituencies and ${st.pcs} Lok Sabha constituencies, across ${st.districts} districts.` },
      { q: `What does the full ${st.name} list cost?`, a: `${inr(st.booths * RATE_PER_BOOTH)} for all ${n(st.booths)} booths at ${inr(RATE_PER_BOOTH)} per booth. Ask for a quote on district and state orders.` }
    ],
    disclaimer: disclaimer(st)
  };
}

/** One of a state's three lists: every district, every assembly constituency or every Lok Sabha seat */
export function indexDetail(st: StateSummary, kind: keyof typeof INDEX_SLUGS): AreaDetail {
  const c = copy.states[st.slug]?.[INDEX_SLUGS[kind]];
  const what = { districts: "district", acs: "assembly constituency", pcs: "Lok Sabha seat" }[kind];
  const count = { districts: st.districts, acs: st.acs, pcs: st.pcs }[kind];
  const unit = { districts: "district's constituencies", acs: "constituency", pcs: "seat's assembly segments" }[kind];
  return {
    title: `Every ${what} in ${st.name}, in Excel`,
    summary: [
      `${st.name} has ${n(count)} ${kind === "acs" ? "assembly constituencies" : kind === "pcs" ? "Lok Sabha constituencies" : "districts"} on the ${st.roll} roll, ${n(st.booths)} booths in all, an average of ${n(avg(st.booths, count))} booths each.`,
      `Each ${unit} comes as Excel workbooks, one sheet per booth, every voter on one row, names in ${languages(st)}. Open any card for its own page, or order the whole state.`
    ],
    article: c?.article ?? [],
    facts: [
      { label: "State", value: st.name },
      { label: kind === "acs" ? "Assembly constituencies" : kind === "pcs" ? "Lok Sabha constituencies" : "Districts", value: n(count) },
      { label: "Polling booths", value: n(st.booths) },
      { label: "Roll", value: st.roll },
      { label: "Full state", value: full(st.booths) }
    ],
    includes: INCLUDES,
    sample: SAMPLE,
    related: [],
    faqs: c?.faqs ?? [],
    disclaimer: disclaimer(st)
  };
}

export function districtDetail(st: StateSummary, di: DistrictSummary): AreaDetail {
  const acs = ACS[di.slugs.join("/")] ?? [];
  const districts = DISTRICTS[st.slug] ?? [];
  const seats = [...new Set(acs.map((a) => a.pc?.name).filter(Boolean))];
  return {
    title: `${di.name} district voter list in Excel`,
    summary: [
      `The ${di.roll} voter list for ${di.name} district, ${st.name}: ${di.acs} assembly constituencies and ${n(di.booths)} booths, one workbook per constituency.`,
      `${di.name} holds about ${pct(di.booths, st.booths)} of the booths in ${st.name}, an average of ${n(avg(di.booths, di.acs))} per constituency. By booths it ranks ${rank(districts, di)} of ${districts.length} districts in the state.`
    ],
    article: [],
    facts: [
      { label: "District", value: di.name },
      { label: "State", value: st.name },
      { label: "Assembly constituencies", value: String(di.acs) },
      { label: "Lok Sabha seats", value: seats.length ? seats.join(", ") : String(di.pcs) },
      { label: "Polling booths", value: n(di.booths) },
      { label: "Roll", value: di.roll },
      { label: "Roll language", value: languages(st) },
      { label: "Full district", value: full(di.booths) }
    ],
    includes: INCLUDES,
    sample: SAMPLE,
    related: [
      ...(acs.length ? [{ title: `Constituencies in ${di.name}`, columns: { name: "Constituency", booths: "Booths", meta: "Lok Sabha" }, rows: rows(acs, (x) => x.pc?.name ?? "") }] : []),
      { title: `Other districts in ${st.name}`, columns: { name: "District", booths: "Booths" }, rows: rows(districts.filter((x) => x.slug !== di.slug)) }
    ],
    faqs: [
      { q: `How can I download the ${di.name} district voter list in Excel?`, a: `Order the whole district or any of its ${di.acs} constituencies above. Each constituency is one workbook, one sheet per booth, from the ${di.roll} roll.` },
      { q: `How many assembly constituencies and polling booths are there in ${di.name}?`, a: `${di.acs} assembly constituencies and ${n(di.booths)} polling booths.` },
      { q: `What is the price of the ${di.name} district voter list in Excel?`, a: `${inr(di.booths * RATE_PER_BOOTH)} for all ${n(di.booths)} booths at ${inr(RATE_PER_BOOTH)} per booth. Ask for a quote on bundles.` },
      ...(seats.length ? [{ q: `Which Lok Sabha seats cover ${di.name} district?`, a: `${seats.join(", ")}.` }] : [])
    ],
    disclaimer: disclaimer(st)
  };
}

export function acDetail(st: StateSummary, di: DistrictSummary, ac: AcSummary): AreaDetail {
  const siblings = ACS[di.slugs.join("/")] ?? [];
  const inState = stateAcs(st.slug);
  const pc = ac.pc ? (PCS[st.slug] ?? []).find((p) => p.no === ac.pc!.no) : undefined;
  const segments = pc ? pc.segments.filter((s) => s.no !== ac.no).map((s) => acBy.get(`${st.slug}#${s.no}`)!).filter(Boolean) : [];
  const stateAvg = avg(st.booths, inState.length);
  return {
    title: `${ac.name} voter list in Excel`,
    summary: [
      `${ac.name} is an assembly constituency in ${di.name}, ${st.name}, with ${n(ac.booths)} polling booths. Its ${ac.roll} voter list is published as one PDF per booth.`,
      `Here it is as one workbook: one sheet per booth, every voter on one row, with names in ${languages(st)}.`,
      `With ${n(ac.booths)} booths, ${ac.name} is ${ac.booths >= stateAvg ? "larger" : "smaller"} than most constituencies in ${st.name}, where the average is ${n(stateAvg)}. It ranks ${rank(inState, ac)} of ${inState.length} in the state and ${rank(siblings, ac)} of ${siblings.length} in ${di.name}, about ${pct(ac.booths, di.booths)} of the district's booths.`
    ],
    article: [],
    facts: [
      { label: "Constituency", value: `${ac.name} (AC ${ac.no})` },
      { label: "District", value: di.name },
      { label: "State", value: st.name },
      ...(ac.pc ? [{ label: "Lok Sabha seat", value: `${ac.pc.no} · ${ac.pc.name}` }] : []),
      { label: "Polling booths", value: n(ac.booths) },
      { label: "Roll", value: ac.roll },
      { label: "Roll language", value: languages(st) },
      { label: "Full constituency", value: full(ac.booths) }
    ],
    includes: INCLUDES.map((x, i) => (i === 1 ? `${n(ac.booths)} booth sheets, one per part, with the polling station and section names in the header` : x)),
    sample: SAMPLE,
    related: [
      { title: `Other constituencies in ${di.name}`, columns: { name: "Constituency", booths: "Booths" }, rows: rows(siblings.filter((x) => x.slug !== ac.slug)) },
      ...(pc ? [{ title: `Other segments in ${pc.name}`, columns: { name: "Segment", booths: "Booths", meta: "District" }, rows: rows(segments, (x) => x.district.name) }] : [])
    ].filter((r) => r.rows.length),
    faqs: [
      { q: `How can I download the ${ac.name} voter list in Excel?`, a: `The official ${ac.name} roll is ${n(ac.booths)} booth PDFs. We provide the ${ac.roll} roll as one Excel workbook, one sheet per booth, names in ${languages(st)}. Use the order button on this page.` },
      { q: `How many polling booths are in ${ac.name}?`, a: `${ac.name} has ${n(ac.booths)} polling booths. That is the number of sheets in the workbook.` },
      { q: `What is the price of the ${ac.name} voter list in Excel?`, a: `${inr(ac.booths * RATE_PER_BOOTH)} for all ${n(ac.booths)} booths at ${inr(RATE_PER_BOOTH)} per booth.` },
      { q: `Which district${ac.pc ? " and Lok Sabha seat" : ""} is ${ac.name} in?`, a: `${ac.name} is in ${di.name}, ${st.name}${ac.pc ? `, and in the ${ac.pc.name} Lok Sabha seat` : ""}.` },
      { q: `Can I buy a single booth of ${ac.name}?`, a: `The smallest order is the full constituency, all ${n(ac.booths)} booths. Ask on WhatsApp for one sample booth sheet before you order.` },
      { q: `Can I get the whole ${di.name} district${pc ? ` or the ${pc.name} seat` : ""}?`, a: `${ac.name} is one of ${siblings.length} constituencies in ${di.name}${pc ? ` and one of ${pc.segments.length} segments in ${pc.name}` : ""}. Both bundles are available; ask on WhatsApp.` }
    ],
    disclaimer: disclaimer(st)
  };
}

export function pcDetail(st: StateSummary, pc: PcSummary): AreaDetail {
  const pcs = PCS[st.slug] ?? [];
  const stateAvg = avg(pcs.reduce((t, x) => t + x.booths, 0), pcs.length);
  const segments = pc.segments.map((s) => acBy.get(`${st.slug}#${s.no}`)!).filter(Boolean);
  return {
    title: `${pc.name} Lok Sabha voter list in Excel`,
    summary: [
      `${pc.name} is a Lok Sabha constituency in ${st.name}, made up of ${pc.segments.length} assembly segments and ${n(pc.booths)} polling booths. The ${pc.roll} roll is published as booth PDFs under each assembly segment.`,
      `Here it is in Excel: one workbook per assembly segment, one sheet per booth, every voter on one row, with names in ${languages(st)}.`,
      `${pc.name}'s ${n(pc.booths)} booths are ${Math.abs(pc.booths - stateAvg) < stateAvg * 0.1 ? "close to" : pc.booths > stateAvg ? "above" : "below"} the ${st.name} average of ${n(stateAvg)} per Lok Sabha seat. It ranks ${rank(pcs, pc)} of ${pcs.length} by booth count.`
    ],
    article: [],
    facts: [
      { label: "Constituency", value: `${pc.name} (PC ${pc.no})` },
      { label: "State", value: st.name },
      { label: "Assembly segments", value: String(pc.segments.length) },
      { label: "Polling booths", value: n(pc.booths) },
      { label: "Roll", value: pc.roll },
      { label: "Roll language", value: languages(st) },
      { label: "Full seat", value: full(pc.booths) }
    ],
    includes: INCLUDES.map((x, i) => (i === 1 ? `${pc.segments.length} workbooks, one per assembly segment, ${n(pc.booths)} booth sheets in all` : x)),
    sample: SAMPLE,
    related: [
      ...(segments.length ? [{ title: `All ${segments.length} assembly segments in ${pc.name}`, columns: { name: "Segment", booths: "Booths", meta: "District" }, rows: segments.map((a) => ({ name: acLabel(a), slugs: a.slugs, booths: a.booths, meta: a.district.name })) }] : []),
      { title: `Other Lok Sabha seats in ${st.name}`, columns: { name: "Seat", booths: "Booths" }, rows: rows(pcs.filter((x) => x.slug !== pc.slug)) }
    ].filter((r) => r.rows.length),
    faqs: [
      { q: `How can I download the ${pc.name} Lok Sabha voter list in Excel?`, a: `Order the whole seat or any of its ${pc.segments.length} assembly segments above. Each segment is one workbook, one sheet per booth, from the ${pc.roll} roll.` },
      { q: `How many assembly segments and booths are in ${pc.name}?`, a: `${pc.segments.length} assembly segments and ${n(pc.booths)} polling booths.` },
      { q: `What is the price of the ${pc.name} voter list in Excel?`, a: `${inr(pc.booths * RATE_PER_BOOTH)} for all ${n(pc.booths)} booths at ${inr(RATE_PER_BOOTH)} per booth.` },
      ...(pc.segments.length ? [{ q: `Which assembly constituencies make up ${pc.name}?`, a: `${pc.segments.map(acLabel).join(", ")}.` }] : [])
    ],
    disclaimer: disclaimer(st)
  };
}

function group<T>(list: T[], key: (x: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const x of list) (out[key(x)] ??= []).push(x);
  return out;
}
