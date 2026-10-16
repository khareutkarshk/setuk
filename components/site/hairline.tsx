"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * A hairline figure: an isometric line drawing that answers the pointer (the role pages' heroes).
 * Figures live in public/hairline/v1 and are drawn on the kernel of @lucasmarkes/hairline, copied
 * there unchanged; the hairline-create skill (.agents/skills) writes and checks them.
 *
 * The kernel loads once as a classic script (window.HL). A figure is a module that calls the global
 * hairline(definition), the way the skill's bench page runs it; this file collects definitions by
 * name, so returning to a page mounts again without reloading anything. The page's palette comes
 * from the --hairline-* variables in globals.css. The figure writes a short read-out ("seat 3·12"),
 * which shows in the plate's corner in the page's language, and the hint (if any) shows until the
 * pointer arrives. Once the figure is mostly in view it walks its tour round and round, unless the reader
 * asked for less motion; the kernel's one frame loop only ticks figures on screen in a visible tab,
 * so a lap out of sight costs nothing. Without script the plate stays empty and the label still names it.
 *
 * A page can give its own `tour` (the role heroes walk their case through it) and hear it with
 * `onTour`: -1 as the first lap sets off, then each stop's index as the unseen pointer reaches it,
 * the closing null's when the figure is back at rest, and round again from the first stop.
 * `controlsRef` hands back `restart`: the lap from its first stop now, even before the figure is in
 * view (a page whose card is seen first starts the figure with it).
 */

type Stop = [number, number] | null;
export type HairlineControls = { restart: () => void };
type Handle = { set: (value: number) => void; destroy: () => void };
type Definition = {
  name: string;
  range: [number, number, number];
  tour: Stop[] | null;
  mount: (on: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string | null } }, value: number) => Handle;
};
type Kernel = {
  inject: (root: Document) => void;
  mk: (tag: string, attrs: Record<string, string>, parent: Element) => SVGSVGElement;
  tour: (stage: HTMLElement, stops: Stop[], onStop: (i: number) => void) => { stop: () => void };
  LAP: Stop[];
};

declare global {
  interface Window {
    HL?: Kernel;
    hairline?: (figure: Definition) => void;
  }
}

const BASE = "/hairline/v1/";
const figures = new Map<string, Definition>();
const pending = new Map<string, Promise<Definition>>();
const arrivals = new Map<string, (figure: Definition) => void>();
let kernel: Promise<void> | null = null;

function script(src: string, module: boolean) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    if (module) s.type = "module";
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`hairline: ${src} did not load`));
    document.head.append(s);
  });
}

function load(name: string): Promise<Definition> {
  const known = figures.get(name);
  if (known) return Promise.resolve(known);
  let p = pending.get(name);
  if (!p) {
    window.hairline ??= (figure) => {
      figures.set(figure.name, figure);
      arrivals.get(figure.name)?.(figure);
    };
    kernel ??= window.HL ? Promise.resolve() : script(BASE + "kernel.js", false);
    p = kernel.then(() => new Promise<Definition>((resolve, reject) => {
      arrivals.set(name, resolve);
      script(BASE + name + ".js", true).catch(reject);
    }));
    pending.set(name, p);
  }
  return p;
}

export function Hairline({ name, label, hint, nouns, tour, onTour, controlsRef, threshold = 0.6, className = "" }: {
  name: string;
  /** What the figure shows, for screen readers */
  label: string;
  /** Shown in the corner until the pointer arrives; leave it out for an empty corner at rest */
  hint?: string;
  /** The read-out's first word in the page's language: { seat: "सीट" } */
  nouns: Record<string, string>;
  /** Stops for the lap in place of the figure's own, ending in null */
  tour?: Stop[];
  onTour?: (step: number) => void;
  controlsRef?: RefObject<HairlineControls | null>;
  /** How much of the figure must be in view before the lap plays */
  threshold?: number;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLSpanElement>(null);
  // the latest listener, so a page re-rendering on each step never mounts the figure again
  const heard = useRef(onTour);
  useEffect(() => { heard.current = onTour; });

  useEffect(() => {
    const stage = stageRef.current, out = outRef.current;
    if (!stage || !out) return;
    let gone = false;
    let handle: Handle | undefined;
    let lap: { stop: () => void } | null = null;
    let watch: IntersectionObserver | undefined;
    // a restart asked for before the figure has loaded plays as soon as it has
    let play: (() => void) | null = null;
    let wanted = false;
    if (controlsRef) controlsRef.current = { restart: () => { if (play) play(); else wanted = true; } };

    const show = (v: string | null) => {
      const live = !!v && v !== "rest";
      const cut = live ? v.indexOf(" ") : -1;
      out.textContent = !live ? hint ?? "" : cut > 0 ? (nouns[v.slice(0, cut)] ?? v.slice(0, cut)) + v.slice(cut) : v;
      out.toggleAttribute("data-live", live);
    };

    load(name).then((figure) => {
      const HL = window.HL;
      if (gone || !HL) return;
      HL.inject(document);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
      let text: string | null = null;
      const read = {
        get textContent() { return text; },
        set textContent(v: string | null) { text = v == null ? "" : String(v); show(text); }
      };
      handle = figure.mount({ stage, svg, read }, figure.range[1]);
      if (text === null) show("rest");
      stage.toggleAttribute("data-ready", true);

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const stops = tour ?? figure.tour ?? HL.LAP;
      play = () => {
        watch?.disconnect();
        lap?.stop();
        heard.current?.(-1);
        // the kernel's tour walks round for ever, rests a beat at each null, and gives way to a real pointer
        lap = HL.tour(stage, stops, (i) => heard.current?.(i));
      };
      if (wanted) { play(); return; }
      watch = new IntersectionObserver(([e]) => {
        if (e?.isIntersecting) play?.();
      }, { threshold });
      watch.observe(stage);
    }).catch(() => {});

    return () => {
      gone = true;
      if (controlsRef) controlsRef.current = null;
      watch?.disconnect();
      lap?.stop();
      handle?.destroy();
      stage.replaceChildren();
      stage.removeAttribute("data-ready");
    };
  }, [name, hint, nouns, tour, controlsRef, threshold]);

  return (
    <div className={`relative ${className}`}>
      <div ref={stageRef} data-hairline={name} role="img" aria-label={label} className="hairline-stage" />
      <span ref={outRef} aria-hidden="true" className="hairline-read">{hint}</span>
    </div>
  );
}
