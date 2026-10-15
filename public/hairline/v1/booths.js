/**
 * Booths: an assembly constituency in miniature. A raised plate cut to an
 * uneven, lobed boundary carries thirty-odd polling booths, small huts with
 * pitched roofs, scattered across it like villages. The pointer is put back on
 * the map; the booths within reach rise on their springs, falling off with
 * distance, and the one nearest it takes the bright stroke and goes to the
 * read-out by its part number. Parts are numbered along a serpentine, so
 * neighbours have close numbers. At rest the map swells in two places and the
 * home booth is lit. The slider is the reach, in world units.
 *
 * The pattern: a continuous field, as Terrain. Springs, a clamped falloff, a
 * hit test on the plate's top (which never moves), and a composed rest.
 */
const {
  Cam, facing, fillet, fit, hull, open, poly, prism, proj, rings, ringAt, run, unproj,
  spring, stepS, mk, pointer, put, register, disposer, solid,
} = HL;

// The boundary, from the far corner round, and a fillet radius for each of its corners.
const OUT = [[8, 22], [40, 4], [66, 18], [100, 0], [134, 16], [148, 50], [124, 72], [150, 104], [128, 138], [94, 126], [66, 150], [30, 136], [6, 108], [24, 80], [0, 50]];
const RAD = [10, 8, 6, 8, 10, 8, 7, 9, 10, 7, 9, 10, 8, 7, 9];
const PB = 6, L = 9, W = 7, EAVE = 1.3, RH = 5, H0 = 3, HMAX = 28, DMIN = 17;

/** The share of full height at u reaches from the pointer: 1 → .31 at 42% → .09 at the edge and beyond. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094;
const area = (p) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0);

/** The outline moved inward by d (outward when d is negative), corner by corner. */
function inset(pts, d) {
  const n = pts.length, s = Math.sign(area(pts));
  const nrm = (q, r) => { const l = Math.hypot(r[0] - q[0], r[1] - q[1]); return [(-s * (r[1] - q[1])) / l, (s * (r[0] - q[0])) / l]; };
  return pts.map((p, i) => {
    const m1 = nrm(pts[(i + n - 1) % n], p), m2 = nrm(p, pts[(i + 1) % n]), k = d / (1 + m1[0] * m2[0] + m1[1] * m2[1]);
    return [p[0] + k * (m1[0] + m2[0]), p[1] + k * (m1[1] + m2[1])];
  });
}

function inside(pts, [x, y]) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Open polylines over each cyclic run of edges that pass keep (edge i joins vertex i to i + 1), capped by end(i) when given. */
function runs(n, keep, at, end) {
  let s = 0, cur = null;
  while (s < n && keep(s)) s++;
  const out = [];
  for (let k = 1; k <= n; k++) {
    const i = (s + k) % n;
    if (keep(i)) { if (!cur) cur = end ? [end(i), at(i)] : [at(i)]; cur.push(at((i + 1) % n)); }
    else if (cur) { if (end) cur.push(end(i)); out.push(open(cur)); cur = null; }
  }
  return out.join("");
}

/**
 * The plate, painted once. Its outline is not convex, so it is not a prism: the
 * skirt (the sides that face the camera) goes down first, then the top, which
 * covers whatever of the skirt lies behind a nearer lobe, then the far edge.
 */
function plate(P, g) {
  const loop = fillet(OUT, RAD), n = loop.length;
  const T = loop.map(([x, y]) => P(x, y, 0)), Bt = loop.map(([x, y]) => P(x, y, -PB));
  const s = Math.sign(area(T)), fr = (i) => s * (T[(i + 1) % n][0] - T[i][0]) < 0;
  let quads = poly(Bt);
  for (let i = 0; i < n; i++) if (fr(i)) quads += poly([Bt[i], Bt[(i + 1) % n], T[(i + 1) % n], T[i]]);
  mk("path", { d: quads, class: "fo" }, g);
  mk("path", { d: runs(n, fr, (i) => Bt[i], (i) => T[i]), class: "nf sil" }, g);
  mk("path", { d: poly(T), class: "fo" }, g);
  mk("path", { d: runs(n, (i) => !fr(i), (i) => T[i]), class: "nf sil" }, g);
  // the crease, a unit or two in from the front edges, and the boundary drawn on the map
  const ci = fillet(inset(OUT, 1.8), RAD).map(([x, y]) => P(x, y, 0)), m = ci.length;
  const cs = Math.sign(area(ci));
  mk("path", { d: runs(m, (i) => cs * (ci[(i + 1) % m][0] - ci[i][0]) < 0, (i) => ci[i]), class: "nf lo" }, g);
  mk("path", { d: poly(fillet(inset(OUT, 7), RAD).map(([x, y]) => P(x, y, 0))), class: "nf dash" }, g);
}

