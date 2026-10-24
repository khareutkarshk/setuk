"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type Lenis from "lenis";
import type { DemoCopy } from "@/content/types";
import * as I from "@/components/icons";
import { Pattern } from "@/components/site/pattern";
import { SetukMark } from "@/components/site/setuk-mark";
import { watchLenis } from "@/lib/smooth-scroll";

type Field = "name" | "phone";
type Direct = { href: string; label: string };

/**
 * The request-a-demo dialog, one per page, mounted by the site shell. Every demo button stays a plain
 * link to the contact page (so it still works without script) and carries data-demo; a click on one
 * opens this instead. data-demo="0".."3" preselects a role (the role pages pass theirs).
 *
 * Laid out like a note to the office: the brand side says what happens after you send it, the paper
 * side is the slip itself. On phones it rises as a sheet. Only the name and a mobile number are asked
 * for; the rest is optional, and the send button stays in view at the slip's foot. There is no form
 * backend yet, so until the API is connected in onSubmit a request shows its thank-you but goes nowhere.
 *
 * A native <dialog>: Escape, the backdrop and the close button all play the exit through `hide`
 * (data-closing keeps it in the top layer while it fades, in every browser), focus goes to the title
 * on open and back to the button after, and the page under it holds still (Lenis stops while open).
 */
