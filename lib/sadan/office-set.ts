/**
 * The table in the well, where the story's office scenes play.
 *
 *   2 The problem    the table is a cluttered office: registers and red-tape files shedding papers,
 *                    a frozen spreadsheet, phones buzzing with a flooded group chat. Four badges float
 *                    above it and fail one by one, in step with the card's strike-through.
 *   3 With Setuk     the clutter streams into the laptop, which becomes one inbox; the four badges
 *                    merge into one Setuk badge and a phone confirms the citizen's SMS.
 *   5 Discuss        a consultant and a politician talk across the middle chairs.
 *   6 Design         over the consultant's shoulder: the laptop opens on the office setup.
 *   7 Train          the laptop is a role-by-role training call.
 *   8 Run            the month's numbers count up, then the camera turns to the politician, pleased.
 *
 * The clutter is swapped for the people while the camera is at the desk in chapter 4, out of sight.
 * Nothing here casts into the baked shadow map; soft contact shadows stand in.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { TierConfig } from "./quality";
import { clamp01, smooth } from "./progress";
import { createScreen, type Paint, type Screen } from "./screens";
import {
  BADGE, LAPTOP, PHONE, TAG, drawBadge, drawChat, drawExcel, drawInbox, drawMeet, drawMissed, drawPaper, drawPhoneOk, drawRun,
  drawLidMark, drawSetukBadge, drawSetup, drawTag, type BadgeLook
} from "./set-screens";
import { loadAvatar, type Anchors, type Avatar, type AvatarSpec, type Pose } from "./avatar";

export interface SetKit {
  world: THREE.Group;
  T: TierConfig;
  mat: (p: THREE.MeshPhysicalMaterialParameters) => THREE.MeshStandardMaterial;
  paint: Paint;
  maxAniso: number;
  accent: THREE.Color;
  normalFromHeight: (c: HTMLCanvasElement, strength?: number) => THREE.Texture;
  /** A sample of seat positions (world), for the pulses that run from the fix out to the House */
  seatPoints: THREE.Vector3[];
  /** Public folder holding the rigged people (consultant.glb) */
  peopleBase?: string;
  /** Compile an object's materials against the scene's lights, so late arrivals (the rigged people) never compile mid-scroll */
  compile?: (o: THREE.Object3D) => Promise<unknown>;
}

export interface SetFrame {
  /** Chapter progress */
  p: number;
  /** Seconds */
  t: number;
  dt: number;
  reduced: boolean;
  camera: THREE.PerspectiveCamera;
  /** Drawing buffer height in pixels, for point sizes */
  viewH: number;
  /** Compact layouts (the scene is a small band): badges regroup and text keeps a minimum size on screen */
  compact?: boolean;
  /** Canvas height in CSS pixels, for on-screen text sizes */
  cssH?: number;
}