/** The booths: darts thrown inside the boundary and kept apart, numbered along a serpentine from the far side. */
function layout() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const safe = inset(OUT, 8), pts = [];
  for (let t = 0; t < 4000; t++) {
    const p = [rnd() * 150, rnd() * 150, rnd() < 0.5];
    if (inside(safe, p) && pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= DMIN)) pts.push(p);
  }
  const row = (p) => Math.floor(p[1] / 24);
  pts.sort((a, b) => row(a) - row(b) || (row(a) % 2 ? b[0] - a[0] : a[0] - b[0]));
  return pts.map(([x, y, ax], k) => {
    const hx = (ax ? L : W) / 2, hy = (ax ? W : L) / 2, e = EAVE;
    // a dune of two rises: the larger over the west of the map, the smaller in the north-east
    const h0 = H0 + 11 * Math.exp(-((x - 44) ** 2 + (y - 100) ** 2) / 1300) + 6 * Math.exp(-((x - 112) ** 2 + (y - 44) ** 2) / 700);
    const [ring, inner] = rings(x - hx, y - hy, x + hx, y + hy, 1.4, 0.8);
    const [foot] = rings(x - hx - e, y - hy - e, x + hx + e, y + hy + e, 1.6, 0.8);
    // the ridge: a thin strip along the long side, short of the ends, so the roof is hipped
    const rx = ax ? hx - 1.2 : 0.6, ry = ax ? 0.6 : hy - 1.2;
    const [top, cap] = rings(x - rx, y - ry, x + rx, y + ry, 0.6, 0.3);
    return { x, y, no: 101 + k, h0, ring, inner, foot, top, cap, sp: spring(h0, { eps: 0.04 }), drawn: NaN };
  });
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const booths = layout(), reach = inset(OUT, -6);
  const far = booths.reduce((a, b) => (b.x + b.y < a.x + a.y ? b : a));
  const home = booths.reduce((a, b) => (b.h0 > a.h0 ? b : a));
  // fitted to the plate and to the farthest booth at full height, so nothing leaves the frame in any pose
  const C = Cam(45, 0.5, 1.85);
  fit(C, OUT.map(([x, y]) => [x, y, -PB]).concat([[far.x, far.y, HMAX + RH]]), 200, 166);
  const P = proj(C), front = facing(C);
  let R = value, over = null, act = null;

  const g = mk("g", {}, svg);
  plate(P, g);
  // back to front: by ascending x + y, from the far corner
  for (const b of booths.slice().sort((p, q) => p.x + p.y - q.x - q.y)) {
    const grp = mk("g", {}, g);
    b.body = solid(grp); b.roof = solid(grp);
  }

  function draw(b) {
    const h = Math.max(0.6, b.sp.x);
    if (h === b.drawn) return;
    b.drawn = h;
    put(b.body, prism(P, front, b.ring, b.inner, 0, h));
    put(b.roof, {
      sil: poly(hull(ringAt(P, b.foot, h).concat(ringAt(P, b.top, h + RH)))),
      crease: open(ringAt(P, run(b.cap, front), h + RH)),
    });
  }

  /** The bright stroke goes to one booth: the body and the roof of the same hut. */
  function light(b) {
    if (b === act) return;
    if (act) { act.body.sil.classList.remove("hi"); act.roof.sil.classList.remove("hi"); }
    act = b;
    b.body.sil.classList.add("hi"); b.roof.sil.classList.add("hi");
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const b of booths) { if (stepS(b.sp, dt)) m = true; draw(b); }
    return m;
  });
  bag.add(B.unregister);

  /**
   * The booth under a screen point, tested against each booth's REST roof, a
   * plane that never moves (rule 01), and the place on the map it sets there;
   * null off the map.
   */
  function hit([sx, sy]) {
    let best = null, bd = Infinity;
    for (const b of booths) {
      const q = unproj(C, sx, sy, b.h0 + RH / 2), d = Math.hypot(q[0] - b.x, q[1] - b.y);
      if (d < bd) { bd = d; best = { b, q }; }
    }
    return bd < L || inside(reach, unproj(C, sx, sy, 0)) ? best : null;
  }

  function retarget() {
    for (const b of booths) b.sp.t = over ? H0 + (HMAX - H0) * falloff(Math.hypot(b.x - over.q[0], b.y - over.q[1]) / R) : b.h0;
    light(over ? over.b : home);
    read.textContent = over ? `booth ${over.b.no}` : "rest";
    B.wake();
  }
  retarget();

  bag.add(pointer(stage, {
    move: (p) => { over = hit(p); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "booths",
  means: "A constituency in miniature: the booths near the pointer rise, falling off with distance, and the one under it is lit.",
  rules: [1, 3, 5, 9],
  range: [30, 54, 84],
  tour: [[227, 121], [311, 189], [207, 236], null],
  mount,
});
