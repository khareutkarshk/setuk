/**
 * "Sadan": a model of the new Lok Sabha chamber and a scroll-driven camera that tells the homepage
 * story (who we serve, the problem, the fix, the two products, the four steps of how we work).
 *
 * Framework-free: the React side passes a container, a stage element and a progress getter, and gets a
 * handle with dispose(). Geometry is procedural (curved desk rows are swept profiles, seats are
 * instanced), surfaced with CC0 Poly Haven maps plus canvas-drawn patterns from reference photos.
 *
 * The office scenes (the problem, the fix and the four steps of how we work) play at the table in
 * the well; see office-set.ts.
 *
 * Performance: see quality.ts for the tiers. Shadows and the reflection probe render once, shaders
 * compile before the first frame, frames render only when something changed or animates (idle
 * animation is capped at 30 fps below the high tier), and the loop idles while the stage is off
 * screen or the tab is hidden. While frames render back to back the engine watches the frame
 * interval and steps quality down if the median goes above ~26 ms.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { SceneLabels } from "@/content/types";
import { clamp01, smooth } from "./progress";
import { pickTier, probeGpu, type Tier } from "./quality";
import { DESK, WALL, createScreen, drawChaos, drawDashboard, drawDesk, drawReport, type Paint } from "./screens";
import { TAG, drawTag } from "./set-screens";
import { createOfficeSet } from "./office-set";
import { onThemeChange } from "../theme";

export interface SadanOptions {
  /** Element the engine adds its own <canvas> to. Each instance owns its canvas (and WebGL context),
      so a cancelled instance (e.g. React StrictMode's double mount) can't lose the context of the next one. */
  container: HTMLElement;
  /** Sticky stage that holds the canvas; sized and observed for visibility */
  stage: HTMLElement;
  /** Current chapter progress (0..8) */
  progress: () => number;
  labels: SceneLabels;
  reducedMotion: boolean;
  /** Public path holding tex/ and tex/lite/, e.g. "/sadan/v1/" */
  assetBase: string;
  /** "low" | "mid" | "high" to force a tier */
  quality?: string | null;
  signal?: AbortSignal;
  onReady?: () => void;
  /** Load progress, 0..1, reported as textures arrive and the scene compiles */
  onProgress?: (p: number) => void;
  onContextLost?: () => void;
}

export interface SadanHandle {
  tier: Tier;
  /** Re-read the accent and fonts from CSS (theme or language change) */
  refreshTheme(): void;
  dispose(): void;
}

interface Seat { r: number; b: number; R: number; y: number; k: number; n: number; a: number; jit: number }
type Profile = [number, number, boolean?][];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const DEG = Math.PI / 180;

