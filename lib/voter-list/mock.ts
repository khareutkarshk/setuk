import type { AcSummary, AreaDetail, DistrictSummary, RelatedRow, StateSummary } from "./types";

/*
 * [mock] Sample data for the voter list pages, until the real API is connected (see api.ts).
 * The figures are a small slice of the published rolls: twelve states, eight Bihar districts, and
 * Patna's fourteen constituencies. Other districts have no constituencies here on purpose, so the
 * empty state can be seen. The write-ups are built from the figures by the functions at the end.
 */

const s = (slug: string, name: string, roll: string, districts: number, acs: number, pcs: number, booths: number): StateSummary =>
  ({ level: "state", slug, name, roll, districts, acs, pcs, booths });

export const STATES: StateSummary[] = [
  s("assam", "Assam", "FinalRoll - 2026", 35, 126, 14, 31486),
  s("bihar", "Bihar", "State General Election 2025", 38, 243, 40, 90712),
  s("gujarat", "Gujarat", "SIR FinalRoll - 2026", 34, 182, 26, 56622),
  s("karnataka", "Karnataka", "SIR DraftRoll - 2026", 34, 224, 28, 60923),
  s("kerala", "Kerala", "SIR FinalRoll - Rev2 - 2026", 14, 140, 20, 30471),
  s("madhya-pradesh", "Madhya Pradesh", "SIR FinalRoll - 2026", 55, 230, 29, 71930),
  s("maharashtra", "Maharashtra", "SIR DraftRoll - 2026", 36, 288, 48, 100216),
  s("punjab", "Punjab", "SIR DraftRoll - 2026", 23, 117, 13, 25332),
  s("rajasthan", "Rajasthan", "SIR FinalRoll - 2026", 41, 200, 25, 61404),
  s("tamil-nadu", "Tamil Nadu", "SIR FinalRoll-Rev2- 2026", 38, 234, 39, 75032),
  s("uttar-pradesh", "Uttar Pradesh", "SIR FinalRoll - 2026", 75, 403, 80, 177516),
  s("west-bengal", "West Bengal", "SIR FinalRoll-Rev2 - 2026", 24, 294, 42, 80719)
];

const BIHAR_ROLL = "State General Election 2025";
const d = (slug: string, name: string, acs: number, pcs: number, booths: number): DistrictSummary =>
  ({ level: "district", slug, name, roll: BIHAR_ROLL, acs, pcs, booths });

/** Keyed by state slug */
export const DISTRICTS: Record<string, DistrictSummary[]> = {
  bihar: [
    d("bhagalpur", "Bhagalpur", 7, 2, 2678),
    d("darbhanga", "Darbhanga", 10, 3, 3329),
    d("gaya", "Gaya", 10, 3, 3866),
    d("muzaffarpur", "Muzaffarpur", 11, 2, 4186),
    d("nalanda", "Nalanda", 7, 1, 2765),
    d("patna", "Patna", 14, 3, 5665),
    d("purnia", "Purnia", 7, 2, 2553),
    d("saran", "Saran", 10, 2, 3510)
  ]
};

const a = (no: number, name: string, booths: number, pc: AcSummary["pc"]): AcSummary =>
  ({ level: "ac", no, slug: `${no}-${name.toLowerCase().replace(/\s+/g, "-")}-excel-voter-list`, name, roll: BIHAR_ROLL, booths, pc });
const MUNGER = { no: 28, name: "Munger" };
const PATNA_SAHIB = { no: 30, name: "Patna Sahib" };
const PATALIPUTRA = { no: 31, name: "Pataliputra" };

/** Keyed by "state/district" */
export const ACS: Record<string, AcSummary[]> = {
  "bihar/patna": [
    a(178, "Mokama", 342, MUNGER),
    a(179, "Barh", 349, MUNGER),
    a(180, "Bakhtiarpur", 351, PATNA_SAHIB),
    a(181, "Digha", 501, PATNA_SAHIB),
    a(182, "Bankipur", 422, PATNA_SAHIB),
    a(183, "Kumhrar", 435, PATNA_SAHIB),
    a(184, "Patna Sahib", 405, PATNA_SAHIB),
    a(185, "Fatuha", 350, PATNA_SAHIB),
    a(186, "Danapur", 409, PATALIPUTRA),
    a(187, "Maner", 406, PATALIPUTRA),
    a(188, "Phulwari", 459, PATALIPUTRA),
    a(189, "Masaurhi", 443, PATALIPUTRA),
    a(190, "Paliganj", 369, PATALIPUTRA),
    a(191, "Bikram", 424, PATALIPUTRA)
  ]
};

/** Rupees per booth. The order message and the price lines use it */
export const RATE_PER_BOOTH = 20;

/* ---- write-ups ---------------------------------------------------------------------------- */

const n = (x: number) => x.toLocaleString("en-IN");
const inr = (x: number) => `₹${n(x)}`;

