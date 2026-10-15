/**
 * Benches: the Lok Sabha chamber in miniature. A horseshoe of four raked bench
 * tiers round an open well, on a round plinth; at its open end the Speaker's
 * dais with a tall chair back, and the table in the well before it. The
 * pointer picks one bench block; it rises, as a member stands to speak, and
 * its neighbours rise less, staggered outwards by their distance in blocks on
 * the 700ms lift curve. At rest the front-row centre block, the member's own
 * seat, stands a little and holds the bright stroke. The slider is the
 * stagger, in ms.
 *
 * The blocks are annular sectors, which are not convex, so a hull will not do
 * for their outline: it is the top ring's upper edge and the foot ring's lower
 * edge, column by column. The hit test marches the pointer's ray down through
 * the rest heights, so a rising block never moves its own hit area.
 */
const {
  Cam, circ, facing, fit, open, poly, prism, proj, rrect, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const T = 4, NB = 7, R0 = 34, D = 13, GAP = 1.6, Z0 = 5, DZ = 6.5, GW = 4, RC = 2.6, CB = 1.1;
const AX = (60 * Math.PI) / 180, SPAN = (248 * Math.PI) / 180, TS = AX + Math.PI - SPAN / 2, STEP = SPAN / NB;
const RP = R0 + T * D + 6, PB = 5, LIFT = 15, SIT = 5, OWN = 3, TAU = 2 * Math.PI;
const top = (k) => Z0 + k * DZ;
/** A neighbour's share of the lift, by its distance in blocks: 1 → .48 → .26 → nothing from three and a bit away. */
const share = (d) => (d === 0 ? 1 : Math.max(0, 0.7 - 0.22 * d));

/** An annular sector from radius a to b between the radial lines at g0 and g1, each moved in by e, its corners rounded to rc: a ring of {u, v, nu, nv}. */
function sector(a, b, g0, g1, e, rc) {
  const out = [], cos = Math.cos, sin = Math.sin, H = Math.PI / 2;
  const add = (x, y, n) => out.push({ u: x, v: y, nu: cos(n), nv: sin(n) });
  const arc = (r, t0, t1, n0) => {
    const m = Math.max(2, Math.ceil((Math.abs(t1 - t0) * r) / 4));
    for (let i = 1; i < m; i++) { const t = t0 + ((t1 - t0) * i) / m; add(r * cos(t), r * sin(t), t + n0); }
  };
  const fil = (rho, ph, n0, sweep) => {
    for (let i = 0; i <= 4; i++) { const n = n0 + (sweep * i) / 4; add(rho * cos(ph) + rc * cos(n), rho * sin(ph) + rc * sin(n), n); }
  };
  const o0 = g0 + Math.asin((e + rc) / (b - rc)), o1 = g1 - Math.asin((e + rc) / (b - rc));
  const i0 = g0 + Math.asin((e + rc) / (a + rc)), i1 = g1 - Math.asin((e + rc) / (a + rc));
  arc(b, o0, o1, 0);
  fil(b - rc, o1, o1, g1 + H - o1);
  fil(a + rc, i1, g1 + H, i1 + H - g1);
  arc(a, i1, i0, Math.PI);
  fil(a + rc, i0, i0 + Math.PI, g0 - i0 + H);
  fil(b - rc, o0, g0 - H, o0 - g0 + H);
  return out;
}

/** A rounded rectangle in the chamber's own frame (u out along its axis, v across), turned into the world. */
function local(u0, v0, u1, v1, r) {
  const c = Math.cos(AX), s = Math.sin(AX);
  return rrect(u0, v0, u1, v1, r, 4).map((q) => ({ u: q.u * c - q.v * s, v: q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));
}

/**
 * A solid standing on a ring that need not be convex. Its outline is the
 * ring's upper edge lifted to z1 and its lower edge at z0, column by column
 * (screen x does not move with z); its crease, every run of the inner ring
 * that faces the camera, at z1. Returns at(z0, z1) → {sil, crease}.
 */
function stand(P, front, ring, inner) {
  const kz = P(0, 0, 0)[1] - P(0, 0, 1)[1], pts = ring.map((q) => P(q.u, q.v, 0));
  const xs = [...new Set(pts.map((p) => p[0]))].sort((m, n) => m - n), lo = [], hi = [];
  for (const x of xs) {
    let a = Infinity, b = -Infinity;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      if ((p[0] - x) * (q[0] - x) > 0) return;
      const ys = p[0] === q[0] ? [p[1], q[1]] : [p[1] + ((x - p[0]) / (q[0] - p[0])) * (q[1] - p[1])];
      for (const y of ys) { a = Math.min(a, y); b = Math.max(b, y); }
    });
    lo.push(a); hi.push(b);
  }
  const f = inner.map(front), s = f.indexOf(false), runs = [];
  let cur = null;
  for (let i = 1; i <= inner.length; i++) {
    const j = (s + i) % inner.length;
    if (!f[j]) { cur = null; continue; }
    if (!cur) runs.push((cur = []));
    cur.push(P(inner[j].u, inner[j].v, 0));
  }
  return (z0, z1) => ({
    sil: poly(xs.map((x, i) => [x, lo[i] - z1 * kz]).concat(xs.map((x, i) => [x, hi[i] - z0 * kz]).reverse())),
    crease: runs.map((r) => open(r.map(([x, y]) => [x, y - z1 * kz]))).join(""),
  });
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  // The camera is fitted to the plinth and the back tier with a block risen, so no pose leaves the frame.
  const C = Cam(45, 0.5, 1.5), box = circ(RP, 32).flatMap((q) => [[q.u, q.v, -PB], [q.u, q.v, 0]]);
  for (let t = TS; t <= TS + SPAN; t += 0.1) box.push([(RP - 7) * Math.cos(t), (RP - 7) * Math.sin(t), top(T - 1) + LIFT]);
  fit(C, box, 200, 166);
  const P = proj(C), front = facing(C);
  const depth = (x, y) => x + y;

  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, circ(RP, 64), circ(RP - 2.2, 64), -PB, 0));

  // The bench blocks, tier by tier from the front row; gangways run radially through every tier.
  const blocks = [];
  for (let k = 0; k < T; k++) for (let j = 0; j < NB; j++) {
    const a = R0 + k * D, b = a + D - GAP, g0 = TS + j * STEP, g1 = g0 + STEP, tm = g0 + STEP / 2, rm = (a + b) / 2;
    blocks.push({
      i: blocks.length, k, j, z: top(k), drawn: NaN, tw: tween(blocks.length === OWN ? SIT : 0),
      d: depth(rm * Math.cos(tm), rm * Math.sin(tm)),
      at: stand(P, front, sector(a, b, g0, g1, GW / 2, RC), sector(a + CB, b - CB, g0, g1, GW / 2 + CB, RC - CB)),
    });
  }
  // The table in the well, then the dais in two steps and the chair on it (seat, then its tall back),
  // each painted just after what it stands on: [u0, v0, u1, v1, r, b, z0, z1, depth].
  const on = (u) => depth(u * Math.cos(AX), u * Math.sin(AX)), dais = on(51);
  const fixed = [
    [7, -11, 15, 11, 2.6, 1, 0, 4.5, on(11)],
    [42, -18, 60, 18, 3, 1.1, 0, 4, dais],
    [46, -11, 59, 11, 2.6, 1, 4, 8, dais + 1e-4],
    [49, -4, 54, 4, 2, 0.9, 8, 12, dais + 2e-4],
    [54, -4.5, 57, 4.5, 1.4, 0.6, 8, 26, dais + 3e-4],
  ].map(([u0, v0, u1, v1, r, cb, z0, z1, d]) => ({ d, z0, z1, at: stand(P, front, local(u0, v0, u1, v1, r), local(u0 + cb, v0 + cb, u1 - cb, v1 - cb, r - cb)) }));

  // Painted back to front by the depth the camera sees.
  for (const p of [...blocks, ...fixed].sort((m, n) => m.d - n.d)) {
    p.el = solid(g);
    if (p.z0 !== undefined) put(p.el, p.at(p.z0, p.z1));
  }
  blocks[OWN].el.sil.classList.add("hi");

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of blocks) {
      const h = b.z + tval(b.tw, now);
      if (h !== b.drawn) { b.drawn = h; put(b.el, b.at(0, h)); }
      if (!tdone(b.tw, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  /** The block whose rest solid the pointer's ray meets first, marching down from the back tier's top; -1 for none. */
  function hit([sx, sy]) {
    for (let z = top(T - 1); z >= 0; z -= 0.5) {
      const [x, y] = unproj(C, sx, sy, z), k = Math.floor((Math.hypot(x, y) - R0) / D);
      const t = (((Math.atan2(y, x) - TS) % TAU) + TAU) % TAU;
      if (k >= 0 && k < T && z <= top(k) && t < SPAN) return k * NB + Math.floor(t / STEP);
    }
    return -1;
  }

  /** Stands block a (-1 sits everyone back down); the stagger spreads out from the block chosen, or the one let go. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), ch = a >= 0 ? blocks[a] : null, o = ch || blocks[act >= 0 ? act : OWN];
    act = a;
    for (const b of blocks) {
      const lift = ch ? LIFT * share(Math.hypot(b.k - ch.k, b.j - ch.j)) : b.i === OWN ? SIT : 0;
      tset(b.tw, lift, now, Math.hypot(b.k - o.k, b.j - o.j) * stag);
      b.el.sil.classList.toggle("hi", b.i === (ch ? a : OWN));
    }
    read.textContent = ch ? `seat ${ch.k + 1}·${ch.j + 1}` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "benches",
  means: "The Lok Sabha in miniature: the bench block under the pointer stands, and its neighbours rise less, in turn.",
  rules: [1, 2, 5, 9],
  range: [0, 40, 90],
  tour: [[179, 151], [231, 97], [284, 188], null],
  mount,
});
