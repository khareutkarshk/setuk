/**
 * The Setuk bridge mark, redrawn as a vector so it follows the theme through CSS variables
 * (--mark-arch, --mark-dot-side, --mark-dot-mid). Compare with the master artwork before print use.
 */
export function SetukMark({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 949 405" fill="none" aria-hidden="true" className={`block h-auto w-full overflow-visible ${draw ? "mark-draw" : ""} ${className ?? ""}`}>
      <path className="mk-band" d="M15 305 Q474 -15 934 305" stroke="var(--mark-arch)" strokeWidth="34" pathLength={1} />
      <path
        className="mk-deck"
        fill="var(--mark-arch)"
        d="M60 330 Q474 50 888 330 L868 348 L868 392 L811 392 L811 355 A85 85 0 0 0 641 355 L641 392 L590 392 L590 350 A115 115 0 0 0 360 350 L360 392 L307 392 L307 355 A85 85 0 0 0 137 355 L137 392 L80 392 L80 348 Z"
      />
      <circle className="mk-dot mk-d1" cx="225" cy="92" r="38" fill="var(--mark-dot-side)" />
      <circle className="mk-dot mk-d2" cx="474" cy="56" r="41" fill="var(--mark-dot-mid)" />
      <circle className="mk-dot mk-d3" cx="723" cy="92" r="38" fill="var(--mark-dot-side)" />
    </svg>
  );
}
