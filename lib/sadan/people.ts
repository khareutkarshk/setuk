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
    x * 0.078 * k * (1 - 0.22 * low * low),
    y * 0.108 * k + (y < 0 ? -0.006 * low : 0),
    z * 0.093 * k * (1 - 0.12 * low * low) + front * low * 0.014 - (z < 0 ? low * low * 0.02 : 0)
  ] as const;
};
const gauss = (dx: number, dy: number, s2: number) => Math.exp(-(dx * dx + dy * dy) / s2);
/** Face relief on a skull point (head frame, metres): eye sockets, brow ridge, cheekbones and chin */
const sculpt = (x: number, y: number, z: number): [number, number, number] => {
  if (z <= 0.02) return [x, y, z];
  const w = Math.min(1, (z - 0.02) / 0.03);
  const brow = 0.004 * Math.exp(-((y - 0.03) ** 2) / 0.0001) * Math.exp(-(x * x) / 0.0025);
  const socket = 0.0036 * (gauss(x - 0.03, y - 0.012, 0.00018) + gauss(x + 0.03, y - 0.012, 0.00018));
  const cheek = 0.0035 * (gauss(x - 0.047, y + 0.02, 0.0003) + gauss(x + 0.047, y + 0.02, 0.0003));
  const chin = 0.005 * gauss(x, y + 0.09, 0.0003);
  return [x + Math.sign(x) * cheek * 0.5 * w, y, z + (brow - socket + cheek + chin) * w];
};
/** Depth of the front of the face at (x, y), head frame, before sculpting */
const faceZ = (x: number, y: number) => 0.093 * Math.sqrt(Math.max(0, 1 - (x / 0.078) ** 2 - (y / 0.108) ** 2));
/** Sum of two irregular blink cycles: 0 open, 1 shut */
const blinkAt = (t: number) => {
  const one = (x: number) => (x < 0.07 ? x / 0.07 : x < 0.17 ? 1 - (x - 0.07) / 0.1 : 0);
  return Math.max(one(t % 4.3), one((t * 1.13 + 1.9) % 6.7));
};
const hash = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
/** Height of the hairline (unit-sphere y) by azimuth from the front: forehead, temples, over the ears, nape */
const HAIRLINE: [number, number][] = [[0, 0.6], [0.5, 0.55], [0.85, 0.36], [1.12, 0.05], [1.3, 0.22], [1.7, 0.24], [2.2, -0.12], [Math.PI, -0.45]];
const hairlineAt = (az: number) => {
  const a = Math.abs(az);
  for (let i = 1; i < HAIRLINE.length; i++) {
    const [a0, h0] = HAIRLINE[i - 1], [a1, h1] = HAIRLINE[i];
    if (a <= a1) return h0 + ((h1 - h0) * (a - a0)) / (a1 - a0);
  }
  return HAIRLINE[HAIRLINE.length - 1][1];
};
const smoothstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Fine combed strands as a bump map, running from the crown down */
let strands: THREE.CanvasTexture | null = null;
const strandMap = () => {
  if (strands || typeof document === "undefined") return strands;
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const x = hash(i) * 256, w = 0.6 + hash(i + 0.5) * 1.4, v = 90 + hash(i + 0.25) * 90 | 0;
    g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, 85, x - 6, 170, x + 3, 256); g.stroke();
  }
  strands = new THREE.CanvasTexture(c);
  strands.wrapS = strands.wrapT = THREE.RepeatWrapping; strands.repeat.set(10, 1);
  return strands;
};
const ABDOMEN: [number, number][] = [[0, -0.08], [0.12, -0.075], [0.166, -0.03], [0.171, 0.04], [0.163, 0.14], [0.159, 0.22], [0.162, 0.28], [0, 0.28]];
const CHEST: [number, number][] = [[0, -0.02], [0.159, -0.02], [0.169, 0.06], [0.179, 0.15], [0.177, 0.21], [0.16, 0.25], [0.115, 0.278], [0.056, 0.292], [0, 0.292]];

