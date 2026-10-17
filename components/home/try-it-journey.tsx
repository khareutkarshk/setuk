"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { TryItCopy } from "@/content/types";
import * as I from "@/components/icons";

/* the request's file number, from the name, so the same name always gets the same file */
const fileNo = (name: string) => {
  let h = 7;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) % 9973;
  return String(140 + (h % 60)).padStart(4, "0");
};
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => v[k] ?? m);

/* the journey's moments in order, each with its wait after the one before (ms): steps light, messages
   arrive. Chained rather than all set from the start, so a busy phone keeps the gaps instead of bunching */
const MOMENTS: { wait: number; step?: number; msg?: number }[] = [
  { wait: 0, step: 0 }, { wait: 700, msg: 1 }, { wait: 500, step: 1 }, { wait: 600, msg: 2 },
  { wait: 700, step: 2 }, { wait: 1100, step: 3 }, { wait: 500, msg: 3 }
];

/**
 * The visitor's own request, from logged to closed: a name, one of the sample requests, then the
 * office's steps light one by one while the messages they would get arrive on a phone. It all runs
 * here: nothing is sent or stored. At rest, before anyone types and without script, it shows a
 * finished example; with reduced motion a request shows finished at once. Only the closing line is
 * announced, and focus moves to "Play again" when it ends.
 */
export function TryItJourney({ c }: { c: TryItCopy }) {
  const id = useId();
  const [name, setName] = useState("");
  const [pick, setPick] = useState(0);
  /* what is on screen: whose request, how far it has got, how many messages have come */
  const [shown, setShown] = useState({ name: c.sample, pick: 0 });
  const [reached, setReached] = useState(3);
  const [msgs, setMsgs] = useState(3);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const againRef = useRef<HTMLButtonElement>(null);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);

  const start = (who: string, which: number) => {
    clear();
    setShown({ name: who, pick: which });
    setDone(false);
    setRun((r) => r + 1);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReached(3); setMsgs(3); setDone(true);
      return;
    }
    setMsgs(0);
    const next = (k: number) => {
      const m = MOMENTS[k];
      if (!m) {
        timers.current.push(window.setTimeout(() => { setDone(true); requestAnimationFrame(() => againRef.current?.focus()); }, 400));
        return;
      }
      timers.current.push(window.setTimeout(() => {
        if (m.step !== undefined) setReached(m.step);
        if (m.msg !== undefined) setMsgs(m.msg);
        next(k + 1);
      }, m.wait));
    };
    setReached(0);
    next(1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    start(name.trim().slice(0, 40) || c.sample, pick);
  };

  const sample = c.request.samples[shown.pick];
  const vars = { name: shown.name, no: fileNo(shown.name), dept: sample.dept };
  const finished = reached === 3 && msgs === 3;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      {/* the request */}
      <form onSubmit={onSubmit} className="self-start rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <label htmlFor={`${id}-n`} className="text-[15px] font-semibold">{c.name.label}</label>
        <input id={`${id}-n`} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" placeholder={c.name.placeholder}
          className="mt-2 block h-13 w-full rounded-xl border border-line bg-bg px-4 text-[17px] text-ink transition-colors placeholder:text-muted/70 hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25" />
        <fieldset className="mt-6">
          <legend className="text-[15px] font-semibold">{c.request.label}</legend>
          <div className="mt-3 grid gap-2">
            {c.request.samples.map((x, i) => (
              <label key={x.t} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg px-4 py-2.5 text-[16px] transition-colors hover:border-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
                <input type="radio" name="request" value={i} checked={pick === i} onChange={() => setPick(i)} className="size-4 shrink-0 accent-[var(--accent)]" />
                {x.t}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="press mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-[17px] font-semibold text-accent-ink hover:brightness-110 sm:w-auto">
          <I.PaperPlaneTilt size={19} aria-hidden />{c.button}
        </button>
        <p className="mt-4 flex items-center gap-2 text-[14px] text-muted"><I.Lock size={15} className="shrink-0 text-leaf" aria-hidden />{c.privacy}</p>
      </form>

      {/* what the office does with it, and what reaches the citizen */}
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_40px_90px_-60px_color-mix(in_srgb,var(--accent)_60%,transparent)] sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-4">
            <p className="font-mono text-[14px] font-semibold text-accent">{fill(c.file, vars)}</p>
            <p className="min-w-0 truncate text-[14px] text-muted">{shown.name} · {sample.t}</p>
          </div>
          <ol className="role-steps mt-5">
            {c.steps.map((s, k) => {
              const state = k < reached ? "done" : k > reached ? "next" : k === 3 ? "closed" : "now";
              return (
                <li key={s.t} data-state={state} aria-current={state === "now" ? "step" : undefined}>
                  <span aria-hidden="true" className="role-dot">{(state === "done" || state === "closed") && <I.Check size={11} weight="bold" />}</span>
                  <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4">
                    <span className="min-w-0">
                      <span className="block text-[16px] leading-snug font-semibold">{fill(s.t, vars)}</span>
                      <span className="mt-0.5 block text-[14px] leading-snug text-muted">{s.d}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[12px] text-muted">{c.when[k]}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <p role="status" className={`flex-1 text-[14px] font-medium ${done ? "text-leaf" : "text-muted"}`}>
              {done && <I.SealCheck size={17} weight="fill" className="mr-1.5 inline align-[-3px]" aria-hidden />}
              {done ? fill(c.done, vars) : ""}
            </p>
            {run > 0 && finished && (
              <>
                <button ref={againRef} type="button" onClick={() => start(shown.name, shown.pick)}
                  className="press inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 font-semibold hover:border-ink">
                  <I.ClockCounterClockwise size={16} aria-hidden />{c.again}
                </button>
                <button type="button" onClick={() => { const n = (shown.pick + 1) % c.request.samples.length; setPick(n); start(shown.name, n); }}
                  className="press inline-flex h-11 items-center gap-2 rounded-full px-4 font-semibold text-accent hover:bg-accent-soft">
                  {c.another}<I.ArrowRight size={15} aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>

        {/* the citizen's phone */}
        <div aria-hidden className="ti-phone mx-auto w-full max-w-[300px] rounded-[34px] border border-line p-2.5 shadow-[0_40px_80px_-40px_color-mix(in_srgb,var(--shadow)_70%,transparent)] xl:mt-10">
          <div className="min-h-[360px] rounded-[26px] bg-bg p-3.5">
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-line" />
            <p className="flex items-center gap-2 border-b border-line pb-3 text-[13px] font-semibold">
              <span className="grid size-7 place-items-center rounded-full bg-leaf text-leaf-ink"><I.ChatsCircle size={15} /></span>
              <span className="min-w-0 truncate">{c.phone.from}</span>
            </p>
            <div className="mt-3 space-y-2.5">
              {c.phone.messages.slice(0, msgs).map((m, k) => (
                <p key={`${run}-${k}`} className={`max-w-[92%] rounded-2xl rounded-tl-md bg-leaf-soft px-3.5 py-2.5 text-[14px] leading-snug text-ink ${run > 0 ? "ti-msg" : ""}`}>
                  {fill(m, vars)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
