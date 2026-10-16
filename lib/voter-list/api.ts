import { ACS, DISTRICTS, INDEX_SLUGS, PCS, RATE_PER_BOOTH, STATES, acDetail, allDetail, districtDetail, heroCopy, indexDetail, pcDetail, stateAcs, stateDetail, stateIndex } from "./mock";
import type { IndexKind, Option, VoterListView } from "./types";

/**
 * The voter list pages' one data call. It takes the URL's slugs and returns everything the page
 * draws, or null for an unknown address (the page then 404s). The addresses are the live site's
 * (see types.ts for the full list):
 *   []                          the landing page
 *   [state]                     a state
 *   [state, "all-districts" | "all-assembly-constituencies" | "all-parliamentary-constituencies"]
 *   [state, pc]                 a Lok Sabha constituency
 *   [state, district]           a district
 *   [state, district, ac]       an assembly constituency
 *
 * [mock] This reads mock.ts, the catalogue exported from the live site. To connect the backend,
 * replace the body with a fetch that returns the same VoterListView shape (lib/voter-list/types.ts),
 * for example:
 *
 *   const res = await fetch(`${process.env.VOTER_LIST_API}/views/${slugs.join("/")}`, { next: { revalidate: 3600 } });
 *   if (res.status === 404) return null;
 *   return (await res.json()) as VoterListView;
 *
 * and do the same for getVoterListPaths. Nothing else on the page needs to change.
 */
export async function getVoterListView(slugs: string[]): Promise<VoterListView | null> {
  const [stateSlug, second, third, ...rest] = slugs;
  if (rest.length) return null;
  const states = STATES.map(opt);
  const base = { ratePerBooth: RATE_PER_BOOTH };

  if (!stateSlug) {
    return {
      ...base,
      level: "all",
      trail: {},
      cards: STATES,
      options: { states, districts: [], acs: [] },
      totals: { states: STATES.length, districts: sum(STATES, "districts"), acs: sum(STATES, "acs"), pcs: sum(STATES, "pcs"), booths: sum(STATES, "booths") },
      detail: allDetail(),
      index: STATES.map(stateIndex)
    };
  }

  const state = STATES.find((x) => x.slug === stateSlug);
  if (!state) return null;
  const districts = DISTRICTS[state.slug] ?? [];
  const pcs = PCS[state.slug] ?? [];
  const inState = { ...base, index: [stateIndex(state)], options: { states, districts: districts.map(opt), acs: [] as Option[] } };
  const stateTotals = { districts: state.districts, acs: state.acs, pcs: state.pcs, booths: state.booths };

  if (!second) {
    return { ...inState, level: "state", trail: { state }, cards: districts, totals: stateTotals, hero: heroCopy(state.slug, "state"), detail: stateDetail(state) };
  }

  /* one of the state's three lists; a list the state doesn't have (no assembly, no seats) is not a page */
  const kind = (Object.keys(INDEX_SLUGS) as IndexKind[]).find((k) => INDEX_SLUGS[k] === second);
  if (kind) {
    const cards = kind === "districts" ? districts : kind === "acs" ? stateAcs(state.slug) : pcs;
    if (third || !cards.length) return null;
    return { ...inState, level: kind, trail: { state }, cards, totals: stateTotals, hero: heroCopy(state.slug, kind), detail: indexDetail(state, kind) };
  }

  const pc = pcs.find((x) => x.slug === second);
  if (pc) {
    if (third) return null;
    const segments = pc.segments.map((s) => stateAcs(state.slug).find((a) => a.no === s.no)!).filter(Boolean);
    return {
      ...inState,
      level: "pc",
      trail: { state, pc },
      /* the seat first, then its assembly segments */
      cards: [pc, ...segments],
      totals: { acs: pc.segments.length, booths: pc.booths },
      detail: pcDetail(state, pc)
    };
  }

  const district = districts.find((x) => x.slug === second);
  if (!district) return null;
  const acs = ACS[district.slugs.join("/")] ?? [];
  const inDistrict = { ...inState, options: { ...inState.options, acs: acs.map((a) => ({ slug: a.slug, name: `${a.no} · ${a.name}` })) } };

  if (!third) {
    return { ...inDistrict, level: "district", trail: { state, district }, cards: acs, totals: { acs: district.acs, pcs: district.pcs, booths: district.booths }, detail: districtDetail(state, district) };
  }

  const ac = acs.find((x) => x.slug === third);
  if (!ac) return null;
  return {
    ...inDistrict,
    level: "ac",
    trail: { state, district, ac },
    /* the chosen constituency first, then the rest of its district */
    cards: [ac, ...acs.filter((x) => x !== ac)],
    totals: { booths: ac.booths },
    detail: acDetail(state, district, ac)
  };
}

/**
 * Every voter list page, as slug lists, for the sitemap: the landing page, each state with its
 * lists, Lok Sabha seats, districts and constituencies. [mock] Replace with the backend's list of areas.
 */
export async function getVoterListPaths(): Promise<string[][]> {
  return [
    [],
    ...STATES.flatMap((st) => [
      [st.slug],
      ...(DISTRICTS[st.slug]?.length ? [[st.slug, INDEX_SLUGS.districts]] : []),
      ...(stateAcs(st.slug).length ? [[st.slug, INDEX_SLUGS.acs]] : []),
      ...(PCS[st.slug]?.length ? [[st.slug, INDEX_SLUGS.pcs]] : []),
      ...(PCS[st.slug] ?? []).map((p) => p.slugs),
      ...(DISTRICTS[st.slug] ?? []).map((d) => d.slugs),
      ...stateAcs(st.slug).map((a) => a.slugs)
    ])
  ];
}

const opt = (x: { slug: string; name: string }): Option => ({ slug: x.slug, name: x.name });

function sum<T>(list: T[], key: { [K in keyof T]: T[K] extends number ? K : never }[keyof T]) {
  return list.reduce((t, x) => t + (x[key] as number), 0);
}
