"use client";

import { useEffect, useId, useRef } from "react";

/* The bridge: Setuk is सेतु, a bridge. Six arches over one deck, a hanger at each quarter, a pin at every
   pier and crown, and the whole bridge mirrored faintly below the deck, as on still water. Each time it
   comes into view it builds itself once (globals.css, .foot-*): the deck and piers, the arches rising in
   turn with their hangers and crowns, then a light with a soft tail crosses from the first pier, lighting
   each crown as it passes, and settles on the last with a ripple. All in under five seconds (WCAG 2.2.2).
   It is drawn finished in the HTML; only once script has checked for motion is it held back (data-armed)
   for the play (data-play). */
const SPANS = 6, W = 200, DECK = 150, CROWN = 30;
const arch = (k: number) => `M${k * W} ${DECK}Q${k * W + W / 2} ${CROWN} ${(k + 1) * W} ${DECK}`;
const RUN = Array.from({ length: SPANS }, (_, k) => (k ? arch(k).replace(/^M[\d.]+ [\d.]+/, "") : arch(k))).join("");
const at = (k: number, t: number) => [k * W + W * t, DECK - 2 * (DECK - CROWN) * t * (1 - t)] as const;
const END = SPANS * W;

/** The arches, hangers, crowns and piers; drawn twice, once as the bridge and once as its reflection */
function Structure({ stroke }: { stroke: string }) {
  return (
    <>
      {Array.from({ length: SPANS }, (_, k) => (
        <g key={k} style={{ ["--k" as string]: k }}>
          {[0.25, 0.5, 0.75].map((t) => {
            const [x, y] = at(k, t);
            return <line key={t} className="foot-hanger" x1={x} y1={y} x2={x} y2={DECK} />;
          })}
          <path className="foot-arch" d={arch(k)} pathLength={1} stroke={stroke} />
          <circle className="foot-crown" cx={k * W + W / 2} cy={at(k, 0.5)[1]} r={4.5} />
        </g>
      ))}
      {Array.from({ length: SPANS + 1 }, (_, k) => (
        <circle key={k} className="foot-pier" style={{ ["--k" as string]: k }} cx={k * W} cy={DECK} r={k === 0 || k === SPANS ? 7 : 5} />
      ))}
    </>
  );
}

export function FooterBridge({ word }: { word: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.setAttribute("data-armed", "");
    const watch = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        // restarts the play: off, a reflow, on again
        el.removeAttribute("data-play");
        void el.offsetWidth;
        el.setAttribute("data-play", "");
      } else if (e && e.boundingClientRect.top > 0) el.removeAttribute("data-play");
    }, { threshold: 0.6 });
    watch.observe(el);
    return () => { watch.disconnect(); el.removeAttribute("data-armed"); el.removeAttribute("data-play"); };
  }, []);
  const grad = `${id}-arch`, fade = `${id}-fade`, mask = `${id}-mask`;
  return (
    <div ref={ref} className="foot-bridge relative" aria-hidden="true">
      <span className="foot-word font-deva">{word}</span>
      <svg viewBox={`-10 0 ${END + 20} 214`} className="relative block h-auto w-full overflow-visible">
        <defs>
          {/* the arches shade from the brand blue to the mark's bright blue at the middle and back */}
          <linearGradient id={grad} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={END} y2="0">
            <stop offset="0" className="foot-stop-a" />
            <stop offset="0.5" className="foot-stop-b" />
            <stop offset="1" className="foot-stop-a" />
          </linearGradient>
          <linearGradient id={fade} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={mask} maskUnits="userSpaceOnUse" x="-10" y={DECK} width={END + 20} height="64">
            <rect x="-10" y={DECK} width={END + 20} height="64" fill={`url(#${fade})`} />
          </mask>
        </defs>
        {/* the reflection: flattened under the deck and fading out, built in step with the bridge */}
        <g className="foot-reflect" mask={`url(#${mask})`}>
          <g transform={`matrix(1 0 0 -0.42 0 ${DECK * 1.42})`}>
            <Structure stroke={`url(#${grad})`} />
          </g>
        </g>
        <path className="foot-deck" d={`M0 ${DECK}H${END}`} pathLength={1} />
        <Structure stroke={`url(#${grad})`} />
        <path className="foot-trail" d={RUN} pathLength={1} />
        <circle className="foot-halo" cx={END} cy={DECK} r={8} />
        <circle className="foot-runner" r={6} style={{ offsetPath: `path("${RUN}")` }} />
      </svg>
    </div>
  );
}
