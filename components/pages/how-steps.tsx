"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The process section's one interaction: the step list beside the steps marks the step being read,
 * and a rail fills as the reader moves through all four. Both tell the reader where they are in the
 * process. GSAP ScrollTrigger is loaded only here, after hydration; without it the list and the
 * steps are simply static. Markup comes from the server: [data-rail] (the fill), [data-step-link]
 * (list items) and [data-step] (the step articles), matched by index.
 */
export function HowSteps({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let revert = () => {};
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const steps = [...root.querySelectorAll<HTMLElement>("[data-step]")];
      const links = [...root.querySelectorAll<HTMLElement>("[data-step-link]")];
      const rail = root.querySelector<HTMLElement>("[data-rail]");
      const ctx = gsap.context(() => {
        if (rail) {
          gsap.fromTo(rail, { scaleY: 0 }, {
            scaleY: 1, ease: "none",
            scrollTrigger: { trigger: steps[0], endTrigger: steps[steps.length - 1], start: "top 55%", end: "bottom 55%", scrub: 0.4 }
          });
        }
        const mark = (i: number) => links.forEach((l, k) => l.toggleAttribute("data-on", k === i));
        steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%", onToggle: (st) => { if (st.isActive) mark(i); } }));
        mark(0);
      }, root);
      revert = () => ctx.revert();
    })();
    return () => { cancelled = true; revert(); };
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
