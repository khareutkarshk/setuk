"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/content";
import { proof } from "@/content/site";
import styles from "./story.module.css";

const format = (value: number, v: number, suffix: string) =>
  (value < 100 ? v.toFixed(1) : Math.round(v).toLocaleString("en-IN")) + suffix;

/**
 * Proof strip counters. The server renders the final figures (readable without JS and by crawlers);
 * after hydration they count up once, unless the visitor prefers reduced motion. The strip is still
 * hidden behind its load-in animation at that point, so the reset to zero is not seen.
 */
export function ProofStrip({ locale, items }: { locale: Locale; items: string[] }) {
  const [t, setT] = useState(1);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now() + 500;
    const tick = (now: number) => {
      const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, (now - start) / 1600)), 4);
      setT(e);
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <dl className={styles.proof}>
      {items.map((label, i) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className="tnum">{format(proof[i].value, proof[i].value * t, proof[i].suffix[locale])}</dd>
        </div>
      ))}
    </dl>
  );
}
