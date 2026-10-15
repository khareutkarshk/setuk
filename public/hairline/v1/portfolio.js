/**
 * Portfolio: a turntable carrying four client offices (a domed assembly, a
 * long office block, a municipal tower, a panchayat hut) round a low hub.
 * Pointer motion over the platter pushes it round; friction bleeds the spin,
 * and a spring catches it on the nearest detent with one office facing the
 * viewer in the bright stroke. The first office a hand reaches is pulled
 * round to the front. Rim dots count the clients. The slider is the coast, s.
 *
 * The pattern: push the camera. Friction, then a spring; the pointer read on
 * a fixed disc, the office it lands on picked from the target pose, and the
 * paint order re-sorted by depth as the platter turns.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, prism, rings, rrect, ringAt, run, seg, unproj,
  spring, stepS, reducedMotion, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const RP = 67, RB = 54, ZB = 15, ZT = 22, RC = 40, RD = 62.5, HUB = 9;
// detents sit 17° off the axis; each office is turned so that at a detent it stands square to the view
const Q = Math.PI / 2, OFF = 0.3, A0 = Math.PI / 4 + OFF, ROT = Math.PI / 4 - OFF;
const WMAX = 10, GAIN = 3, CATCH = 0.5, REACH = 24;

const disc = (r, n = 8) => rrect(-r, -r, r, r, r, n);
/** A part: rings stacked at heights, hulled into its silhouette, and one crease ring at its height. */
const part = (layers, crease) => ({ layers, crease });
const block = (x0, y0, x1, y1, r, b, z0, z1) => {
  const [o, i] = rings(x0, y0, x1, y1, r, b);
  return part([[o, z0], [o, z1]], [i, z1]);
};
const drum = (r, b, z0, z1, n) => part([[disc(r, n), z0], [disc(r, n), z1]], [disc(r - b, n), z1]);
/** Marks on faces, each [u0, v0, z0, u1, v1, z1, nu, nv]: drawn dim, and only while their face is turned to the viewer. */
const cols = (r, n, z0, z1) => Array.from({ length: n }, (_, k) => {
  const c = Math.cos((2 * Math.PI * k) / n), s = Math.sin((2 * Math.PI * k) / n);
  return [r * c, r * s, z0, r * c, r * s, z1, c, s];
});
const floors = (x0, y0, x1, y1, i, zs) => zs.flatMap((z) => [
  [x0 + i, y1, z, x1 - i, y1, z, 0, 1], [x0 + i, y0, z, x1 - i, y0, z, 0, -1], [x1, y0 + i, z, x1, y1 - i, z, 1, 0], [x0, y0 + i, z, x0, y1 - i, z, -1, 0],
]);