export interface OfficeSet {
  root: THREE.Group;
  /** Returns whether anything is animating (the engine then keeps rendering) and whether this frame changed */
  update(f: SetFrame): { animating: boolean; changed: boolean };
  /** The Run close-up: blend weight and the shot to blend toward */
  shot: { w: number; p: THREE.Vector3; t: THREE.Vector3; fov: number };
  /** Redraw every canvas (theme or font change) */
  redraw(): void;
  /** true: everything visible (to compile shaders up front); false: back to per-chapter visibility */
  showAll(on: boolean): void;
  extras: { dispose(): void }[];
}

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function createOfficeSet(k: SetKit): OfficeSet {
  const { T, paint } = k;
  const TOP = T.tier === "low" ? 0.8 : 0.82;
  const extras: { dispose(): void }[] = [];
  const set = new THREE.Group(), clutter = new THREE.Group(), meeting = new THREE.Group();
  set.add(clutter, meeting);
  k.world.add(set);
  const add = <O extends THREE.Object3D>(parent: THREE.Object3D, o: O) => { o.castShadow = false; o.receiveShadow = true; parent.add(o); return o; };
  const screen = (w: number, h: number, scale: number) => { const s = createScreen(w, h, scale, k.maxAniso); extras.push(s.tex); return s; };
  const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = k.maxAniso;
    return { t, c };
  };
  const sc = T.tier === "low" ? 0.6 : T.tier === "mid" ? 0.8 : 1;

  /* ---------- shared textures ---------- */
  const paperTex = canvasTex(256, 362, (g) => drawPaper(g, 256, 362, 7)).t;
  paperTex.wrapS = paperTex.wrapT = THREE.ClampToEdgeWrapping;
  const edgeTex = canvasTex(64, 64, (g) => {
    g.fillStyle = "#efe6d2"; g.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 2) { g.fillStyle = `rgba(120,100,70,${0.12 + ((y * 7) % 5) * 0.03})`; g.fillRect(0, y, 64, 1); }
  }).t;
  const coverTex = canvasTex(256, 256, (g) => {
    g.fillStyle = "#e9e9e9"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    g.fillStyle = "rgba(0,0,0,.45)";
    [[0, 0, 1, 1], [256, 0, -1, 1], [0, 256, 1, -1], [256, 256, -1, -1]].forEach(([x, y, sx, sy]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * 64, y); g.lineTo(x, y + sy * 64); g.closePath(); g.fill(); });
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(78, 96, 100, 54);
  }).t;
  const keysTex = canvasTex(512, 256, (g) => {
    g.fillStyle = "#2a2c30"; g.fillRect(0, 0, 512, 256);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { g.fillStyle = "#121315"; g.beginPath(); g.roundRect(14 + c * 35, 12 + r * 34, 30, 28, 4); g.fill(); }
    g.fillStyle = "#121315"; g.beginPath(); g.roundRect(120, 184, 270, 26, 4); g.fill();
    g.fillStyle = "#3a3d42"; g.beginPath(); g.roundRect(170, 214, 170, 40, 6); g.fill();
  }).t;
  const shadowTex = canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(0.6, "rgba(0,0,0,.22)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }).t;
  extras.push(paperTex, edgeTex, coverTex, keysTex, shadowTex);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false });
  const blob = (parent: THREE.Object3D, w: number, d: number, x: number, y: number, z: number, opacity = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), opacity === 1 ? shadowMat : Object.assign(shadowMat.clone(), { opacity }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.002, z); m.renderOrder = 1;
    parent.add(m);
    return m;
  };

  const mPaper = k.mat({ map: paperTex, color: "#cfc9bc", roughness: 0.92, side: THREE.DoubleSide });
  const mEdge = k.mat({ map: edgeTex, roughness: 0.95 });
  const mCover = k.mat({ map: coverTex, roughness: 0.8, sheen: 0.4, sheenColor: "#ffffff", sheenRoughness: 0.6 });
  const mFile = k.mat({ color: "#ffffff", roughness: 0.9 });
  const mTape = k.mat({ color: "#b81f2a", roughness: 0.6, sheen: 0.6, sheenColor: "#ff6a70", sheenRoughness: 0.4 });
  const mAlu = k.mat({ color: "#9ea3ab", metalness: 0.85, roughness: 0.32 });
  const mDarkAlu = k.mat({ color: "#3f444b", metalness: 0.8, roughness: 0.38 });
  const mKeys = k.mat({ map: keysTex, roughness: 0.6 });
  const mPhone = k.mat({ color: "#16171a", metalness: 0.4, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 });
  const mGlass = k.mat({ color: "#dfe9ee", roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, clearcoat: 1 });
  const mWater = k.mat({ color: "#b9d4e0", roughness: 0.05, transparent: true, opacity: 0.45 });

  /* ---------- the clutter ---------- */
  /* Registers: page blocks and cloth covers with leather corners, instanced across two stacks */
  const regs: THREE.Matrix4[] = [];
  const regColors = ["#7a2430", "#2d4f3b", "#26365a", "#5a3a22", "#7a2430", "#2a2a2a", "#2d4f3b", "#7a2430", "#26365a", "#5a3a22"];
  const stackA = V(-0.5, TOP, -11.45), stackB = V(-0.36, TOP, -10.62);
  [[stackA, 6], [stackB, 4]].forEach(([at, n]) => {
    for (let i = 0; i < (n as number); i++) {
      const p = (at as THREE.Vector3).clone().add(V((Math.random() - 0.5) * 0.02, 0.021 + i * 0.043, (Math.random() - 0.5) * 0.02));
      regs.push(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (Math.random() - 0.5) * 0.18), V(1, 1, 1)));
    }
  });
  const pageGeo = new THREE.BoxGeometry(0.232, 0.034, 0.322);
  const coverParts = [new THREE.BoxGeometry(0.24, 0.0045, 0.33).translate(0, 0.0195, 0), new THREE.BoxGeometry(0.24, 0.0045, 0.33).translate(0, -0.0195, 0), new THREE.BoxGeometry(0.008, 0.043, 0.33).translate(-0.118, 0, 0)];
  const coverGeo = mergeGeometries(coverParts)!; coverParts.forEach((g) => g.dispose());
  const pages = add(clutter, new THREE.InstancedMesh(pageGeo, mEdge, regs.length));
  const covers = add(clutter, new THREE.InstancedMesh(coverGeo, mCover, regs.length));
  regs.forEach((m, i) => { pages.setMatrixAt(i, m); covers.setMatrixAt(i, m); covers.setColorAt(i, new THREE.Color(regColors[i % regColors.length])); });

  /* Red-tape files (laal fita): buff folders tied in a cross */
  const filesAt = V(0.46, TOP, -11.5), FILES = 9;
  const fileGeo = new THREE.BoxGeometry(0.25, 0.012, 0.345);
  const files = add(clutter, new THREE.InstancedMesh(fileGeo, mFile, FILES));
  const filesM: THREE.Matrix4[] = [];
  for (let i = 0; i < FILES; i++) {
    const m = new THREE.Matrix4().compose(filesAt.clone().add(V((Math.random() - 0.5) * 0.025, 0.006 + i * 0.0128, (Math.random() - 0.5) * 0.025)), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (Math.random() - 0.5) * 0.1), V(1, 1, 1));
    filesM.push(m); files.setMatrixAt(i, m);
    files.setColorAt(i, new THREE.Color().setHSL(0.11 + Math.random() * 0.02, 0.45 + Math.random() * 0.15, 0.62 + Math.random() * 0.1));
  }
  const fh = FILES * 0.0128 + 0.002;
  const tapeParts = [
    new THREE.BoxGeometry(0.262, 0.002, 0.022).translate(0, fh, 0), new THREE.BoxGeometry(0.002, fh, 0.022).translate(0.131, fh / 2, 0), new THREE.BoxGeometry(0.002, fh, 0.022).translate(-0.131, fh / 2, 0),
    new THREE.BoxGeometry(0.022, 0.002, 0.357).translate(0, fh + 0.001, 0), new THREE.BoxGeometry(0.022, fh, 0.002).translate(0, fh / 2, 0.178), new THREE.BoxGeometry(0.022, fh, 0.002).translate(0, fh / 2, -0.178),
    new THREE.SphereGeometry(0.018, 10, 6).scale(1.4, 0.45, 1).translate(0, fh + 0.006, 0)
  ];
  const tape = add(clutter, new THREE.Mesh(mergeGeometries(tapeParts.map((g) => g.index ? g.toNonIndexed() : g))!, mTape));
  tapeParts.forEach((g) => g.dispose());
  tape.position.copy(filesAt);

  /* Loose papers: some on the table, some on the floor, five falling off the stacks in a loop */
  const PAPERS = 20, FALLING = 5;
  const paperGeo = new THREE.PlaneGeometry(0.21, 0.297); paperGeo.rotateX(-Math.PI / 2);
  const papers = add(clutter, new THREE.InstancedMesh(paperGeo, mPaper, PAPERS));
  papers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const restPapers: THREE.Matrix4[] = [];
  const paperSpots: [number, number, number, number][] = [
    [-0.12, TOP + 0.001, -11.0, 0.4], [0.05, TOP + 0.002, -11.25, -0.7], [-0.7, TOP + 0.001, -10.9, 1.2], [0.62, TOP + 0.001, -10.7, -0.3], [0.1, TOP + 0.001, -9.95, 0.9],
    [-1.05, 0.004, -11.35, 0.6], [-1.15, 0.004, -10.35, -0.9], [1.08, 0.004, -11.1, 0.3], [1.0, 0.004, -9.6, 1.4], [-0.98, 0.004, -9.5, -0.2], [0.3, 0.004, -7.55, 0.8], [-0.4, 0.004, -7.4, -1.1],
    [-1.3, 0.004, -11.6, 2.2], [1.25, 0.004, -10.4, -2.0], [0.0, 0.004, -7.2, 0.2]
  ];
  for (let i = 0; i < PAPERS; i++) {
    const s = paperSpots[i % paperSpots.length];
    const m = new THREE.Matrix4().compose(V(s[0], s[1] + (i >= paperSpots.length ? 0.002 : 0), s[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s[3] + i, 0)), V(1, 1, 1));
    restPapers.push(m); papers.setMatrixAt(i, m);
  }
  const fallFrom = [stackA, stackA, stackB, filesAt, stackB].map((s, i) => s.clone().add(V(i % 2 ? -0.08 : 0.05, i === 3 ? fh : i < 2 ? 0.26 : 0.17, 0.02)));
  const fallTo = [V(-1.1, 0.005, -11.35), V(-1.0, 0.005, -11.0), V(-0.95, 0.005, -10.35), V(1.05, 0.005, -11.4), V(-0.15, 0.005, -9.3)];

  /* The Setuk mark on the back of each lid; repainted with the accent on theme change */
  const logoScr = screen(256, 256, 1);
  const logoMat = new THREE.MeshBasicMaterial({ map: logoScr.tex, transparent: true, toneMapped: false });

  /* A laptop: aluminium base with a keyboard, a lid hinged at the back, and its screen */
  const makeLaptop = (scr: Screen, dark = false) => {
    const g = new THREE.Group();
    const base = add(g, new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.016, 0.22, 2, 0.006), dark ? mDarkAlu : mAlu)); base.position.y = 0.008;
    const kb = add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.18), mKeys)); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.0165, 0.012);
    const lid = new THREE.Group(); lid.position.set(0, 0.016, -0.108); g.add(lid);
    const shell = add(lid, new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.212, 0.008, 2, 0.003), dark ? mDarkAlu : mAlu)); shell.position.set(0, 0.106, -0.004);
    const glass = add(lid, new THREE.Mesh(new THREE.PlaneGeometry(0.306, 0.198), new THREE.MeshBasicMaterial({ color: "#050608" }))); glass.position.set(0, 0.106, 0.0005);
    const disp = add(lid, new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.181), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }))); disp.position.set(0, 0.108, 0.001);
    const logo = add(lid, new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), logoMat)); logo.rotation.y = Math.PI; logo.position.set(0, 0.11, -0.0085);
    blob(g, 0.48, 0.36, 0, 0, 0, 0.8);
    return { g, lid, disp };
  };
  const officeScr = screen(LAPTOP.w, LAPTOP.h, sc);
  const office = makeLaptop(officeScr);
  office.g.position.set(0.3, TOP, -10.15); office.g.rotation.y = -0.12;
  office.lid.rotation.x = -0.28;
  clutter.add(office.g);

  /* Phones: one on a stand, two flat; screens are their own canvases */
  const makePhone = (scr: Screen) => {
    const g = new THREE.Group();
    add(g, new THREE.Mesh(new RoundedBoxGeometry(0.074, 0.0085, 0.156, 2, 0.004), mPhone));
    const disp = add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.148), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false })));
    disp.rotation.x = -Math.PI / 2; disp.position.y = 0.0044;
    return g;
  };
  const chatScr = screen(PHONE.w, PHONE.h, sc), missedScr = screen(PHONE.w, PHONE.h, sc), chat2Scr = screen(PHONE.w, PHONE.h, sc);
  const phoneA = makePhone(chatScr), phoneB = makePhone(chat2Scr), phoneC = makePhone(missedScr);
  const phoneAHome = V(-0.1, TOP + 0.074, -9.62);
  phoneA.position.copy(phoneAHome); phoneA.rotation.set(1.13, 0.1, 0);
  {
    const stand = add(clutter, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.07), mDarkAlu)); stand.position.set(-0.1, TOP + 0.005, -9.6);
    const lip = add(clutter, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.006), mDarkAlu)); lip.position.set(-0.1, TOP + 0.04, -9.66); lip.rotation.x = -0.44;
  }
  const phoneBHome = V(0.22, TOP + 0.0043, -9.45), phoneCHome = V(-0.58, TOP + 0.0043, -9.85);
  phoneB.position.copy(phoneBHome); phoneB.rotation.y = 0.35;
  phoneC.position.copy(phoneCHome); phoneC.rotation.y = -0.5;
  clutter.add(phoneA, phoneB, phoneC);
  const blobs = [blob(clutter, 0.9, 0.7, stackA.x, TOP, stackA.z, 0.8), blob(clutter, 0.7, 0.6, stackB.x, TOP, stackB.z, 0.7), blob(clutter, 0.8, 0.7, filesAt.x, TOP, filesAt.z, 0.7)];

  /* Badges over the table: the four tools that fail, and the one that replaces them */
  const sprite = (w: number, h: number, scale: number) => {
    const s = screen(w, h, 1);
    const mat = new THREE.SpriteMaterial({ map: s.tex, transparent: true, depthWrite: false, toneMapped: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(scale, (scale * h) / w, 1);
    sp.renderOrder = 3;
    return { s, sp, mat, base: scale };
  };
  /*
   * Hang a tag under a badge in screen space: the camera looks down into the well, so an offset
   * along world y would foreshorten and slide the tag up over the caption.
   */
  const hang = (tag: THREE.Sprite, under: THREE.Sprite) => {
    tag.position.copy(under.position); tag.position.z += 0.01;
    tag.center.y = tag.scale.y > 0 ? 1 + under.scale.y / 2 / tag.scale.y : 1;
  };
  const LOOKS: BadgeLook[] = [
    { glyph: "register", tint: "#8a3b2a" },
    { glyph: "excel", tint: "#1f7246" },
    { glyph: "whatsapp", tint: "#1faa59" },
    { glyph: "brain", tint: "#6b4fb8" }
  ];
  const BADGE_Y = 1.6, BADGE_Z = -11.35;
  const badges = LOOKS.map((_, i) => {
    const b = sprite(BADGE.w, BADGE.h, 0.36), tag = sprite(TAG.w, TAG.h, 0.5);
    const home = V(-0.75 + i * 0.5, BADGE_Y, BADGE_Z);
    b.sp.position.copy(home); tag.sp.position.copy(home).add(V(0, -0.29, 0.01));
    clutter.add(b.sp, tag.sp);
    return { b, tag, home };
  });
  const fixed = sprite(BADGE.w, BADGE.h, 0.72), fixedTag = sprite(TAG.w, TAG.h, 0.66);
  const FIX = V(0, BADGE_Y + 0.08, BADGE_Z);
  fixed.sp.position.copy(FIX); fixedTag.sp.position.copy(FIX).add(V(0, -0.33, 0.01));
  clutter.add(fixed.sp, fixedTag.sp);

  /* A chakra halo behind the Setuk badge: glow, a beaded rim and twenty-four spokes, tinted with the accent */
  const { t: haloTex } = canvasTex(512, 512, (g) => {
    const c = 256;
    const glow = g.createRadialGradient(c, c, 0, c, c, 250);
    glow.addColorStop(0, "rgba(255,255,255,.55)"); glow.addColorStop(0.45, "rgba(255,255,255,.18)"); glow.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glow; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "#fff"; g.fillStyle = "#fff";
    g.lineWidth = 4; g.beginPath(); g.arc(c, c, 204, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(c, c, 150, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 24; i++) {
      g.save(); g.translate(c, c); g.rotate((i / 24) * Math.PI * 2);
      g.beginPath(); g.moveTo(0, -152); g.lineTo(-5, -176); g.lineTo(0, -202); g.lineTo(5, -176); g.closePath(); g.fill();
      g.restore();
    }
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      g.beginPath(); g.arc(c + Math.cos(a) * 224, c + Math.sin(a) * 224, i % 2 ? 2.5 : 4.5, 0, Math.PI * 2); g.fill();
    }
  });
  const haloMat = new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const halo = new THREE.Sprite(haloMat);
  halo.renderOrder = 2;
  clutter.add(halo);
  extras.push(haloMat, haloTex);

  /* Ripples on the floor of the well, spreading from under the badge out towards the House */
  const RIPPLES = 3;
  const rippleGeo = new THREE.RingGeometry(0.94, 1, 128);
  rippleGeo.rotateX(-Math.PI / 2);
  const ripples = Array.from({ length: RIPPLES }, () => {
    const m = new THREE.MeshBasicMaterial({ color: k.accent, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
    const r = new THREE.Mesh(rippleGeo, m);
    r.position.set(0, 0.02, BADGE_Z + 0.6);
    r.renderOrder = 1;
    clutter.add(r);
    extras.push(m);
    return r;
  });
  extras.push(rippleGeo);

  /* The stream: points flowing from the clutter into the laptop */
  const STREAM = T.tier === "low" ? 140 : 320;
  const from = new Float32Array(STREAM * 3), to = new Float32Array(STREAM * 3), delay = new Float32Array(STREAM), seed = new Float32Array(STREAM);
  const sources = [stackA, stackB, filesAt, phoneBHome, phoneCHome, phoneAHome, V(-1.05, 0.05, -10.9), V(1.05, 0.05, -10.8)];
  const sink = V(0.3 - 0.02, TOP + 0.13, -10.27);
  for (let i = 0; i < STREAM; i++) {
    const s = sources[i % sources.length];
    from.set([s.x + (Math.random() - 0.5) * 0.24, s.y + Math.random() * 0.25, s.z + (Math.random() - 0.5) * 0.3], i * 3);
    to.set([sink.x + (Math.random() - 0.5) * 0.2, sink.y + (Math.random() - 0.5) * 0.12, sink.z], i * 3);
    delay[i] = Math.random() * 0.5; seed[i] = Math.random();
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.BufferAttribute(from.slice(), 3));
  sGeo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
  sGeo.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
  sGeo.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
  sGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const sMat = new THREE.ShaderMaterial({
    uniforms: { uM: { value: 0 }, uSize: { value: 30 }, uTime: { value: 0 }, uColor: { value: k.accent } },
    vertexShader: `attribute vec3 aFrom; attribute vec3 aTo; attribute float aDelay; attribute float aSeed;
      uniform float uM, uSize, uTime; varying float vA;
      void main() {
        float u = clamp((uM - aDelay) / 0.5, 0.0, 1.0);
        vec3 mid = mix(aFrom, aTo, 0.5) + vec3(0.0, 0.35 + aSeed * 0.35, 0.0);
        vec3 p = mix(mix(aFrom, mid, u), mix(mid, aTo, u), u);
        p += vec3(sin(uTime * 3.0 + aSeed * 20.0), cos(uTime * 2.3 + aSeed * 13.0), 0.0) * 0.02 * (1.0 - u);
        vA = (u > 0.0 && u < 1.0) ? sin(u * 3.14159) : 0.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.6 + aSeed * 0.8) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA;
        gl_FragColor = vec4(mix(mix(uColor, vec3(1.0), 0.45), vec3(1.0), smoothstep(0.25, 0.0, d)) * a, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const stream = new THREE.Points(sGeo, sMat);
  stream.frustumCulled = false;
  clutter.add(stream);

  /* Pulses from the Setuk badge out to the seats: one system between the office and the people */
  const OUT = Math.min(k.seatPoints.length, T.tier === "low" ? 80 : 220);
  const oFrom = new Float32Array(OUT * 3), oTo = new Float32Array(OUT * 3), oSeed = new Float32Array(OUT);
  for (let i = 0; i < OUT; i++) {
    const tp = k.seatPoints[Math.floor((i / OUT) * k.seatPoints.length)];
    oFrom.set([0, 1.95, -11.35], i * 3); oTo.set([tp.x, tp.y, tp.z], i * 3); oSeed[i] = Math.random();
  }
  const oGeo = new THREE.BufferGeometry();
  oGeo.setAttribute("position", new THREE.BufferAttribute(oTo.slice(), 3));
  oGeo.setAttribute("aFrom", new THREE.BufferAttribute(oFrom, 3));
  oGeo.setAttribute("aTo", new THREE.BufferAttribute(oTo, 3));
  oGeo.setAttribute("aSeed", new THREE.BufferAttribute(oSeed, 1));
  const oMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: 30 }, uOn: { value: 0 }, uColor: { value: k.accent } },
    vertexShader: `attribute vec3 aFrom; attribute vec3 aTo; attribute float aSeed;
      uniform float uTime, uSize, uOn; varying float vA;
      void main() {
        float u = fract(uTime * 0.28 + aSeed);
        vec3 mid = mix(aFrom, aTo, 0.5) + vec3(0.0, 2.2 + aSeed * 1.5, 0.0);
        vec3 p = mix(mix(aFrom, mid, u), mix(mid, aTo, u), u);
        vA = sin(u * 3.14159) * uOn;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.7 + aSeed * 0.6) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: sMat.fragmentShader,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const outflow = new THREE.Points(oGeo, oMat);
  outflow.frustumCulled = false;
  clutter.add(outflow);
  extras.push(oGeo, oMat);

  /* ---------- the meeting ---------- */
  /* Seats (x along the table, facing across it) */
  const SEATS = { consultant: { x: 1.25, ry: -Math.PI / 2 }, politician: { x: -1.25, ry: Math.PI / 2 } };
  let consultant: Avatar | null = null, politician: Avatar | null = null;
  /*
   * Rigged people, placed as they load (the camera is at the desk in chapter 4 meanwhile). Both
   * use the executive model; the politician is dressed differently and gets glasses and a mustache.
   */
  let swapped = false, gone = false;
  const avatars: Avatar[] = [];
  const seat = (spec: AvatarSpec, which: "consultant" | "politician") => loadAvatar(spec).then(async (next) => {
    avatars.push(next);
    if (gone) return;
    await k.compile?.(next.root).catch(() => undefined);
    if (gone) return;
    next.root.position.set(SEATS[which].x, 0, -10.9); next.root.rotation.y = SEATS[which].ry;
    meeting.add(next.root);
    if (which === "consultant") consultant = next; else politician = next;
    swapped = true;
  }).catch((err) => console.warn(`sadan: could not load the ${which}`, err));
  if (k.peopleBase) {
    const face = { blink: 16, smile: 33, open: 67, count: 68 };
    seat({ url: k.peopleBase + "consultant.glb", height: 1.76, face, dress: executive }, "consultant");
    /* the politician: the same model in a kurta, glasses and mustache, greying at the temples */
    seat({ url: k.peopleBase + "consultant.glb", height: 1.74, face, dress: leader, accessories: (a) => leaderExtras(a, k.mat) }, "politician");
  }
  extras.push({ dispose: () => { gone = true; avatars.forEach((a) => a.dispose()); } });
  blob(meeting, 0.9, 0.9, 1.1, 0, -10.9, 0.9); blob(meeting, 0.9, 0.9, -1.1, 0, -10.9, 0.9);
  const lapScr = screen(LAPTOP.w, LAPTOP.h, sc);
  const lap = makeLaptop(lapScr, true);
  lap.g.position.set(0.64, TOP, -10.9); lap.g.rotation.y = Math.PI / 2;
  meeting.add(lap.g);
  const LAP_SCREEN = V(0.53, TOP + 0.12, -10.9);
  /* notebook and pen in front of the politician, water glasses */
  {
    const nb = add(meeting, new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.012, 0.21), [mCover, mCover, mPaper, mCover, mEdge, mEdge]));
    nb.position.set(-0.6, TOP + 0.006, -10.82); nb.rotation.y = Math.PI / 2 + 0.15;
    const pen = add(meeting, new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 8), mDarkAlu)); pen.rotation.set(Math.PI / 2, 0, 0.6); pen.position.set(-0.52, TOP + 0.016, -10.75);
    for (const [x, z] of [[-0.58, -11.28], [0.58, -11.32]]) {
      const gl = add(meeting, new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.028, 0.11, 16, 1, true), mGlass)); gl.position.set(x, TOP + 0.055, z);
      const wa = add(meeting, new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.027, 0.07, 16), mWater)); wa.position.set(x, TOP + 0.036, z);
    }
  }

  /* ---------- canvases ---------- */
  const tagFail = badges.map((x, i) => () => drawTag(x.tag.s, paint, paint.labels.fail[i].why, "fail"));
  const redraw = () => {
    badges.forEach((x, i) => { drawBadge(x.b.s, paint, LOOKS[i], paint.labels.fail[i].t); tagFail[i](); });
    drawSetukBadge(fixed.s, paint, paint.labels.fixed.t);
    drawLidMark(logoScr, paint);
    drawTag(fixedTag.s, paint, paint.labels.fixed.why, "ok");
    keys.office = keys.chat = keys.missed = keys.lap = "";
  };
  const keys = { office: "", chat: "", missed: "", lap: "" };
  redraw();

  /* ---------- per-frame state ---------- */
  const shot = { w: 0, p: V(0.42, 1.36, -10.2), t: V(-1.2, 1.16, -10.9), fov: 34 };
  const clock = { fail: 0, setup: 0, run: 0, lastSlow: -1 };
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = V(), s4 = V();
  /* where the heads sit until the models arrive */
  const headC = V(1.2, 1.24, -10.9), headP = V(-1.2, 1.24, -10.9), camPos = V();
  let showing = false;

  /* Pose scratch objects, reused every frame */
  const mkPose = (): Pose => ({ lean: 0.08, look: V(), hands: [V(-0.16, 0.845, 0.43), V(0.16, 0.845, 0.43)], backs: [V(0, 1, 0), V(0, 1, 0)], aim: [V(0, 1, 0), V(0, 1, 0)], aimW: 0, nod: 0, tilt: 0, smile: 0, talk: 0 });
  const pc = mkPose(), pp = mkPose();
  const rest = (o: Pose, spread = 0.16, z = 0.39) => { o.hands[0].set(-spread, 0.845, z); o.hands[1].set(spread, 0.845, z); o.backs[0].set(-0.1, 1, 0); o.backs[1].set(0.1, 1, 0); };
  /* idle hands sit well inside the reach (the table edge is ~0.33 in front), so the elbows bend */
  const clasp = (o: Pose) => { o.hands[0].set(-0.045, 0.85, 0.385); o.hands[1].set(0.04, 0.852, 0.4); o.backs[0].set(-0.7, 1, 0.1); o.backs[1].set(0.7, 1, 0.1); };

  const choreograph = (p: number, t: number, reduced: boolean) => {
    consultant?.head.getWorldPosition(headC); politician?.head.getWorldPosition(headP);
    const ph = p < 5.5 ? 0 : p < 6.5 ? 1 : p < 7.5 ? 2 : 3;
    const tm = reduced ? 0 : t;
    [pc, pp].forEach((o) => { o.nod = 0; o.tilt = 0; o.smile = 0; o.talk = 0; o.aimW = 0; });
    if (ph === 0) {
      /* Discuss: they take turns; the listener nods */
      const turn = Math.sin(tm * 1.05), cTalk = smooth(0.1, 0.4, turn), pTalk = smooth(0.1, 0.4, -turn);
      pc.lean = 0.12; pc.look.copy(headP); rest(pc);
      pc.hands[0].set(-0.17 + 0.05 * Math.sin(tm * 2.3), 0.845 + cTalk * (0.13 + 0.04 * Math.sin(tm * 3.1)), 0.39 - cTalk * 0.04);
      pc.backs[0].set(-0.5, 1 - cTalk * 1.6, 0.3 * cTalk);
      pc.talk = cTalk; pc.nod = (1 - cTalk) * 0.07 * Math.max(0, Math.sin(tm * 4.4)) - 0.04 * cTalk; pc.tilt = 0.06 * Math.sin(tm * 0.7);
      pp.lean = 0.06; pp.look.copy(headC);
      if (pTalk > 0.5) {
        pp.hands[0].set(-0.21 - 0.03 * Math.sin(tm * 2.1), 0.96 + 0.03 * Math.sin(tm * 2.9), 0.37); pp.hands[1].set(0.21 + 0.03 * Math.sin(tm * 1.7), 0.95 + 0.03 * Math.sin(tm * 3.3), 0.37);
        pp.backs[0].set(-0.5, -1, 0.2); pp.backs[1].set(0.5, -1, 0.2);
      } else clasp(pp);
      pp.talk = pTalk; pp.nod = (1 - pTalk) * 0.06 * Math.max(0, Math.sin(tm * 3.8)); pp.tilt = -0.05 * Math.sin(tm * 0.6);
    } else if (ph === 1) {
      /* Design: the consultant types; the politician leans in to watch */
      pc.lean = 0.17; pc.look.copy(LAP_SCREEN);
      pc.hands[0].set(-0.085 + 0.012 * Math.sin(tm * 1.3), 0.858 + 0.007 * Math.abs(Math.sin(tm * 13)), 0.535);
      pc.hands[1].set(0.085 + 0.012 * Math.sin(tm * 1.1), 0.858 + 0.007 * Math.abs(Math.sin(tm * 11 + 1)), 0.535);
      pc.backs[0].set(0, 1, -0.15); pc.backs[1].set(0, 1, -0.15);
      pp.lean = 0.16; pp.look.lerpVectors(headC, LAP_SCREEN, 0.5); clasp(pp);
      pp.nod = 0.05 * Math.max(0, Math.sin(tm * 2.2)); pp.tilt = 0.06;
    } else if (ph === 2) {
      /* Train: the consultant runs the call, a hand on the trackpad */
      pc.lean = 0.14; pc.look.copy(LAP_SCREEN); rest(pc, 0.2, 0.42);
      pc.hands[0].set(-0.02 + 0.015 * Math.sin(tm * 0.9), 0.85, 0.5 + 0.01 * Math.sin(tm * 1.3)); pc.backs[0].set(0, 1, -0.1);
      pc.talk = 0.7 * smooth(-0.2, 0.3, Math.sin(tm * 0.8)); pc.nod = 0.03 * Math.sin(tm * 1.9);
      pp.lean = 0.1; pp.look.copy(headC); clasp(pp); pp.nod = 0.05 * Math.max(0, Math.sin(tm * 3.1));
    } else {
      /* Run: the numbers come in; the politician sits back, smiles, nods and joins his hands */
      const r = clock.run, happy = smooth(2.6, 3.8, r), namaste = smooth(3.3, 4.3, r);
      pc.lean = 0.06; pc.look.copy(headP); rest(pc); pc.smile = 0.6 * happy; pc.nod = 0.03 * happy * Math.sin(tm * 2);
      pp.lean = 0.08 - 0.12 * happy; camPos.lerpVectors(headC, shot.p, 0.6 * happy); pp.look.copy(camPos);
      clasp(pp);
      if (namaste > 0) {
        pp.hands[0].lerp(V(-0.026, 0.96, 0.24), namaste); pp.hands[1].lerp(V(0.026, 0.96, 0.24), namaste);
        pp.backs[0].lerp(V(-1, 0, 0.15), namaste); pp.backs[1].lerp(V(1, 0, 0.15), namaste);
        pp.aim[0].set(0.05, 1, 0.3); pp.aim[1].set(-0.05, 1, 0.3); pp.aimW = namaste;
      }
      pp.smile = happy; pp.nod = happy * (0.05 + 0.06 * Math.max(0, Math.sin(tm * 2.6))); pp.tilt = happy * 0.05;
    }
  };

  const showAll = (on: boolean) => {
    showing = on;
    if (on) { set.visible = clutter.visible = meeting.visible = true; set.traverse((o) => { o.visible = true; }); }
  };

  /* On-screen size floor for sprite text: the factor that brings text of height `world` (world units) at
     `pos` up to `px` CSS pixels, between 1 and `cap` */
  const textFloor = (camera: THREE.PerspectiveCamera, cssH: number, pos: THREE.Vector3, world: number, px: number, cap: number) => {
    const perUnit = cssH / (2 * pos.distanceTo(camera.position) * Math.tan((camera.fov * Math.PI) / 360));
    return THREE.MathUtils.clamp(px / (world * perUnit), 1, cap);
  };
  const gridHome = V();
  const update = ({ p, t, dt, reduced, camera, viewH, compact = false, cssH = 0 }: SetFrame) => {
    let changed = false;
    if (showing) return { animating: false, changed };
    const nearTable = p > 1.25 && p < 8.9;
    set.visible = nearTable;
    const clut = p < 4.12, meet = p >= 4.12;
    clutter.visible = clut && nearTable;
    meeting.visible = meet && nearTable;
    if (!nearTable) return { animating: false, changed };

    /* ----- problem and solution ----- */
    if (clut) {
      if (p < 1.4) clock.fail = 0;
      else if (Math.abs(p - 2) < 0.48) clock.fail += dt;
      const fail = reduced ? 99 : clock.fail;
      const mg = smooth(2.32, 2.92, p);
      const gather = smooth(0, 0.6, mg), vanish = smooth(0.45, 0.75, mg), arrive = smooth(0.55, 0.92, mg);
      /* compact: captions (30 px in a 320 canvas, 0.36 wide) keep about 8 px on screen, the four badges in a 2x2 grid */
      const bk = compact && cssH ? textFloor(camera, cssH, FIX, (30 / BADGE.w) * 0.36, 8, 2.6) : 1;
      /* grown that large they would dip behind the desks in front, so in compact layouts they draw on top */
      if (badges[0].b.mat.depthTest === compact) [...badges.flatMap((x) => [x.b.mat, x.tag.mat]), fixed.mat, fixedTag.mat].forEach((m) => { m.depthTest = !compact; });
      badges.forEach((x, i) => {
        const f = smooth(0.85 + i * 0.32, 1.15 + i * 0.32, fail);
        const bob = reduced ? 0 : Math.sin(t * 1.6 + i * 1.3) * 0.012;
        const home = compact ? gridHome.set(((i % 2) - 0.5) * 0.6 * bk, BADGE_Y + 0.12 + (i < 2 ? 0.27 : -0.27) * bk, BADGE_Z) : x.home;
        x.b.sp.position.lerpVectors(home, FIX, gather).y += bob - f * 0.05 * (1 - gather);
        const sc0 = x.b.base * bk * (1 - vanish) * (1 - 0.12 * f);
        x.b.sp.scale.set(sc0, (sc0 * BADGE.h) / BADGE.w, 1);
        x.b.mat.rotation = f * (i % 2 ? -0.16 : 0.14) * (1 - gather);
        const grey = 1 - f * 0.45;
        x.b.mat.color.setRGB(grey, grey, grey);
        x.b.sp.visible = sc0 > 0.002;
        const tg = f * (1 - smooth(0, 0.25, mg)), pop = tg > 0 ? 1 + 0.25 * Math.sin(Math.min(1, tg) * Math.PI) : 0;
        x.tag.sp.visible = tg > 0.01;
        x.tag.sp.scale.set(x.tag.base * bk * tg * pop, (x.tag.base * bk * tg * pop * TAG.h) / TAG.w, 1);
        hang(x.tag.sp, x.b.sp);
      });
      /* compact: the "One system" tag (38 px in a 560 canvas, 0.66 wide) keeps about 10 px on screen */
      const fk = compact && cssH ? textFloor(camera, cssH, FIX, (38 / TAG.w) * 0.66, 10, 3.5) : 1;
      const fs = fixed.base * fk * arrive * (1 + 0.12 * Math.sin(arrive * Math.PI));
      fixed.sp.visible = fs > 0.002; fixed.sp.scale.set(fs, (fs * BADGE.h) / BADGE.w, 1);
      fixed.sp.position.copy(FIX).add(V(0, arrive * 0.3 * fk + (reduced ? 0 : Math.sin(t * 1.4) * 0.015), 0));
      const ft = smooth(0.85, 1, mg);
      fixedTag.sp.visible = ft > 0.01; fixedTag.sp.scale.set(fixedTag.base * fk * ft, (fixedTag.base * fk * ft * TAG.h) / TAG.w, 1);
      const off = smooth(3.6, 3.95, p);
      if (off > 0) { fixed.sp.scale.multiplyScalar(1 - off); fixedTag.sp.scale.multiplyScalar(1 - off); }
      hang(fixedTag.sp, fixed.sp);

      /* halo and ripples: the fix radiating out to the people */
      const glow = smooth(0.7, 1, mg) * (1 - off);
      halo.visible = glow > 0.01;
      if (halo.visible) {
        const hs = 1.35 * fk * glow * (1 + (reduced ? 0 : Math.sin(t * 1.8) * 0.03));
        halo.scale.set(hs, hs, 1);
        halo.position.copy(fixed.sp.position).add(V(0, 0.02, -0.03));
        haloMat.rotation = reduced ? 0 : t * 0.25;
        haloMat.color.copy(k.accent).multiplyScalar(0.9 * glow);
      }
      ripples.forEach((r, i) => {
        const u = reduced ? (i + 1) / (RIPPLES + 1) : (t * 0.22 + i / RIPPLES) % 1;
        r.visible = glow > 0.01;
        r.scale.setScalar(0.6 + u * 7.5);
        (r.material as THREE.MeshBasicMaterial).color.copy(k.accent).multiplyScalar(glow * (1 - u) * smooth(0, 0.12, u) * 0.9);
      });

      /* clutter dissolves into the stream, item by item */
      const shrink = (i: number) => 1 - smooth(0.1 + i * 0.07, 0.45 + i * 0.07, mg);
      const sA = shrink(0), sB = shrink(1), sF = shrink(2), sP = shrink(3);
      regs.forEach((m, i) => {
        const s = i < 6 ? sA : sB;
        m.decompose(v4, q4, s4); v4.y += (1 - s) * 0.2; s4.setScalar(Math.max(1e-4, s));
        m4.compose(v4, q4, s4); pages.setMatrixAt(i, m4); covers.setMatrixAt(i, m4);
      });
      filesM.forEach((m, i) => { m.decompose(v4, q4, s4); v4.y += (1 - sF) * 0.2; s4.setScalar(Math.max(1e-4, sF)); m4.compose(v4, q4, s4); files.setMatrixAt(i, m4); });
      [sA, sB, sF].forEach((v, i) => { blobs[i].scale.setScalar(Math.max(1e-4, v)); blobs[i].visible = v > 0.01; });
      tape.scale.setScalar(Math.max(1e-4, sF)); tape.position.copy(filesAt).add(V(0, (1 - sF) * 0.2, 0));
      pages.instanceMatrix.needsUpdate = covers.instanceMatrix.needsUpdate = files.instanceMatrix.needsUpdate = true;
      pages.visible = covers.visible = sB > 0.001 || sA > 0.001;
      phoneB.scale.setScalar(Math.max(1e-4, shrink(4))); phoneC.scale.setScalar(Math.max(1e-4, shrink(5)));
      phoneB.visible = phoneC.visible = shrink(5) > 0.001 || shrink(4) > 0.001;
      /* papers: resting ones shrink away; the falling ones loop until the fix */
      for (let i = 0; i < PAPERS; i++) {
        const s = Math.max(1e-4, sP);
        if (i < FALLING && !reduced && mg < 0.3) {
          const u = (t * 0.32 + i * 0.21) % 1, fall = smooth(0.15, 0.85, u);
          v4.lerpVectors(fallFrom[i], fallTo[i], fall);
          v4.y = THREE.MathUtils.lerp(fallFrom[i].y, fallTo[i].y, fall * fall) + Math.sin(u * 9) * 0.03 * (1 - fall);
          v4.x += Math.sin(u * 7 + i) * 0.08 * fall * (1 - fall);
          e4.set(Math.sin(u * 8 + i) * 0.9 * (1 - fall), i + u * 3, Math.cos(u * 6) * 0.7 * (1 - fall));
          const g = smooth(0, 0.08, u) * (1 - smooth(0.9, 1, u)) * s;
          m4.compose(v4, q4.setFromEuler(e4), s4.setScalar(Math.max(1e-4, g)));
        } else {
          restPapers[i].decompose(v4, q4, s4); s4.setScalar(s); m4.compose(v4, q4, s4);
        }
        papers.setMatrixAt(i, m4);
      }
      papers.instanceMatrix.needsUpdate = true;
      /* phones buzz until the fix */
      const buzz = !reduced && mg < 0.3 && (t % 1.7) < 0.32;
      phoneB.position.copy(phoneBHome); phoneC.position.copy(phoneCHome);
      if (buzz) { phoneB.position.x += Math.sin(t * 160) * 0.0016; phoneB.rotation.y = 0.35 + Math.sin(t * 140) * 0.02; phoneC.position.z += Math.sin(t * 150) * 0.0016; }
      phoneA.position.copy(phoneAHome);
      if (!reduced && mg < 0.3 && ((t + 0.8) % 2.3) < 0.28) phoneA.position.x += Math.sin(t * 170) * 0.0012;

      const on = smooth(2.7, 3.0, p) * (1 - smooth(3.4, 3.8, p));
      outflow.visible = on > 0.01;
      oMat.uniforms.uOn.value = on; oMat.uniforms.uTime.value = reduced ? 0.5 : t;
      oMat.uniforms.uSize.value = (0.24 * viewH) / (2 * Math.tan((camera.fov * Math.PI) / 360));
      sMat.uniforms.uM.value = mg * 1.35 - 0.1;
      sMat.uniforms.uTime.value = t;
      sMat.uniforms.uSize.value = (0.03 * viewH) / (2 * Math.tan((camera.fov * Math.PI) / 360));
      stream.visible = mg > 0.02 && mg < 0.98;

      /* screens (throttled to ~8 fps while they animate) */
      const slow = Math.floor(t * 8);
      if (mg < 0.45) {
        const key = "x" + (reduced ? 0 : slow);
        if (key !== keys.office) { keys.office = key; drawExcel(officeScr, paint, reduced ? 0 : slow / 8); changed = true; }
      } else {
        const pr = smooth(0.45, 1, mg), key = "i" + Math.round(pr * 60);
        if (key !== keys.office) { keys.office = key; drawInbox(officeScr, paint, pr); changed = true; }
      }
      const n = reduced ? 6 : Math.floor(t / 0.85);
      const ck = (mg > 0.6 ? "ok" : "c" + n);
      if (ck !== keys.chat) {
        keys.chat = ck;
        if (mg > 0.6) drawPhoneOk(chatScr, paint); else { drawChat(chatScr, paint, n); drawChat(chat2Scr, paint, n + 3); }
        changed = true;
      }
      const mk = "m" + Math.floor(n / 3);
      if (mk !== keys.missed) { keys.missed = mk; drawMissed(missedScr, paint, Math.floor(n / 3)); changed = true; }
    }

    /* ----- the meeting ----- */
    if (meet) {
      if (p < 5.3) clock.setup = 0;
      else if (Math.abs(p - 6) < 0.42) clock.setup += dt;
      if (p > 7.78) clock.run += dt; else clock.run = Math.max(0, clock.run - dt * 3);
      if (reduced) { clock.setup = Math.abs(p - 6) < 0.5 ? 99 : clock.setup; clock.run = p > 7.78 ? 99 : 0; }
      /* the lid opens on the way to Design */
      const open = smooth(5.15, 5.6, p);
      lap.lid.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.02, -0.26, open);
      lap.disp.visible = open > 0.4;
      choreograph(p, t, reduced);
      consultant?.pose(pc, reduced ? 0 : dt, reduced ? 0 : t);
      politician?.pose(pp, reduced ? 0 : dt, reduced ? 0 : t);
      /* laptop screen */
      let key = "", draw: (() => void) | null = null;
      if (p < 6.6) { const pr = smooth(0.2, 4.6, clock.setup); key = "s" + Math.round(pr * 90); draw = () => drawSetup(lapScr, paint, pr); }
      else if (p < 7.5) { const tt = reduced ? 1.7 : Math.floor(t * 8) / 8; key = "m" + tt; draw = () => drawMeet(lapScr, paint, tt); }
      else { const pr = smooth(0.25, 2.5, clock.run); key = "r" + Math.round(pr * 120); draw = () => drawRun(lapScr, paint, pr); }
      if (key !== keys.lap) { keys.lap = key; draw(); changed = true; }
      shot.w = smoother(smooth(2.6, 4.3, clock.run));
    } else shot.w = 0;

    const animating = !reduced && ((clut && p > 1.4 && p < 3.6) || (meet && p > 4.4));
    if (swapped) { swapped = false; changed = true; }
    return { animating, changed };
  };

  extras.push(sGeo, sMat);
  return { root: set, update, shot, redraw, showAll, extras };
}

