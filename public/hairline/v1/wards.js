/**
 * Wards: a city in miniature. A rounded plinth is cut by straight streets into
 * a 4 × 3 grid of kerbed ward blocks, each holding one to three buildings, some
 * with a setback; the municipal tower, crowned by a round drum, stands near the
 * middle and holds the bright stroke at rest. The pointer picks a ward: its
 * buildings rise and its kerb and buildings take the bright stroke, while the
 * wards around it rise less, staggered outwards by distance on the 700ms lift
 * curve. The slider is the stagger, in ms.
 *
 * The hit test reads the rest pose only: each building's rest silhouette, front
 * to back, then the kerb plane, which never moves; a street reads its nearer
 * ward. A ward rising out from under the pointer cannot change the choice.
 */
const {
  Cam, circ, clamp, facing, fit, hull, prism, proj, ringAt, rings, rrect, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const NX = 4, NY = 3, B = 23, ST = 8, CELL = B + ST, M = 7, KT = 3, PB = 5, LIFT = 18;
const EX = (NX - 1) * CELL + B, EY = (NY - 1) * CELL + B;

/**
 * The wards, numbered row by row. Each holds its buildings back to front; a
 * building is its parts bottom to top, each [x0, y0, x1, y1, h] in the ward's
 * own units (a narrower part on top is a setback), or [cx, cy, r, h] for a
 * round drum; h is the height of the part's top above the kerb.
 */
const CITY = [
  [[[2, 2, 9, 21, 11]], [[12, 3, 21, 11, 15]]],
  [[[2, 4, 9, 21, 9]], [[12, 2, 21, 11, 22], [13.6, 3.6, 19.4, 9.4, 28]]],
  [[[3, 3, 11, 11, 19]], [[13, 2, 21, 21, 12]]],
  [[[4, 4, 19, 19, 8], [7, 7, 16, 16, 12]]],
  [[[3, 3, 11, 11, 17], [4.6, 4.6, 9.4, 9.4, 22]], [[2, 14, 21, 21, 8]]],
  [[[2, 2, 21, 21, 7], [7, 7, 16, 16, 42], [11.5, 11.5, 3.3, 50]]],
  [[[2, 2, 21, 9, 16]], [[3, 12, 11, 20, 10]], [[14, 12, 21, 21, 6]]],
  [[[3, 3, 12, 12, 14]], [[14, 5, 21, 19, 7]]],
  [[[3, 3, 20, 10, 7]], [[3, 13, 11, 20, 11]]],
  [[[2, 2, 11, 11, 13], [4, 4, 9, 9, 17]], [[13, 4, 21, 20, 6]]],
  [[[3, 3, 11, 20, 6]], [[13, 3, 21, 11, 9]]],
  [[[4, 4, 19, 19, 5]]],
];
const CIVIC = 5;

/** A round ring and its crease, moved to (cx, cy). */
const disc = (cx, cy, r) => [r, r - 0.8].map((q) => circ(q, 24).map((s) => ({ ...s, u: s.u + cx, v: s.v + cy })));

/** The lift a ward takes at u wards from the one picked: 1, then .36 next door, falling to nothing three away. */
const fall = (u) => (u === 0 ? 1 : clamp(0.36 * Math.exp(-1.1 * (u - 1)) - 0.02, 0, 1));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // The wards, each with its place on the grid and its buildings in world units.
  const wards = CITY.map((list, n) => {
    const i = n % NX, j = Math.floor(n / NX), ox = i * CELL, oy = j * CELL;
    const builds = list.map((parts) => {
      let z = 0;
      const ps = parts.map((p) => {
        const [ring, inner] = p.length === 4 ? disc(ox + p[0], oy + p[1], p[2]) : rings(ox + p[0], oy + p[1], ox + p[2], oy + p[3], 1.8, 0.9);
        const part = { ring, inner, h0: z, h1: p[p.length - 1] };
        z = part.h1;
        return part;
      });
      return { ps, top: z };
    });
    return { n, i, j, ox, oy, builds, tw: tween(0), drawn: NaN };
  });

  // The camera is fitted to every building lifted at once, so no pose leaves the frame.
  const C = Cam(45, 0.5, 1.9), pts = [];
  for (const [x, y] of [[-M, -M], [EX + M, -M], [-M, EY + M], [EX + M, EY + M]]) pts.push([x, y, -PB]);
  for (const w of wards) for (const b of w.builds) for (const q of b.ps[0].ring) pts.push([q.u, q.v, KT + b.top + LIFT]);
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // the plinth's round is large on screen, so its rings take more steps than rings() gives
  const pr = rrect(-M, -M, EX + M, EY + M, 10, 14), pi = rrect(2.2 - M, 2.2 - M, EX + M - 2.2, EY + M - 2.2, 7.8, 14);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  // Ward by ward along the diagonals from the far corner, each kerb before its
  // buildings, so appending is painting back to front. Buildings only grow up,
  // inside their own footprints, so the order holds in every pose.
  const order = wards.slice().sort((a, b) => a.i + a.j - (b.i + b.j));
  const hits = [];
  for (const w of order) {
    const [kr, ki] = rings(w.ox, w.oy, w.ox + B, w.oy + B, 3, 1.2);
    w.kerb = solid(g);
    put(w.kerb, prism(P, front, kr, ki, 0, KT));
    for (const b of w.builds) {
      for (const p of b.ps) p.el = solid(g);
      // the building's rest silhouette, for the hit test: it never moves
      const rest = [];
      for (const p of b.ps) rest.push(...ringAt(P, p.ring, KT + p.h0), ...ringAt(P, p.ring, KT + p.h1));
      hits.push({ w: w.n, poly: hull(rest) });
    }
  }

  /** Whether a screen point lies inside a convex polygon. */
  function inside([x, y], poly) {
    let s = 0;
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k], b = poly[(k + 1) % poly.length];
      const c = Math.sign((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]));
      if (c && s && c !== s) return false;
      if (c) s = c;
    }
    return true;
  }

  /** The ward under a screen point: the nearest building at rest, else the kerb plane; -1 off the grid. */
  function hit(p) {
    for (let k = hits.length - 1; k >= 0; k--) if (inside(p, hits[k].poly)) return hits[k].w;
    const [x, y] = unproj(C, p[0], p[1], KT);
    const i = Math.floor((x + ST / 2) / CELL), j = Math.floor((y + ST / 2) / CELL);
    return i >= 0 && i < NX && j >= 0 && j < NY ? j * NX + i : -1;
  }

  /** A ward's buildings with their tops raised by d; each part keeps its share of the height. */
  function draw(w, d) {
    if (d === w.drawn) return;
    w.drawn = d;
    for (const b of w.builds) {
      const s = (b.top + d) / b.top;
      for (const p of b.ps) put(p.el, prism(P, front, p.ring, p.inner, KT + p.h0 * s, KT + p.h1 * s));
    }
  }

  /** Lights a ward's buildings, and its kerb when the pointer picked it. */
  const bright = (w, on, kerb) => {
    w.kerb.sil.classList.toggle("hi", on && kerb);
    for (const b of w.builds) for (const p of b.ps) p.el.sil.classList.toggle("hi", on);
  };
  bright(wards[CIVIC], true, false);

  const L = register(stage, (_dt, now) => {
    let moving = false;
    for (const w of wards) { draw(w, tval(w.tw, now)); if (!tdone(w.tw, now)) moving = true; }
    return moving;
  });
  bag.add(L.unregister);

  let act = -1;
  /** Picks ward a (-1 lets every ward settle back). The stagger spreads out from the ward picked, or the one let go. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    const at = (w, k) => Math.hypot(w.i - (k % NX), w.j - Math.floor(k / NX));
    for (const w of wards) {
      tset(w.tw, a < 0 ? 0 : LIFT * fall(at(w, a)), now, at(w, from) * stag);
      bright(w, a < 0 ? w.n === CIVIC : w.n === a, a >= 0);
    }
    read.textContent = a < 0 ? "rest" : "ward " + String(a + 1).padStart(2, "0");
    L.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "wards",
  means: "A city in miniature: the ward under the pointer rises, and the wards around it rise less, in turn.",
  rules: [1, 2, 5, 6],
  range: [0, 40, 90],
  tour: [[140, 200], [262, 212], [222, 140], null],
  mount,
});
