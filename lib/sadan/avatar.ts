/**
 * Rigged GLB people for the meeting, driven by the same `Pose` as the procedural ones in people.ts.
 *
 * Works with Mixamo-style (Ready Player Me) and Character Creator skeletons. Bones are found by
 * name, and every rotation is set as a world-space change from the rest pose, so the code never
 * depends on a bone's local axes. Legs are seated once; spine, head, eyes, arms, hands and fingers
 * are solved every frame. Faces with blend shapes blink, smile and open the mouth while talking.
 * Frame: origin on the floor under the seat, +z forward, +y up, +x the person's left.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Person, Pose } from "./people";

export interface AvatarSpec {
  url: string;
  /** Standing height in metres */
  height: number;
  /** Blend shape indices, for faces that have them */
  face?: { blink: number; smile: number; open: number; count: number };
  /** Called with each mesh, e.g. to recolour an outfit */
  dress?: (mesh: THREE.Mesh) => void;
  /** Add rigid extras (glasses, a jacket); `head` and `chest` follow those bones, built in rest-pose coordinates */
  accessories?: (a: Anchors) => void;
  /** Garments grown from an existing one (e.g. a jacket from the shirt's torso), skinned to the same bones */
  overlays?: Overlay[];
}

export interface Overlay {
  /** Material name of the garment to copy */
  from: RegExp;
  material: THREE.Material;
  /** Leave out vertices weighted more than `limit` to bones matching this (arms, neck) */
  drop: RegExp;
  limit: number;
  /** Leave out everything higher than this bone's joint plus `by` metres, dipping by `dip` per metre forward (a round neckline) */
  below?: { bone: RegExp; by: number; dip?: number; width?: number };
  /** Always keep vertices between these bones' joints (left/right), e.g. the shoulders up to the seam */
  seam?: { bone: RegExp; margin: number };
  /** Offset along the normals, metres */
  inflate: number;
  /** Buttons down the front centre: count and material */
  buttons?: { count: number; material: THREE.Material; radius: number };
}

/** Rest-pose landmarks in the person's frame, and groups that carry extras with the head and chest */
export interface Anchors {
  head: THREE.Group;
  chest: THREE.Group;
  eyes: [THREE.Vector3, THREE.Vector3];
  headBone: THREE.Vector3;
  neck: THREE.Vector3;
  shoulders: [THREE.Vector3, THREE.Vector3];
  hips: THREE.Vector3;
}

export interface Avatar extends Person {
  dispose(): void;
}

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const X = V(1, 0, 0);
const HIP_Y = 0.58;

/* Bone names without the exporter's numeric suffix, per rig family (Mixamo / Character Creator) */
const NAMES = {
  spine: [["Spine", "Spine1", "Spine2"], ["Waist", "Spine01", "Spine02"]],
  neck: [["Neck"], ["NeckTwist01", "NeckTwist02"]],
  head: ["Head"],
  eye: (l: boolean) => [l ? "LeftEye" : "RightEye", l ? "L_Eye" : "R_Eye"],
  arm: (l: boolean) => [l ? "LeftArm" : "RightArm", l ? "L_Upperarm" : "R_Upperarm"],
  fore: (l: boolean) => [l ? "LeftForeArm" : "RightForeArm", l ? "L_Forearm" : "R_Forearm"],
  hand: (l: boolean) => [l ? "LeftHand" : "RightHand", l ? "L_Hand" : "R_Hand"],
  thigh: (l: boolean) => [l ? "LeftUpLeg" : "RightUpLeg", l ? "L_Thigh" : "R_Thigh"],
  calf: (l: boolean) => [l ? "LeftLeg" : "RightLeg", l ? "L_Calf" : "R_Calf"],
  foot: (l: boolean) => [l ? "LeftFoot" : "RightFoot", l ? "L_Foot" : "R_Foot"],
  toe: (l: boolean) => [l ? "LeftToeBase" : "RightToeBase", l ? "L_ToeBase" : "R_ToeBase"],
  finger: (l: boolean, f: string, n: number) => [`${l ? "Left" : "Right"}Hand${f === "Mid" ? "Middle" : f}${n}`, `${l ? "L" : "R"}_${f}${n}`]
};
const FINGERS = ["Index", "Mid", "Ring", "Pinky", "Thumb"] as const;