const SAMPLE_COLUMNS = ["Part No.", "Sr. No.", "EPIC No.", "Name (Original)", "Name (English)", "Name (Hindi)", "Relation", "House No.", "Age", "Gender"];
const SAMPLE_NOTE = "Sample rows for illustration. Relative names, section and polling station follow in the next columns.";
const INCLUDES = [
  "A summary sheet listing every booth with men, women and third-gender totals",
  "One sheet per booth, with the polling station and section names in the header",
  "One row per voter: EPIC number, name, relative's name, relation, house number, age, gender and section",
  "Every name in the original script, plus English and Hindi, with transliteration reviewed by people",
  "Supplementary lists merged in, with deleted voters flagged",
  "Public roll data only. No phone numbers, photos or caste tags."
];
const DISCLAIMER = "Contains only data from the publicly available electoral roll. For electoral, political and research use under ECI guidelines and the DPDP Act, 2023.";

const rows = (list: { slug: string; name: string; booths: number }[], base: string[], skip?: string, meta?: (x: { slug: string }) => string): RelatedRow[] =>
  list.filter((x) => x.slug !== skip).map((x) => ({ name: x.name, slugs: [...base, x.slug], booths: x.booths, meta: meta?.(x) }));

export function allDetail(): AreaDetail {
  const booths = STATES.reduce((t, x) => t + x.booths, 0);
  return {
    title: "The official voter list isn't searchable. Ours is.",
    summary: [
      "Download an electoral roll from a state CEO website and you get a PDF of scanned images. Ctrl+F finds nothing, copy-paste returns nothing, and the text is often in a script ordinary converters can't read.",
      "We turn those PDFs into a searchable voter list in Excel: one booth per sheet, one voter per row, with every name in the original script plus English and Hindi."
    ],
    facts: [
      { label: "States and UTs", value: String(STATES.length) },
      { label: "Assembly constituencies", value: n(STATES.reduce((t, x) => t + x.acs, 0)) },
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
    related: [{ title: "Every state we cover", columns: { name: "State", booths: "Booths", meta: "Roll" }, rows: rows(STATES, [], undefined, (x) => STATES.find((y) => y.slug === x.slug)!.roll) }],
    faqs: [
      { q: "Is this the official voter list?", a: "It is the official roll published by the Chief Electoral Officer of each state, rebuilt as a spreadsheet. Nothing is added; every field comes from the published roll." },
      { q: "Which languages are the names in?", a: "Every file has three versions of each name: the original script as printed, an English transliteration and a Hindi (Devanagari) transliteration." },
      { q: "Does the file include phone numbers?", a: "No. It contains only what is printed in the public electoral roll." },
      { q: "How do I order?", a: "Pick a state, district or constituency above and use the order button. WhatsApp opens with the order filled in; we confirm and send the file." }
    ],
    disclaimer: DISCLAIMER
  };
}

export function stateDetail(st: StateSummary): AreaDetail {
  const districts = DISTRICTS[st.slug] ?? [];
  return {
    title: `${st.name} voter list in Excel`,
    summary: [
      `${st.name}'s ${st.roll} roll in searchable Excel for all ${st.acs} assembly constituencies: one workbook per constituency, one sheet per booth, every voter on one row.`,
      `The Chief Electoral Officer publishes the roll as one PDF per booth, ${n(st.booths)} of them across the state. Order one constituency, a district, a Lok Sabha seat or the whole state.`
    ],
    facts: [
      { label: "Districts", value: String(st.districts) },
      { label: "Assembly constituencies", value: String(st.acs) },
      { label: "Lok Sabha constituencies", value: String(st.pcs) },
      { label: "Polling booths", value: n(st.booths) },
      { label: "Roll", value: st.roll },
      { label: "Full state", value: `${inr(st.booths * RATE_PER_BOOTH)} at ${inr(RATE_PER_BOOTH)} per booth` }
    ],
    includes: INCLUDES,
    sample: { columns: SAMPLE_COLUMNS, rows: [["1", "1", "ABC1234567", "राम कुमार सिंह", "Ram Kumar Singh", "राम कुमार सिंह", "Father", "23", "45", "M"]], note: SAMPLE_NOTE },
    related: districts.length ? [{ title: `All districts in ${st.name}`, columns: { name: "District", booths: "Booths", meta: "Constituencies" }, rows: rows(districts, [st.slug], undefined, (x) => String(districts.find((y) => y.slug === x.slug)!.acs)) }] : [],
    faqs: [
      { q: `How can I get the ${st.name} voter list in Excel?`, a: `Choose a district or constituency above, or order the whole state. Files come as one workbook per assembly constituency and one sheet per booth.` },
      { q: `How many constituencies are there in ${st.name}?`, a: `${st.acs} assembly constituencies and ${st.pcs} Lok Sabha constituencies, across ${st.districts} districts.` },
      { q: `What does the full ${st.name} list cost?`, a: `${inr(st.booths * RATE_PER_BOOTH)} for all ${n(st.booths)} booths at ${inr(RATE_PER_BOOTH)} per booth. Ask for a quote on district and state orders.` }
    ],
    disclaimer: DISCLAIMER
  };
}

export function districtDetail(st: StateSummary, di: DistrictSummary): AreaDetail {
  const acs = ACS[`${st.slug}/${di.slug}`] ?? [];
  return {
    title: `${di.name} district voter list in Excel`,
    summary: [
      `The ${di.roll} voter list for ${di.name} district, ${st.name}: ${di.acs} assembly constituencies and ${n(di.booths)} booths, one workbook per constituency.`,
      `${di.name} holds about ${((di.booths / st.booths) * 100).toFixed(1)}% of the booths in ${st.name}, an average of ${n(Math.round(di.booths / di.acs))} per constituency.`
    ],
    facts: [
      { label: "State", value: st.name },
      { label: "Assembly constituencies", value: String(di.acs) },
      { label: "Lok Sabha constituencies", value: String(di.pcs) },
      { label: "Polling booths", value: n(di.booths) },
      { label: "Roll", value: di.roll },
      { label: "Full district", value: `${inr(di.booths * RATE_PER_BOOTH)} at ${inr(RATE_PER_BOOTH)} per booth` }
    ],
    includes: INCLUDES,
    sample: { columns: SAMPLE_COLUMNS, rows: [["1", "1", "ABC1234567", "राम कुमार सिंह", "Ram Kumar Singh", "राम कुमार सिंह", "Father", "23", "45", "M"]], note: SAMPLE_NOTE },
    related: [
      ...(acs.length ? [{ title: `Constituencies in ${di.name}`, columns: { name: "Constituency", booths: "Booths", meta: "Lok Sabha" }, rows: rows(acs, [st.slug, di.slug], undefined, (x) => acs.find((y) => y.slug === x.slug)!.pc.name) }] : []),
      { title: `Other districts in ${st.name}`, columns: { name: "District", booths: "Booths" }, rows: rows(DISTRICTS[st.slug] ?? [], [st.slug], di.slug) }
    ],
    faqs: [
      { q: `How many constituencies are in ${di.name}?`, a: `${di.acs} assembly constituencies, spread across ${di.pcs} Lok Sabha seats.` },
      { q: `Can I order the whole ${di.name} district?`, a: `Yes. All ${n(di.booths)} booths come to ${inr(di.booths * RATE_PER_BOOTH)}; ask for a quote on bundles.` }
    ],
    disclaimer: DISCLAIMER
  };
}

export function acDetail(st: StateSummary, di: DistrictSummary, ac: AcSummary): AreaDetail {
  const siblings = ACS[`${st.slug}/${di.slug}`] ?? [];
  const segments = siblings.filter((x) => x.pc.no === ac.pc.no);
  const rank = [...siblings].sort((p, q) => q.booths - p.booths).findIndex((x) => x.slug === ac.slug) + 1;
  return {
    title: `${ac.name} voter list in Excel`,
    summary: [
      `${ac.name} is an assembly constituency in ${di.name}, ${st.name}, with ${n(ac.booths)} polling booths. Its ${ac.roll} voter list is published as one PDF per booth.`,
      `Here it is as one workbook: one sheet per booth, every voter on one row, with names in English and Hindi. By booths it ranks ${rank} of ${siblings.length} in ${di.name}.`
    ],
    facts: [
      { label: "Constituency", value: `${ac.name} (AC ${ac.no})` },
      { label: "District", value: di.name },
      { label: "State", value: st.name },
      { label: "Lok Sabha seat", value: `${ac.pc.no} · ${ac.pc.name}` },
      { label: "Polling booths", value: n(ac.booths) },
      { label: "Roll", value: ac.roll },
      { label: "Full constituency", value: `${inr(ac.booths * RATE_PER_BOOTH)} at ${inr(RATE_PER_BOOTH)} per booth` }
    ],
    includes: INCLUDES.map((x, i) => (i === 1 ? `${n(ac.booths)} booth sheets, one per part, with the polling station and section names in the header` : x)),
    sample: { columns: SAMPLE_COLUMNS, rows: [["1", "1", "ABC1234567", "राम कुमार सिंह", "Ram Kumar Singh", "राम कुमार सिंह", "Father", "23", "45", "M"]], note: SAMPLE_NOTE },
    related: [
      { title: `Other segments in ${ac.pc.name}`, columns: { name: "Segment", booths: "Booths", meta: "District" }, rows: rows(segments, [st.slug, di.slug], ac.slug, () => di.name) }
    ].filter((r) => r.rows.length),
    faqs: [
      { q: `How many polling booths are in ${ac.name}?`, a: `${ac.name} has ${n(ac.booths)} polling booths. That is the number of sheets in the workbook.` },
      { q: `What is the price of the ${ac.name} voter list?`, a: `${inr(ac.booths * RATE_PER_BOOTH)} for all ${n(ac.booths)} booths at ${inr(RATE_PER_BOOTH)} per booth.` },
      { q: `Which Lok Sabha seat is ${ac.name} in?`, a: `${ac.name} is in ${di.name}, ${st.name}, and in the ${ac.pc.name} Lok Sabha seat.` },
      { q: "Can I buy a single booth?", a: `The smallest order is the full constituency. Ask on WhatsApp for one sample booth sheet before you order.` }
    ],
    disclaimer: DISCLAIMER
  };
}
