"use client";

import { useEffect, useRef } from "react";

/* Measures each package card into --card-h and marks the stack data-fit, so on phones (engage.module.css)
   a card taller than the screen pins only once its foot is in view, and the next card never covers copy
   that hasn't been read. Without script the stack stays a plain list. */
export function EngageFit() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const stack = ref.current?.parentElement;
    if (!stack) return;
    const cards = [...stack.querySelectorAll<HTMLElement>("article")];
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) (e.target as HTMLElement).style.setProperty("--card-h", `${(e.target as HTMLElement).offsetHeight}px`);
    });
    cards.forEach((c) => ro.observe(c));
    stack.dataset.fit = "";
    return () => {
      ro.disconnect();
      delete stack.dataset.fit;
    };
  }, []);
  return <span ref={ref} hidden />;
}
