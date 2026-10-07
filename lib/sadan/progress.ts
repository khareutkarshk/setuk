/**
 * Maps scroll position to a chapter index p (0..n-1). p is an integer while chapter i's anchor (its
 * centre by default) sits on the focus line (the viewport centre by default; the middle of the reading
 * area when the scene is a band above the text) and fractional in between. Shared by the story chrome and the 3D camera.
 */
export interface ScrollProgress {
  /** Re-measure chapter positions (after resize, font load, layout changes) */
  measure(): void;
  /** Current progress */
  get(): number;
  /** Scroll offset that centres chapter i */
  centre(i: number): number;
  /** Scroll offset for a progress value (the inverse of get), to restore the place after a layout change */
  at(p: number): number;
}

export function createScrollProgress(
  steps: HTMLElement[],
  focus: () => number = () => window.innerHeight / 2,
  /** The point of a chapter that meets the focus line, from its top (its centre by default) */
  anchor: (height: number) => number = (h) => h / 2
): ScrollProgress {
  let centres: number[] = [];
  const measure = () => {
    const f = focus();
    centres = steps.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + anchor(r.height) - f;
    });
    if (centres.length) centres[0] = 0;
  };
  const get = () => {
    const y = window.scrollY;
    if (!centres.length || y <= centres[0]) return 0;
    for (let i = 0; i < centres.length - 1; i++) {
      if (y <= centres[i + 1]) return i + (y - centres[i]) / (centres[i + 1] - centres[i]);
    }
    return centres.length - 1;
  };
  const centre = (i: number) => centres[Math.max(0, Math.min(i, centres.length - 1))] ?? 0;
  const at = (p: number) => {
    const i = Math.max(0, Math.min(Math.floor(p), centres.length - 2));
    return i < 0 ? 0 : centre(i) + (centre(i + 1) - centre(i)) * Math.min(1, Math.max(0, p - i));
  };
  measure();
  return { measure, get, centre, at };
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
