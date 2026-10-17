"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as I from "@/components/icons";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);

/**
 * Plays a product screen's story (screens.tsx) once it is in view: it sets data-play on the frame,
 * which CSS turns into the moments of the story (globals.css, .play-*), and counts up the figures
 * marked data-count from zero to what the server wrote. "Play again" runs it once more. With reduced
 * motion nothing starts and the button stays hidden (.play-only), so the screen rests at its end.
 * The counting writes text straight into those elements, so this component never re-renders.
 */
export function ScreenPlay({ children, note, replay }: { children: ReactNode; note: string; replay: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const play = () => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* restart the CSS: off, a reflow, on */
    el.removeAttribute("data-play");
    void el.offsetWidth;
    el.setAttribute("data-play", "");

    const counts = [...el.querySelectorAll<HTMLElement>("[data-count]")].map((n) => {
      /* the figure as the server wrote it, kept for every replay */
      n.dataset.text ??= n.textContent ?? "";
      const text = n.dataset.text;
      const m = text.match(/\d[\d,]*/);
      return { n, text, m, to: m ? Number(m[0].replace(/,/g, "")) : 0 };
    });
    cancelAnimationFrame(raf.current);
    const start = performance.now() + 900;
    const tick = (now: number) => {
      const e = ease((now - start) / 1400);
      for (const c of counts) if (c.m) c.n.textContent = c.text.replace(c.m[0], Math.round(c.to * e).toLocaleString("en-IN"));
      if (e < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      play();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div ref={ref}>{children}</div>
      <p className="rise mt-3 flex items-center justify-center gap-4 text-[12px] text-muted [--i:6]">
        {note}
        <button type="button" onClick={play}
          className="play-only press min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink hover:border-ink">
          <I.ClockCounterClockwise size={14} aria-hidden />{replay}
        </button>
      </p>
    </>
  );
}