/** The four offices in local coordinates: u along the rim, v out from the centre, z up from the platter top. */
const OFFICES = [
  { h: 30, marks: cols(17, 16, 1.6, 8.4), parts: [ // a domed assembly: a colonnaded drum, a stepped dome, a finial
    drum(17, 1.4, 0, 10),
    part([[disc(14.5), 10], [disc(14), 14], [disc(12.2), 18], [disc(9.2, 6), 21.5], [disc(5.3, 4), 24.3], [disc(2.3, 3), 25.3]], [disc(12.8), 14]),
    drum(1.8, 0.6, 25, 30, 3),
  ] },
  { h: 17, marks: floors(-21, -7.5, 21, 7.5, 3, [4, 8]), parts: [ // a long low office block with a stair head on its roof
    block(-21, -7.5, 21, 7.5, 3, 1.4, 0, 12),
    block(-16, -4, -5, 4, 1.6, 0.8, 12, 17),
  ] },
  { h: 55, marks: floors(-9, -9, 9, 9, 3.4, [13, 23, 33]), parts: [ // a tall municipal tower: a shaft, a setback, a pointed cap
    block(-9, -9, 9, 9, 3.4, 1.3, 0, 38),
    block(-6.2, -6.2, 6.2, 6.2, 2.4, 1, 38, 48),
    part([[rrect(-4.4, -4.4, 4.4, 4.4, 1.8, 3), 48], [rrect(-0.9, -0.9, 0.9, 0.9, 0.9, 2), 55]], [rrect(-3.6, -3.6, 3.6, 3.6, 1.2, 3), 48.6]),
  ] },
  { h: 20, marks: [[-2, 7, 0, -2, 7, 5, 0, 1], [-2, 7, 5, 2, 7, 5, 0, 1], [2, 7, 5, 2, 7, 0, 0, 1]], parts: [ // a panchayat hut: a door, low walls, a pitched roof
    block(-8.5, -7, 8.5, 7, 2, 1, 0, 8),
    part([[rrect(-11.5, -9.5, 11.5, 9.5, 1.8, 3), 8], [rrect(-7, -0.9, 7, 0.9, 0.9, 2), 20]], [rrect(-6.6, -0.45, 6.6, 0.45, 0.45, 2), 20]),
  ] },
];
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.95), box = [];
  for (let k = 0; k < 24; k++) {
    const c = Math.cos((k * Math.PI) / 12), s = Math.sin((k * Math.PI) / 12);
    box.push([RP * c, RP * s, ZT], [RP * c, RP * s, ZB], [RB * c, RB * s, 0], [(RC + 6) * c, (RC + 6) * s, ZT + 55]);
  }
  fit(C, box, 200, 166);
  const P = proj(C), front = facing(C);

  // the base and the platter never move: a round platter is the same drawing at any angle
  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, disc(RB, 14), disc(RB - 2, 14), 0, ZB));
  put(solid(g), prism(P, front, disc(RP, 16), disc(RP - 2.2, 16), ZB, ZT));
  const dotsG = mk("g", {}, g);
  const hub = { k: 4, depth: 0, g: mk("g", {}, g), parts: [] };
  put(solid(hub.g), prism(P, front, disc(HUB), disc(HUB - 1.4), ZT, ZT + 6));
  put(solid(hub.g), prism(P, front, disc(4.8, 4), disc(3.8, 4), ZT + 6, ZT + 10));
  const offs = OFFICES.map((o, k) => {
    const og = mk("g", {}, g);
    const dots = Array.from({ length: k + 1 }, () => flatDot(dotsG, C, 0.95, "dot off"));
    const parts = o.parts.map((p) => ({ ...p, el: solid(og) }));
    return { k, h: o.h, g: og, depth: 0, dots, parts, marks: o.marks, mk: mk("path", { class: "lo nf" }, og) };
  });
  const all = offs.concat(hub);

  let tau = value, th = A0, w = 0, aim = A0, held = true, over = false, reached = false, last = null, lit = -1, drawn = NaN, order = "";
  const sp = spring(A0, { eps: 0.002 });
  const snap = (a) => A0 + Q * Math.round((a - A0) / Q);
  const frontOf = (a) => (((Math.round((A0 - a) / Q)) % 4) + 4) % 4;

  /** Office k turned with the platter to angle a: its rings, carried round the centre. */
  function drawOffice(o, a) {
    const c = Math.cos(a - Q + ROT), s = Math.sin(a - Q + ROT), cx = RC * Math.cos(a), cy = RC * Math.sin(a);
    const X = (u, v, z) => P(cx + u * c - v * s, cy + u * s + v * c, ZT + z), N = (nu, nv) => ({ nu: nu * c - nv * s, nv: nu * s + nv * c });
    const T = (ring) => ring.map((q) => ({ ...q, u: cx + q.u * c - q.v * s, v: cy + q.u * s + q.v * c, ...N(q.nu, q.nv) }));
    for (const p of o.parts) {
      const pts = [].concat(...p.layers.map(([r, z]) => ringAt(P, T(r), ZT + z)));
      put(p.el, { sil: poly(hull(pts)), crease: open(ringAt(P, run(T(p.crease[0]), front), ZT + p.crease[1])) });
    }
    // a mark shows only on a face clearly turned to the viewer (toward +x +y), so none doubles a silhouette
    o.mk.setAttribute("d", o.marks.filter((m) => { const n = N(m[6], m[7]); return n.nu + n.nv > 0.4; }).map((m) => seg(X(m[0], m[1], m[2]), X(m[3], m[4], m[5]))).join(""));
    // its dots sit in a row along the rim, outside it
    const ex = Math.cos(a), ey = Math.sin(a);
    o.dots.forEach((el, d) => { const u = (d - (o.dots.length - 1) / 2) * 3.6; place(el, P(RD * ex - u * ey, RD * ey + u * ex, ZT)); });
    o.depth = cx + cy;
  }

  function draw(a) {
    if (a === drawn) return;
    drawn = a;
    offs.forEach((o) => drawOffice(o, a + o.k * Q));
    // depth order changes as it turns: move the groups, back to front
    const sorted = all.slice().sort((x, y) => x.depth - y.depth), key = sorted.map((o) => o.k).join();
    if (key !== order) { order = key; let prev = dotsG; for (const o of sorted) { prev.after(o.g); prev = o.g; } }
    const f = frontOf(a);
    if (f !== lit) {
      lit = f;
      offs.forEach((o) => {
        o.parts.forEach((p) => p.el.sil.classList.toggle("hi", o.k === f));
        o.dots.forEach((el) => el.classList.toggle("off", o.k !== f));
      });
    }
  }

  function label(moving) {
    const t = over || moving ? `client ${frontOf(sp.x) + 1}` : "rest";
    if (read.textContent !== t) read.textContent = t;
  }

  const B = register(stage, (dt) => {
    if (!held) {
      th += w * dt; w *= Math.exp(-dt / tau);
      // friction has bled the spin: the detent nearest where it would stop catches it; a hand still on it keeps the rest of its aim
      if (Math.abs(w) * tau < CATCH || reducedMotion()) { held = true; aim = th + w * tau; sp.t = snap(aim); w = 0; if (!over) aim = sp.t; }
      else sp.t = th;
    }
    const m = stepS(sp, dt) || !held;
    draw(sp.x);
    label(m);
    return m;
  });
  bag.add(B.unregister);

  // let go of the detent, keeping the aim: the coast from here ends there (th + w·tau), so slow drags add up
  const free = () => { if (held) { th = sp.x; w = (aim - sp.x) / tau; held = false; } };
  const away = () => { over = reached = false; last = null; if (held) aim = sp.t; };
  /** Where the platter is headed: its detent if caught, else where the coast ends. */
  const target = () => (held ? sp.t : snap(th + w * tau));

  /** The office a hand lands on, read from the target pose, never the pose on screen. */
  function landed(p) {
    const at = target();
    let best = -1, bd = REACH;
    offs.forEach((o) => {
      // the office's upright body at its target pose: from its foot to its top
      const a = at + o.k * Q, f = P(RC * Math.cos(a), RC * Math.sin(a), ZT), t = P(RC * Math.cos(a), RC * Math.sin(a), ZT + o.h);
      const d = Math.hypot(p[0] - f[0], Math.max(0, p[1] - f[1], t[1] - p[1]));
      if (d < bd) { bd = d; best = o.k; }
    });
    return best;
  }

  function move(p) {
    const q = unproj(C, p[0], p[1], ZT), r = Math.hypot(q[0], q[1]);
    const k = reached ? -1 : landed(p), on = r < RP + 6 || k >= 0;
    if (k >= 0) {
      // the first office a hand reaches on each visit is pulled round to the front: a push sized to coast to its detent
      reached = true;
      const at = target(), want = A0 - k * Q, D = want + 2 * Math.PI * Math.round((at - want) / (2 * Math.PI));
      if (k !== frontOf(at)) { free(); w = clamp((D - th) / tau, -WMAX, WMAX); }
    } else if (on && last && r > HUB + 4 && last.r > HUB + 4) {
      // motion across the disc pushes the rim along with it
      const d = Math.atan2(Math.sin(Math.atan2(q[1], q[0]) - last.a), Math.cos(Math.atan2(q[1], q[0]) - last.a));
      if (Math.abs(d) > 1e-3) { free(); w = clamp(w + d * GAIN, -WMAX, WMAX); }
    }
    if (on) { over = true; last = { a: Math.atan2(q[1], q[0]), r }; } else away();
    B.wake();
  }

  bag.add(pointer(stage, { move, leave: () => { away(); B.wake(); } }));
  bag.add(() => svg.replaceChildren());
  draw(A0);
  read.textContent = "rest";

  return {
    set: (v) => { tau = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "portfolio",
  means: "Four client offices share one turntable: push it round, and it coasts to a stop with one office facing you.",
  rules: [1, 3, 6, 8],
  range: [0.35, 0.7, 1.4],
  tour: [[125, 172], [205, 250], [300, 205], null],
  mount,
});