/**
 * The consultant model: matte cloth (the converted materials come out glossy), black hair with
 * clean card edges, and a warmer complexion.
 */
const executive = (m: THREE.Mesh) => {
  const mat = m.material as THREE.MeshPhysicalMaterial;
  if (/Shirt/i.test(mat.name)) mat.color.set("#c9dcf0");
  if (/Shirt|Slacks|shoes/i.test(mat.name)) { mat.roughness = /shoes/i.test(mat.name) ? 0.45 : 0.85; mat.metalness = 0; if (mat.isMeshPhysicalMaterial) mat.specularIntensity = 0.25; }
  if (/Classic_Taper/.test(mat.name)) { mat.color.set("#3a3330"); mat.alphaTest = 0.5; mat.transparent = false; mat.depthWrite = true; mat.roughness = 0.6; }
  if (/Std_Skin|Std_Nails/.test(mat.name)) skinTone(mat, [0.98, 0.9, 0.84]);
};

/** Redraw a texture through a per-pixel colour function (keeps folds and strands) */
const recolor = (map: THREE.Texture, fn: (r: number, g: number, b: number, out: number[]) => void) => {
  const img = map.image as HTMLImageElement | ImageBitmap;
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d")!; g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), px = d.data, o = [0, 0, 0];
  for (let i = 0; i < px.length; i += 4) { fn(px[i], px[i + 1], px[i + 2], o); px[i] = o[0]; px[i + 1] = o[1]; px[i + 2] = o[2]; }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.flipY = map.flipY; t.channel = map.channel; t.wrapS = map.wrapS; t.wrapT = map.wrapT; t.colorSpace = THREE.SRGBColorSpace;
  map.dispose();
  return t;
};

