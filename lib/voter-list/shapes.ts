import shapes from "./data/state-shapes.json";
import type { AreaSummary } from "./types";

/**
 * The cards' maps, drawn from an open dataset whose boundaries follow India's official map
 * (data/state-shapes.LICENSE). Each state has its outline, fitted to its own box, and, in the same
 * box, each assembly constituency (AC) the boundary data names as the catalogue does, and each
 * district and Lok Sabha seat whose ACs it has all of, drawn as one shape: its path and its bounds.
 * Together they fill the outline, so a card's area sits where its outline says. `marks` are the
 * centres of the scattered pieces of a UT such
 * as Puducherry, for a ring round each. Assam and Jammu and Kashmir have no ACs: their seats were
 * redrawn after the boundary data was made. Rebuild with scripts/voter-list/state-shapes.py.
 * This is drawing, not data: the backend need not send it.
 */
export type StateShape = {
  viewBox: string;
  d: string;
  marks?: number[][];
  /** AC number -> its area */
  acs?: Record<string, Area>;
  /** district slug -> its area */
  districts?: Record<string, Area>;
  /** Lok Sabha number -> its area */
  pcs?: Record<string, Area>;
};

/** An area on its state's outline: [path, x0, y0, x1, y1] */
type Area = [string, number, number, number, number];

/** One area lit up on its state's outline: its path, and a ring where it is too small to find */
export type Highlight = { d: string; ring?: [number, number, number] };

/* JSON reads tuples as plain arrays, hence the cast through unknown */
const all = shapes.shapes as unknown as Record<string, StateShape>;

export const stateShape = (slug: string): StateShape | undefined => all[slug];

/** The area of a district, AC or Lok Sabha card on its state, when the boundary data has all of it */
export function areaHighlight(area: AreaSummary): Highlight | undefined {
  if (area.level === "state") return undefined;
  const st = all[area.slugs[0]];
  const got = area.level === "ac" ? st?.acs?.[String(area.no)] : area.level === "pc" ? st?.pcs?.[String(area.no)] : st?.districts?.[area.slug];
  if (!st || !got) return undefined;
  const [d, x0, y0, x1, y1] = got;
  const [, , vw, vh] = st.viewBox.split(" ").map(Number);
  /* smaller than a twelfth of the state: ring it, so the eye finds it at card size */
  const small = Math.max(x1 - x0, y1 - y0) < Math.max(vw, vh) / 12;
  return { d, ring: small ? [(x0 + x1) / 2, (y0 + y1) / 2, 7] : undefined };
}
