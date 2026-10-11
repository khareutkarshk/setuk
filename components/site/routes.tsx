import type { CSSProperties } from "react";

/**
 * The inner pages' hero backdrop: Setuk as a setu. A few nodes (offices, booths, citizens) joined by
 * fine curved routes. The routes draw in once, then breathe: they brighten and settle on slow clocks
 * of their own, and every node carries a soft glow that swells and fades. Nothing travels across the
 * screen. A slow wash of light drifts behind. SVG and CSS only (the routes-* rules in
 * app/globals.css), no script; reduced motion leaves it drawn and still. Colour is currentColor.
 *
 * Everything that loops animates only opacity and scale on whole boxes (an <svg> layer of routes, a
 * glow span), so the compositor runs it without layout or paint. Animating the paths and circles
 * inside one SVG instead made Chrome lay out and repaint the hero every frame, for as long as the
 * page stayed open.
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

/* The routes breathe in three layers, each on its own clock; route i sits in layer i % 3 */
const LAYERS = 3;
const VIEW = { x: 660, y: 40, w: 800, h: 640 };

export function Routes({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`routes pointer-events-none absolute inset-0 ${className}`}>
      <span className="routes-wash routes-wash-a" />
      <span className="routes-wash routes-wash-b" />
      <div className="routes-map">
        {Array.from({ length: LAYERS }, (_, k) => (
          <svg key={k} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} fill="none" className="routes-layer" style={clock(k, 9, 6)}>
            <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
              {ROUTES.map((_, i) => i % LAYERS === k && <path key={i} d={curve(i)} pathLength={1} className="routes-line" style={clock(i, 9, 6)} />)}
            </g>
          </svg>
        ))}
        {/* each node's glow, a gradient disc over its dot (52 units across, as the old r=26 halo) */}
        {NODES.map(([x, y], i) => (
          <span key={i} className="routes-node routes-glow" style={{ ...clock(i, 7, 5), left: `${((x - VIEW.x) / VIEW.w) * 100}%`, top: `${((y - VIEW.y) / VIEW.h) * 100}%`, width: `${(52 / VIEW.w) * 100}%` }}>
            <span className="routes-halo" />
          </span>
        ))}
        <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} fill="currentColor" className="routes-layer routes-dots">
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 2.6 : 3.8} className="routes-node" style={clock(i, 7, 5)} />
          ))}
        </svg>
      </div>
    </div>
  );
}
