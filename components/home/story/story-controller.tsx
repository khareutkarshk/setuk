"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dictionary, SceneLabels } from "@/content/types";
import { CornerPattern, Mandala } from "@/components/site/pattern";
import { SetukMark } from "@/components/site/setuk-mark";
import { clamp01, createScrollProgress, smooth } from "@/lib/sadan/progress";
import type { SadanHandle } from "@/lib/sadan/engine";
import poster from "@/assets/loksabha.jpg";
import styles from "./story.module.css";

interface Props {
  chapters: string[];
  railLabel: string;
  labels: SceneLabels;
  ariaLabel: string;
  brand: Dictionary["brand"];
  children: ReactNode;
}

/**
 * Owns the scroll story: maps scroll to a chapter index, marks the centred chapter active, drives
 * the chapter rail and the hero scrim, and loads the 3D chamber after hydration.
 *
 * The chapters themselves are server-rendered children. Per-frame work writes to the DOM directly
 * (data attributes and a CSS variable) so React only re-renders when the active chapter changes.
 * Three.js is code-split behind a dynamic import, so it never delays first paint; without WebGL,
 * or before the engine is ready, the Lok Sabha photo stays as the backdrop.
 */
export function StoryController({ chapters, railLabel, labels, ariaLabel, brand, children }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<ReturnType<typeof createScrollProgress> | null>(null);
  const [active, setActive] = useState(0);
  const [railVisible, setRailVisible] = useState(false);
  const [ready, setReady] = useState(false);
  /* "loading" keeps the splash up; "failed" drops it and falls back to the photo */
  const [percent, setPercent] = useState(0);
  const targetRef = useRef(0.04);
  const [boot, setBoot] = useState<"loading" | "done" | "failed">("loading");

  /* Scroll chrome: active chapter, scrim, rail visibility */
  useEffect(() => {
    const root = rootRef.current!;
    const steps = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    const progress = createScrollProgress(steps);
    /* "How we work": a story card over consecutive chapters, from data-how onwards */
    const how = root.querySelector<HTMLElement>("[data-how]");
    const howFirst = Number(how?.dataset.how ?? 0);
    const howSlides = how ? [...how.querySelectorAll<HTMLElement>("[data-k]")] : [];
    const howBars = how ? [...how.querySelectorAll<HTMLElement>("[data-bar]")] : [];
    let lastSlide = -1;
    progressRef.current = progress;
    let lastActive = -1, lastRail: boolean | null = null, frame = 0;

    const update = () => {
      frame = 0;
      const p = progress.get();
      steps.forEach((el, i) => el.toggleAttribute("data-active", Math.abs(p - i) < 0.4));
      scrimRef.current?.style.setProperty("--hero", String(1 - smooth(0.05, 0.45, p)));
      if (how) {
        /* each bar fills across its step, from halfway in to halfway out (the last one by its centre) */
        const n = howBars.length, local = p - howFirst, slide = Math.min(n - 1, Math.max(0, Math.round(local)));
        how.toggleAttribute("data-active", local > -0.4);
        howBars.forEach((el, k) => el.style.setProperty("--f", (k < slide ? 1 : k > slide ? 0 : clamp01((local - k + 0.5) / (k === n - 1 ? 0.5 : 1))).toFixed(3)));
        if (slide !== lastSlide) { lastSlide = slide; howSlides.forEach((el) => el.toggleAttribute("data-on", Number(el.dataset.k) === slide)); }
      }
      const a = Math.round(p);
      if (a !== lastActive) { lastActive = a; setActive(a); }
      const r = root.getBoundingClientRect();
      const rail = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
      if (rail !== lastRail) { lastRail = rail; setRailVisible(rail); }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const remeasure = () => { progress.measure(); schedule(); };

    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", remeasure);
    document.fonts?.ready.then(remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(root);

    /* ?ch=N opens at chapter N (reviews and screenshots) */
    const ch = new URLSearchParams(location.search).get("ch");
    if (ch !== null) scrollTo({ top: progress.centre(Number(ch) || 0), behavior: "instant" });

    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", remeasure);
      ro.disconnect();
    };
  }, []);

  /* The 3D chamber, loaded after hydration and disposed on unmount */
  useEffect(() => {
    const ac = new AbortController();
    let handle: SadanHandle | null = null;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const quality = new URLSearchParams(location.search).get("q");

    /* The shown number eases toward the engine's progress and creeps on between reports */
    let shown = 0, raf = 0;
    const animate = () => {
      const target = targetRef.current;
      const creep = target < 1 ? Math.min(target + 0.08, 0.99) : 1;
      shown += (Math.max(target, Math.min(shown + 0.0006, creep)) - shown) * 0.08;
      if (target >= 1 && shown > 0.995) shown = 1;
      setPercent(Math.floor(shown * 100));
      if (shown < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    import("@/lib/sadan/engine")
      .then(({ createSadan }) => {
        targetRef.current = Math.max(targetRef.current, 0.1);
        return createSadan({
          container: canvasSlotRef.current!,
          stage: stageRef.current!,
          progress: () => progressRef.current?.get() ?? 0,
          labels,
          reducedMotion,
          assetBase: "/sadan/v1/",
          quality,
          signal: ac.signal,
          onProgress: (p) => { targetRef.current = Math.max(targetRef.current, p); },
          onReady: () => { targetRef.current = 1; setReady(true); },
          onContextLost: () => setReady(false)
        });
      })
      .then((h) => {
        if (ac.signal.aborted) h?.dispose();
        else if (!h) setBoot("failed");
        else handle = h;
      })
      .catch((err) => {
        /* The photo backdrop takes over; the story still works without the scene */
        console.error("[sadan] 3D chamber failed to start", err);
        if (!ac.signal.aborted) setBoot("failed");
      });

    /* Never trap the visitor behind the splash on a slow or stuck load */
    const timeout = setTimeout(() => setBoot((b) => (b === "loading" ? "failed" : b)), 15000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      ac.abort();
      handle?.dispose();
    };
  }, [labels]);

  /* Hold the splash a beat at 100 so the count visibly completes */
  useEffect(() => {
    if (!ready || percent < 100) return;
    const t = setTimeout(() => setBoot((b) => (b === "loading" ? "done" : b)), 350);
    return () => clearTimeout(t);
  }, [ready, percent]);

  const go = (i: number) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: progressRef.current?.centre(i) ?? 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={rootRef} className={styles.story} aria-label={ariaLabel}>
      <div ref={stageRef} className={styles.stage} data-ready={ready ? "" : undefined} data-boot={boot} aria-hidden="true">
        {/* next/image "fill" needs a positioned (not sticky) parent */}
        <div className={styles.posterBox}>
          <Image src={poster} alt="" fill preload sizes="100vw" placeholder="blur" className={styles.poster} />
        </div>
        <div ref={canvasSlotRef} className={styles.canvasSlot} />
        <div className={styles.vignette} />
        <div ref={scrimRef} className={styles.scrim} />
        <div className={styles.topScrim} />
        <p className={styles.loading}>
          <span className={styles.spin} />
          <span>{labels.loading}</span>
        </p>
      </div>

      <div className={styles.splash} data-hidden={boot === "loading" ? undefined : ""} role="status" aria-live="polite">
        <CornerPattern kind="sadan" fx={0} fy={0} radius={460} cell={36} className="inset-0 text-accent opacity-[0.09]" />
        <CornerPattern kind="sadan" fx={100} fy={100} radius={460} cell={36} className="inset-0 text-accent opacity-[0.09]" />
        <div className={styles.splashEmblem}>
          <Mandala className={`${styles.splashLotus} text-accent`} />
          <span className={styles.splashHalo} />
          <SetukMark draw className={styles.splashMark} />
        </div>
        <p className={`${styles.splashName} text-ink`}>{brand.name}</p>
        <p className={`${styles.splashLine} text-muted`}>{brand.line}</p>
        <p className={`${styles.splashPercent} tnum text-ink`}>{percent}<span className="text-muted">%</span></p>
        <span className={styles.splashBar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span style={{ transform: `scaleX(${percent / 100})` }} />
        </span>
        <p className={`${styles.splashStatus} text-muted`}>{labels.loading}</p>
      </div>

      <nav className={styles.rail} data-hidden={railVisible ? undefined : ""} aria-label={railLabel}>
        {chapters.map((c, i) => (
          <button key={c} type="button" onClick={() => go(i)} aria-label={c} aria-current={i === active ? "step" : undefined}>
            <span className={styles.tip}>{c}</span>
            <span className={styles.dot} />
          </button>
        ))}
      </nav>

      {children}
    </section>
  );
}
