import type { CSSProperties, ReactNode } from "react";

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

/**
 * A layered mandala after the Ashoka Chakra, rangoli rings and Mughal jaali rosettes. Line art in
 * currentColor. Each ring is a <g data-ring="1..5"> (outside in) so callers can animate them.
 */
export function Mandala({ className = "" }: { className?: string }) {
  const c = 200;
  const ring = (n: number, f: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => f(i));
  const petal = (r: number, len: number, w: number) => `M${c} ${c - r} C${c + w} ${c - r - len * 0.35} ${c + w * 0.6} ${c - r - len * 0.85} ${c} ${c - r - len} C${c - w * 0.6} ${c - r - len * 0.85} ${c - w} ${c - r - len * 0.35} ${c} ${c - r}Z`;
  const arch = (r: number, h: number, w: number) => `M${c - w} ${c - r} Q${c - w} ${c - r - h} ${c} ${c - r - h * 1.25} Q${c + w} ${c - r - h} ${c + w} ${c - r}`;
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true" className={`pointer-events-none ${className}`}>
      {/* 1: scalloped arch border with bead ring */}
      <g data-ring="1">
        <circle cx={c} cy={c} r="196" strokeDasharray="0.5 5" strokeWidth="1.6" />
        {ring(48, (i) => <path key={i} d={arch(178, 11, 11.6)} transform={`rotate(${i * 7.5} ${c} ${c})`} />)}
        {ring(48, (i) => <circle key={`d${i}`} cx={c} cy={c - 186} r="1.3" fill="currentColor" stroke="none" transform={`rotate(${i * 7.5 + 3.75} ${c} ${c})`} />)}
        <circle cx={c} cy={c} r="178" />
      </g>
      {/* 2: double lotus petals, outward */}
      <g data-ring="2">
        {ring(32, (i) => <path key={i} d={petal(132, 40, 12)} transform={`rotate(${i * 11.25} ${c} ${c})`} />)}
        {ring(32, (i) => <path key={`s${i}`} d={petal(134, 22, 6)} transform={`rotate(${i * 11.25 + 5.625} ${c} ${c})`} />)}
        <circle cx={c} cy={c} r="132" />
        <circle cx={c} cy={c} r="126" strokeDasharray="1 3" />
      </g>
      {/* 3: twenty-four spoke chakra */}
      <g data-ring="3">
        <circle cx={c} cy={c} r="118" />
        {ring(24, (i) => (
          <g key={i} transform={`rotate(${i * 15} ${c} ${c})`}>
            <path d={`M${c} ${c - 40} L${c - 3.2} ${c - 80} L${c} ${c - 116} L${c + 3.2} ${c - 80} Z`} />
            <path d={`M${c - 15.4} ${c - 117} A 6 6 0 0 0 ${c - 15.4} ${c - 105}`} transform={`rotate(7.5 ${c} ${c})`} />
          </g>
        ))}
        <circle cx={c} cy={c} r="40" />
      </g>
      {/* 4: jaali rosette */}
      <g data-ring="4">
        {ring(12, (i) => <ellipse key={i} cx={c} cy={c - 22} rx="7" ry="16" transform={`rotate(${i * 30} ${c} ${c})`} />)}
      </g>
      {/* 5: bindu */}
      <g data-ring="5">
        <circle cx={c} cy={c} r="8" />
        <circle cx={c} cy={c} r="2.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** The Ashoka Chakra: rim, twenty-four tapered spokes, the lobes between them and the hub. In currentColor. */
export function AshokaChakra({ className = "" }: { className?: string }) {
  const c = 100;
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true" className={`pointer-events-none ${className}`}>
      <circle cx={c} cy={c} r="93" strokeWidth="6" />
      <circle cx={c} cy={c} r="85" strokeWidth="0.8" />
      {Array.from({ length: 24 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 15} ${c} ${c})`}>
          <path d={`M${c} ${c - 13} L${c - 2.6} ${c - 50} L${c} ${c - 85} L${c + 2.6} ${c - 50} Z`} fill="currentColor" stroke="none" />
          <path d={`M${c - 4.4} ${c - 85} A4.4 4.4 0 0 0 ${c + 4.4} ${c - 85}`} transform={`rotate(7.5 ${c} ${c})`} strokeWidth="1.4" />
          <circle cx={c} cy={c - 89} r="1.4" fill="currentColor" stroke="none" transform={`rotate(7.5 ${c} ${c})`} />
        </g>
      ))}
      <circle cx={c} cy={c} r="13" strokeWidth="2.4" />
      <circle cx={c} cy={c} r="5" fill="currentColor" stroke="none" />
    </svg>
  );
}