/** White cloth: drop the texture's colour, keep its folds as shading around its mean brightness */
const whiten = (mat: THREE.MeshPhysicalMaterial) => {
  if (mat.map && !mat.userData.whitened) {
    const img = mat.map.image as HTMLImageElement | ImageBitmap;
    const c = document.createElement("canvas"); c.width = c.height = 16;
    const g = c.getContext("2d")!; g.drawImage(img, 0, 0, 16, 16);
    const px = g.getImageData(0, 0, 16, 16).data;
    let mean = 0;
    for (let i = 0; i < px.length; i += 4) mean += 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
    mean = Math.max(1, mean / (px.length / 4));
    mat.map = recolor(mat.map, (r, gr, b, o) => { o[0] = o[1] = o[2] = Math.min(255, 242 * (0.8 + 0.2 * ((0.3 * r + 0.59 * gr + 0.11 * b) / mean))); });
    mat.userData.whitened = true;
  }
  mat.color.set("#ffffff");
};

/** Skin: take most of the red out of the texture, then set the tone (multipliers per channel) */
const skinTone = (mat: THREE.MeshPhysicalMaterial, tone: [number, number, number]) => {
  if (mat.map && !mat.userData.toned) {
    mat.map = recolor(mat.map, (r, g, b, o) => {
      const l = 0.3 * r + 0.59 * g + 0.11 * b;
      o[0] = (l + (r - l) * 0.45) * tone[0]; o[1] = (l + (g - l) * 0.45) * tone[1]; o[2] = (l + (b - l) * 0.45) * tone[2];
    });
    mat.userData.toned = true;
  }
  mat.color.set("#ffffff"); mat.roughness = 0.6;
  if (mat.isMeshPhysicalMaterial) { mat.specularIntensity = 0.3; mat.sheen = 0; }
};

