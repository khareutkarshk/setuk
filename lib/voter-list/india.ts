import data from "./data/india-map.json";

/**
 * The map of India for the voter list's landing page: every state in one projection, with the centre
 * of its largest piece, and `small` on those too small to tap (they get a ring). Drawn by
 * scripts/voter-list/state-shapes.py --india from the same official boundaries as the card outlines.
 * Read on the server only, so the shapes reach the page as markup, never as script.
 */
export type IndiaState = { d: string; c: number[]; small?: boolean };

export const india = data as { source: string; viewBox: string; states: Record<string, IndiaState> };
