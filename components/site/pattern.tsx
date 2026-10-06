import type { CSSProperties } from "react";

/**
 * Decorative Indian patterns (see the pattern classes in app/globals.css). They are masks over
 * currentColor, so set the colour and strength with text-* and opacity-* classes. Always aria-hidden.
 */
export type PatternKind = "jaali" | "temple" | "kolam" | "lehar" | "buti" | "toran";

export function Pattern({ kind, className = "", style }: { kind: PatternKind; className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`pat pat-${kind} ${className}`} style={style} />;
}

/** A pattern that fades out from one corner (fx/fy in %, radius in px) */
export function CornerPattern({ kind, className = "", fx = 100, fy = 0, radius = 240, cell }: { kind: PatternKind; className?: string; fx?: number; fy?: number; radius?: number; cell?: number }) {
  const vars = { "--fx": `${fx}%`, "--fy": `${fy}%`, "--fr": `${radius}px` } as CSSProperties;
  const inner = cell ? ({ "--s": `${cell}px`, "--r": `${cell * 0.71}px` } as CSSProperties) : undefined;
  return (
    <span aria-hidden="true" className={`pat-fade pointer-events-none absolute ${className}`} style={vars}>
      <span className={`pat pat-${kind} h-full w-full`} style={inner} />
    </span>
  );
}

/** A lotus rosette: sixteen outer petals, eight inner, two rings. Line art in currentColor. */
export function Lotus({ className = "" }: { className?: string }) {
  const petal = (r: number, len: number, w: number) => `M100 ${100 - r} C${100 + w} ${100 - r - len * 0.35} ${100 + w * 0.6} ${100 - r - len * 0.85} 100 ${100 - r - len} C${100 - w * 0.6} ${100 - r - len * 0.85} ${100 - w} ${100 - r - len * 0.35} 100 ${100 - r}Z`;
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" className={`pointer-events-none ${className}`}>
      <circle cx="100" cy="100" r="14" />
      <circle cx="100" cy="100" r="22" strokeDasharray="1.5 3" />
      {Array.from({ length: 8 }, (_, i) => <path key={`i${i}`} d={petal(24, 30, 11)} transform={`rotate(${i * 45 + 22.5} 100 100)`} />)}
      {Array.from({ length: 16 }, (_, i) => <path key={`o${i}`} d={petal(46, 42, 10)} transform={`rotate(${i * 22.5} 100 100)`} />)}
      <circle cx="100" cy="100" r="93" />
      <circle cx="100" cy="100" r="97" strokeDasharray="1 4" />
    </svg>
  );
}
