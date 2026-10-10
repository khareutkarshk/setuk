/**
 * The inner pages' hero backdrop: Setuk as a setu. A few nodes (offices, booths, citizens) joined by
 * faint curved routes, with a light travelling along some of them like a request on its way and a
 * reply coming back (green), and a node that pings when one arrives. A slow wash of light drifts
 * behind. SVG and CSS only (the routes-* rules in app/globals.css), no script; reduced motion
 * leaves the routes still. Colour comes from currentColor, so set it with text-* classes.
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

/* Lights: [route, duration s, delay s, reply?]. Negative delays start them mid-journey */
const LIGHTS: [number, number, number, boolean][] = [
  [0, 7, -1.5, false], [2, 8, -4, false], [3, 6.5, -2.2, true], [5, 9, -6, false], [6, 7.5, -3.1, true], [8, 8.5, -0.4, false], [10, 7, -5.2, true]
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

export function Routes({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`routes pointer-events-none absolute inset-0 ${className}`}>
      <span className="routes-wash routes-wash-a" />
      <span className="routes-wash routes-wash-b" />
      <svg viewBox="660 40 800 640" fill="none" className="routes-map">
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" strokeLinecap="round" className="routes-lines">
          {ROUTES.map((_, i) => <path key={i} d={curve(i)} />)}
        </g>
        {LIGHTS.map(([r, dur, delay, reply], k) => {
          const style = { animationDuration: `${dur}s`, animationDelay: `${delay}s` };
          const [x, y] = NODES[ROUTES[r][1]];
          return (
            <g key={k} className={reply ? "routes-reply" : undefined}>
              <path d={curve(r)} pathLength={100} className="routes-glow" style={style} />
              <path d={curve(r)} pathLength={100} className="routes-light" style={style} />
              {/* the arriving end pings on the same clock, as the light reaches it */}
              <circle cx={x} cy={y} r="14" className="routes-ping" style={style} />
            </g>
          );
        })}
        <g fill="currentColor" className="routes-nodes">
          {NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 3 : 4.5} />)}
        </g>
      </svg>
    </div>
  );
}
