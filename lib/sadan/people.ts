/**
 * Seated people for the "How we work" scenes: a consultant in a suit and a politician in a kurta
 * with a Nehru jacket. Built from lathed and deformed primitives, merged per bone and material so
 * each person costs about two dozen draw calls.
 *
 * Posing is target-driven. Each frame the choreography passes wrist targets, the direction the
 * back of each hand faces, a look-at point and a few expression values. Arms are solved with
 * two-bone IK in chest space and the head turns toward the look point, all eased so a new pose
 * never snaps. Frame: origin on the floor under the seat, +z forward, +y up, +x the person's left.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

export interface PersonLook {
  outfit: "suit" | "kurta";
  skin: string;
  hair: string;
  /** Hair only at the sides and back */
  receding?: boolean;
  mustache?: boolean;
  glasses?: boolean;
  /** Suit jacket, or the Nehru jacket over the kurta */
  jacket: string;
  /** Shirt, or the kurta */
  shirt: string;
  tie?: string;
  /** Trousers, or the pyjama */
  legs: string;
  shoes: string;
}

export interface PersonKit {
  /** Material factory for the tier (physical on high, standard elsewhere) */
  mat: (p: THREE.MeshPhysicalMaterialParameters) => THREE.MeshStandardMaterial;
  /** Radial segments for limbs and heads */
  seg: number;
  /** Fine weave normal map for cloth, or null */
  weave: THREE.Texture | null;
}

export interface Pose {
  /** Torso lean forward, radians */
  lean: number;
  /** World point to look at */
  look: THREE.Vector3;
  /** Wrist targets in the person's frame: right, then left */
  hands: [THREE.Vector3, THREE.Vector3];
  /** Direction the back of each hand faces, person's frame */
  backs: [THREE.Vector3, THREE.Vector3];
  /** Where the fingers point (person's frame), blended over the forearm direction by aimW (bent wrists, e.g. namaste) */
  aim: [THREE.Vector3, THREE.Vector3];
  aimW: number;
  /** Added head pitch (nodding), radians */
  nod: number;
  /** Head roll, radians */
  tilt: number;
  smile: number;
  /** Mouth opening, 0..1 */
  talk: number;
}

export interface Person {
  root: THREE.Group;
  /** Ease toward a pose; `dt` in seconds (0 snaps) */
  pose(p: Pose, dt: number, t: number): void;
  /** Head centre, world space */
  head: THREE.Object3D;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Y = V(0, 1, 0);

/* geometry helpers */
type G = THREE.BufferGeometry;
const lathe = (pts: [number, number][], seg: number, depth = 1, width = 1) => {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  g.scale(width, 1, depth);
  return g;
};
/** A tapered capsule along +y from 0 to len */
const limb = (r0: number, r1: number, len: number, seg: number) =>
  lathe([[0, -r0 * 0.95], [r0 * 0.62, -r0 * 0.76], [r0 * 0.93, -r0 * 0.36], [r0, 0], [r1, len], [r1 * 0.93, len + r1 * 0.36], [r1 * 0.62, len + r1 * 0.76], [0, len + r1 * 0.95]], seg);
/** Rotate a +y geometry to point from a to b and move it to a */
const along = (g: G, a: THREE.Vector3, b: THREE.Vector3) => {
  const d = b.clone().sub(a).normalize();
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d));
  g.translate(a.x, a.y, a.z);
  return g;
};
const sphere = (seg: number, sx: number, sy: number, sz: number, x = 0, y = 0, z = 0) => {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg * 0.75 | 0));
  g.scale(sx, sy, sz); g.translate(x, y, z);
  return g;
};
/** Merge parts that share a material; parts may differ in index and uv */
const merge = (parts: G[], uv = false) => {
  const prepped = parts.map((g) => {
    const q = g.index ? g.toNonIndexed() : g;
    if (q !== g) g.dispose();
    if (!uv && q.attributes.uv) q.deleteAttribute("uv");
    if (uv && !q.attributes.uv) q.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2));
    return q;
  });
  const out = mergeGeometries(prepped)!;
  prepped.forEach((g) => g.dispose());
  return out;
};

