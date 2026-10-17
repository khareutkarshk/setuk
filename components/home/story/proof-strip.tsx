"use client";

import type { Locale } from "@/content";
import { proof } from "@/content/site";
import { useEased } from "@/lib/use-eased";
import styles from "./story.module.css";

const format = (value: number, v: number, suffix: string) =>
  (value < 100 ? v.toFixed(1) : Math.round(v).toLocaleString("en-IN")) + suffix;

/**
 * Proof strip counters. The server renders the final figures (readable without JS and by crawlers);
 * after hydration they count up once, unless the visitor prefers reduced motion. The strip is still
 * hidden behind its load-in animation at that point, so the reset to zero is not seen.
 */
export function ProofStrip({ locale, items }: { locale: Locale; items: string[] }) {
  const t = useEased(true, { delay: 500 });

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
