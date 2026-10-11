import { ACS, DISTRICTS, RATE_PER_BOOTH, STATES, acDetail, allDetail, districtDetail, stateDetail } from "./mock";
import type { VoterListView } from "./types";

/**
 * The voter list pages' one data call. It takes the URL's slugs (none, [state], [state, district] or
 * [state, district, ac]) and returns everything the page draws, or null for an unknown area (the
 * page then 404s).
 *
 * [mock] This reads mock.ts. To connect the backend, replace the body with a fetch that returns the
 * same VoterListView shape (lib/voter-list/types.ts), for example:
 *
 *   const res = await fetch(`${process.env.VOTER_LIST_API}/views/${slugs.join("/")}`, { next: { revalidate: 3600 } });
 *   if (res.status === 404) return null;
 *   return (await res.json()) as VoterListView;
 *
 * Nothing else on the page needs to change.
 */
export async function getVoterListView(slugs: string[]): Promise<VoterListView | null> {
  const [stateSlug, districtSlug, acSlug, ...rest] = slugs;
  if (rest.length) return null;
  const states = STATES.map(({ slug, name }) => ({ slug, name }));

  if (!stateSlug) {
    return {
      level: "all",
      trail: {},
      cards: STATES,
      options: { states, districts: [], acs: [] },
      totals: { states: STATES.length, acs: sum(STATES, "acs"), pcs: sum(STATES, "pcs"), booths: sum(STATES, "booths") },
      ratePerBooth: RATE_PER_BOOTH,
      detail: allDetail()
    };
  }

  const state = STATES.find((x) => x.slug === stateSlug);
  if (!state) return null;
  const districts = DISTRICTS[state.slug] ?? [];
  const districtOptions = districts.map(({ slug, name }) => ({ slug, name }));

  if (!districtSlug) {
    return {
      level: "state",
      trail: { state },
      cards: districts,
      options: { states, districts: districtOptions, acs: [] },
      totals: { districts: state.districts, acs: state.acs, pcs: state.pcs, booths: state.booths },
      ratePerBooth: RATE_PER_BOOTH,
      detail: stateDetail(state)
    };
  }

  const district = districts.find((x) => x.slug === districtSlug);
  if (!district) return null;
  const acs = ACS[`${state.slug}/${district.slug}`] ?? [];
  const acOptions = acs.map(({ slug, name, no }) => ({ slug, name: `${no} · ${name}` }));

  if (!acSlug) {
    return {
      level: "district",
      trail: { state, district },
      cards: acs,
      options: { states, districts: districtOptions, acs: acOptions },
      totals: { acs: district.acs, pcs: district.pcs, booths: district.booths },
      ratePerBooth: RATE_PER_BOOTH,
      detail: districtDetail(state, district)
    };
  }

  const ac = acs.find((x) => x.slug === acSlug);
  if (!ac) return null;
  return {
    level: "ac",
    trail: { state, district, ac },
    /* the chosen constituency first, then the rest of its district */
    cards: [ac, ...acs.filter((x) => x !== ac)],
    options: { states, districts: districtOptions, acs: acOptions },
    totals: { booths: ac.booths },
    ratePerBooth: RATE_PER_BOOTH,
    detail: acDetail(state, district, ac)
  };
}

/**
 * Every area page, as slug lists, for the sitemap. [mock] Replace with the backend's list of areas.
 */
export async function getVoterListPaths(): Promise<string[][]> {
  return [
    [],
    ...STATES.map((st) => [st.slug]),
    ...Object.entries(DISTRICTS).flatMap(([st, list]) => list.map((di) => [st, di.slug])),
    ...Object.entries(ACS).flatMap(([key, list]) => list.map((ac) => [...key.split("/"), ac.slug]))
  ];
}

function sum<T>(list: T[], key: { [K in keyof T]: T[K] extends number ? K : never }[keyof T]) {
  return list.reduce((t, x) => t + (x[key] as number), 0);
}
