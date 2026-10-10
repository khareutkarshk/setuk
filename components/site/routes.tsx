import type { CSSProperties } from "react";

/**
 * The inner pages' hero backdrop: Setuk as a setu. A few nodes (offices, booths, citizens) joined by
 * fine curved routes. The routes draw in once, then breathe: each brightens and settles on its own
 * slow clock, and every node carries a soft glow that swells and fades. Nothing travels across the
 * screen. A slow wash of light drifts behind. SVG and CSS only (the routes-* rules in
 * app/globals.css), no script; reduced motion leaves it drawn and still. Colour is currentColor.
 */

type P = readonly [number, number];

/* Laid out in a 1440 x 720 box; only the right part (the viewBox) is drawn, top right of the hero */
const NODES: P[] = [
  [700, 230], [930, 120], [1010, 360], [1180, 240], [1370, 90], [1330, 430], [1110, 560], [860, 520], [1420, 640]
];

/* [from, to, bend]; bend lifts the curve off the straight line, in px, either side */
const ROUTES: [number, number, number][] = [
  [0, 1, -40], [0, 2, 50], [1, 3, -50], [3, 4, 40], [2, 3, -30], [3, 5, 50], [2, 6, -40], [6, 5, 30], [7, 2, 40], [7, 6, -30], [5, 8, -30], [1, 4, -60]
];

function curve(i: number) {
  const [a, b, bend] = ROUTES[i];
  const [x1, y1] = NODES[a];
  const [x2, y2] = NODES[b];
  const len = Math.hypot(x2 - x1, y2 - y1);
  // control points a third and two thirds along, pushed out along the normal
  const nx = (-(y2 - y1) / len) * bend;
  const ny = ((x2 - x1) / len) * bend;
  const r = (n: number) => Math.round(n);
  return `M${x1} ${y1}C${r(x1 + (x2 - x1) / 3 + nx)} ${r(y1 + (y2 - y1) / 3 + ny)} ${r(x1 + (2 * (x2 - x1)) / 3 + nx)} ${r(y1 + (2 * (y2 - y1)) / 3 + ny)} ${x2} ${y2}`;
}

/* each piece keeps its own slow clock, so the breathing never falls into step */
const clock = (i: number, base: number, spread: number) =>
  ({ "--d": `${(i * 0.14).toFixed(2)}s`, "--b": `${base + ((i * 7) % spread)}s`, "--bd": `${-((i * 3.7) % base).toFixed(1)}s` }) as CSSProperties;

export function Routes({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`routes pointer-events-none absolute inset-0 ${className}`}>
      <span className="routes-wash routes-wash-a" />
      <span className="routes-wash routes-wash-b" />
      <svg viewBox="660 40 800 640" fill="none" className="routes-map">
        <defs>
          {/* a glow that fades to nothing at its edge, so halos read as light rather than discs */}
          <radialGradient id="routes-glow">
            <stop offset="0" stopColor="currentColor" stopOpacity="1" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          {ROUTES.map((_, i) => <path key={i} d={curve(i)} pathLength={1} className="routes-line" style={clock(i, 9, 6)} />)}
        </g>
        <g fill="currentColor">
          {NODES.map(([x, y], i) => (
            <g key={i} className="routes-node" style={clock(i, 7, 5)}>
              <circle cx={x} cy={y} r="26" fill="url(#routes-glow)" className="routes-halo" />
              <circle cx={x} cy={y} r={i % 3 ? 2.6 : 3.8} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