let loader: GLTFLoader | null = null;

export async function loadAvatar(spec: AvatarSpec): Promise<Avatar> {
  if (!loader) { loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder); }
  const gltf = await loader.loadAsync(spec.url);
  const model = gltf.scene;

  /* ---------- bones ---------- */
  const byName = new Map<string, THREE.Object3D>();
  model.traverse((o) => { if ((o as THREE.Bone).isBone) byName.set(o.name.replace(/_\d+$/, ""), o); });
  const find = (names: string[]) => names.map((n) => byName.get(n)).find(Boolean) ?? null;
  const need = (names: string[]) => { const b = find(names); if (!b) throw new Error("avatar: missing bone " + names.join("/")); return b; };
  const family = byName.has("Spine1") ? 0 : 1;
  const spine = NAMES.spine[family].map((n) => need([n]));
  const neck = NAMES.neck[family].map((n) => byName.get(n)).filter((b): b is THREE.Object3D => !!b);
  const head = need(NAMES.head);
  const sides = [false, true].map((l) => ({
    s: l ? 1 : -1,
    eye: find(NAMES.eye(l)),
    arm: need(NAMES.arm(l)), fore: need(NAMES.fore(l)), hand: need(NAMES.hand(l)),
    thigh: need(NAMES.thigh(l)), calf: need(NAMES.calf(l)), foot: need(NAMES.foot(l)), toe: find(NAMES.toe(l)),
    fingers: FINGERS.map((f) => [1, 2, 3].map((n) => find(NAMES.finger(l, f, n))).filter((b): b is THREE.Object3D => !!b))
  }));

  /* ---------- stand the model in the person's frame: facing +z, scaled, hips over the seat ---------- */
  const root = new THREE.Group();
  const holder = new THREE.Group();
  root.add(holder); holder.add(model);
  const P = (o: THREE.Object3D, out = V()) => root.worldToLocal(o.getWorldPosition(out));
  root.updateMatrixWorld(true);
  const left = P(sides[1].thigh).sub(P(sides[0].thigh)).normalize();
  const up = P(head).sub(P(sides[0].foot).add(P(sides[1].foot)).multiplyScalar(0.5)).normalize();
  const fwd = V().crossVectors(left, up).normalize();
  const basis = new THREE.Matrix4().makeBasis(left, V().crossVectors(fwd, left), fwd);
  model.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(basis).invert());
  root.updateMatrixWorld(true);
  const tall = P(head).y - Math.min(P(sides[0].foot).y, P(sides[1].foot).y);
  holder.scale.setScalar((spec.height * 0.86) / tall);
  root.updateMatrixWorld(true);
  const hipMid = P(sides[0].thigh).add(P(sides[1].thigh)).multiplyScalar(0.5);
  holder.position.set(-hipMid.x, HIP_Y - hipMid.y, -0.01 - hipMid.z);
  root.updateMatrixWorld(true);

  checkSkin(model, head, root, spec.height);
  spec.overlays?.forEach((o) => addOverlay(model, root, o));

  /* rest pose, in the person's frame */
  const restQ = new Map<THREE.Object3D, THREE.Quaternion>(), restLocal = new Map<THREE.Object3D, THREE.Quaternion>(), restP = new Map<THREE.Object3D, THREE.Vector3>();
  model.traverse((o) => {
    if (!(o as THREE.Bone).isBone) return;
    restQ.set(o, o.getWorldQuaternion(new THREE.Quaternion()));
    restLocal.set(o, o.quaternion.clone());
    restP.set(o, P(o));
  });

  /* ---------- meshes and materials ---------- */
  const faces: THREE.Mesh[] = [];
  const disposables: { dispose(): void }[] = [];
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true;
    if (spec.face && m.morphTargetInfluences?.length === spec.face.count) faces.push(m);
    spec.dress?.(m);
    disposables.push(m.geometry);
    (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
      disposables.push(mat);
      Object.values(mat).forEach((v) => { if (v instanceof THREE.Texture) disposables.push(v); });
    });
  });

  /* ---------- solving helpers ---------- */
  const rootQ = new THREE.Quaternion(), tq = new THREE.Quaternion(), pq = new THREE.Quaternion();
  /** Set a bone's orientation in the person's frame */
  const setQ = (b: THREE.Object3D, q: THREE.Quaternion) => {
    b.parent!.getWorldQuaternion(pq);
    b.quaternion.copy(pq.invert().multiply(tq.copy(rootQ).multiply(q)));
    b.updateMatrixWorld(true);
  };
  const curQ = (b: THREE.Object3D, out: THREE.Quaternion) => out.copy(rootQ).invert().multiply(b.getWorldQuaternion(tq));
  /** Rotation taking frame (a1, a2) to (b1, b2); a2/b2 need only be roughly perpendicular */
  const m0 = new THREE.Matrix4(), m1 = new THREE.Matrix4();
  const frame = (m: THREE.Matrix4, d: THREE.Vector3, s: THREE.Vector3) => {
    const z = d.clone().normalize(), x = s.clone().addScaledVector(z, -s.dot(z)).normalize(), y = V().crossVectors(z, x);
    return m.makeBasis(x, y, z);
  };
  const align = (a1: THREE.Vector3, a2: THREE.Vector3, b1: THREE.Vector3, b2: THREE.Vector3) =>
    new THREE.Quaternion().setFromRotationMatrix(frame(m1, b1, b2).multiply(frame(m0, a1, a2).invert()));
  const turn = (from: THREE.Vector3, to: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize());

  /* ---------- seat the legs (once) ---------- */
  for (const sd of sides) {
    const hip = restP.get(sd.thigh)!, knee0 = restP.get(sd.calf)!;
    const thighDir = V(sd.s * 0.08, -0.1, 1).normalize(), shinDir = V(sd.s * 0.02, -1, 0.1).normalize();
    /* the knee bends the shin backwards when standing, downwards when seated */
    setQ(sd.thigh, align(knee0.clone().sub(hip), V(0, 0, -1), thighDir, V(0, -1, 0)).multiply(restQ.get(sd.thigh)!));
    setQ(sd.calf, turn(P(sd.foot).sub(P(sd.calf)), shinDir).multiply(curQ(sd.calf, new THREE.Quaternion())));
    if (sd.toe) setQ(sd.foot, turn(P(sd.toe).sub(P(sd.foot)), V(sd.s * 0.1, -0.35, 1)).multiply(curQ(sd.foot, new THREE.Quaternion())));
  }

  /* arm lengths and the hand's rest frame (fingers and back of the hand) */
  const arms = sides.map((sd) => {
    const sh = restP.get(sd.arm)!, el = restP.get(sd.fore)!, wr = restP.get(sd.hand)!;
    const mid = sd.fingers[1][0] ?? sd.fingers[0][0], idx = sd.fingers[0][0], pink = sd.fingers[3][0];
    const dir = (mid ? restP.get(mid)!.clone() : wr.clone().sub(el).add(wr)).sub(wr).normalize();
    const lat = idx && pink ? restP.get(idx)!.clone().sub(restP.get(pink)!) : V(0, 0, 1);
    const back = V().crossVectors(lat, dir).multiplyScalar(sd.s).normalize();
    return {
      sd, L1: sh.distanceTo(el), L2: el.distanceTo(wr),
      upperDir: el.clone().sub(sh).normalize(), handDir: dir, handBack: back,
      tgt: V(sd.s * 0.16, 0.86, 0.42), back: V(0, 1, 0), aim: V(0, 1, 0)
    };
  });

  /* ---------- pose ---------- */
  const st = { lean: 0.06, look: V(0, 1.3, 2), nod: 0, tilt: 0, smile: 0, talk: 0, aimW: 0 };
  const headPoint = new THREE.Object3D(); root.add(headPoint);

  /* rigid extras: a group per bone whose matrix is the bone's motion from rest, in the person's frame */
  const carried: { g: THREE.Group; bone: THREE.Object3D; restInv: THREE.Matrix4 }[] = [];
  const carry = (bone: THREE.Object3D) => {
    const g = new THREE.Group(); g.matrixAutoUpdate = false; root.add(g);
    carried.push({ g, bone, restInv: new THREE.Matrix4().compose(restP.get(bone)!, restQ.get(bone)!, V(1, 1, 1)).invert() });
    return g;
  };
  if (spec.accessories) {
    const chestBone = spine[spine.length - 1];
    const eyeAt = (e: THREE.Object3D | null, s: number) => (e ? restP.get(e)!.clone() : restP.get(head)!.clone().add(V(s * 0.032, 0.06, 0.08)));
    spec.accessories({
      head: carry(head), chest: carry(chestBone),
      eyes: [eyeAt(sides[0].eye, -1), eyeAt(sides[1].eye, 1)],
      headBone: restP.get(head)!.clone(), neck: restP.get(neck[0] ?? head)!.clone(),
      shoulders: [restP.get(sides[0].arm)!.clone(), restP.get(sides[1].arm)!.clone()],
      hips: restP.get(spine[0])!.clone()
    });
    for (const { g } of carried) g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.receiveShadow = true;
      disposables.push(m.geometry);
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => disposables.push(x));
    });
  }
  const mB = new THREE.Matrix4(), rootInv = new THREE.Matrix4(), bq = new THREE.Quaternion(), bp = V();
  const phase = hashStr(spec.url) * 6;
  const q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), e = new THREE.Euler();
  const vS = V(), vT = V(), vD = V(), vE = V(), vPole = V(), vF = V(), vL = V();

  const solveArm = (a: (typeof arms)[number]) => {
    const { sd } = a;
    const sh = P(sd.arm, vS);
    vD.subVectors(a.tgt, sh);
    /* past 90% of the reach the arm eases toward 97% instead of locking straight, so elbows stay soft */
    const R = a.L1 + a.L2, raw = Math.max(0.08, vD.length()), knee = 0.9 * R;
    const d = raw <= knee ? raw : knee + 0.07 * R * (1 - Math.exp(-(raw - knee) / (0.07 * R)));
    vD.normalize();
    const along = (a.L1 * a.L1 - a.L2 * a.L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a.L1 * a.L1 - along * along));
    vPole.set(sd.s * 0.55, -1, -0.45); vPole.addScaledVector(vD, -vPole.dot(vD)).normalize();
    vE.copy(sh).addScaledVector(vD, along).addScaledVector(vPole, h);
    vT.copy(sh).addScaledVector(vD, d);
    const upper = vE.clone().sub(sh), fore = vT.clone().sub(vE);
    /* upper arm: along the bone, with the elbow bending toward the forearm (rest flexion is forward) */
    const flex = fore.clone().addScaledVector(upper.clone().normalize(), -fore.dot(upper.clone().normalize()));
    setQ(sd.arm, align(a.upperDir, V(0, 0, 1), upper, flex.lengthSq() > 1e-6 ? flex : vPole).multiply(restQ.get(sd.arm)!));
    setQ(sd.fore, turn(P(sd.hand, vF).sub(P(sd.fore, vL)), fore).multiply(curQ(sd.fore, q1)));
    /* hand: fingers along the forearm (or `aim`), back of the hand toward `back` */
    const fingersTo = fore.clone().normalize().lerp(a.aim, st.aimW).normalize();
    setQ(sd.hand, align(a.handDir, a.handBack, fingersTo, a.back).multiply(restQ.get(sd.hand)!));
    /* fingers: a relaxed curl that straightens for open gestures */
    const curl = 0.32 * (1 - st.aimW * 0.85);
    const axis = V().crossVectors(a.back, fingersTo).normalize();
    sd.fingers.forEach((chain, f) => chain.forEach((b, j) => {
      b.quaternion.copy(restLocal.get(b)!); b.updateMatrixWorld(true);
      const k = f === 4 ? 0.35 : 1 - j * 0.15;
      setQ(b, new THREE.Quaternion().setFromAxisAngle(axis, curl * k).multiply(curQ(b, q1)));
    }));
  };

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

    root.updateMatrixWorld(true);
    root.getWorldQuaternion(rootQ);

    /* spine: lean shared down the chain, with breathing */
    const br = Math.sin(t * 1.7);
    spine.forEach((b, i) => setQ(b, q1.setFromAxisAngle(X, (st.lean + br * 0.008) * ((i + 1) / spine.length)).multiply(restQ.get(b)!)));

    /* head: toward the look point (person frame), with a slow idle sway; the neck takes part of the turn */
    const lk = root.worldToLocal(vL.copy(st.look)).sub(P(head, vF));
    const sway = 0.022 * Math.sin(t * 0.53 + phase) + 0.01 * Math.sin(t * 1.37 + phase * 2);
    const yaw = THREE.MathUtils.clamp(Math.atan2(lk.x, lk.z), -1.2, 1.2) + sway;
    const pitch = THREE.MathUtils.clamp(Math.atan2(-lk.y, Math.hypot(lk.x, lk.z)), -0.5, 0.6) + 0.012 * Math.sin(t * 0.71 + phase * 3);
    const headQ = (f: number, extra: number, roll: number) => q1.setFromEuler(e.set(pitch * f + extra, yaw * f, roll, "YXZ"));
    neck.forEach((b, i) => setQ(b, headQ(0.25 * (i + 1), st.lean * 0.4, 0).multiply(restQ.get(b)!)));
    setQ(head, headQ(1, st.nod, st.tilt + sway * 0.3).multiply(restQ.get(head)!));

    /* eyes: follow the head, plus small saccades */
    const sIdx = Math.floor(t * (0.8 + st.talk * 0.6) + phase * 3);
    const eq = q2.setFromEuler(e.set(pitch * 0.15 + (hash(sIdx + 17.3) - 0.5) * 0.08, yaw * 0.1 + (hash(sIdx) - 0.5) * 0.16, 0, "YXZ"));
    sides.forEach((sd) => { if (sd.eye) setQ(sd.eye, headQ(1, st.nod, st.tilt + sway * 0.3).multiply(eq).multiply(restQ.get(sd.eye)!)); });

    arms.forEach(solveArm);

    /* extras ride on their bones (rotation and position only) */
    if (carried.length) {
      rootInv.copy(root.matrixWorld).invert();
      for (const c of carried) {
        mB.multiplyMatrices(rootInv, c.bone.matrixWorld).decompose(bp, bq, vF);
        c.g.matrix.compose(bp, bq, vF.set(1, 1, 1)).multiply(c.restInv);
        c.g.matrixWorldNeedsUpdate = true;
      }
    }

    /* face */
    if (spec.face) {
      const bl = blinkAt(t + phase);
      const o = st.talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 11) * Math.sin(t * 4.3)));
      for (const m of faces) {
        const w = m.morphTargetInfluences!;
        w[spec.face.blink] = bl; w[spec.face.smile] = st.smile * 0.7 + 0.08; w[spec.face.open] = o * 0.55;
      }
    }

    /* look target for the other person: between the eyes */
    if (sides[0].eye && sides[1].eye) headPoint.position.copy(P(sides[0].eye, vF)).add(P(sides[1].eye, vL)).multiplyScalar(0.5);
    else headPoint.position.copy(P(head, vF)).add(V(0, 0.08, 0.04));
  };

  return { root, pose, head: headPoint, dispose: () => disposables.forEach((d) => d.dispose()) };
}

