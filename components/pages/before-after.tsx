"use client";

import Image from "next/image";
import { useEffect, useRef, type ChangeEvent } from "react";
import { media } from "@/content/media";
import * as I from "@/components/icons";

type Copy = { label: string; before: string; after: string; valuetext: string };

/**
 * The About page's before and after: one picture whose two halves are the office before Setuk and
 * with it, shown in one frame with a divider to drag. Both layers are the same image at the same
 * size, so it downloads once; the "after" layer is clipped at the divider (--pos). The control is a
 * real range input laid over the frame, so it works by keyboard and is read out; the divider nudges
 * once when the frame first comes into view, unless the visitor prefers reduced motion. `alt`
 * describes the whole picture, on the first layer.
 */
export function BeforeAfter({ c, alt, className = "" }: { c: Copy; alt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const set = (v: number) => {
    ref.current?.style.setProperty("--pos", `${v}%`);
    input.current?.setAttribute("aria-valuetext", c.valuetext.replace("{n}", String(100 - Math.round(v))));
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => set(Number(e.target.value));

  /* the first time it's seen: out to 36 and back, to show it moves */
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now() + 400;
      const tick = (now: number) => {
        const x = Math.min(1, Math.max(0, (now - t0) / 1400));
        const v = 50 - 14 * Math.sin(Math.PI * x) * (1 - x * 0.2);
        set(x < 1 ? v : 50);
        if (input.current) input.current.value = String(Math.round(x < 1 ? v : 50));
        if (x < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sizes = "(min-width: 1024px) 1200px, 200vw";
  return (
    <div ref={ref} style={{ "--pos": "50%" } as React.CSSProperties}
      className={`illo group relative aspect-[8/9] overflow-hidden rounded-3xl border border-line bg-surface select-none ${className}`}>
      <Image src={media.officeBeforeAfter} alt={alt} fill sizes={sizes} placeholder="blur" className="object-cover object-left" />
      <Image src={media.officeBeforeAfter} alt="" fill sizes={sizes} className="object-cover object-right [clip-path:inset(0_0_0_var(--pos))]" />

      <span aria-hidden className="absolute top-4 left-4 rounded-full bg-ink/75 px-3 py-1 text-[13px] font-semibold text-bg backdrop-blur-sm">{c.before}</span>
      <span aria-hidden className="absolute top-4 right-4 rounded-full bg-leaf px-3 py-1 text-[13px] font-semibold text-leaf-ink">{c.after}</span>

      {/* the divider and its handle */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-(--pos) w-[3px] -translate-x-1/2 bg-surface shadow-[0_0_0_1px_color-mix(in_srgb,var(--shadow)_15%,transparent)]" />
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-(--pos) grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface text-accent shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--shadow)_50%,transparent)] ring-accent ring-offset-2 ring-offset-surface group-has-[:focus-visible]:ring-2">
        <I.ArrowsLeftRight size={22} weight="bold" />
      </span>

      <input ref={input} type="range" min={0} max={100} defaultValue={50} onChange={onChange} aria-label={c.label}
        aria-valuetext={c.valuetext.replace("{n}", "50")}
        className="absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y appearance-none opacity-0" />
    </div>
  );
}
