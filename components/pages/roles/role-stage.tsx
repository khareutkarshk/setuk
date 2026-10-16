"use client";

import { useRef, useState } from "react";
import type { RoleCase } from "@/content/types";
import * as I from "@/components/icons";
import { Hairline, type HairlineControls } from "@/components/site/hairline";
import { CornerPattern, Pattern } from "@/components/site/pattern";
import type { RoleWindow, Stop } from "./look";

/*
 * The role hero's picture: the line figure in its window, and the case card that walks one real
 * case through the figure's tour (Hairline's `tour` and `onTour`). The card is copy, so it is always
 * there and always readable: before the lap and without motion it shows the case as written, every
 * step done; while the lap plays the step the unseen pointer has reached is lit, and when the figure
 * comes back to rest the case closes and the rest highlight turns leaf (`data-closed`, globals.css).
 * The figure's own read-out ("ward 07") stands down while the case plays, so it never contradicts
 * the card; a real pointer brings it back and takes the leaf away.
 */

/** null: the case as written; -1: the lap has set off; 0 to 3: the step reached, 3 closing it */
type Step = number | null;

type Props = {
  window: RoleWindow;
  figure: string;
  stops: Stop[];
  label: string;
  hint: string;
  nouns: Record<string, string>;
  /** The role in Devanagari, set large in outline behind the figure */
  word: string;
  kase: RoleCase;
  replay: string;
  /** The Flow section's anchor and its link text, on the office pages */
  more?: { href: string; t: string };
};

export function RoleStage({ window: kind, figure, stops, label, hint, nouns, word, kase, replay, more }: Props) {
  const [step, setStep] = useState<Step>(null);
  const [hand, setHand] = useState(false);
  const controls = useRef<HairlineControls | null>(null);
  const last = kase.steps.length - 1;
  const closed = step === null || step >= last;
  const inside = kind === "jharokha";

  const card = (
    <CaseCard kase={kase} step={step} closed={closed} replay={step === last ? () => controls.current?.replay() : undefined} replayLabel={replay} more={more} />
  );

  return (
    <div
      className="role-stage"
      data-window={kind}
      data-playing={!closed && !hand ? "" : undefined}
      data-closed={closed && !hand ? "" : undefined}
    >
      <div className="role-window">
        {/* the window's shape, ground and ornament, clipped on their own so the figure and its read-out never are */}
        <span aria-hidden="true" className="role-bg">
          <Decor kind={kind} />
          <span className="role-word font-deva">{word}</span>
        </span>
        {/* a hero is tall, so the case starts once a good part of the figure is in view, not most of it */}
        {/* a hand on the figure itself (not the card beside it) takes the stage from the case */}
        <div className="role-figure" onPointerEnter={() => setHand(true)} onPointerLeave={() => setHand(false)}>
          <Hairline name={figure} label={label} hint={hint} nouns={nouns} tour={stops} onTour={(i) => setStep(i)} controls={controls} threshold={0.35} />
        </div>
        {inside && card}
      </div>
      {!inside && card}
    </div>
  );
}

/** Each window's ornament, from the role's own pattern (look.ts) */
function Decor({ kind }: { kind: RoleWindow }) {
  if (kind === "dome") {
    return (
      <>
        <Pattern kind="sadan" className="absolute inset-0 opacity-[.07]" style={{ ["--s" as string]: "56px" }} />
        <Pattern kind="temple" className="absolute inset-x-0 bottom-0 opacity-30" />
      </>
    );
  }
  if (kind === "circle") return <CornerPattern kind="kolam" fx={50} fy={50} radius={520} className="inset-0 text-accent opacity-[.16]" />;
  if (kind === "jharokha") {
    return (
      <>
        <CornerPattern kind="jaali" fx={0} fy={0} radius={420} className="inset-0 text-accent opacity-[.14]" />
        <CornerPattern kind="jaali" fx={100} fy={100} radius={420} className="inset-0 text-accent opacity-[.14]" />
        <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent opacity-[.18]" />
      </>
    );
  }
  return <CornerPattern kind="lehar" fx={50} fy={100} radius={420} className="inset-0 text-accent opacity-[.24]" />;
}

function CaseCard({ kase, step, closed, replay, replayLabel, more }: {
  kase: RoleCase;
  step: Step;
  closed: boolean;
  replay?: () => void;
  replayLabel: string;
  more?: { href: string; t: string };
}) {
  const last = kase.steps.length - 1;
  const reached = step === null ? last : Math.max(step, -1);
  return (
    <div className="role-card-wrap">
      {/* the next clients' cards, squared up behind this one (shown on the consultants' pool only) */}
      <span aria-hidden="true" className="role-ghost" />
      <span aria-hidden="true" className="role-ghost" />
      <div className="role-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[.06em] text-muted">{kase.label}</p>
        {closed
          ? <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-leaf-soft px-2.5 text-[12px] font-semibold text-leaf"><I.Check size={12} weight="bold" aria-hidden />{kase.done}</span>
          : <span aria-hidden="true" className="shrink-0 font-mono text-[12px] tabular-nums text-muted">{Math.max(reached + 1, 1)}/{kase.steps.length}</span>}
      </div>
      <p className="font-display-tight mt-1.5 text-[19px] leading-snug text-ink">{kase.title}</p>
      <ol className="role-steps mt-4">
        {kase.steps.map((s, k) => {
          const state = k < reached ? "done" : k > reached ? "next" : k === last ? "closed" : "now";
          return (
            <li key={s.t} data-state={state} aria-current={state === "now" ? "step" : undefined}>
              <span aria-hidden="true" className="role-dot">{(state === "done" || state === "closed") && <I.Check size={11} weight="bold" />}</span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-snug">{s.t}</span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{s.d}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {(replay || more) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3">
          {more && (
            <a href={more.href} className="group inline-flex min-h-9 items-center gap-1.5 text-[14px] font-semibold text-accent">
              <span className="underline decoration-accent/30 underline-offset-4 group-hover:decoration-accent">{more.t}</span>
              <I.ArrowDown size={14} aria-hidden />
            </a>
          )}
          {replay && (
            <button type="button" onClick={replay} className="press ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[14px] font-medium text-muted hover:text-ink">
              <I.ClockCounterClockwise size={15} aria-hidden />{replayLabel}
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