/**
 * Reject exports whose skin does not follow the skeleton (the mesh only looks right at rest, and
 * tears as soon as a bone moves): the head's vertices must sit around the head bone.
 */
function checkSkin(model: THREE.Object3D, head: THREE.Object3D, root: THREE.Object3D, height: number) {
  const hp = root.worldToLocal(head.getWorldPosition(V())), v = V(), c = V();
  let n = 0;
  model.traverse((o) => {
    const m = o as THREE.SkinnedMesh;
    if (!m.isSkinnedMesh) return;
    const hi = m.skeleton.bones.indexOf(head as THREE.Bone);
    if (hi < 0) return;
    const g = m.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
    for (let i = 0; i < g.attributes.position.count; i += 3) {
      for (let j = 0; j < 4; j++) if (si.getComponent(i, j) === hi && sw.getComponent(i, j) > 0.8) {
        m.getVertexPosition(i, v); c.add(root.worldToLocal(v.applyMatrix4(m.matrixWorld))); n++;
      }
    }
  });
  if (!n || c.divideScalar(n).distanceTo(hp) > height * 0.12) throw new Error("avatar: skin does not follow its skeleton");
}

/**
 * Grow a garment from another one: copy its geometry, keep the triangles whose vertices are
 * mostly carried by the wanted bones, push the surface out along its normals, and skin the copy
 * to the same skeleton so it bends exactly like the body. Buttons are skinned to front vertices.
 */
