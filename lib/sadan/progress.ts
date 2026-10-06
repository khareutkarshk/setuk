/**
 * Maps scroll position to a chapter index p (0..n-1). p is an integer while chapter i's card is
 * centred in the viewport and fractional in between. Shared by the story chrome and the 3D camera.
 */
export interface ScrollProgress {
  /** Re-measure chapter positions (after resize, font load, layout changes) */
  measure(): void;
  /** Current progress */
  get(): number;
  /** Scroll offset that centres chapter i */
  centre(i: number): number;
}

export function createScrollProgress(steps: HTMLElement[]): ScrollProgress {
  let centres: number[] = [];
  const measure = () => {
    const vh = window.innerHeight;
    centres = steps.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2 - vh / 2;
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
  measure();
  return { measure, get, centre: (i) => centres[Math.max(0, Math.min(i, centres.length - 1))] ?? 0 };
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
