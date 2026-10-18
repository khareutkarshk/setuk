"use client";

import { useEffect, useRef, type ReactNode } from "react";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);
/**
 * Plays a product screen's story (screens.tsx) once, when it comes into view: data-play runs it from
 * the start (globals.css, .play-*) and the figures marked data-count count up from zero to what the
 * server wrote; then it rests at its end. It used to rewind and loop for as long as it was in view,
 * which is motion beside the page's text with no way to stop it (WCAG 2.2.2). With the tab hidden it
 * waits for the visitor's return. With reduced motion nothing starts, so the screen rests at its end.
 * It writes to the DOM directly and never re-renders.
 */
export function ScreenPlay({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false, waiting = true, raf = 0;

    const count = () => {
      const counts = [...el.querySelectorAll<HTMLElement>("[data-count]")].map((n) => {
        /* the figure as the server wrote it */
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
      el.setAttribute("data-play", "");
      count();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && waiting) play();
    }, { threshold: 0.3 });
    io.observe(el);
    const onVisibility = () => { if (!document.hidden && visible && waiting) play(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVisibility); cancelAnimationFrame(raf); };
  }, []);

  return <div ref={ref}>{children}</div>;
}
