"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneLabels } from "@/content/types";
import { createScrollProgress, smooth } from "@/lib/sadan/progress";
import type { SadanHandle } from "@/lib/sadan/engine";
import poster from "@/assets/loksabha.jpg";
import styles from "./story.module.css";

interface Props {
  chapters: string[];
  railLabel: string;
  labels: SceneLabels;
  ariaLabel: string;
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
export function StoryController({ chapters, railLabel, labels, ariaLabel, children }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<ReturnType<typeof createScrollProgress> | null>(null);
  const [active, setActive] = useState(0);
  const [railVisible, setRailVisible] = useState(false);
  const [ready, setReady] = useState(false);

  /* Scroll chrome: active chapter, scrim, rail visibility */
  useEffect(() => {
    const root = rootRef.current!;
    const steps = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    const progress = createScrollProgress(steps);
    progressRef.current = progress;
    let lastActive = -1, lastRail: boolean | null = null, frame = 0;

    const update = () => {
      frame = 0;
      const p = progress.get();
      steps.forEach((el, i) => el.toggleAttribute("data-active", Math.abs(p - i) < 0.4));
      scrimRef.current?.style.setProperty("--hero", String(1 - smooth(0.05, 0.45, p)));
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

    import("@/lib/sadan/engine")
      .then(({ createSadan }) =>
        createSadan({
          container: canvasSlotRef.current!,
          stage: stageRef.current!,
          progress: () => progressRef.current?.get() ?? 0,
          labels,
          reducedMotion,
          assetBase: "/sadan/v1/",
          quality,
          signal: ac.signal,
          onReady: () => setReady(true),
          onContextLost: () => setReady(false)
        })
      )
      .then((h) => {
        if (ac.signal.aborted) h?.dispose();
        else handle = h;
      })
      .catch((err) => {
        /* The photo backdrop stays; the story still works without the scene */
        console.error("[sadan] 3D chamber failed to start", err);
      });

    return () => {
      ac.abort();
      handle?.dispose();
    };
  }, [labels]);

  const go = (i: number) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: progressRef.current?.centre(i) ?? 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={rootRef} className={styles.story} aria-label={ariaLabel}>
      <div ref={stageRef} className={styles.stage} data-ready={ready ? "" : undefined} aria-hidden="true">
        <Image src={poster} alt="" fill preload sizes="100vw" placeholder="blur" className={styles.poster} />
        <div ref={canvasSlotRef} className={styles.canvasSlot} />
        <div className={styles.vignette} />
        <div ref={scrimRef} className={styles.scrim} />
        <div className={styles.topScrim} />
        <p className={styles.loading}>
          <span className={styles.spin} />
          <span>{labels.loading}</span>
        </p>
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
