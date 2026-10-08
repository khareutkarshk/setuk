"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dictionary, SceneLabels } from "@/content/types";
import { CornerPattern, Mandala } from "@/components/site/pattern";
import { SetukMark } from "@/components/site/setuk-mark";
import { clamp01, createScrollProgress, smooth } from "@/lib/sadan/progress";
import { scrollToY } from "@/lib/smooth-scroll";
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
 *
 * When the scroll settles between two chapters it finishes the move to one of them (Lenis eases
 * it), so a card is never left half on screen and the camera always rests on a stop.
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
  /* Bumped to rebuild the chamber after the browser drops the WebGL context (at most twice) */
  const [epoch, setEpoch] = useState(0);

  /* Scroll chrome: active chapter, scrim, rail visibility, the How card, the header on compact screens */
  useEffect(() => {
    const root = rootRef.current!;
    const html = document.documentElement;
    const steps = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    /* Layout mode from the story CSS: the reading area (and so the focus line) sits below the band in
       band mode and right of the scene in side mode */
    let mode = "classic", band = 0, headerH = 64;
    const readLayout = () => {
      const m = getComputedStyle(root).getPropertyValue("--story-mode").trim();
      mode = m === "band" || m === "side" ? m : "classic";
      band = mode === "band" ? stageRef.current?.offsetHeight ?? 0 : 0;
      headerH = parseFloat(getComputedStyle(html).getPropertyValue("--header-h")) || 64;
    };
    readLayout();
    const focus = () => (mode === "band" ? band + (innerHeight - band) / 2 : mode === "side" ? headerH + (innerHeight - headerH) / 2 : innerHeight / 2);
    /* compact: a chapter taller than the reading area arrives with its top in view, not its middle */
    const anchor = (h: number) => (mode === "classic" ? h / 2 : Math.min(h / 2, (innerHeight - (mode === "band" ? band : headerH)) / 2 - 8));
    const progress = createScrollProgress(steps, focus, anchor);
    progressRef.current = progress;
    /* "How we work": a story card over consecutive chapters, from data-how onwards */
    const how = root.querySelector<HTMLElement>("[data-how]");
    const pin = how?.querySelector<HTMLElement>("[data-pin]");
    const howFirst = Number(how?.dataset.how ?? 0);
    const howSlides = pin ? [...pin.querySelectorAll<HTMLElement>("[data-k]")] : [];
    const howBars = pin ? [...pin.querySelectorAll<HTMLElement>("[data-bar]")] : [];
    let lastSlide = -1, lastActive = -1, lastRail: boolean | null = null, frame = 0;
    /* where the reader is, to put them back after a rotation or a resize across layouts */
    let lastP = 0, lastW = innerWidth, inView = false;
    /* ?ch=N opens at chapter N (reviews and screenshots) and holds it through re-measures until the visitor acts */
    const chParam = new URLSearchParams(location.search).get("ch");
    let pinCh: number | null = chParam === null ? null : Number(chParam) || 0;
    const release = () => { pinCh = null; };
    const releaseOn = ["pointerdown", "wheel", "keydown", "touchstart"] as const;
    releaseOn.forEach((e) => addEventListener(e, release, { once: true, passive: true }));
    let lastY = scrollY, hideHeader = false;
    const setHideHeader = (on: boolean) => { if (on !== hideHeader) { hideHeader = on; html.toggleAttribute("data-hide-header", on); } };

    const update = () => {
      frame = 0;
      const p = progress.get();
      if (innerWidth === lastW) lastP = p;
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
      const r = root.getBoundingClientRect(), f = focus();
      inView = r.top < innerHeight && r.bottom > 0;
      const rail = r.top < f && r.bottom > f;
      if (rail !== lastRail) { lastRail = rail; setRailVisible(rail); }
      /* compact screens: the header slides away while reading down through the story, back on any scroll up */
      const y = scrollY;
      if (mode === "classic" || p < 0.6 || r.bottom <= innerHeight) { setHideHeader(false); lastY = y; }
      else if (y - lastY > 8) { setHideHeader(true); lastY = y; }
      else if (lastY - y > 8) { setHideHeader(false); lastY = y; }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    /* Snap: once the scroll has been still for a moment between chapters i and i + 1, go on to the next
       chapter if it has come a good way in (back to i when moving up), otherwise back. Compact chapters
       taller than the reading area are read by scrolling through them, so they never snap. Off with
       reduced motion, and while a finger or the scrollbar holds the page. */
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let settle = 0, dir = 0, prevY = scrollY, held = false;
    const fits = (el: HTMLElement) => mode === "classic" || el.offsetHeight <= innerHeight - (mode === "band" ? band : headerH);
    const snap = () => {
      if (reduced || held || pinCh !== null || !inView) return;
      const p = progress.get(), i = Math.floor(p), f = p - i;
      if (i >= steps.length - 1 || f < 0.005 || f > 0.995) return;
      if (!fits(steps[i]) || !fits(steps[i + 1])) return;
      const to = f > (dir < 0 ? 0.7 : 0.3) ? i + 1 : i;
      scrollToY(progress.centre(to), { duration: 0.6 + 0.6 * (to === i ? f : 1 - f) });
    };
    const onScroll = () => {
      schedule();
      const y = scrollY;
      if (y !== prevY) { dir = Math.sign(y - prevY); prevY = y; }
      clearTimeout(settle);
      settle = window.setTimeout(snap, 160);
    };
    const hold = () => { held = true; clearTimeout(settle); };
    const letGo = () => { if (!held) return; held = false; clearTimeout(settle); settle = window.setTimeout(snap, 160); };
    const remeasure = () => {
      const prevMode = mode, prevW = lastW;
      readLayout();
      lastW = innerWidth;
      progress.measure();
      if (pinCh !== null) scrollToY(progress.centre(pinCh), { immediate: true });
      /* the layout changed under the reader (rotation, split view, a resize across modes): keep their place.
         Height-only changes (mobile toolbars) are left alone so they never fight a fling. */
      else if (inView && (mode !== prevMode || innerWidth !== prevW)) scrollToY(progress.at(lastP), { immediate: true });
      schedule();
    };

    if (pinCh !== null) scrollToY(progress.centre(pinCh), { immediate: true });
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointerdown", hold, { passive: true });
    addEventListener("touchstart", hold, { passive: true });
    addEventListener("pointerup", letGo);
    addEventListener("pointercancel", letGo);
    addEventListener("touchend", letGo);
    addEventListener("resize", remeasure);
    document.fonts?.ready.then(remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(root);

    if (new URLSearchParams(location.search).has("debug")) {
      (window as unknown as { __story: unknown }).__story = {
        go: (i: number) => { pinCh = null; scrollToY(progress.centre(i), { immediate: true }); },
        p: () => progress.get(),
        mode: () => mode
      };
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointerdown", hold);
      removeEventListener("touchstart", hold);
      removeEventListener("pointerup", letGo);
      removeEventListener("pointercancel", letGo);
      removeEventListener("touchend", letGo);
      removeEventListener("resize", remeasure);
      releaseOn.forEach((e) => removeEventListener(e, release));
      ro.disconnect();
      html.removeAttribute("data-hide-header");
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
    if (epoch === 0) raf = requestAnimationFrame(animate);

    /* A lost context shows the photo; the chamber is rebuilt when the context comes back, or after 3s */
    let rebuild = 0;
    const again = () => { clearTimeout(rebuild); if (epoch < 2 && !ac.signal.aborted) setEpoch(epoch + 1); };

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
          onContextLost: () => {
            setReady(false);
            clearTimeout(rebuild);
            rebuild = window.setTimeout(() => { if (!document.hidden) again(); }, 3000);
          },
          onContextRestored: again
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

    /* Never trap the visitor behind the splash on a slow or stuck load; compact screens give up sooner
       (the photo shows in the band and the chamber still fades in when it is ready) */
    const compact = matchMedia("(orientation: portrait), (max-height: 559.98px), (max-width: 767.98px)").matches;
    const timeout = setTimeout(() => setBoot((b) => (b === "loading" ? "failed" : b)), compact ? 6000 : 15000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(rebuild);
      cancelAnimationFrame(raf);
      ac.abort();
      handle?.dispose();
    };
  }, [labels, epoch]);

  /* Hold the splash a beat at 100 so the count visibly completes */
  useEffect(() => {
    if (!ready || percent < 100) return;
    const t = setTimeout(() => setBoot((b) => (b === "loading" ? "done" : b)), 350);
    return () => clearTimeout(t);
  }, [ready, percent]);

  const go = (i: number) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollToY(progressRef.current?.centre(i) ?? 0, { immediate: reduce, duration: 1.4 });
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