/** Radius of a lathe profile at height y (linear between points) */
const rAt = (pts: [number, number][], y: number) => {
  for (let i = 1; i < pts.length; i++) {
    const [r0, y0] = pts[i - 1], [r1, y1] = pts[i];
    if ((y - y0) * (y - y1) <= 0 && y1 !== y0) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
};
/** The head: a unit sphere point reshaped with a narrower jaw, a forward chin and a tucked nape */
const skullPoint = (x: number, y: number, z: number, k = 1) => {
  const low = Math.max(0, -y), front = Math.max(0, z);
  return [
    x * 0.078 * k * (1 - 0.32 * low * low),
    y * 0.108 * k + (y < 0 ? -0.006 * low : 0),
    z * 0.093 * k * (1 - 0.12 * low * low) + front * low * 0.014 - (z < 0 ? low * low * 0.02 : 0)
  ] as const;
};
const ABDOMEN: [number, number][] = [[0, -0.08], [0.12, -0.075], [0.166, -0.03], [0.171, 0.04], [0.163, 0.14], [0.159, 0.22], [0.162, 0.28], [0, 0.28]];
const CHEST: [number, number][] = [[0, -0.02], [0.159, -0.02], [0.169, 0.06], [0.179, 0.15], [0.177, 0.21], [0.16, 0.25], [0.115, 0.278], [0.056, 0.292], [0, 0.292]];

export function createPerson(look: PersonLook, kit: PersonKit): Person {
  const S = kit.seg;
  const ns = (k: number) => new THREE.Vector2(k, k);
  const m = (p: THREE.MeshPhysicalMaterialParameters) => kit.mat(p);
  const skin = m({ color: look.skin, roughness: 0.6, sheen: 0.25, sheenColor: "#e8a58a", sheenRoughness: 0.6 });
  const jacket = m({ color: look.jacket, roughness: 0.82, normalMap: kit.weave, normalScale: ns(0.45), sheen: 0.7, sheenColor: "#9aa3b5", sheenRoughness: 0.5 });
  const shirt = m({ color: look.shirt, roughness: 0.88, normalMap: kit.weave, normalScale: ns(0.25), sheen: 0.4, sheenColor: "#ffffff", sheenRoughness: 0.6 });
  const legs = look.legs === look.jacket ? jacket : look.legs === look.shirt ? shirt : m({ color: look.legs, roughness: 0.85, normalMap: kit.weave, normalScale: ns(0.35) });
  const shoes = m({ color: look.shoes, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const hair = m({ color: look.hair, roughness: 0.62, sheen: 0.6, sheenColor: "#ffffff", sheenRoughness: 0.35 });
  const eyeW = m({ color: "#e9e2da", roughness: 0.25 });
  const iris = m({ color: "#24160f", roughness: 0.15 });
  const lip = m({ color: "#7d4238", roughness: 0.55 });
  const dark = m({ color: "#2a1210", roughness: 0.8 });
  const metal = m({ color: "#1d1d1f", metalness: 0.6, roughness: 0.35 });
  const button = m({ color: look.outfit === "kurta" ? "#c99a45" : "#1b1d22", metalness: look.outfit === "kurta" ? 1 : 0, roughness: 0.35 });

  const root = new THREE.Group();
  const add = (parent: THREE.Object3D, g: G, mat: THREE.Material) => { const mesh = new THREE.Mesh(g, mat); mesh.castShadow = false; mesh.receiveShadow = true; parent.add(mesh); return mesh; };

  /* ---------- legs (static, seated) ---------- */
  const hipY = 0.58;
  const legParts: G[] = [], footParts: G[] = [], lapParts: G[] = [];
  legParts.push(sphere(S, 0.165, 0.095, 0.13, 0, hipY, -0.01));
  for (const s of [-1, 1]) {
    const hip = V(s * 0.093, hipY, 0.02), knee = V(s * 0.105, hipY - 0.05, 0.43), ankle = V(s * 0.105, 0.09, 0.47);
    legParts.push(along(limb(0.078, 0.056, hip.distanceTo(knee), S), hip, knee));
    legParts.push(along(limb(0.056, 0.04, knee.distanceTo(ankle), S), knee, ankle));
    const foot = new RoundedBoxGeometry(0.095, 0.075, 0.25, 2, 0.03);
    foot.translate(s * 0.108, 0.038, 0.545);
    footParts.push(foot);
  }
  if (look.outfit === "kurta") {
    /* the kurta falls over the lap and hangs at the hips, below the jacket */
    const lap = new RoundedBoxGeometry(0.37, 0.03, 0.34, 2, 0.012);
    lap.rotateX(0.1); lap.translate(0, hipY + 0.07, 0.15);
    lapParts.push(lap);
    for (const s of [-1, 1]) { const side = new RoundedBoxGeometry(0.03, 0.2, 0.3, 2, 0.01); side.translate(s * 0.19, hipY - 0.02, 0.1); lapParts.push(side); }
    lapParts.push(sphere(S, 0.178, 0.1, 0.142, 0, hipY + 0.03, -0.01));
  }
  add(root, merge(legParts, true), legs);
  add(root, merge(footParts), shoes);
  if (lapParts.length) add(root, merge(lapParts, true), shirt);

  /* ---------- torso ---------- */
  const spine = new THREE.Group();
  spine.position.set(0, hipY + 0.02, -0.03);
  root.add(spine);
  add(spine, lathe(ABDOMEN, S, 0.7), jacket);
  const chest = new THREE.Group();
  chest.position.set(0, 0.24, 0);
  spine.add(chest);
  const chestMeshParts: G[] = [lathe(CHEST, S, 0.66)];
  /* surface depth at the front centre line, chest frame (abdomen points are 0.24 lower) */
  const frontZ = (y: number) => (y >= -0.02 ? rAt(CHEST, y) * 0.66 : rAt(ABDOMEN, y + 0.24) * 0.7) + 0.003;
  for (const s of [-1, 1]) chestMeshParts.push(sphere(S, 0.062, 0.056, 0.062, s * 0.176, 0.226, 0));
  const chestMesh = add(chest, merge(chestMeshParts, true), jacket);
  const shirtParts: G[] = [], tieParts: G[] = [], buttonParts: G[] = [];
  if (look.outfit === "suit") {
    const v = new THREE.Shape(); v.moveTo(-0.052, 0.292); v.lineTo(0.052, 0.292); v.lineTo(0, 0.13); v.closePath();
    const vg = new THREE.ShapeGeometry(v); vg.translate(0, -0.13, 0); vg.rotateX(-0.24); vg.translate(0, 0.13, 0.121);
    shirtParts.push(vg);
    const collar = new THREE.TorusGeometry(0.05, 0.013, 6, S * 2); collar.rotateX(Math.PI / 2 - 0.25); collar.translate(0, 0.292, 0.006);
    shirtParts.push(collar);
    const tie = new THREE.Shape(); tie.moveTo(-0.012, 0.282); tie.lineTo(0.012, 0.282); tie.lineTo(0.02, 0.15); tie.lineTo(0, 0.125); tie.lineTo(-0.02, 0.15); tie.closePath();
    const tg = new THREE.ExtrudeGeometry(tie, { depth: 0.006, bevelEnabled: false }); tg.translate(0, -0.13, 0); tg.rotateX(-0.24); tg.translate(0, 0.13, 0.123);
    tieParts.push(tg);
    const knot = sphere(8, 0.014, 0.012, 0.008, 0, 0.275, 0.092); tieParts.push(knot);
    /* lapels along the edges of the V, tilted with it */
    for (const s of [-1, 1]) {
      const len = 0.172, lap = new THREE.BoxGeometry(0.018, len, 0.007);
      lap.translate(0, -len / 2, 0); lap.rotateZ(-s * 0.31); lap.translate(s * 0.06, 0.292, 0);
      lap.translate(0, -0.13, 0); lap.rotateX(-0.24); lap.translate(0, 0.13, 0.122);
      buttonParts.push(lap);
    }
    [0.1, 0.035].forEach((y) => buttonParts.push(sphere(6, 0.008, 0.008, 0.004, 0, y, frontZ(y))));
  } else {
    /* band collars: kurta under the jacket */
    const kc = new THREE.CylinderGeometry(0.05, 0.053, 0.05, S * 2, 1, true); kc.translate(0, 0.31, 0.004); shirtParts.push(kc);
    const jc = new THREE.CylinderGeometry(0.056, 0.06, 0.03, S * 2, 1, true); jc.translate(0, 0.292, 0.004);
    const jcm = add(chest, jc, jacket); jcm.material = jacket; (jacket as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    [0.25, 0.19, 0.13, 0.07, 0.01, -0.06, -0.13].forEach((y) => buttonParts.push(sphere(6, 0.0075, 0.0075, 0.005, 0, y, frontZ(y))));
  }
  if (shirtParts.length) add(chest, merge(shirtParts), shirt);
  if (tieParts.length) add(chest, merge(tieParts), m({ color: look.tie ?? "#7a1f2b", roughness: 0.45, sheen: 1, sheenColor: "#ff8a95", sheenRoughness: 0.35 }));
  if (buttonParts.length) add(chest, merge(buttonParts), look.outfit === "suit" ? jacket : button);

  /* ---------- neck and head ---------- */
  const neck = new THREE.Group();
  neck.position.set(0, 0.268, 0.0);
  chest.add(neck);
  add(neck, limb(0.048, 0.045, 0.1, S), skin);
  const head = new THREE.Group();
  head.position.set(0, 0.085, 0.012);
  head.rotation.order = "YXZ";
  neck.add(head);
  const HC = V(0, 0.1, 0.01);
  {
    const skull = new THREE.SphereGeometry(1, S * 2, S + 4);
    const pos = skull.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setXYZ(i, ...skullPoint(pos.getX(i), pos.getY(i), pos.getZ(i)));
    skull.deleteAttribute("uv"); skull.deleteAttribute("normal");
    const sk = mergeVertices(skull); sk.computeVertexNormals(); skull.dispose();
    sk.translate(HC.x, HC.y, HC.z);
    const parts: G[] = [sk];
    parts.push(sphere(8, 0.013, 0.027, 0.019, 0, HC.y - 0.008, HC.z + 0.094));
    parts.push(sphere(8, 0.012, 0.011, 0.011, 0, HC.y - 0.029, HC.z + 0.104));
    for (const s of [-1, 1]) {
      parts.push(sphere(8, 0.011, 0.012, 0.009, s * 0.009, HC.y - 0.032, HC.z + 0.098));
      parts.push(sphere(8, 0.011, 0.027, 0.018, s * 0.077, HC.y + 0.002, HC.z - 0.004));
    }
    add(head, merge(parts), skin);

    const eyes = new THREE.Group(); eyes.position.set(0, HC.y + 0.012, 0); head.add(eyes);
    const whites: G[] = [], irises: G[] = [];
    for (const s of [-1, 1]) {
      whites.push(sphere(10, 0.0115, 0.0105, 0.009, s * 0.03, 0, HC.z + 0.079));
      irises.push(sphere(8, 0.0068, 0.0068, 0.004, s * 0.03, 0, HC.z + 0.0875));
    }
    add(eyes, merge(whites), eyeW); add(eyes, merge(irises), iris);
    head.userData.eyes = eyes;

    const hairParts: G[] = [];
    for (const s of [-1, 1]) { const b = limb(0.0042, 0.0034, 0.028, 6); b.rotateZ(-s * (Math.PI / 2 + 0.12)); b.rotateY(s * 0.5); b.translate(s * 0.017, HC.y + 0.035, HC.z + 0.083); hairParts.push(b); }
    const cap = look.receding
      ? new THREE.SphereGeometry(1, S * 2, S, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0.24 * Math.PI, 0.38 * Math.PI)
      : new THREE.SphereGeometry(1, S * 2, S, 0, Math.PI * 2, 0, 0.6 * Math.PI);
    if (!look.receding) cap.rotateX(-0.9);
    {
      const cp = cap.attributes.position;
      for (let i = 0; i < cp.count; i++) cp.setXYZ(i, ...skullPoint(cp.getX(i), cp.getY(i), cp.getZ(i), look.receding ? 1.035 : 1.06));
      cap.computeVertexNormals();
    }
    cap.translate(HC.x, HC.y, HC.z);
    hairParts.push(cap);
    if (look.mustache) {
      const mu = new THREE.TorusGeometry(0.021, 0.0058, 6, 14, Math.PI); mu.scale(1.05, 0.42, 0.7); mu.translate(0, HC.y - 0.043, HC.z + 0.089);
      hairParts.push(mu);
    }
    const hairMesh = add(head, merge(hairParts), hair);
    if (look.receding) (hair as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    void hairMesh;

    /* mouth: a lip line that curves into a smile, and an opening for speech */
    const smileGeo = new THREE.TorusGeometry(0.02, 0.0034, 5, 12, Math.PI); smileGeo.rotateZ(Math.PI);
    const smile = add(head, smileGeo, lip); smile.position.set(0, HC.y - 0.055, HC.z + 0.085);
    const open = add(head, sphere(8, 0.013, 0.01, 0.004), dark); open.position.set(0, HC.y - 0.058, HC.z + 0.083);
    head.userData.smile = smile; head.userData.open = open;

    if (look.glasses) {
      const gl: G[] = [];
      for (const s of [-1, 1]) {
        const ring = new THREE.TorusGeometry(0.0175, 0.0017, 4, 20); ring.scale(1.22, 0.92, 1); ring.translate(s * 0.031, HC.y + 0.012, HC.z + 0.097); gl.push(ring);
        const arm = new THREE.BoxGeometry(0.0026, 0.0026, 0.088); arm.translate(s * 0.08, HC.y + 0.015, HC.z + 0.05); gl.push(arm);
      }
      const bridge = new THREE.BoxGeometry(0.016, 0.0026, 0.0026); bridge.translate(0, HC.y + 0.017, HC.z + 0.098); gl.push(bridge);
      add(head, merge(gl), metal);
    }
  }
  const headPoint = new THREE.Object3D(); headPoint.position.copy(HC); head.add(headPoint);

  /* ---------- arms ---------- */
  const L1 = 0.285, L2 = 0.255;
  const sleeve = look.outfit === "suit" ? jacket : shirt;
  interface Arm { s: number; sh: THREE.Group; el: THREE.Group; wr: THREE.Group; tgt: THREE.Vector3; back: THREE.Vector3; aim: THREE.Vector3 }
  const arms: Arm[] = [-1, 1].map((s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.19, 0.222, -0.005); chest.add(sh);
    add(sh, limb(0.049, 0.041, L1, S), sleeve);
    const el = new THREE.Group(); el.position.set(0, L1, 0); sh.add(el);
    add(el, limb(0.041, look.outfit === "suit" ? 0.034 : 0.037, L2 - 0.012, S), sleeve);
    if (look.outfit === "suit") { const c = new THREE.CylinderGeometry(0.036, 0.036, 0.022, S, 1, true); c.translate(0, L2 - 0.016, 0); add(el, c, shirt); }
    const wr = new THREE.Group(); wr.position.set(0, L2, 0); el.add(wr);
    const hp: G[] = [];
    const palm = new RoundedBoxGeometry(0.078, 0.092, 0.032, 2, 0.012); palm.translate(0, 0.046, 0); hp.push(palm);
    [0.075, 0.083, 0.079, 0.066].forEach((len, f) => {
      const fg = limb(0.0098, 0.0082, len, 6); fg.rotateX(-0.38 - f * 0.04); fg.translate(-s * (0.027 - f * 0.018), 0.086, -0.002); hp.push(fg);
    });
    const thumb = limb(0.012, 0.0095, 0.045, 6); thumb.rotateZ(-s * 0.75); thumb.rotateX(-0.35); thumb.translate(s * 0.032, 0.022, -0.012); hp.push(thumb);
    hp.push(limb(0.032, 0.03, 0.02, S));
    add(wr, merge(hp), skin);
    return { s, sh, el, wr, tgt: V(s * 0.16, 0.86, 0.42), back: V(0, 1, 0), aim: V(0, 1, 0) };
  });

  /* ---------- posing ---------- */
  const st = { lean: 0.06, look: V(0, 1.3, 2), nod: 0, tilt: 0, smile: 0, talk: 0, aimW: 0 };
  const tmpM = new THREE.Matrix4(), inv = new THREE.Matrix4(), qInv = new THREE.Quaternion(), q = new THREE.Quaternion();
  const vS = V(0, 0, 0), vT = V(0, 0, 0), vD = V(0, 0, 0), vE = V(0, 0, 0), vP = V(0, 0, 0), vB = V(0, 0, 0), vX = V(0, 0, 0);
  const basis = new THREE.Matrix4(), vAim = V(0, 0, 0);
  const solveArm = (a: Arm) => {
    /* target and hand orientation into chest space */
    vT.copy(a.tgt).applyMatrix4(inv);
    vB.copy(a.back).applyQuaternion(qInv).normalize();
    vS.copy(a.sh.position);
    vD.subVectors(vT, vS);
    const d = THREE.MathUtils.clamp(vD.length(), 0.08, L1 + L2 - 0.004);
    vD.normalize();
    const along1 = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - along1 * along1));
    vP.set(a.s * 0.55, -1, -0.45); vP.addScaledVector(vD, -vP.dot(vD)).normalize();
    vE.copy(vS).addScaledVector(vD, along1).addScaledVector(vP, h);
    vX.subVectors(vE, vS).normalize();
    a.sh.quaternion.setFromUnitVectors(Y, vX);
    const qUpper = a.sh.quaternion;
    vT.copy(vS).addScaledVector(vD, d);
    const dirF = vX.subVectors(vT, vE).normalize().clone();
    q.copy(qUpper).invert();
    a.el.quaternion.setFromUnitVectors(Y, dirF.clone().applyQuaternion(q));
    /* hand: fingers along the forearm, back of the hand toward `back` */
    const yA = dirF.lerp(vAim.copy(a.aim).applyQuaternion(qInv).normalize(), st.aimW).normalize(), zA = vB.addScaledVector(yA, -vB.dot(yA)).normalize(), xA = new THREE.Vector3().crossVectors(yA, zA);
    basis.makeBasis(xA, yA, zA);
    const qHand = new THREE.Quaternion().setFromRotationMatrix(basis);
    const qFore = qUpper.clone().multiply(a.el.quaternion);
    a.wr.quaternion.copy(qFore.invert().multiply(qHand));
  };
  const lk = V(0, 0, 0), hc = V(0, 0, 0);
  const blinkPhase = look.receding ? 2.1 : 0.4;

  const pose = (p: Pose, dt: number, t: number) => {
    const k = dt <= 0 ? 1 : 1 - Math.exp(-dt * 5);
    st.lean += (p.lean - st.lean) * k;
    st.look.lerp(p.look, dt <= 0 ? 1 : 1 - Math.exp(-dt * 4));
    st.nod += (p.nod - st.nod) * Math.min(1, k * 2.2);
    st.tilt += (p.tilt - st.tilt) * k;
    st.smile += (p.smile - st.smile) * (dt <= 0 ? 1 : 1 - Math.exp(-dt * 2.5));
    st.talk += (p.talk - st.talk) * Math.min(1, k * 3);
    st.aimW += (p.aimW - st.aimW) * k;
    arms.forEach((a, i) => { a.tgt.lerp(p.hands[i], dt <= 0 ? 1 : 1 - Math.exp(-dt * 6)); a.back.lerp(p.backs[i], k).normalize(); a.aim.lerp(p.aim[i], k); });

    /* breathing */
    const br = Math.sin(t * 1.7);
    spine.rotation.x = st.lean * 0.6 + br * 0.006;
    chest.rotation.x = st.lean * 0.4;
    chestMesh.scale.set(1 + br * 0.006, 1, 1 + br * 0.012);
    spine.updateMatrix(); chest.updateMatrix();
    tmpM.multiplyMatrices(spine.matrix, chest.matrix);
    inv.copy(tmpM).invert();
    qInv.copy(spine.quaternion).multiply(chest.quaternion).invert();
    arms.forEach(solveArm);

    /* head: look toward the target, neck takes part of the turn */
    root.updateWorldMatrix(true, false);
    lk.copy(st.look); root.worldToLocal(lk); lk.applyMatrix4(inv);
    hc.set(0, 0.268 + 0.085 + HC.y, 0.012 + HC.z);
    lk.sub(hc);
    const yaw = THREE.MathUtils.clamp(Math.atan2(lk.x, lk.z), -1.2, 1.2);
    const pitch = THREE.MathUtils.clamp(Math.atan2(-lk.y, Math.hypot(lk.x, lk.z)), -0.5, 0.6);
    neck.rotation.set(pitch * 0.35 - st.lean * 0.5, yaw * 0.4, 0, "YXZ");
    head.rotation.set(pitch * 0.65 + st.nod, yaw * 0.6, st.tilt, "YXZ");

    /* face: blink every few seconds, smile, mouth opening while talking */
    const bl = (t + blinkPhase) % 4.3;
    (head.userData.eyes as THREE.Object3D).scale.y = bl < 0.13 ? 0.15 : 1;
    const sm = head.userData.smile as THREE.Mesh, op = head.userData.open as THREE.Mesh;
    sm.scale.set(1 + st.smile * 0.15, 0.22 + st.smile * 0.45, 1);
    sm.position.y = HC.y - 0.055 + st.smile * 0.005;
    const o = st.talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 11) * Math.sin(t * 4.3)));
    op.scale.set(1 + st.smile * 0.2, 0.15 + o * 0.85, 1);
    op.visible = o > 0.04;
  };

  return { root, pose, head: headPoint };
}
