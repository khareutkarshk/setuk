/**
 * Quality tiers for the chamber. One model, three budgets, picked from the device and stepped
 * down at runtime by the engine when frames run slow. Override with ?q=low|mid|high.
 *
 *   high  physical materials, full textures, 6 downlights, 2048 shadow map, GTAO + bloom
 *   mid   standard materials, half-size textures, 2 downlights, 1024 shadow map, no post-processing
 *   low   standard materials, diffuse maps only, 1 wash light, no shadows, no post-processing, DPR 1
 */
export type Tier = "low" | "mid" | "high";

export interface TierConfig {
  tier: Tier;
  /** Max device pixel ratio */
  dpr: number;
  /** Texture folder under the asset base ("" = full size) */
  tex: "" | "lite/";
  /** Normal and roughness maps */
  maps: boolean;
  /** MeshPhysicalMaterial (clear coat, sheen) instead of MeshStandardMaterial */
  physical: boolean;
  /** Shadow map size, 0 = no shadows */
  shadows: number;
  /** EffectComposer with GTAO and bloom */
  post: boolean;
  /** RoundedBoxGeometry segments */
  seg: number;
  /** Multiplier on swept-geometry step length (higher = fewer vertices) */
  step: number;
  /** Resolution scale for canvas-drawn textures */
  canvas: number;
  /** Ceiling downlights */
  spots: 0 | 2 | 6;
}

const TIERS: Record<Tier, Omit<TierConfig, "tier">> = {
  low: { dpr: 1, tex: "lite/", maps: false, physical: false, shadows: 0, post: false, seg: 1, step: 1.8, canvas: 0.5, spots: 0 },
  mid: { dpr: 1.5, tex: "lite/", maps: true, physical: false, shadows: 1024, post: false, seg: 2, step: 1.3, canvas: 0.75, spots: 2 },
  high: { dpr: 1.75, tex: "", maps: true, physical: true, shadows: 2048, post: true, seg: 3, step: 1, canvas: 1, spots: 6 }
};

/** GPU renderer string, or null when WebGL is unavailable. The probe context is released straight away. */
export function probeGpu(): string | null {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return null;
  }
}

const SLOW_GPU = /swiftshader|llvmpipe|software|mali-[4t]|adreno \(tm\) [2-5]\d\d|powervr|intel.*hd graphics [2-5]\d{2,3}\b|gma /i;

export function pickTier(gpu: string, override?: string | null): TierConfig {
  let tier: Tier;
  if (override === "low" || override === "mid" || override === "high") tier = override;
  else {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const mem = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency || 8;
    const small = matchMedia("(max-width: 767px)").matches;
    if (nav.connection?.saveData || mem <= 2 || cores <= 2 || SLOW_GPU.test(gpu)) tier = "low";
    else if (small || matchMedia("(pointer: coarse)").matches || mem <= 4 || cores <= 4) tier = "mid";
    else tier = "high";
  }
  return { tier, ...TIERS[tier] };
}