export function createPerson(look: PersonLook, kit: PersonKit): Person {
  const S = kit.seg;
  const ns = (k: number) => new THREE.Vector2(k, k);
  const m = (p: THREE.MeshPhysicalMaterialParameters) => kit.mat(p);
  const skin = m({ color: look.skin, roughness: 0.55, sheen: 0.12, sheenColor: "#c98a74", sheenRoughness: 0.7, clearcoat: 0.08, clearcoatRoughness: 0.6 });
  /* sheen tinted from the cloth or hair itself, so dark suits and dark hair don't pick up a white glaze */
  const tint = (c: string, k: number) => new THREE.Color(c).lerp(new THREE.Color("#ffffff"), k);
  const jacket = m({ color: look.jacket, roughness: 0.85, normalMap: kit.weave, normalScale: ns(0.45), sheen: 0.3, sheenColor: tint(look.jacket, 0.25), sheenRoughness: 0.7 });
  const shirt = m({ color: look.shirt, roughness: 0.88, normalMap: kit.weave, normalScale: ns(0.25), sheen: 0.4, sheenColor: "#ffffff", sheenRoughness: 0.6 });
  const legs = look.legs === look.jacket ? jacket : look.legs === look.shirt ? shirt : m({ color: look.legs, roughness: 0.85, normalMap: kit.weave, normalScale: ns(0.35) });
  const shoes = m({ color: look.shoes, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const hair = m({ color: look.hair, roughness: 0.62, bumpMap: strandMap(), bumpScale: 1.2, sheen: 0.35, sheenColor: tint(look.hair, 0.3), sheenRoughness: 0.45 });
  const brow = m({ color: look.hair, roughness: 0.8 });
  const lash = m({ color: new THREE.Color(look.hair).multiplyScalar(0.6), roughness: 0.9 });
  const eyeW = m({ color: "#e2d8cc", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const iris = m({ color: "#3d2616", roughness: 0.3 });
  const pupil = m({ color: "#070404", roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02 });
  const lip = m({ color: new THREE.Color(look.skin).multiplyScalar(0.72).lerp(new THREE.Color("#8a3f3a"), 0.35), roughness: 0.45, clearcoat: 0.25, clearcoatRoughness: 0.35 });
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
  /* shoulders take the sleeve: jacket for the suit, the kurta under the sleeveless Nehru jacket */
  const shoulderParts: G[] = [];
  for (const s of [-1, 1]) shoulderParts.push(sphere(S, 0.058, 0.054, 0.058, s * 0.178, 0.222, -0.004));
  if (look.outfit === "suit") chestMeshParts.push(...shoulderParts);
  const chestMesh = add(chest, merge(chestMeshParts, true), jacket);
  const shirtParts: G[] = look.outfit === "suit" ? [] : shoulderParts, tieParts: G[] = [], buttonParts: G[] = [];
  if (look.outfit === "suit") {
    const v = new THREE.Shape(); v.moveTo(-0.052, 0.292); v.lineTo(0.052, 0.292); v.lineTo(0, 0.13); v.closePath();
    const vg = new THREE.ShapeGeometry(v); vg.translate(0, -0.13, 0); vg.rotateX(-0.24); vg.translate(0, 0.13, 0.121);
    shirtParts.push(vg);
    const collar = new THREE.TorusGeometry(0.057, 0.013, 6, S * 2); collar.rotateX(Math.PI / 2 - 0.25); collar.translate(0, 0.292, 0.006);
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
    const kc = new THREE.CylinderGeometry(0.059, 0.062, 0.05, S * 2, 1, true); kc.translate(0, 0.31, 0.004); shirtParts.push(kc);
    const jc = new THREE.CylinderGeometry(0.065, 0.069, 0.03, S * 2, 1, true); jc.translate(0, 0.292, 0.004);
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
  add(neck, limb(0.055, 0.051, 0.085, S), skin);
  const head = new THREE.Group();
  head.position.set(0, 0.07, 0.012);
  head.rotation.order = "YXZ";
  neck.add(head);
  const HC = V(0, 0.1, 0.01);
  /* eyeball centres, head frame */
  const EY = HC.y + 0.012, EZ = HC.z + 0.074, ER = 0.013;
  const face = (x: number, y: number, lift = 0) => V(x, HC.y + y, HC.z + faceZ(x, y) + lift);
  let eyes: THREE.Object3D, lidsUp: THREE.Object3D, lidsLow: THREE.Object3D, brows: THREE.Object3D, lowerLip: THREE.Object3D, smile: THREE.Mesh, open: THREE.Mesh;
  {
    const skull = new THREE.SphereGeometry(1, S * 2, S + 4);
    const pos = skull.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setXYZ(i, ...sculpt(...skullPoint(pos.getX(i), pos.getY(i), pos.getZ(i))));
    skull.deleteAttribute("uv"); skull.deleteAttribute("normal");
    const sk = mergeVertices(skull); sk.computeVertexNormals(); skull.dispose();
    sk.translate(HC.x, HC.y, HC.z);
    const parts: G[] = [sk];
    /* nose: a bridge that widens to the tip, with nostril wings */
    parts.push(along(limb(0.0062, 0.0092, 0.032, 8), face(0, 0.008, -0.004), face(0, -0.025, 0.005)));
    parts.push(sphere(10, 0.0078, 0.0074, 0.008, 0, HC.y - 0.029, HC.z + 0.093));
    for (const s of [-1, 1]) {
      parts.push(sphere(10, 0.0058, 0.0055, 0.0062, s * 0.0105, HC.y - 0.031, HC.z + 0.084));
      /* ears, swept back a little */
      const ear = sphere(8, 0.009, 0.028, 0.018); ear.rotateY(s * 0.35); ear.rotateZ(-s * 0.12); ear.translate(s * 0.076, HC.y + 0.0, HC.z - 0.006);
      parts.push(ear);
    }
    add(head, merge(parts), skin);

    /* eyes: whites fixed in the sockets; iris and pupil drift for saccades */
    const whites: G[] = [], irises: G[] = [], pupils: G[] = [];
    for (const s of [-1, 1]) {
      whites.push(sphere(12, ER, ER, ER, s * 0.03, EY, EZ));
      irises.push(sphere(10, 0.0064, 0.0064, 0.0016, s * 0.03, EY, EZ + ER - 0.0004));
      pupils.push(sphere(8, 0.0028, 0.0028, 0.0009, s * 0.03, EY, EZ + ER + 0.0011));
    }
    add(head, merge(whites), eyeW);
    eyes = new THREE.Group(); head.add(eyes);
    add(eyes, merge(irises), iris); add(eyes, merge(pupils), pupil);

    /* lids: shells just proud of the eyeball, turning about the shared eye axis */
    const lid = (top: boolean) => {
      const g = new THREE.Group(); g.position.set(0, EY, EZ); head.add(g);
      const shells: G[] = [];
      for (const s of [-1, 1]) {
        const sh = new THREE.SphereGeometry(ER * 1.028, 16, 6, 0, Math.PI * 2, top ? 0 : Math.PI / 2, Math.PI / 2);
        sh.translate(s * 0.03, 0, 0); shells.push(sh);
      }
      add(g, merge(shells), skin);
      if (top) {
        /* lash line along the upper lid edge */
        const ll: G[] = [];
        for (const s of [-1, 1]) { const t = new THREE.TorusGeometry(ER * 1.033, 0.0008, 4, 16, Math.PI); t.rotateX(Math.PI / 2); t.translate(s * 0.03, 0, 0); ll.push(t); }
        add(g, merge(ll), lash);
      }
      return g;
    };
    lidsUp = lid(true); lidsLow = lid(false);
    (skin as THREE.MeshStandardMaterial).side = THREE.DoubleSide;

    /* hair: cap, brows and the mustache */
    const hairParts: G[] = [];
    {
      /* a shell over the skull, full thickness inside the hairline and thinning to nothing at it */
      const cap = new THREE.SphereGeometry(1, Math.max(48, S * 4), Math.max(32, S * 3));
      const cp = cap.attributes.position;
      for (let i = 0; i < cp.count; i++) {
        const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i);
        const h = hairlineAt(Math.atan2(x, z)), c = smoothstep(h - 0.05, h + 0.09, y);
        const lift = c * (0.055 + 0.03 * Math.max(0, y) + 0.025 * Math.max(0, z) * Math.max(0, y)) - (1 - c) * 0.15;
        cp.setXYZ(i, ...skullPoint(x, y, z, 1 + lift));
      }
      cap.computeVertexNormals();
      cap.translate(HC.x, HC.y, HC.z);
      add(head, cap, hair);
    }
    if (look.mustache) {
      const mu = new THREE.TorusGeometry(0.02, 0.0042, 6, 16, Math.PI); mu.scale(1.05, 0.42, 0.6); mu.translate(0, HC.y - 0.046, HC.z + 0.09);
      hairParts.push(mu);
    }
    if (hairParts.length) add(head, merge(hairParts), brow);
    const browParts: G[] = [];
    for (const s of [-1, 1]) {
      const a = face(s * 0.012, 0.03, 0.0038), mid = face(s * 0.031, 0.034, 0.0034), b = face(s * 0.048, 0.029, 0.0026);
      const p1 = along(limb(0.0034, 0.003, a.distanceTo(mid), 6), a, mid), p2 = along(limb(0.003, 0.0018, mid.distanceTo(b), 6), mid, b);
      browParts.push(p1, p2);
    }
    brows = new THREE.Group(); head.add(brows);
    add(brows, merge(browParts), brow);

    /* mouth: the upper lip line curves into a smile; the lower lip drops with the jaw */
    const upper = sphere(10, 0.0148, 0.0031, 0.0048); upper.translate(0, HC.y - 0.0525, HC.z + 0.084); add(head, upper, lip);
    const smileGeo = new THREE.TorusGeometry(0.017, 0.0016, 5, 12, Math.PI); smileGeo.rotateZ(Math.PI);
    smile = add(head, smileGeo, lip); smile.position.set(0, HC.y - 0.055, HC.z + 0.086);
    open = add(head, sphere(8, 0.013, 0.01, 0.004), dark); open.position.set(0, HC.y - 0.059, HC.z + 0.083);
    lowerLip = add(head, sphere(10, 0.0135, 0.0042, 0.0052), lip); lowerLip.position.set(0, HC.y - 0.062, HC.z + 0.083);

    if (look.glasses) {
      const gl: G[] = [];
      for (const s of [-1, 1]) {
        const ring = new THREE.TorusGeometry(0.0165, 0.0011, 4, 24); ring.scale(1.28, 0.82, 1); ring.translate(s * 0.031, HC.y + 0.012, HC.z + 0.099); gl.push(ring);
        const arm = new THREE.BoxGeometry(0.0018, 0.0022, 0.09); arm.translate(s * 0.08, HC.y + 0.015, HC.z + 0.052); gl.push(arm);
      }
      const bridge = new THREE.BoxGeometry(0.016, 0.0018, 0.0018); bridge.translate(0, HC.y + 0.017, HC.z + 0.1); gl.push(bridge);
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
    const kurta = look.outfit === "kurta";
    add(sh, merge([limb(kurta ? 0.053 : 0.05, 0.042, L1, S), sphere(S, 0.043, 0.043, 0.043, 0, L1, 0)], true), sleeve);
    const el = new THREE.Group(); el.position.set(0, L1, 0); sh.add(el);
    add(el, limb(0.041, kurta ? 0.04 : 0.034, L2 - 0.012, S), sleeve);
    if (look.outfit === "suit") { const c = new THREE.CylinderGeometry(0.036, 0.036, 0.022, S, 1, true); c.translate(0, L2 - 0.016, 0); add(el, c, shirt); }
    const wr = new THREE.Group(); wr.position.set(0, L2, 0); el.add(wr);
    /* hand: palm narrowing to the wrist, two-jointed fingers in a relaxed curl, index beside the thumb */
    const hp: G[] = [];
    const palm = new RoundedBoxGeometry(0.076, 0.088, 0.03, 3, 0.013);
    {
      const pp = palm.attributes.position;
      for (let i = 0; i < pp.count; i++) {
        const u = (pp.getY(i) + 0.044) / 0.088;
        pp.setX(i, pp.getX(i) * (0.84 + 0.16 * u));
        pp.setZ(i, pp.getZ(i) * (1.05 - 0.25 * u) + (pp.getZ(i) < 0 ? -0.003 * Math.sin(u * Math.PI) : 0));
      }
      palm.computeVertexNormals();
    }
    palm.translate(0, 0.046, 0.001); hp.push(palm);
    [[0.043, 0.034], [0.047, 0.037], [0.045, 0.035], [0.035, 0.028]].forEach(([l1, l2], f) => {
      const curl = 0.16 + f * 0.05, r = 0.0088 - f * 0.0006;
      const k = V(s * (0.027 - f * 0.018), 0.086, -0.001);
      const m1 = k.clone().add(V(-s * (f - 1.2) * 0.012, Math.cos(curl), -Math.sin(curl)).normalize().multiplyScalar(l1));
      const tip = m1.clone().add(V(-s * (f - 1.2) * 0.01, Math.cos(curl * 2.6), -Math.sin(curl * 2.6)).normalize().multiplyScalar(l2));
      hp.push(along(limb(r, r * 0.92, l1, 6), k, m1), along(limb(r * 0.9, r * 0.78, l2, 6), m1, tip));
    });
    const t0 = V(s * 0.03, 0.024, -0.008), t1 = t0.clone().add(V(s * 0.55, 0.72, -0.42).normalize().multiplyScalar(0.034)), t2 = t1.clone().add(V(s * 0.2, 0.85, -0.48).normalize().multiplyScalar(0.03));
    hp.push(sphere(S, 0.02, 0.03, 0.013, s * 0.022, 0.032, -0.006));
    hp.push(along(limb(0.0118, 0.0105, 0.034, 6), t0, t1), along(limb(0.0105, 0.0088, 0.03, 6), t1, t2));
    hp.push(limb(0.03, 0.029, 0.02, S));
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
  const blinkPhase = look.outfit === "kurta" ? 2.1 : 0.4;

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
    hc.set(0, 0.268 + 0.07 + HC.y, 0.012 + HC.z);
    lk.sub(hc);
    const yaw = THREE.MathUtils.clamp(Math.atan2(lk.x, lk.z), -1.2, 1.2);
    const pitch = THREE.MathUtils.clamp(Math.atan2(-lk.y, Math.hypot(lk.x, lk.z)), -0.5, 0.6);
    /* idle life: a slow sway of the head and a little shoulder rise with each breath */
    const swayY = 0.022 * Math.sin(t * 0.53 + blinkPhase) + 0.01 * Math.sin(t * 1.37 + blinkPhase * 2);
    const swayX = 0.012 * Math.sin(t * 0.71 + blinkPhase * 3) + 0.006 * Math.sin(t * 1.9);
    chest.position.y = 0.24 + br * 0.0018;
    neck.rotation.set(pitch * 0.35 - st.lean * 0.5, yaw * 0.4 + swayY * 0.4, 0, "YXZ");
    head.rotation.set(pitch * 0.65 + st.nod + swayX, yaw * 0.6 + swayY * 0.6, st.tilt + swayY * 0.3, "YXZ");

    /* eyes: small saccades every second or so, a touch more lively while talking */
    const sIdx = Math.floor(t * (0.8 + st.talk * 0.6) + blinkPhase * 3);
    eyes.position.set((hash(sIdx) - 0.5) * 0.0026, (hash(sIdx + 17.3) - 0.5) * 0.0014 - pitch * 0.002, 0);

    /* lids: irregular blinks, a squint when smiling, upper lids follow the gaze down */
    const bl = blinkAt(t + blinkPhase);
    lidsUp.rotation.x = THREE.MathUtils.lerp(-0.36 + st.smile * 0.1 + Math.max(0, pitch) * 0.25, 0.7, bl);
    lidsLow.rotation.x = THREE.MathUtils.lerp(0.5 - st.smile * 0.22, 0.4, bl);

    /* brows lift on stressed words and with a smile */
    brows.position.y = 0.0028 * st.talk * Math.max(0, Math.sin(t * 2.7 + blinkPhase)) + 0.0014 * st.smile;

    /* mouth: lip line curves with the smile; the jaw and lower lip drop while talking */
    smile.scale.set(1 + st.smile * 0.15, 0.22 + st.smile * 0.45, 1);
    smile.position.y = HC.y - 0.055 + st.smile * 0.005;
    const o = st.talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 11) * Math.sin(t * 4.3)));
    open.scale.set(1 + st.smile * 0.2, 0.15 + o * 0.85, 1);
    open.visible = o > 0.04;
    lowerLip.position.y = HC.y - 0.062 - o * 0.0065;
    lowerLip.scale.x = 1 + st.smile * 0.12;
  };

  return { root, pose, head: headPoint };
}
