/**
 * Page-wide smooth scrolling (Lenis), started once by <SmoothScroll /> in the site shell. Off with
 * reduced motion, where the page scrolls natively. Code that moves the page goes through `scrollToY`
 * so a running Lenis animation never fights a native jump.
 */
import Lenis from "lenis";

let lenis: Lenis | null = null;
const watchers = new Set<(l: Lenis | null) => void>();

export function startSmoothScroll(): () => void {
  if (lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
  /* in-page links land below the sticky header, as scroll-padding-top does natively */
  const l = new Lenis({ autoRaf: true, anchors: { offset: -(headerH + 24) } });
  lenis = l;
  watchers.forEach((cb) => cb(l));
  return () => {
    l.destroy();
    if (lenis === l) lenis = null;
    watchers.forEach((cb) => cb(null));
  };
}

/** Calls `cb` with the running instance now and whenever it starts or stops; returns an unsubscribe */
export function watchLenis(cb: (l: Lenis | null) => void): () => void {
  watchers.add(cb);
  cb(lenis);
  return () => { watchers.delete(cb); };
}

/** Scroll the page to `y`: eased through Lenis when it runs, otherwise natively */
export function scrollToY(y: number, { immediate = false, duration = 1 }: { immediate?: boolean; duration?: number } = {}) {
  if (lenis) lenis.scrollTo(y, { immediate, duration, force: true });
  else scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}