function addOverlay(model: THREE.Object3D, root: THREE.Object3D, o: Overlay) {
  let src: THREE.SkinnedMesh | null = null;
  model.traverse((x) => {
    const m = x as THREE.SkinnedMesh;
    if (!src && m.isSkinnedMesh && o.from.test((m.material as THREE.Material).name)) src = m;
  });
  if (!src) return;
  const m: THREE.SkinnedMesh = src;
  const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const n = pos.count, dropB = m.skeleton.bones.map((b) => o.drop.test(b.name));
  /* local units per metre, measured on the skinned mesh */
  const a = V(), b = V(), ra = V(), rb = V();
  const world = (i: number, out: THREE.Vector3) => root.worldToLocal(m.getVertexPosition(i, out).applyMatrix4(m.matrixWorld));
  let k = 1;
  for (let i = 1; i < n; i += Math.max(1, (n / 7) | 0)) {
    const dl = ra.fromBufferAttribute(pos, 0).distanceTo(rb.fromBufferAttribute(pos, i)), dw = world(0, a).distanceTo(world(i, b));
    if (dw > 0.05) { k = dl / dw; break; }
  }
  const capBone = o.below ? m.skeleton.bones.find((x) => o.below!.bone.test(x.name)) : null;
  const capP = capBone ? root.worldToLocal(capBone.getWorldPosition(V())) : null;
  /* the neckline only applies around the neck; the shoulder line further out keeps its full height */
  const capAt = (p: THREE.Vector3) => (capP && Math.abs(p.x - capP.x) < (o.below!.width ?? Infinity) ? capP.y + o.below!.by - Math.max(0, p.z - capP.z) * (o.below!.dip ?? 0) : Infinity);
  const seamX = o.seam ? Math.max(0, ...m.skeleton.bones.filter((x) => o.seam!.bone.test(x.name)).map((x) => Math.abs(root.worldToLocal(x.getWorldPosition(V())).x))) + o.seam.margin : 0;
  /*
   * Coverage per vertex, 0..1: a smooth ramp across the shoulder seam (a plane at the arm joints)
   * and the neckline, so the edge is a clean line where the garment crosses back under its source.
   * Without a seam, vertices carried mostly by `drop` bones are left out.
   */
  const band = 0.012, ramp = (d: number) => { const t = Math.min(1, Math.max(0, (d + band) / (2 * band))); return t * t * (3 - 2 * t); };
  const cover = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    world(i, a);
    let f = Number.isFinite(capAt(a)) ? ramp(capAt(a) - a.y) : 1;
    if (o.seam) f = Math.min(f, ramp(seamX - Math.abs(a.x)));
    else {
      let w = 0;
      for (let j = 0; j < 4; j++) if (dropB[si.getComponent(i, j)]) w += sw.getComponent(i, j);
      if (w > o.limit) f = 0;
    }
    cover[i] = f;
  }
  const keep = cover;
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), v = V(), nv = V();
  for (let i = 0; i < n; i++) {
    nv.fromBufferAttribute(nor, i).normalize();
    /* covered vertices sit above the source surface, uncovered ones just under it */
    v.fromBufferAttribute(pos, i).addScaledVector(nv, (-1.5 + 2.5 * cover[i]) * o.inflate * k);
    v.toArray(P, i * 3); nv.toArray(N, i * 3);
  }
  const idx: number[] = [], src3 = g.index;
  const tri = src3 ? src3.count / 3 : n / 3, at = (t: number) => (src3 ? src3.getX(t) : t);
  for (let t = 0; t < tri; t++) {
    const i0 = at(t * 3), i1 = at(t * 3 + 1), i2 = at(t * 3 + 2);
    if (Math.max(cover[i0], cover[i1], cover[i2]) > 0.02) idx.push(i0, i1, i2);
  }
  /* Drop the source triangles the garment fully covers, so the source can't poke through where
     skinning squeezes the offset (shoulders and upper back, with the arms forward) */
  const under: number[] = [];
  for (let t = 0; t < tri; t++) {
    const i0 = at(t * 3), i1 = at(t * 3 + 1), i2 = at(t * 3 + 2);
    if (Math.min(cover[i0], cover[i1], cover[i2]) < 0.98) under.push(i0, i1, i2);
  }
  const shown = g.clone();
  shown.setIndex(under);
  m.geometry = shown;
  g.dispose();

  const og = new THREE.BufferGeometry();
  og.setAttribute("position", new THREE.BufferAttribute(P, 3));
  og.setAttribute("normal", new THREE.BufferAttribute(N, 3));
  og.setAttribute("skinIndex", si.clone()); og.setAttribute("skinWeight", sw.clone());
  if (g.attributes.uv) og.setAttribute("uv", g.attributes.uv.clone());
  og.setIndex(idx);
  const jacket = new THREE.SkinnedMesh(og, o.material);
  jacket.frustumCulled = false; jacket.receiveShadow = true;
  m.parent!.add(jacket);
  jacket.position.copy(m.position); jacket.quaternion.copy(m.quaternion); jacket.scale.copy(m.scale);
  jacket.bind(m.skeleton, m.bindMatrix);

  /* buttons: at the front centre line of the kept surface, spaced from hem to neck */
  if (!o.buttons) return;
  const front: { i: number; y: number; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    if (keep[i] < 0.9) continue;
    world(i, a);
    if (Math.abs(a.x) < 0.012) front.push({ i, y: a.y, z: a.z });
  }
  if (front.length < 4) return;
  const ys = front.map((f) => f.y), lo = Math.min(...ys), hi = Math.max(...ys);
  const parts: THREE.BufferGeometry[] = [];
  for (let c = 0; c < o.buttons.count; c++) {
    const y = hi - 0.05 - (c * (hi - lo - 0.09)) / Math.max(1, o.buttons.count - 1);
    const best = front.filter((f) => Math.abs(f.y - y) < 0.02).sort((p, q) => q.z - p.z)[0];
    if (!best) continue;
    const sg = new THREE.SphereGeometry(o.buttons.radius * k, 8, 6);
    nv.fromBufferAttribute(nor, best.i).normalize();
    v.fromBufferAttribute(pos, best.i).addScaledVector(nv, o.inflate * k * 1.6);
    sg.translate(v.x, v.y, v.z);
    const cnt = sg.attributes.position.count, sI = new Float32Array(cnt * 4), sW = new Float32Array(cnt * 4);
    for (let q = 0; q < cnt; q++) for (let j = 0; j < 4; j++) { sI[q * 4 + j] = si.getComponent(best.i, j); sW[q * 4 + j] = sw.getComponent(best.i, j); }
    sg.setAttribute("skinIndex", new THREE.BufferAttribute(sI, 4)); sg.setAttribute("skinWeight", new THREE.BufferAttribute(sW, 4));
    sg.deleteAttribute("uv");
    parts.push(sg);
  }
  if (!parts.length) return;
  const merged = mergeGeometries(parts)!; parts.forEach((p) => p.dispose());
  const btn = new THREE.SkinnedMesh(merged, o.buttons.material);
  btn.frustumCulled = false;
  m.parent!.add(btn);
  btn.position.copy(m.position); btn.quaternion.copy(m.quaternion); btn.scale.copy(m.scale);
  btn.bind(m.skeleton, m.bindMatrix);
}

/* ---------- small helpers ---------- */
const hash = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const hashStr = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return hash(h); };
/** Two irregular blink cycles: 0 open, 1 shut */
const blinkAt = (t: number) => {
  const one = (x: number) => (x < 0.07 ? x / 0.07 : x < 0.17 ? 1 - (x - 0.07) / 0.1 : 0);
  return Math.max(one(t % 4.3), one((t * 1.13 + 1.9) % 6.7));
};