/** The politician's clothes and colouring on the executive model */
const leader = (m: THREE.Mesh) => {
  const mat = m.material as THREE.MeshPhysicalMaterial;
  const matte = () => { mat.metalness = 0; if (mat.isMeshPhysicalMaterial) mat.specularIntensity = 0.2; };
  if (/Shirt|Slacks/i.test(mat.name)) { whiten(mat); mat.roughness = 0.9; matte(); }
  else if (/shoes/i.test(mat.name)) { mat.color.set("#6b4428"); mat.roughness = 0.5; matte(); }
  else if (/Classic_Taper/.test(mat.name)) {
    /* salt and pepper: strands mapped to greys by their brightness */
    if (mat.map) mat.map = recolor(mat.map, (r, g, b, o) => { const l = (r + g + b) / 765, v = 28 + l * 190 + ((r * 7 + b) % 23 > 15 ? 55 : 0); o[0] = o[1] = o[2] = Math.min(200, v); });
    mat.color.set("#ffffff"); mat.alphaTest = 0.5; mat.transparent = false; mat.depthWrite = true; mat.roughness = 0.65;
  } else if (/Std_Skin|Std_Nails/.test(mat.name)) skinTone(mat, [0.8, 0.7, 0.62]);
};

/** Glasses and mustache (ride the head), built around the rest pose */
const leaderExtras = (a: Anchors, mat: SetKit["mat"]) => {
  const frame = mat({ color: "#1d1b1a", metalness: 0.5, roughness: 0.35 });
  const hairM = mat({ color: "#4a4643", roughness: 0.8 });
  /* glasses: thin rectangular-round rims in front of the eyes, temples back to the ears */
  const [eR, eL] = a.eyes, mid = eR.clone().add(eL).multiplyScalar(0.5), z = mid.z + 0.03;
  const parts: THREE.BufferGeometry[] = [];
  for (const e of [eR, eL]) {
    const ring = new THREE.TorusGeometry(0.0175, 0.0012, 6, 28); ring.scale(1.2, 0.85, 1); ring.translate(e.x, e.y, z); parts.push(ring);
    const s = Math.sign(e.x - mid.x);
    const arm = new THREE.BoxGeometry(0.002, 0.0022, 0.1); arm.translate(e.x + s * 0.026, e.y + 0.004, z - 0.05); parts.push(arm);
  }
  const bridge = new THREE.BoxGeometry(Math.abs(eL.x - eR.x) - 0.042, 0.002, 0.002); bridge.translate(mid.x, mid.y + 0.004, z + 0.002); parts.push(bridge);
  parts.forEach((g) => a.head.add(new THREE.Mesh(g, frame)));
  /* mustache over the upper lip */
  const mu = new THREE.TorusGeometry(0.019, 0.005, 8, 18, Math.PI); mu.scale(1.1, 0.42, 0.55);
  const must = new THREE.Mesh(mu, hairM); must.position.set(mid.x, mid.y - 0.058, mid.z + 0.03); a.head.add(must);
};

const smoother = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
