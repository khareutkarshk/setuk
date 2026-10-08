"use client";

import { useEffect } from "react";
import { startSmoothScroll } from "@/lib/smooth-scroll";
import "lenis/dist/lenis.css";

/** Starts page-wide smooth scrolling after hydration; renders nothing */
export function SmoothScroll() {
  useEffect(() => startSmoothScroll(), []);
  return null;
}