export function DemoHost({ c, privacyHref, whatsapp, phone }: { c: DemoCopy; privacyHref: string; whatsapp: Direct; phone: Direct }) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-demo]");
      const d = ref.current;
      if (!el || !d) return;
      e.preventDefault();
      const role = Number(el.dataset.demo);
      const form = formRef.current;
      if (form && el.dataset.demo !== "" && Number.isInteger(role)) {
        const r = form.querySelector<HTMLInputElement>(`input[name="role"][value="${role}"]`);
        if (r) r.checked = true;
      }
      setSent(false);
      d.removeAttribute("data-closing");
      d.showModal();
      titleRef.current?.focus();
      setOpen(true);
    };
    /* capture, so this runs before next/link's own handler, which then leaves the prevented click alone */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    let l: Lenis | null = null;
    const stop = watchLenis((x) => { l?.start(); l = x; l?.stop(); });
    return () => { stop(); l?.start(); };
  }, [open]);

  useEffect(() => { if (sent) sentRef.current?.focus(); }, [sent]);

  /* plays the exit, then closes: the open styles stop applying under data-closing while it is still in the top layer */
  const hide = async () => {
    const d = ref.current;
    if (!d?.open || d.hasAttribute("data-closing")) return;
    d.setAttribute("data-closing", "");
    const runs = d.getAnimations({ subtree: true });
    if (runs.length) await Promise.race([Promise.allSettled(runs.map((a) => a.finished)), new Promise((r) => setTimeout(r, 600))]);
    if (!d.hasAttribute("data-closing")) return;
    d.close();
    d.removeAttribute("data-closing");
  };

  const check = (form: HTMLFormElement) => {
    const d = new FormData(form);
    const e: Partial<Record<Field, string>> = {};
    if (!String(d.get("name") ?? "").trim()) e.name = c.errors.name;
    if (!mobile(String(d.get("phone") ?? ""))) e.phone = c.errors.phone;
    return e;
  };

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const e = check(form);
    setErrors(e);
    setTouched(true);
    const first = (Object.keys(e) as Field[])[0];
    if (first) { form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    /* TODO: send new FormData(form) (name, phone, role, staff, note) to the API here */
    /* sent: the next request starts on a clean slip */
    form.reset();
    setSent(true);
  };

  const onInput = () => { if (touched && formRef.current) setErrors(check(formRef.current)); };

  const input = "mt-2 block w-full rounded-xl border bg-bg px-4 text-[16px] text-ink transition-colors placeholder:text-muted/70 hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25";
  const border = (k: Field) => (errors[k] ? "border-danger" : "border-line");
  const err = (k: Field) => errors[k] && <p id={`${id}-${k}`} className="mt-2 flex items-start gap-1.5 text-[14px] leading-snug font-medium text-danger"><I.Info className="mt-0.5 shrink-0" aria-hidden />{errors[k]}</p>;
  const desc = (k: Field) => (errors[k] ? `${id}-${k}` : undefined);
  const label = "text-[14px] font-semibold";
  const opt = <span className="font-normal text-muted">({c.optional})</span>;

  return (
    <dialog ref={ref} aria-labelledby={`${id}-t`} data-lenis-prevent {...{ closedby: "any" }}
      onCancel={(e) => { e.preventDefault(); hide(); }}
      onClose={() => setOpen(false)}
      /* a click on the backdrop lands on the dialog itself, outside its panel (browsers without closedby) */
      onClick={(e) => { if (e.target === e.currentTarget) hide(); }}
      className="demo-dialog text-ink">
      <div className="demo-sheet demo-scroll relative grid overflow-y-auto overscroll-contain bg-bg md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">

        {/* the brand side: what this is and what happens after */}
        <aside className="demo-scroll [--thumb:color-mix(in_srgb,var(--accent-ink)_35%,transparent)] relative isolate overflow-clip bg-accent px-6 pt-7 pb-7 text-accent-ink sm:px-8 md:flex md:flex-col md:overflow-y-auto md:overscroll-contain md:py-8">
          <Pattern kind="jaali" className="absolute inset-0 -z-10 opacity-[.07]" />
          <Pattern kind="temple" className="absolute inset-x-0 bottom-0 -z-10 opacity-30" />
          <span aria-hidden="true" className="font-deva pointer-events-none absolute -top-5 -right-4 -z-10 select-none text-[120px] leading-none font-bold opacity-[.08] md:hidden">सेतुक</span>

          <button type="button" onClick={hide} aria-label={c.close}
            className="press absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-accent-ink/10 hover:bg-accent-ink/20 md:hidden">
            <I.X size={18} weight="bold" aria-hidden />
          </button>
          <div className="flex items-center gap-3 pr-12 md:pr-0">
            <span className="block w-8 shrink-0 [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)]"><SetukMark /></span>
            <span className="text-[12px] font-semibold uppercase tracking-[.12em] opacity-75">{c.kicker}</span>
          </div>
          <h2 id={`${id}-t`} ref={titleRef} tabIndex={-1} className="font-display-tight mt-6 text-[24px] leading-[1.08] text-balance outline-none md:mt-6 md:text-[28px]">{c.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed opacity-80 md:leading-normal">{c.body}</p>

          <Next c={c} whatsapp={whatsapp} phone={phone} className="max-md:hidden md:mt-7 md:flex md:flex-1 md:flex-col" />
        </aside>

        {/* the paper side: the slip */}
        <div className="demo-scroll relative md:overflow-y-auto md:overscroll-contain">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-dashed border-line bg-bg/90 px-6 py-3 backdrop-blur-sm sm:px-8">
            <p className="flex min-w-0 items-baseline gap-3 text-[13px]">
              <span className="font-mono text-[11px] uppercase tracking-[.14em] text-muted">{c.to}</span>
              <span className="truncate font-medium">{c.toValue}</span>
            </p>
            <button type="button" onClick={hide} aria-label={c.close}
              className="press -mr-2 max-md:hidden grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink">
              <I.X size={18} weight="bold" aria-hidden />
            </button>
          </div>

          <form ref={formRef} noValidate onSubmit={onSubmit} onInput={onInput} hidden={sent} className="px-6 pt-6 sm:px-8 sm:pt-7">
            <fieldset>
              <legend className={label}>{c.role} {opt}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.roles.map((r, i) => (
                  <label key={r} className="demo-chip group relative inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[14px] font-medium transition-colors hover:border-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
                    <input type="radio" name="role" value={i} className="sr-only" />
                    <I.Check size={14} weight="bold" className="demo-tick shrink-0" aria-hidden />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`${id}-n`} className={label}>{c.name}</label>
                <input id={`${id}-n`} name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={desc("name")} className={`${input} h-12 ${border("name")}`} />
                {err("name")}
              </div>
              <div>
                <label htmlFor={`${id}-p`} className={label}>{c.phone}</label>
                <input id={`${id}-p`} name="phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={desc("phone")} className={`${input} h-12 ${border("phone")}`} />
                {err("phone")}
              </div>
            </div>

            <fieldset className="mt-6">
              <legend className={label}>{c.staff} {opt}</legend>
              {/* a segmented scale: one track, the chosen step lifts out of it */}
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 sm:grid-cols-4">
                {c.staffs.map((s, i) => (
                  <label key={s} className="relative flex min-h-10 cursor-pointer items-center justify-center rounded-[9px] px-2 text-center text-[14px] font-medium text-muted transition-[background-color,color,box-shadow] hover:text-ink has-[:checked]:bg-bg has-[:checked]:text-ink has-[:checked]:shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_14%,transparent),0_0_0_1px_var(--line)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
                    <input type="radio" name="staff" value={i} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label htmlFor={`${id}-m`} className={label}>{c.note} {opt}</label>
              <textarea id={`${id}-m`} name="note" rows={2} placeholder={c.noteHint} className={`${input} min-h-[72px] resize-y border-line py-3`} />
            </div>

            {/* the foot of the slip stays in view, so the button is never below the fold */}
            <div className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-dashed border-line bg-bg/95 px-6 pt-4 pb-5 backdrop-blur-sm sm:-mx-8 sm:px-8">
              <p className="text-[13px] leading-snug text-muted">{c.consent} <Link href={privacyHref} className="font-medium text-accent underline underline-offset-2">{c.privacy}</Link></p>
              <button type="submit" className="press mt-3 inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110 sm:w-auto">
                {c.submit}<I.ArrowRight weight="bold" aria-hidden />
              </button>
            </div>
          </form>

          {sent && (
            <div ref={sentRef} tabIndex={-1} role="status" className="demo-sent px-6 pt-10 pb-10 outline-none sm:px-8 md:pt-16">
              {/* the slip goes into an envelope, the flap folds and Setuk's seal stamps it shut (globals.css, .env-*) */}
              <span aria-hidden className="env">
                <span className="env-back" />
                <span className="env-slip" />
                <span className="env-front" />
                <span className="env-flap" />
                <span className="env-seal"><span className="block w-[22px] [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)] [--mark-dot-side:var(--accent-ink)]"><SetukMark /></span></span>
              </span>
              <h3 className="font-display-tight mt-8 text-[24px] leading-tight text-balance">{c.sentTitle}</h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-muted">{c.sentBody}</p>
              <button type="button" onClick={hide} className="press mt-8 inline-flex h-11 items-center rounded-full border border-line px-6 font-semibold hover:border-ink">{c.done}</button>
            </div>
          )}
        </div>

        {/* on phones the slip comes first, and what happens after follows it */}
        <Next c={c} whatsapp={whatsapp} phone={phone} className="relative isolate overflow-clip bg-accent px-6 py-7 text-accent-ink sm:px-8 md:hidden" />
      </div>
    </dialog>
  );
}

/** An Indian mobile number: ten digits from 6 to 9, with or without +91 or a leading 0, spaces and dashes allowed */
function mobile(x: string) {
  const d = x.replace(/[\s()-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d);
}

/** What happens after you send it, and the numbers to call instead: the brand side's lower half */
function Next({ c, whatsapp, phone, className }: { c: DemoCopy; whatsapp: Direct; phone: Direct; className: string }) {
  return (
    <div className={className}>
      <ol className="demo-steps space-y-4">
        {c.steps.map((s, i) => (
          <li key={s.t} className="relative flex gap-4">
            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-accent-ink/35 bg-accent font-mono text-[12px] tabular-nums">{i + 1}</span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-[15px] leading-snug font-semibold">{s.t}</span>
              <span className="mt-1 block text-[14px] leading-snug opacity-75">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 border-t border-accent-ink/20 pt-4 md:mt-auto">
        <p className="text-[13px] opacity-75">{c.direct}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-5">
          <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-[15px] font-semibold underline decoration-accent-ink/30 underline-offset-4 hover:decoration-accent-ink">
            <I.WhatsappLogo size={18} className="shrink-0" aria-hidden />{whatsapp.label}
          </a>
          <a href={phone.href} className="inline-flex min-h-9 items-center gap-2 text-[15px] font-semibold underline decoration-accent-ink/30 underline-offset-4 hover:decoration-accent-ink">
            <I.Phone size={18} className="shrink-0" aria-hidden />{phone.label}
          </a>
        </div>
      </div>
    </div>
  );
}