export async function createSadan(o: SadanOptions): Promise<SadanHandle | null> {
  const gpu = probeGpu();
  if (gpu === null) return null;
  const T = pickTier(gpu, o.quality);
  const { stage, container } = o;
  stage.dataset.tier = T.tier;
  const root = document.documentElement;
  const aborted = () => o.signal?.aborted ?? false;
  let visible = true, disposed = false, raf = 0;

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* ---------- theme ---------- */
  const css = (name: string, fallback: string) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  const paint: Paint = {
    font: () => getComputedStyle(document.body).fontFamily || "sans-serif",
    accent: () => css("--accent", "#1747A6"),
    accentInk: () => css("--accent-ink", "#F7F9FF"),
    labels: o.labels
  };
  const glowColor = new THREE.Color();
  const syncAccent = () => { glowColor.setStyle(paint.accent()); };
  syncAccent();

  /* ---------- renderer ---------- */
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !T.post, powerPreference: T.tier === "high" ? "high-performance" : "default" });
  } catch {
    canvas.remove();
    return null;
  }
  const onLost = (e: Event) => { e.preventDefault(); o.onContextLost?.(); };
  canvas.addEventListener("webglcontextlost", onLost);
  let pixelRatio = Math.min(devicePixelRatio, T.dpr);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = T.tier === "high" ? 1.18 : 1.24;
  renderer.shadowMap.enabled = T.shadows > 0;
  renderer.shadowMap.type = T.tier === "high" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const maxAniso = Math.min(T.tier === "low" ? 2 : 8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a120c");
  const world = new THREE.Group();
  scene.add(world);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.06, 220);

  /* Everything created below that holds GPU memory outside the scene graph is tracked for dispose() */
  const extras: { dispose(): void }[] = [];
  const disposeAll = () => {
    scene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mat) => {
        Object.values(mat).forEach((v) => { if (v instanceof THREE.Texture) v.dispose(); });
        mat.dispose();
      });
    });
    extras.forEach((x) => x.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };

  /* ---------- textures ---------- */
  const loader = new THREE.TextureLoader();
  const base = o.assetBase + "tex/" + T.tex;
  const TEX_COUNT = 10;
  let texDone = 0;
  const tick = () => o.onProgress?.(0.1 + 0.6 * (++texDone / TEX_COUNT));
  const load = async (name: string, srgb = false, detail = false): Promise<THREE.Texture | null> => {
    const t = await loadTex(name, srgb, detail);
    tick();
    return t;
  };
  const loadTex = async (name: string, srgb: boolean, detail: boolean): Promise<THREE.Texture | null> => {
    if (detail && !T.maps) return null;
    try {
      const t = await loader.loadAsync(base + name);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = maxAniso;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      extras.push(t);
      return t;
    } catch {
      return null;
    }
  };
  const [woodD, woodN, woodR, suedeR, carpetN, carpetR, stoneD, stoneN, stoneR, peacockT] = await Promise.all([
    load("teak_veneer_diffuse.jpg", true), load("sapele_veneer_nor_gl.jpg", false, true), load("sapele_veneer_rough.jpg", false, true),
    load("scuba_suede_rough.jpg", false, true),
    load("dirty_carpet_nor_gl.jpg", false, true), load("dirty_carpet_rough.jpg", false, true),
    load("beige_wall_001_diffuse.jpg", true), load("beige_wall_001_nor_gl.jpg", false, true), load("beige_wall_001_rough.jpg", false, true),
    load("peacock_jaali.jpg", true)
  ]);
  if (aborted()) { disposeAll(); return null; }
  o.onProgress?.(0.75);
  const woodImg = woodD?.image as HTMLImageElement | undefined;

  /* A texture copy with its own tiling. UVs in this scene are in metres, so repeat = 1 / tile size. */
  const tiled = (t: THREE.Texture | null, metres: number, rot = 0) => {
    if (!t) return null;
    const c = t.clone();
    c.repeat.set(1 / metres, 1 / metres);
    c.rotation = rot;
    c.needsUpdate = true;
    return c;
  };
  /* Canvas texture drawn in logical pixels (w x h) at `scale` resolution */
  const canvasTex = (
    w: number, h: number,
    draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
    { srgb = true, metres, scale = 1 }: { srgb?: boolean; metres?: number; scale?: number } = {}
  ) => {
    const c = document.createElement("canvas");
    c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    const g = c.getContext("2d")!;
    g.scale(scale, scale);
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (metres) t.repeat.set(1 / metres, 1 / metres);
    return t;
  };
  /* Normal map from a greyscale height canvas (Sobel) */
  const normalFromHeight = (src: HTMLCanvasElement, strength = 2) => {
    const w = src.width, h = src.height;
    const d = src.getContext("2d")!.getImageData(0, 0, w, h).data;
    const out = new ImageData(w, h);
    const H = (x: number, y: number) => d[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y - 1) + 2 * H(x + 1, y) + H(x + 1, y + 1) - H(x - 1, y - 1) - 2 * H(x - 1, y) - H(x - 1, y + 1)) * strength;
      const dy = (H(x - 1, y + 1) + 2 * H(x, y + 1) + H(x + 1, y + 1) - H(x - 1, y - 1) - 2 * H(x, y - 1) - H(x + 1, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
      out.data[i] = (-dx / l * 0.5 + 0.5) * 255; out.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; out.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; out.data[i + 3] = 255;
    }
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d")!.putImageData(out, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
    return t;
  };

  /* Wall marquetry: squares of veneer with the grain alternating, as on the Speaker's side walls */
  const marquetry = canvasTex(1024, 1024, (g, w) => {
    const cell = w / 4, src = woodImg ? woodImg.width / 4 : 0;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      g.save();
      g.translate(i * cell + cell / 2, j * cell + cell / 2);
      if ((i + j) % 2) g.rotate(Math.PI / 2);
      if (woodImg) g.drawImage(woodImg, (((i * 331 + j * 517) / 2048) * woodImg.width) % (woodImg.width - src), (((j * 241 + i * 97) / 2048) * woodImg.width) % (woodImg.height - src), src, src, -cell / 2, -cell / 2, cell, cell);
      else { g.fillStyle = (i + j) % 2 ? "#a8683a" : "#b9784a"; g.fillRect(-cell / 2, -cell / 2, cell, cell); }
      g.restore();
    }
    g.strokeStyle = "rgba(40,20,8,.55)"; g.lineWidth = 3;
    for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(k * cell, 0); g.lineTo(k * cell, w); g.stroke(); g.beginPath(); g.moveTo(0, k * cell); g.lineTo(w, k * cell); g.stroke(); }
  }, { metres: 2.4, scale: T.canvas });

  /* Carpet: teal-green with a small diamond-and-dot motif (reference: overhead photo of the House) */
  const carpetMap = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#226a5e"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = rnd() > 0.5 ? "rgba(20,70,60,.35)" : "rgba(80,160,140,.25)"; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    const s = 64;
    g.strokeStyle = "rgba(22,84,72,.9)"; g.lineWidth = 3;
    for (let k = -h; k < w + h; k += s) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); g.beginPath(); g.moveTo(k, h); g.lineTo(k + h, 0); g.stroke(); }
    g.fillStyle = "rgba(120,190,170,.75)";
    for (let y = 0; y <= h; y += s) for (let x = 0; x <= w; x += s) { g.beginPath(); g.arc(x + s / 2, y, 4, 0, 7); g.fill(); g.beginPath(); g.arc(x, y + s / 2, 2.5, 0, 7); g.fill(); }
  }, { metres: 0.9 });

  /* Upholstery: teal velvet with fine diamond quilting */
  const quiltH = document.createElement("canvas");
  const fabricMap = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#23786c"; g.fillRect(0, 0, w, h);
    quiltH.width = quiltH.height = w;
    const q = quiltH.getContext("2d")!;
    q.fillStyle = "#fff"; q.fillRect(0, 0, w, h);
    const s = 64;
    [g, q].forEach((c, k) => {
      c.strokeStyle = k ? "#000" : "rgba(12,60,52,.55)"; c.lineWidth = k ? 6 : 2;
      if (k) c.filter = "blur(3px)";
      for (let off = -h; off < w + h; off += s) { c.beginPath(); c.moveTo(off, 0); c.lineTo(off + h, h); c.stroke(); c.beginPath(); c.moveTo(off, h); c.lineTo(off + h, 0); c.stroke(); }
      c.filter = "none";
    });
  }, { metres: 0.15 });
  const quiltN = T.maps ? normalFromHeight(quiltH, 2) : null;
  quiltN?.repeat.set(1 / 0.15, 1 / 0.15);

  /* Jade stone wall behind the Speaker: mottled green with a faint carved lattice */
  const jadeMap = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#29503f"; g.fillRect(0, 0, w, h);
    const blobs = Math.round(6000 * T.canvas);
    for (let i = 0; i < blobs; i++) {
      const x = rnd() * w, y = rnd() * h, r = 2 + rnd() * rnd() * 26;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const c = rnd() > 0.5 ? "60,110,88" : "24,58,44";
      gr.addColorStop(0, `rgba(${c},${0.12 + rnd() * 0.18})`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 70; i++) {
      let x = rnd() * w, y = rnd() * h, a = rnd() * 7;
      g.strokeStyle = `rgba(${rnd() > 0.5 ? "150,200,170" : "12,34,26"},${0.08 + rnd() * 0.12})`; g.lineWidth = 0.6 + rnd() * 1.4;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 40; k++) { a += (rnd() - 0.5) * 0.7; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); }
      g.stroke();
    }
    g.strokeStyle = "rgba(150,200,170,.16)"; g.lineWidth = 2;
    const s = 128;
    for (let y = 0; y <= h; y += s) for (let x = 0; x <= w; x += s) {
      g.beginPath(); g.moveTo(x + s / 2, y); g.lineTo(x + s, y + s / 2); g.lineTo(x + s / 2, y + s); g.lineTo(x, y + s / 2); g.closePath(); g.stroke();
      g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.18, 0, 7); g.stroke();
    }
  }, { metres: 3, scale: T.canvas });

  /* Ceiling: dark timber with a peacock-feather lattice (two families of log spirals) and downlights */
  const CEIL = { w: 50, d: 30, cz: -4 };
  const ceilH = document.createElement("canvas");
  const ceilEmit = document.createElement("canvas");
  const ceilMap = canvasTex(2048, 1229, (g, w, h) => {
    const k = T.canvas;
    ceilH.width = ceilEmit.width = Math.round(w * k); ceilH.height = ceilEmit.height = Math.round(h * k);
    const q = ceilH.getContext("2d")!, e = ceilEmit.getContext("2d")!;
    q.scale(k, k); e.scale(k, k);
    const cx = w / 2, cy = ((14 - CEIL.cz) / CEIL.d) * h;
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
    grd.addColorStop(0, "#5a3a22"); grd.addColorStop(1, "#2e1d12");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    q.fillStyle = "#000"; q.fillRect(0, 0, w, h);
    e.fillStyle = "#000"; e.fillRect(0, 0, w, h);
    const n = 22, b = 0.42, r0 = 40;
    const spiral = (kk: number, dir: number, ctxs: [CanvasRenderingContext2D, string, number][]) => {
      ctxs.forEach(([c, style, lw]) => {
        c.strokeStyle = style; c.lineWidth = lw; c.beginPath();
        for (let t = 0; t <= 1; t += 0.004) {
          const lr = t * 4.2, r = r0 * Math.exp(lr);
          const th = (2 * Math.PI * kk) / n + (dir * lr) / b;
          const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
          if (t) c.lineTo(x, y); else c.moveTo(x, y);
        }
        c.stroke();
      });
    };
    for (let kk = 0; kk < n; kk++) for (const dir of [1, -1]) {
      spiral(kk, dir, [[g, "rgba(20,10,4,.55)", 15], [g, "#b98552", 9], [g, "rgba(255,226,180,.55)", 2.5], [q, "#fff", 13]]);
    }
    /* downlights at the lattice crossings */
    for (let m = 1; m < 60; m++) {
      const r = r0 * Math.exp((b * Math.PI * m) / n);
      if (r > w) break;
      for (let j = 0; j < 2 * n; j++) {
        if ((j + m) % 2) continue;
        const th = (Math.PI * j) / n, x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
        if (x < 8 || y < 8 || x > w - 8 || y > h - 8) continue;
        const rad = Math.min(11, 5 + r * 0.004);
        g.fillStyle = "#2a2018"; g.beginPath(); g.arc(x, y, rad + 4, 0, 7); g.fill();
        g.fillStyle = "#fff7e6"; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
        e.fillStyle = "#fff4e0"; e.beginPath(); e.arc(x, y, rad, 0, 7); e.fill();
      }
    }
    q.setTransform(1, 0, 0, 1, 0, 0);
    q.filter = "blur(4px)"; q.drawImage(ceilH, 0, 0); q.filter = "none";
  }, { scale: T.canvas });
  ceilMap.wrapS = ceilMap.wrapT = THREE.ClampToEdgeWrapping;
  let ceilN: THREE.CanvasTexture | null = null;
  if (T.maps) {
    const c = document.createElement("canvas");
    c.width = 1024 * T.canvas; c.height = 615 * T.canvas;
    c.getContext("2d")!.drawImage(ceilH, 0, 0, c.width, c.height);
    ceilN = normalFromHeight(c, 4 * T.canvas);
    ceilN.wrapS = ceilN.wrapT = THREE.ClampToEdgeWrapping;
  }
  const ceilE = new THREE.CanvasTexture(ceilEmit); ceilE.colorSpace = THREE.SRGBColorSpace;

  /* Desk-end panels: gold peacock-feather inlay on teak (reference: desk ends near the well) */
  const inlayMap = canvasTex(512, 512, (g, w, h) => {
    if (woodImg) g.drawImage(woodImg, 0, 0, woodImg.width * 0.44, woodImg.height * 0.44, 0, 0, w, h); else { g.fillStyle = "#8a4f26"; g.fillRect(0, 0, w, h); }
    g.fillStyle = "rgba(70,30,10,.35)"; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) {
      const x = 50 + k * 84 + (row % 2) * 42, y = 150 + row * 120;
      g.fillStyle = "#e3b562"; g.beginPath(); g.ellipse(x, y, 30, 40, 0, Math.PI, 0); g.lineTo(x, y + 40); g.closePath(); g.fill();
      g.fillStyle = "#5a2c10"; g.beginPath(); g.ellipse(x, y, 18, 26, 0, Math.PI, 0); g.lineTo(x, y + 22); g.closePath(); g.fill();
      g.fillStyle = "#f2cf86"; g.beginPath(); g.arc(x, y - 8, 7, 0, 7); g.fill();
    }
  }, { scale: T.tier === "low" ? 0.5 : 1 });

  /* Desk tablet screens (generic; the hero desk gets its own live screen) */
  const tabletMap = canvasTex(256, 160, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#1d3557"); gr.addColorStop(1, "#0b1526");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, 0, w, 22);
    ([["#e8873a", 52], ["#e9e9e9", 60], ["#2e8b3a", 68]] as const).forEach(([c, y]) => { g.fillStyle = c; g.fillRect(16, y, 34, 8); });
    g.fillStyle = "rgba(220,230,245,.55)";
    for (let k = 0; k < 5; k++) g.fillRect(64, 50 + k * 18, 120 + ((k * 37) % 60), 6);
    g.fillStyle = "rgba(120,170,255,.45)"; g.fillRect(16, 128, w - 32, 14);
  });

  /* ---------- materials ----------
     High tier keeps the physical look (clear-coated wood, velvet sheen). Other tiers use
     MeshStandardMaterial, which is much cheaper per pixel; a clear coat becomes lower roughness. */
  type PhysParams = THREE.MeshPhysicalMaterialParameters;
  const P = (p: PhysParams): THREE.MeshStandardMaterial => {
    if (T.physical) return new THREE.MeshPhysicalMaterial(p);
    const { clearcoat, clearcoatRoughness, sheen, sheenColor, sheenRoughness, ...rest } = p;
    void clearcoatRoughness; void sheen; void sheenColor; void sheenRoughness;
    if (clearcoat) rest.roughness = (rest.roughness ?? 1) * 0.7;
    return new THREE.MeshStandardMaterial(rest);
  };
  const wood = (metres: number, rot: number, tint = "#d2a77c", extra: PhysParams = {}) => P({
    map: tiled(woodD, metres, rot), normalMap: tiled(woodN, metres, rot), roughnessMap: tiled(woodR, metres, rot),
    color: tint, roughness: 0.85, normalScale: new THREE.Vector2(0.6, 0.6), clearcoat: 0.55, clearcoatRoughness: 0.22, ...extra
  });
  const alcoveTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffd9a0"); gr.addColorStop(0.25, "#b3713c"); gr.addColorStop(1, "#3a200f"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const M = {
    desk: wood(1.6, Math.PI / 2),
    deskDark: wood(1.6, Math.PI / 2, "#8f6a4c"),
    panel: wood(2.2, 0, "#c99c72", { clearcoat: 0.3 }),
    wall: P({ map: marquetry, normalMap: tiled(woodN, 2.4), roughnessMap: tiled(woodR, 2.4), color: "#dcb48e", roughness: 0.9, clearcoat: 0.25, clearcoatRoughness: 0.35 }),
    inlay: P({ map: inlayMap, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.2 }),
    carpet: new THREE.MeshStandardMaterial({ map: carpetMap, normalMap: tiled(carpetN, 0.9), roughnessMap: tiled(carpetR, 0.9), normalScale: new THREE.Vector2(1.2, 1.2), roughness: 1 }),
    stone: new THREE.MeshStandardMaterial({ map: tiled(stoneD, 3), normalMap: tiled(stoneN, 3), roughnessMap: tiled(stoneR, 3), color: "#f2e2c6", roughness: 0.9 }),
    jade: P({ map: jadeMap, normalMap: tiled(stoneN, 3), normalScale: new THREE.Vector2(0.25, 0.25), roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.12 }),
    gold: P({ color: "#d9aa52", metalness: 1, roughness: 0.24 }),
    brass: P({ color: "#c8964a", metalness: 1, roughness: 0.32 }),
    peacock: new THREE.MeshStandardMaterial({ map: peacockT, emissive: "#ffd9a6", emissiveMap: peacockT, emissiveIntensity: 1.1, roughness: 0.9 }),
    ceil: new THREE.MeshStandardMaterial({ map: ceilMap, normalMap: ceilN, normalScale: new THREE.Vector2(1.6, 1.6), emissive: "#fff2dc", emissiveMap: ceilE, emissiveIntensity: T.post ? 7 : 4, roughness: 0.6 }),
    black: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.35, metalness: 0.3 }),
    tabletScreen: P({ color: "#000", emissive: "#ffffff", emissiveMap: tabletMap, emissiveIntensity: 0.45, roughness: 0.1, clearcoat: 1 }),
    alcove: new THREE.MeshStandardMaterial({ map: alcoveTex, emissive: "#ffffff", emissiveMap: alcoveTex, emissiveIntensity: 0.35, roughness: 0.8 })
  };

  /* Upholstery with a per-instance glow (aGlow) that tints toward the accent */
  const fabric = P({
    map: fabricMap, normalMap: quiltN, normalScale: new THREE.Vector2(0.6, 0.6), roughnessMap: tiled(suedeR, 0.4),
    roughness: 1, sheen: 1, sheenColor: "#8fe0cf", sheenRoughness: 0.45
  });
  /* Plain copy for parts that never glow (galleries, dais), cloned before the shader hook is attached */
  const fabricPlain = fabric.clone();
  fabric.onBeforeCompile = (sh) => {
    sh.uniforms.uGlow = { value: glowColor };
    sh.vertexShader = "attribute float aGlow;\nvarying float vGlow;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
    sh.fragmentShader = "uniform vec3 uGlow;\nvarying float vGlow;\n" + sh.fragmentShader
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uGlow, clamp(vGlow, 0.0, 1.0) * 0.75);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlow * vGlow * 0.4;");
  };

  const add = <O extends THREE.Object3D>(mesh: O, cast = true, recv = true) => { mesh.castShadow = cast; mesh.receiveShadow = recv; world.add(mesh); return mesh; };
  const at = (mesh: THREE.Mesh, x: number, y: number, z: number) => { mesh.position.set(x, y, z); return add(mesh); };
  /* Box UVs in metres so tiled textures keep their scale on any size */
  const metreUV = (geo: THREE.BufferGeometry, w: number, h: number, d: number) => {
    const uv = geo.attributes.uv, sizes = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sizes[f][0], uv.getY(i) * sizes[f][1]); }
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, ry = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; metreUV(m.geometry, w, h, d);
    return add(m);
  };
  const rbox = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, T.seg, r);

  /* ---------- swept geometry ----------
     Revolve a closed (r, y) profile around the Speaker's point C from angle a0 to a1.
     Points are [r, y, smooth]; non-smooth points make hard edges. UVs are in metres. */
  const C = V(0, 0, -12);
  const sweep = (polyIn: Profile, a0: number, a1: number, step = 0.2) => {
    step *= T.step;
    let poly = polyIn, area = 0;
    for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; area += p[0] * q[1] - q[0] * p[1]; }
    if (area < 0) poly = poly.slice().reverse();
    const n = poly.length, rMax = Math.max(...poly.map((p) => p[0]));
    const N = Math.max(2, Math.ceil((Math.abs(a1 - a0) * rMax) / step));
    const en = poly.map((p, i) => { const q = poly[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; });
    const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
    let vAcc = 0;
    const avg = (a: number[], b: number[]) => { const x = a[0] + b[0], y = a[1] + b[1], l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
    for (let i = 0; i < n; i++) {
      const p = poly[i], q = poly[(i + 1) % n], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (L < 1e-6) continue;
      const np = p[2] ? avg(en[(i - 1 + n) % n], en[i]) : en[i];
      const nq = q[2] ? avg(en[i], en[(i + 1) % n]) : en[i];
      const rRef = (p[0] + q[0]) / 2, base = pos.length / 3;
      for (let s = 0; s <= N; s++) {
        const a = a0 + ((a1 - a0) * s) / N, sa = Math.sin(a), ca = Math.cos(a);
        for (const [pt, nn, v] of [[p, np, vAcc], [q, nq, vAcc + L]] as const) {
          pos.push(C.x + pt[0] * sa, pt[1], C.z + pt[0] * ca);
          nor.push(nn[0] * sa, nn[1], nn[0] * ca);
          uv.push((a - a0) * rRef, v);
        }
      }
      /* winding that agrees with the normal */
      const P0 = V(pos[base * 3], pos[base * 3 + 1], pos[base * 3 + 2]);
      const Q0 = V(pos[base * 3 + 3], pos[base * 3 + 4], pos[base * 3 + 5]);
      const P1 = V(pos[base * 3 + 6], pos[base * 3 + 7], pos[base * 3 + 8]);
      const fn = new THREE.Vector3().crossVectors(Q0.clone().sub(P0), P1.clone().sub(P0));
      const flip = fn.dot(V(en[i][0] * Math.sin(a0), en[i][1], en[i][0] * Math.cos(a0))) < 0;
      for (let s = 0; s < N; s++) {
        const a = base + s * 2, b = a + 1, c = a + 2, d = a + 3;
        if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
      vAcc += L;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  };
  const sweepCaps = (poly: Profile, a0: number, a1: number) => {
    const contour = poly.map((p) => new THREE.Vector2(p[0], p[1]));
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
    const rMin = Math.min(...poly.map((p) => p[0])), yMin = Math.min(...poly.map((p) => p[1]));
    ([[a0, -1], [a1, 1]] as const).forEach(([a, sgn]) => {
      const sa = Math.sin(a), ca = Math.cos(a), base = pos.length / 3;
      const nx = Math.cos(a) * sgn * Math.sign(a1 - a0), nz = -Math.sin(a) * sgn * Math.sign(a1 - a0);
      poly.forEach((p) => { pos.push(C.x + p[0] * sa, p[1], C.z + p[0] * ca); nor.push(nx, 0, nz); uv.push((p[0] - rMin) * 1.15, (p[1] - yMin) * 1.15); });
      const vtx = (k: number) => V(pos[(base + k) * 3], pos[(base + k) * 3 + 1], pos[(base + k) * 3 + 2]);
      tris.forEach(([i, j, k]) => {
        const A = vtx(i);
        const fn = new THREE.Vector3().crossVectors(vtx(j).sub(A), vtx(k).sub(A));
        if (fn.x * nx + fn.z * nz < 0) idx.push(base + i, base + k, base + j); else idx.push(base + i, base + j, base + k);
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  };

  /* ---------- room ---------- */
  const HX = 25, ZF = -16, ZB = 14, H = 18;
  {
    const geo = new THREE.PlaneGeometry(HX * 2, ZB - ZF);
    geo.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? ZB - ZF : HX * 2); });
    const floor = new THREE.Mesh(geo, M.carpet);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, (ZB + ZF) / 2);
    add(floor, false);
  }
  /* Walls and ceiling are single-sided, so the camera can pass through them for a cutaway */
  const plane = (w: number, h: number, mat: THREE.Material, x: number, y: number, z: number, ry: number, uvMetres = true) => {
    const geo = new THREE.PlaneGeometry(w, h);
    if (uvMetres) geo.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? h : w); });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.y = ry;
    return add(m, false);
  };
  plane(HX * 2, H, M.wall, 0, H / 2, ZF, 0);
  const backSide: THREE.Object3D[] = [plane(HX * 2, H, M.wall, 0, H / 2, ZB, Math.PI)];
  plane(ZB - ZF, H, M.wall, -HX, H / 2, (ZB + ZF) / 2, Math.PI / 2);
  plane(ZB - ZF, H, M.wall, HX, H / 2, (ZB + ZF) / 2, -Math.PI / 2);
  const chandelier: THREE.Object3D[] = [];
  {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(CEIL.w, CEIL.d), M.ceil);
    c.rotation.x = Math.PI / 2; c.position.set(0, H, (ZB + ZF) / 2);
    add(c, false, false);
    /* Chandelier ring under the lattice centre */
    const ringMatE = new THREE.MeshStandardMaterial({ color: "#2a1a0c", emissive: "#ffe9c4", emissiveIntensity: 2.2 });
    ([[2.0, 0.06], [1.5, 0.045]] as const).forEach(([r, t], k) => {
      const tor = new THREE.Mesh(new THREE.TorusGeometry(r, t, 12, T.tier === "low" ? 48 : 96), k ? ringMatE : M.brass);
      tor.rotation.x = Math.PI / 2; tor.position.set(0, H - 1.6 - k * 0.25, CEIL.cz);
      chandelier.push(add(tor, false, false));
    });
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.025, 8, 96), ringMatE);
    glowRing.rotation.x = Math.PI / 2; glowRing.position.set(0, H - 1.66, CEIL.cz);
    chandelier.push(add(glowRing, false, false));
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; chandelier.push(box(0.03, 1.6, 0.03, M.brass, Math.cos(a) * 2.0, H - 0.8, CEIL.cz + Math.sin(a) * 2.0)); }
  }

  /* Stone pilasters, skirting band and frieze */
  [-18, -7.4, 7.4, 18].forEach((x) => box(1.4, H, 0.6, M.stone, x, H / 2, ZF + 0.3));
  [-24, -12, 0, 12, 24].forEach((x) => backSide.push(box(1.4, H, 0.6, M.stone, x, H / 2, ZB - 0.3)));
  [-2, 8].forEach((z) => { box(0.6, H, 1.4, M.stone, -HX + 0.3, H / 2, z); box(0.6, H, 1.4, M.stone, HX - 0.3, H / 2, z); });
  box(HX * 2, 0.9, 0.12, M.panel, 0, 0.45, ZF + 0.06);
  box(0.12, 0.9, ZB - ZF, M.panel, -HX + 0.06, 0.45, (ZB + ZF) / 2);
  box(0.12, 0.9, ZB - ZF, M.panel, HX - 0.06, 0.45, (ZB + ZF) / 2);
  box(HX * 2, 0.8, 0.5, M.stone, 0, H - 0.4, ZF + 0.25);
  box(0.5, 0.8, ZB - ZF, M.stone, -HX + 0.25, H - 0.4, (ZB + ZF) / 2);
  box(0.5, 0.8, ZB - ZF, M.stone, HX - 0.25, H - 0.4, (ZB + ZF) / 2);
  backSide.push(box(HX * 2, 0.8, 0.5, M.stone, 0, H - 0.4, ZB - 0.25));

  /* Visitors' galleries: balcony, stepped benches, brass rail */
  const gallery = (len: number, cx: number, cz: number, ry: number) => {
    const g = new THREE.Group();
    const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    const bx = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => { const geo = new THREE.BoxGeometry(w, h, d); metreUV(geo, w, h, d); return part(geo, mat, x, y, z); };
    bx(len, 0.45, 3.2, M.deskDark, 0, 6.2, -1.6);
    bx(len, 1.25, 0.18, M.panel, 0, 7.05, -3.1);
    part(new THREE.CylinderGeometry(0.045, 0.045, len, 12), M.brass, 0, 7.82, -3.1).rotation.z = Math.PI / 2;
    for (let k = 0; k < 3; k++) {
      bx(len, 0.45 * (k + 1), 0.95, M.deskDark, 0, 6.4 + 0.225 * (k + 1), -2.3 + k * 0.9);
      part(rbox(len - 0.3, 0.16, 0.5, 0.05), fabricPlain, 0, 6.4 + 0.45 * (k + 1) + 0.1, -2.1 + k * 0.9);
      part(rbox(len - 0.3, 0.4, 0.1, 0.04), fabricPlain, 0, 6.4 + 0.45 * (k + 1) + 0.35, -1.85 + k * 0.9);
    }
    g.position.set(cx, 0, cz); g.rotation.y = ry;
    world.add(g);
    return g;
  };
  backSide.push(gallery(HX * 2 - 0.8, 0, ZB, 0));
  gallery(14, -HX, 4, -Math.PI / 2);
  gallery(14, HX, 4, Math.PI / 2);
  /* Back-lit peacock jaali panels above the galleries (cropped from a GODL-India photo of the chamber) */
  [-18, -6, 6, 18].forEach((x) => backSide.push(plane(7.4, 5.9, M.peacock, x, 12.4, ZB - 0.05, Math.PI, false)));
  [-7, 3].forEach((z) => { plane(7, 5.6, M.peacock, -HX + 0.05, 12.4, z, Math.PI / 2, false); plane(7, 5.6, M.peacock, HX - 0.05, 12.4, z, -Math.PI / 2, false); });

  /* Speaker's wall: jade stone, brass emblem, niche, dais */
  box(14, 11, 0.24, M.stone, 0, 6.6, ZF + 0.12);
  plane(13.2, 10.2, M.jade, 0, 6.6, ZF + 0.25, 0);
  {
    const e = new THREE.Group();
    e.add(new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.06, 16, 96), M.gold));
    e.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 48), M.gold));
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32), M.gold); hub.rotation.x = Math.PI / 2; e.add(hub);
    for (let k = 0; k < 24; k++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.68, 0.03), M.gold);
      const a = (k / 24) * Math.PI * 2; sp.position.set(Math.sin(a) * 0.57, Math.cos(a) * 0.57, 0); sp.rotation.z = -a; e.add(sp);
    }
    const back = new THREE.Mesh(new THREE.CircleGeometry(1.02, 64), P({ color: "#6d5223", metalness: 0.8, roughness: 0.45 })); back.position.z = -0.04; e.add(back);
    e.children.forEach((c) => { c.castShadow = true; });
    e.position.set(0, 9.4, ZF + 0.36);
    world.add(e);
    box(0.05, 1.4, 0.05, M.gold, 0, 11.0, ZF + 0.32);
  }
  box(3.6, 4.4, 0.35, M.deskDark, 0, 3.7, ZF + 0.42);
  box(0.4, 4.6, 0.7, M.panel, -1.9, 3.8, ZF + 0.55); box(0.4, 4.6, 0.7, M.panel, 1.9, 3.8, ZF + 0.55); box(4.2, 0.45, 0.7, M.panel, 0, 6.2, ZF + 0.55);
  box(10, 1.5, 3.4, M.panel, 0, 0.75, -14.2);
  box(10.04, 0.12, 3.44, M.desk, 0, 1.52, -14.2);
  box(4.6, 1.15, 0.9, M.desk, 0, 2.1, -13.1);
  at(new THREE.Mesh(rbox(1.1, 2.6, 0.32, 0.1), fabricPlain), 0, 2.9, -15.15);
  at(new THREE.Mesh(rbox(1.2, 0.26, 0.9, 0.08), fabricPlain), 0, 1.9, -14.75);
  box(0.14, 0.7, 0.9, M.desk, -0.68, 2.1, -14.75); box(0.14, 0.7, 0.9, M.desk, 0.68, 2.1, -14.75);
  /* Officials' table in the well, rounded end toward the House. The story's office scenes play on it (office-set.ts) */
  {
    const tableShape = (r: number) => {
      const s = new THREE.Shape();
      s.moveTo(-r, 0); s.lineTo(-r, 3.6); s.absarc(0, 3.6, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
      return s;
    };
    const top = new THREE.ExtrudeGeometry(tableShape(0.9), { depth: 0.07, bevelEnabled: T.tier !== "low", bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 32 });
    top.rotateX(Math.PI / 2);
    add(new THREE.Mesh(top, M.desk)).position.set(0, 0.8, -12.4);
    const body = new THREE.ExtrudeGeometry(tableShape(0.75), { depth: 0.72, bevelEnabled: false, curveSegments: 32 });
    body.rotateX(Math.PI / 2);
    add(new THREE.Mesh(body, M.panel)).position.set(0, 0.72, -12.4);
    for (let k = 0; k < 4; k++) for (const sx of [-1.25, 1.25]) {
      at(new THREE.Mesh(rbox(0.5, 0.12, 0.5, 0.04), fabricPlain), sx, 0.48, -11.9 + k * 1.0);
      at(new THREE.Mesh(rbox(0.1, 0.5, 0.5, 0.04), fabricPlain), sx + Math.sign(sx) * 0.27, 0.78, -11.9 + k * 1.0);
    }
  }

  /* ---------- wall screens ---------- */
  const screenScale = T.tier === "low" ? 0.75 : 1;
  const leftScr = createScreen(WALL.w, WALL.h, screenScale, maxAniso);
  const rightScr = createScreen(WALL.w, WALL.h, screenScale, maxAniso);
  ([[-12.7, leftScr], [12.7, rightScr]] as const).forEach(([x, s]) => {
    box(6.9, 4.05, 0.22, M.black, x, 7.6, ZF + 0.12);
    plane(6.5, 3.66, new THREE.MeshBasicMaterial({ map: s.tex }), x, 7.6, ZF + 0.25, 0, false).castShadow = false;
    box(5.2, 2.4, 0.5, M.panel, x, 3.2, ZF + 0.25);
    plane(4.6, 1.9, M.alcove, x, 3.2, ZF + 0.51, 0, false);
  });

  /* ---------- seating ---------- */
  const ROWS = 12, R0 = 7.6, DR = 1.25, RISE = 0.26, PITCH = 0.68;
  const AISLES = [-98, -64, -31, 0, 31, 64, 98].map((a) => a * DEG);
  const tierY = (r: number) => (r + 1) * RISE;

  for (let r = 0; r < ROWS; r++) {
    const R = R0 + r * DR, y = tierY(r);
    add(new THREE.Mesh(sweep([[R - DR / 2, 0], [R + DR / 2, 0], [R + DR / 2, y], [R - DR / 2, y]], AISLES[0], AISLES[6], 0.5), M.carpet), false);
  }
  /* Well: front rail and brass-inlaid carpet lines */
  {
    const rIn = R0 - DR / 2;
    const railProfile: Profile = [[rIn - 0.16, 0], [rIn, 0], [rIn, 1.0, true], [rIn - 0.08, 1.04, true], [rIn - 0.16, 1.0]];
    add(new THREE.Mesh(sweep(railProfile, AISLES[0], AISLES[6]), M.desk));
    add(new THREE.Mesh(sweepCaps(railProfile, AISLES[0], AISLES[6]), M.desk));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) { const a = AISLES[0] + ((AISLES[6] - AISLES[0]) * i) / 128; pts.push(V(C.x + (rIn - 0.08) * Math.sin(a), 1.12, C.z + (rIn - 0.08) * Math.cos(a))); }
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), T.tier === "low" ? 96 : 256, 0.035, T.tier === "low" ? 6 : 10), M.brass));
    [4.6, 5.0, 5.9].forEach((r) => add(new THREE.Mesh(sweep([[r, 0.004], [r + 0.04, 0.004], [r + 0.04, 0.008], [r, 0.008]], -100 * DEG, 100 * DEG), M.brass), false));
  }

  /* Continuous curved desks for every row block, with inlaid end panels */
  const DESK_TOP = 0.78;
  const deskPoly = (R: number, y: number): Profile => {
    const rf = R - 0.64, rb = R - 0.2;
    return [[rf, y], [rf, y + 0.7, true], [rf - 0.01, y + 0.745, true], [rf + 0.02, y + 0.772, true], [rf + 0.07, y + DESK_TOP], [rb, y + DESK_TOP], [rb, y + 0.64], [rf + 0.05, y + 0.64], [rf + 0.05, y]];
  };
  const seats: Seat[] = [];
  const deskGeos: THREE.BufferGeometry[] = [], capGeos: THREE.BufferGeometry[] = [];
  for (let r = 0; r < ROWS; r++) {
    const R = R0 + r * DR, y = tierY(r);
    for (let b = 0; b < AISLES.length - 1; b++) {
      const gap = 0.6 / R;
      const a0 = AISLES[b] + gap, a1 = AISLES[b + 1] - gap;
      deskGeos.push(sweep(deskPoly(R, y), a0, a1, 0.25));
      capGeos.push(sweepCaps(deskPoly(R, y), a0, a1));
      const len = (a1 - a0) * (R + 0.15), n = Math.floor(len / PITCH), pad = (len - n * PITCH) / 2;
      for (let k = 0; k < n; k++) seats.push({ r, b, R, y, k, n, a: a0 + (pad + PITCH * (k + 0.5)) / (R + 0.15), jit: rnd() });
      if (r === ROWS - 1) deskGeos.push(sweep([[R + 0.62, y], [R + 0.74, y], [R + 0.74, y + 1.2, true], [R + 0.68, y + 1.26, true], [R + 0.62, y + 1.2]], a0, a1, 0.25));
    }
  }
  add(new THREE.Mesh(mergeGeometries(deskGeos), M.desk));
  add(new THREE.Mesh(mergeGeometries(capGeos), M.inlay));
  deskGeos.concat(capGeos).forEach((g) => g.dispose());

  /* Instanced seat parts */
  const SEATS = seats.length;
  const seatBasis = (s: Seat) => new THREE.Matrix4().compose(V(C.x + (s.R + 0.15) * Math.sin(s.a), s.y, C.z + (s.R + 0.15) * Math.cos(s.a)), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), s.a), V(1, 1, 1));
  const local = (x: number, y: number, z: number, rx = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), rx), V(1, 1, 1));
  const cushGeo = rbox(0.58, 0.13, 0.5, 0.05);
  const backGeo = rbox(0.58, 0.6, 0.13, 0.05);
  const baseGeo = new THREE.BoxGeometry(0.66, 0.38, 0.46); metreUV(baseGeo, 0.66, 0.38, 0.46);
  const armGeo = new RoundedBoxGeometry(0.07, 0.3, 0.56, Math.min(2, T.seg), 0.03);
  const tabGeo = new THREE.BoxGeometry(0.25, 0.16, 0.012);
  const glowArr = new Float32Array(SEATS);
  const glowCush = new THREE.InstancedBufferAttribute(glowArr, 1); glowCush.setUsage(THREE.DynamicDrawUsage);
  const glowBack = new THREE.InstancedBufferAttribute(glowArr, 1); glowBack.setUsage(THREE.DynamicDrawUsage);
  cushGeo.setAttribute("aGlow", glowCush);
  backGeo.setAttribute("aGlow", glowBack);
  const armCount = seats.filter((s) => s.k % 2 === 0).length + seats.filter((s) => s.k === s.n - 1).length;
  const cush = new THREE.InstancedMesh(cushGeo, fabric, SEATS);
  const backs = new THREE.InstancedMesh(backGeo, fabric, SEATS);
  const bases = new THREE.InstancedMesh(baseGeo, M.deskDark, SEATS);
  const arms = new THREE.InstancedMesh(armGeo, M.desk, armCount);
  const tabs = new THREE.InstancedMesh(tabGeo, [M.black, M.black, M.black, M.black, M.tabletScreen, M.black], SEATS);
  /* Microphones are sub-pixel from most stops; the low tier skips them */
  let mics: THREE.InstancedMesh | null = null;
  if (T.tier !== "low") {
    const micGeo = new THREE.CylinderGeometry(0.0028, 0.0035, 0.28, 5); micGeo.translate(0, 0.14, 0);
    mics = new THREE.InstancedMesh(micGeo, M.brass, SEATS);
  }
  const tmp = new THREE.Matrix4();
  let ai = 0;
  const basisOf: THREE.Matrix4[] = [];
  seats.forEach((s, j) => {
    const B = seatBasis(s); basisOf.push(B);
    cush.setMatrixAt(j, tmp.multiplyMatrices(B, local(0, 0.45, 0.02)));
    backs.setMatrixAt(j, tmp.multiplyMatrices(B, local(0, 0.82, 0.3, 0.16)));
    bases.setMatrixAt(j, tmp.multiplyMatrices(B, local(0, 0.19, 0.02)));
    tabs.setMatrixAt(j, tmp.multiplyMatrices(B, local(0, DESK_TOP + 0.075, -0.6, -0.5)));
    mics?.setMatrixAt(j, tmp.multiplyMatrices(B, local(0.2, DESK_TOP, -0.66, 0.55)));
    if (s.k % 2 === 0) arms.setMatrixAt(ai++, tmp.multiplyMatrices(B, local(-0.34, 0.62, 0.05)));
    if (s.k === s.n - 1) arms.setMatrixAt(ai++, tmp.multiplyMatrices(B, local(0.34, 0.62, 0.05)));
  });
  [cush, backs, bases, arms, tabs, mics].forEach((m) => {
    if (!m) return;
    m.castShadow = m !== tabs && m !== mics;
    m.receiveShadow = true;
    world.add(m);
  });

  /* Sweep order, left to right, for the "one system" light-up */
  const sweepT = new Float32Array(SEATS);
  [...Array(SEATS).keys()].sort((a, b) => seats[a].a - seats[b].a).forEach((j, k) => { sweepT[j] = (k / SEATS) * 0.8 + seats[j].jit * 0.08; });

  /* "Your seat": row 6, right-centre block. In the Products chapter the camera sits at its desk */
  let HERO = 0;
  {
    let bd = 1e9;
    seats.forEach((s, j) => { if (s.r !== 5) return; const d = Math.abs(s.a - 47 * DEG); if (d < bd) { bd = d; HERO = j; } });
  }
  const hs = seats[HERO], HB = basisOf[HERO];
  const heroL = (x: number, y: number, z: number) => V(x, y, z).applyMatrix4(HB);
  const heroSeat = heroL(0, 0.5, 0.02);
  const heroOut = V(Math.sin(hs.a), 0, Math.cos(hs.a));
  tabs.setMatrixAt(HERO, new THREE.Matrix4().makeScale(0, 0, 0));
  mics?.setMatrixAt(HERO, new THREE.Matrix4().makeScale(0, 0, 0));

  /* Hero desk tablet */
  const deskScr = createScreen(DESK.w, DESK.h, T.tier === "low" ? 0.75 : 1, maxAniso);
  const heroTabMat = new THREE.Matrix4().multiplyMatrices(HB, local(0, DESK_TOP + 0.2, -0.56, -0.55));
  const tablet = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.403), new THREE.MeshBasicMaterial({ map: deskScr.tex }));
  tablet.applyMatrix4(heroTabMat.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.012)));
  world.add(tablet);
  const tabletFrame = new THREE.Mesh(new RoundedBoxGeometry(0.67, 0.45, 0.02, 2, 0.008), M.black);
  tabletFrame.applyMatrix4(heroTabMat); tabletFrame.castShadow = true;
  world.add(tabletFrame);
  const tabletPos = V(0, 0, 0).applyMatrix4(heroTabMat);

  /* Marker: a soft beam and a pulsing ring over your seat */
  const beamTex = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#000"); gr.addColorStop(1, "#fff"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { srgb: false });
  const beamMat = new THREE.MeshBasicMaterial({ color: glowColor, alphaMap: beamTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 16, 40, 1, true), beamMat);
  beam.position.copy(heroSeat).add(V(0, 8, 0));
  world.add(beam);
  const ringMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 48), ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.copy(heroSeat).setY(hs.y + 0.02);
  world.add(ring);
  const heroLight = new THREE.PointLight(glowColor, 0, 6, 2);
  heroLight.position.copy(heroSeat).add(V(0, 1.6, 0));
  world.add(heroLight);

  /* ---------- lights: each one costs per pixel, so lower tiers use fewer, brighter ones ---------- */
  world.add(new THREE.HemisphereLight("#ffeedc", "#2a3a32", { high: 0.5, mid: 0.75, low: 1.05 }[T.tier]));
  const key = new THREE.DirectionalLight("#fff6ec", T.tier === "low" ? 2.7 : 2.4);
  key.position.set(6, 40, 6); key.target.position.set(0, 0, -3);
  key.castShadow = T.shadows > 0;
  if (key.castShadow) {
    key.shadow.mapSize.set(T.shadows, T.shadows);
    Object.assign(key.shadow.camera, { left: -27, right: 27, top: 20, bottom: -20, near: 10, far: 70 });
    key.shadow.bias = -0.0003; key.shadow.normalBias = 0.025; key.shadow.radius = 3;
  }
  world.add(key, key.target);
  const POOLS: Record<number, [number, number][]> = { 6: [[-9, 0], [9, 0], [0, 4], [-15, -8], [15, -8], [0, -6]], 2: [[-9, -2], [9, -2]], 0: [] };
  POOLS[T.spots].forEach(([x, z]) => {
    const s = new THREE.SpotLight("#ffeedc", T.spots === 6 ? 380 : 620, 0, T.spots === 6 ? 0.75 : 0.95, 1, 2);
    s.position.set(x, H - 0.3, z); s.target.position.set(x, 0, z);
    world.add(s, s.target);
  });
  const wash = new THREE.SpotLight("#fff0da", 900, 0, 0.5, 0.8, 2);
  wash.position.set(0, H - 0.5, -4); wash.target.position.set(0, 6, ZF);
  world.add(wash, wash.target);
  if (T.tier === "high") [-12.7, 12.7].forEach((x) => { const l = new THREE.PointLight("#ffc98a", 8, 6, 2); l.position.set(x, 3.2, ZF + 1.2); world.add(l); });

  /* ---------- the office set: clutter, the fix, the consultant and the politician ---------- */
  const office = createOfficeSet({
    world, T, mat: P, paint, maxAniso, accent: glowColor, normalFromHeight, peopleBase: o.assetBase + "people/",
    seatPoints: seats.filter((_, j) => j % 7 === 3).map((s) => V(C.x + (s.R + 0.15) * Math.sin(s.a), s.y + 0.9, C.z + (s.R + 0.15) * Math.cos(s.a)))
  });
  extras.push(...office.extras);

  /* Who we serve: a label over each seat band, front to back, on the centre aisle */
  const bandLabels = o.labels.bands.map((text, b) => {
    const s = createScreen(TAG.w, TAG.h, 1, maxAniso);
    extras.push(s.tex);
    const mat = new THREE.SpriteMaterial({ map: s.tex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
    const sp = new THREE.Sprite(mat);
    const r = R0 + (b * 4 + 1.5) * DR;
    sp.position.set(0, tierY(b * 4 + 2) + 2.4, C.z + r);
    sp.scale.set(7.2, (7.2 * TAG.h) / TAG.w, 1);
    sp.renderOrder = 3;
    world.add(sp);
    return { s, mat, text };
  });

  /* Dust in the downlights, for the wide shots (mid and high) */
  let dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
  if (T.tier !== "low" && !o.reducedMotion) {
    const n = T.tier === "high" ? 900 : 420, pos = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos.set([(rnd() - 0.5) * 40, 1.5 + rnd() * 14, -14 + rnd() * 26], i * 3); sd[i] = rnd(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    dust = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 40 }, uOpacity: { value: 0 } },
      vertexShader: `attribute float aSeed; uniform float uTime, uSize; varying float vA;
        void main() {
          vec3 p = position + vec3(sin(uTime * 0.11 + aSeed * 40.0) * 0.9, sin(uTime * 0.07 + aSeed * 17.0) * 0.6, cos(uTime * 0.09 + aSeed * 23.0) * 0.9);
          vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uSize * (0.5 + aSeed) / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform float uOpacity; varying float vA;
        void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * uOpacity; gl_FragColor = vec4(vec3(1.0, 0.9, 0.74) * a, a); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    dust.frustumCulled = false;
    world.add(dust);
  }

  /* ---------- screens ---------- */
  let dirty = 2, dashProg = -1, leftKey = "", deskTick = 0;
  const drawScreens = () => {
    dashProg = -1; leftKey = "";
    drawDashboard(rightScr, paint, 0); drawChaos(leftScr, paint, 0); drawDesk(deskScr, paint, deskTick);
    bandLabels.forEach((b) => drawTag(b.s, paint, b.text, "label"));
    office.redraw();
    dirty = 2;
  };
  drawScreens();
  document.fonts?.ready.then(() => { if (!disposed) drawScreens(); });

  /* ---------- reflections: capture the lit chamber into an environment map (once) ---------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  renderer.shadowMap.needsUpdate = true;
  const transient: THREE.Object3D[] = [office.root, ...(dust ? [dust] : [])];
  transient.forEach((ob) => { ob.visible = false; });
  world.position.set(0, -7, 0);
  world.updateMatrixWorld(true);
  const envRT = pmrem.fromScene(scene, 0.03, 0.1, 120);
  pmrem.dispose();
  extras.push(envRT);
  world.position.set(0, 0, 0);
  world.updateMatrixWorld(true);
  transient.forEach((ob) => { ob.visible = true; });
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.9;
  renderer.shadowMap.needsUpdate = true;

  /* ---------- post-processing (high tier only) ---------- */
  let W = 1, Hh = 1;
  let composer: EffectComposer | null = null, gtao: GTAOPass | null = null, usePost = T.post;
  if (T.post) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? 4 : 0 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 16 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    gtao.blendIntensity = 0.9;
    /* GTAO leaves points and lines out of its depth pass; leave sprites (the floating badges) out too,
       or their quads read as solid and darken a box around each one */
    const hideFromAo = gtao.overrideVisibility.bind(gtao);
    gtao.overrideVisibility = () => { hideFromAo(); scene.traverse((ob) => { if ((ob as THREE.Sprite).isSprite) ob.visible = false; }); };
    composer.addPass(gtao);
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.45, 1.1));
    composer.addPass(new OutputPass());
    extras.push(composer, gtao, rt);
  }

  /* ---------- camera path: sx shifts the subject away from the card (positive when the card is on the left) ---------- */
  const eye = heroL(0, 1.78, 0.72);
  const STOPS = [
    { p: V(0, 9.6, 12.4), t: V(0, 4.6, -14), fov: 52, sx: 0.16, par: 1 },                              // 0 Welcome: gallery view
    { p: V(0, 37, 3.5), t: V(0, 0, -3.5), fov: 46, sx: 0.2, par: 0.6 },                                 // 1 Who we serve: above the House
    { p: V(0.12, 1.72, -8.25), t: V(0, 1.12, -10.8), fov: 46, sx: -0.17, par: 0.2 },                     // 2 The problem: the cluttered table
    { p: V(2.5, 5.3, -14.7), t: V(-0.5, 1.2, -8.0), tp: V(-0.3, 0.7, -9.6), fov: 52, sx: 0.17, par: 0.3 },                      // 3 With Setuk: from the Speaker's side, the House lights up
    { p: eye, t: tabletPos.clone().addScaledVector(heroOut, -0.05), fov: 40, sx: 0.17, par: 0.06 },     // 4 Products: your desk
    { p: V(-2.75, 1.86, -9.3), t: V(0.35, 0.98, -10.95), fov: 40, sx: -0.16, par: 0.15 },                  // 5 Discuss: the middle chairs, past the politician
    { p: V(2.05, 1.62, -10.5), t: V(0.55, 0.98, -10.93), fov: 42, sx: 0.18, par: 0.15 },                // 6 Design: over the consultant's shoulder
    { p: V(1.74, 1.92, -10.72), t: V(0.53, 0.99, -10.93), fov: 36, sx: -0.18, par: 0.1 },                // 7 Train: the call on his screen
    { p: V(1.85, 1.52, -10.48), t: V(0.53, 0.97, -10.92), fov: 40, sx: 0.16, par: 0.12 }                // 8 Run: the numbers, then the close-up (office.shot)
  ];
  const posCurve = new THREE.CatmullRomCurve3(STOPS.map((s) => s.p), false, "centripetal");
  const tgtCurve = new THREE.CatmullRomCurve3(STOPS.map((s) => s.t), false, "centripetal");
  /* Portrait screens can aim a stop differently (tp), where the card at the bottom would cover the subject */
  const tgtCurveP = new THREE.CatmullRomCurve3(STOPS.map((s) => ("tp" in s && s.tp ? s.tp : s.t)), false, "centripetal");
  const N = STOPS.length;
  /* Hold at each stop, travel in the middle of the gap between two cards */
  const along = (p: number) => {
    const i = Math.min(N - 2, Math.floor(p));
    const e = smoother(clamp01((p - i - 0.16) / 0.68));
    return { u: (i + e) / (N - 1), i, e };
  };
  const cur = { p: STOPS[0].p.clone(), t: STOPS[0].t.clone(), fov: STOPS[0].fov, sx: STOPS[0].sx, par: 1 };
  const goal = { p: V(0, 0, 0), t: V(0, 0, 0) };

  const resize = () => {
    W = stage.clientWidth; Hh = stage.clientHeight;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(W, Hh, false);
    if (composer) { composer.setPixelRatio(pixelRatio); composer.setSize(W, Hh); }
    camera.aspect = W / Hh;
    dirty = 2;
  };
  resize();

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
  const fine = !o.reducedMotion && matchMedia("(pointer: fine)").matches;

  /* ---------- seat light, chapter by chapter ----------
     1 Who we serve: three waves, front, middle and back rows (MPs, MLAs, local bodies)
     2 The problem: everything goes dark       3 With Setuk: one sweep, left to right
     4 Products: only your seat                6 Design: six blocks, one at a time, different strengths
     7 Train: rows front to back (role by role) 8 Run: the whole House */
  const seatGlow = (j: number, p: number) => {
    const s = seats[j];
    const band = s.r < 4 ? 0 : s.r < 8 ? 1 : 2;
    const serve = smooth(0.3 + band * 0.18 + s.jit * 0.06, 0.45 + band * 0.18 + s.jit * 0.06, p) * (1 - smooth(1.3, 1.8, p));
    const fix = smooth(2.2 + sweepT[j] * 0.6, 2.32 + sweepT[j] * 0.6, p) * (1 - smooth(3.35, 3.75, p));
    const design = smooth(5.3 + s.b * 0.1, 5.4 + s.b * 0.1, p) * (1 - smooth(6.3, 6.6, p)) * (0.45 + 0.55 * ((s.b % 3) / 2));
    const train = smooth(6.35 + s.r * 0.05, 6.45 + s.r * 0.05, p) * (1 - smooth(7.3, 7.55, p));
    const run = smooth(7.4 + s.jit * 0.3, 7.6 + s.jit * 0.3, p) * 0.85;
    return Math.max(serve, fix, design, train, run);
  };

  /* ---------- adaptive quality: AO, then post-processing, then resolution ---------- */
  const degrade: (() => boolean)[] = [
    () => (gtao && gtao.enabled ? ((gtao.enabled = false), true) : false),
    () => (usePost ? ((usePost = false), true) : false),
    () => (pixelRatio > 1 ? ((pixelRatio = 1), resize(), true) : false),
    () => (pixelRatio > 0.75 ? ((pixelRatio = 0.75), resize(), true) : false)
  ];
  const perf = { samples: [] as number[], lastRender: 0, skip: 20, done: o.quality === "high" };
  const trackPerf = (now: number) => {
    if (perf.done) return;
    const gap = now - perf.lastRender;
    perf.lastRender = now;
    if (gap > 100) return;
    if (perf.skip > 0) { perf.skip--; return; }
    perf.samples.push(gap);
    if (perf.samples.length < 40) return;
    const median = perf.samples.sort((a, b) => a - b)[20];
    perf.samples = [];
    if (median > 26) {
      while (degrade.length && !degrade.shift()!()) { /* skip steps that no longer apply */ }
      perf.skip = 10;
      if (!degrade.length) perf.done = true;
    } else perf.done = true;
    stage.dataset.quality = `${T.tier}${usePost ? "+post" : ""}@${pixelRatio}`;
  };

  /* ---------- loop ---------- */
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) dirty = 2; }, { threshold: 0 });
  io.observe(stage);
  let last = performance.now();
  const onVisibility = () => { if (!document.hidden) { last = performance.now(); dirty = 2; } };

  const refreshTheme = () => {
    syncAccent();
    beamMat.color.copy(glowColor); ringMat.color.copy(glowColor); heroLight.color.copy(glowColor);
    drawScreens();
  };
  addEventListener("resize", resize);
  if (fine) addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  const stopThemeWatch = onThemeChange(refreshTheme);

  const handle: SadanHandle = {
    tier: T.tier,
    refreshTheme,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      stopThemeWatch();
      canvas.removeEventListener("webglcontextlost", onLost);
      disposeAll();
    }
  };

  /* Compile every shader before the first frame, so scrolling never stalls on a new material */
  o.onProgress?.(0.85);
  office.showAll(true);
  try { await renderer.compileAsync(scene, camera); } catch { /* compile lazily */ }
  office.showAll(false);
  if (aborted()) { handle.dispose(); return null; }
  o.onProgress?.(0.97);

  const right = V(0, 0, 0), up = V(0, 0, 0), fwd = V(0, 0, 0), worldUp = V(0, 1, 0), lastCam = new THREE.Matrix4();
  let first = true, deskTimer = 0, lastP = -1, lastAnim = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    let p = o.progress();
    if (o.reducedMotion) p = Math.round(p);

    /* the office set animates first: the Run close-up feeds the camera goal */
    const t = now / 1000;
    const set = office.update({ p, t, dt, reduced: o.reducedMotion, camera, viewH: Hh * pixelRatio });
    if (set.changed) dirty = Math.max(dirty, 1);

    /* camera goal from scroll, eased toward */
    const { u, i, e } = along(p);
    posCurve.getPoint(u, goal.p);
    (camera.aspect < 1 ? tgtCurveP : tgtCurve).getPoint(u, goal.t);
    const sw = office.shot.w;
    if (sw > 0) { goal.p.lerp(office.shot.p, sw); goal.t.lerp(office.shot.t, sw); }
    const k = o.reducedMotion || first ? 1 : 1 - Math.exp(-dt * (sw > 0 && sw < 1 ? 2.2 : 4.5));
    cur.p.lerp(goal.p, k); cur.t.lerp(goal.t, k);
    cur.fov = lerp(cur.fov, lerp(lerp(STOPS[i].fov, STOPS[i + 1].fov, e), office.shot.fov, sw), k);
    cur.sx = lerp(cur.sx, lerp(STOPS[i].sx, STOPS[i + 1].sx, e), k);
    cur.par = lerp(cur.par, lerp(STOPS[i].par, STOPS[i + 1].par, e), k);

    mouse.sx = lerp(mouse.sx, mouse.x, 1 - Math.exp(-dt * 3)); mouse.sy = lerp(mouse.sy, mouse.y, 1 - Math.exp(-dt * 3));
    fwd.subVectors(cur.t, cur.p).normalize();
    right.crossVectors(fwd, worldUp).normalize();
    up.crossVectors(right, fwd);
    camera.position.copy(cur.p).addScaledVector(right, mouse.sx * 0.9 * cur.par).addScaledVector(up, -mouse.sy * 0.5 * cur.par);
    camera.lookAt(cur.t);
    const inside = camera.position.z < ZB - 0.3;
    backSide.forEach((ob) => { ob.visible = inside; });
    const below = camera.position.y < H - 0.2;
    chandelier.forEach((ob) => { ob.visible = below; });

    /* Portrait screens: widen the lens and lift the subject above the card */
    const portrait = camera.aspect < 1;
    camera.fov = portrait ? Math.min(82, cur.fov * Math.pow(1.15 / camera.aspect, 0.55)) : cur.fov;
    if (portrait) camera.setViewOffset(W, Hh, 0, Hh * (p < 0.5 ? 0.06 : 0.2), W, Hh);
    else camera.setViewOffset(W, Hh, -cur.sx * W, 0, W, Hh);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    /* seats */
    const heroOn = smooth(3.3, 3.85, p) * (1 - smooth(4.45, 4.85, p));
    if (Math.abs(p - lastP) > 1e-4 || heroOn > 0.001) {
      for (let j = 0; j < SEATS; j++) glowArr[j] = seatGlow(j, p);
      glowArr[HERO] = Math.max(glowArr[HERO], heroOn * (1.1 + 0.35 * Math.sin(t * 3)));
      glowCush.needsUpdate = glowBack.needsUpdate = true;
      const beamOn = heroOn * (1 - smooth(3.8, 4.1, p));
      beamMat.opacity = beamOn * 0.16;
      ringMat.opacity = beamOn * (0.55 + 0.35 * Math.sin(t * 3));
      ring.scale.setScalar(1 + 0.08 * Math.sin(t * 3));
      heroLight.intensity = heroOn * 3.5;
      bandLabels.forEach((b, j) => { b.mat.opacity = smooth(0.3 + j * 0.18, 0.45 + j * 0.18, p) * (1 - smooth(1.3, 1.8, p)); });
      dirty = 2;
    }
    lastP = p;

    /* idle animation: the office set and the dust; capped at 30 fps below the high tier */
    const dustOn = dust ? 1 - smooth(0.8, 1.4, p) : 0;
    if (dust) { dust.visible = dustOn > 0; dust.material.uniforms.uOpacity.value = dustOn * 0.8; dust.material.uniforms.uTime.value = t; dust.material.uniforms.uSize.value = (0.05 * Hh * pixelRatio) / (2 * Math.tan((camera.fov * DEG) / 2)); }
    if (set.animating || dustOn > 0) {
      if (T.tier === "high" || now - lastAnim > 31) { lastAnim = now; dirty = Math.max(dirty, 1); }
    }

    /* screens: redraw only when their state changes */
    const dp = smooth(2.35, 2.95, p);
    if (Math.abs(dp - dashProg) > 0.004) { dashProg = dp; drawDashboard(rightScr, paint, dp); dirty = 2; }
    const report = p > 6.8;
    const lp = report ? smooth(7.3, 7.9, p) : smooth(1.3, 1.95, p);
    const lk = (report ? "r" : "c") + Math.round(lp * 250);
    if (lk !== leftKey) { leftKey = lk; if (report) drawReport(leftScr, paint, lp); else drawChaos(leftScr, paint, lp); dirty = 2; }
    if (Math.abs(p - 4) < 0.6 && !o.reducedMotion) {
      deskTimer += dt;
      if (deskTimer > 1.6) { deskTimer = 0; deskTick++; drawDesk(deskScr, paint, deskTick); dirty = 2; }
    }

    /* render only when something changed */
    if (!lastCam.equals(camera.matrixWorld)) dirty = 2;
    lastCam.copy(camera.matrixWorld);
    if (!dirty) { perf.lastRender = 0; return; }
    dirty--;
    if (usePost && composer) composer.render(); else renderer.render(scene, camera);
    if (first) { first = false; o.onProgress?.(1); o.onReady?.(); return; }
    trackPerf(now);
  };
  raf = requestAnimationFrame(frame);
  if (new URLSearchParams(location.search).has("debug")) {
    (window as unknown as { __sadan: unknown }).__sadan = { renderer, gtao, setPost: (on: boolean) => { usePost = on; dirty = 2; }, info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, programs: renderer.info.programs?.length, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, quality: stage.dataset.quality ?? T.tier }) };
  }
  return handle;
}
