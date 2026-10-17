"use client";

import { useEffect, useState } from "react";

/**
 * Eased progress from 0 to 1 (easeOutQuart), for numbers that count up once. It starts at 1, so the
 * server and a visitor without script see the final figures; when `run` turns true it plays from 0,
 * and again whenever `key` changes while running. With reduced motion it stays at 1.
 */
export function useEased(run: boolean, { duration = 1600, delay = 0, key }: { duration?: number; delay?: number; key?: unknown } = {}) {
  const [t, setT] = useState(1);

  useEffect(() => {
    if (!run || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, (now - start) / duration)), 4);
      setT(e);
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, duration, delay, key]);

  return t;
}
