"use client";

import { useEffect, useRef, type ReactNode } from "react";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);
/* how long a story holds its end before it rewinds, and how long the rewind takes (ms) */
const HOLD = 6500;
const REWIND = 600;

/**
 * Loops a product screen's story (screens.tsx) while it is in view: data-play runs it from the start
 * (globals.css, .play-*), the figures marked data-count count up from zero to what the server wrote,
 * and after HOLD data-rewind eases everything back so it can play again. Out of view, or with the tab
 * hidden, the loop waits and picks up again on return. With reduced motion nothing starts, so the
 * screen rests at its end. It writes to the DOM directly and never re-renders.
 */
export function ScreenPlay({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false, waiting = true, timer = 0, raf = 0;

    const count = () => {
      const counts = [...el.querySelectorAll<HTMLElement>("[data-count]")].map((n) => {
        /* the figure as the server wrote it, kept for every loop */
        n.dataset.text ??= n.textContent ?? "";
        const text = n.dataset.text;
        const m = text.match(/\d[\d,]*/);
        return { n, text, m, to: m ? Number(m[0].replace(/,/g, "")) : 0 };
      });
      cancelAnimationFrame(raf);
      const start = performance.now() + 900;
      const tick = (now: number) => {
        const e = ease((now - start) / 1400);
        for (const c of counts) if (c.m) c.n.textContent = c.text.replace(c.m[0], Math.round(c.to * e).toLocaleString("en-IN"));
        if (e < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!visible || document.hidden) { waiting = true; return; }
      waiting = false;
      el.removeAttribute("data-rewind");
      el.removeAttribute("data-play");
      void el.offsetWidth; // restart the CSS animations
      el.setAttribute("data-play", "");
      count();
      timer = window.setTimeout(rewind, HOLD);
    };
    const rewind = () => {
      el.setAttribute("data-rewind", "");
      el.removeAttribute("data-play");
      timer = window.setTimeout(play, REWIND);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && waiting) play();
    }, { threshold: 0.3 });
    io.observe(el);
    const onVisibility = () => { if (!document.hidden && visible && waiting) play(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVisibility); clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  return <div ref={ref}>{children}</div>;
}
