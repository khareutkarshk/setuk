"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Pages } from "@/content/types";
import * as I from "@/components/icons";

type F = Pages["contact"]["form"];
type Field = "name" | "email" | "message" | "consent";

/**
 * The contact form. There is no form backend yet, so sending composes the email in the visitor's
 * own mail app (to contact@setuk.org, subject and body filled in); the page says so beside the button.
 * Fields validate on submit, then live once touched; errors sit under their field and are announced.
 * ?topic=0..4 preselects the topic (links from other pages).
 */
export function ContactForm({ f, to, privacyHref }: { f: F; to: string; privacyHref: string }) {
  const id = useId();
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const topicRef = useRef<HTMLSelectElement>(null);

  /* preselect from the address; the select stays uncontrolled */
  useEffect(() => {
    const q = Number(new URLSearchParams(location.search).get("topic"));
    if (topicRef.current && Number.isInteger(q) && q > 0 && q < f.topics.length) topicRef.current.value = String(q);
  }, [f.topics.length]);

  const check = (form: HTMLFormElement) => {
    const d = new FormData(form);
    const e: Partial<Record<Field, string>> = {};
    if (!String(d.get("name") ?? "").trim()) e.name = f.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.get("email") ?? "").trim())) e.email = f.errors.email;
    if (String(d.get("message") ?? "").trim().length < 10) e.message = f.errors.message;
    if (!d.get("consent")) e.consent = f.errors.consent;
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
    const d = new FormData(form);
    const g = (k: string) => String(d.get(k) ?? "").trim();
    const subject = `${f.topics[Number(g("topic"))] ?? f.topics[0]}: ${g("name")}${g("org") ? `, ${g("org")}` : ""}`;
    const body = [g("message"), "", `${f.name}: ${g("name")}`, `${f.email}: ${g("email")}`, g("org") ? `${f.org}: ${g("org")}` : ""].filter((x, i) => x || i < 2).join("\n");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  useEffect(() => { if (sent) sentRef.current?.focus(); }, [sent]);

  const onInput = () => { if (touched && formRef.current) setErrors(check(formRef.current)); };

  if (sent) {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className="rounded-3xl border border-line bg-surface p-8 outline-none md:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-leaf-soft text-leaf"><I.EnvelopeSimpleOpen size={24} aria-hidden /></span>
        <h2 className="font-display-tight mt-6 text-[26px] leading-tight">{f.sentTitle}</h2>
        <p className="mt-3 max-w-[48ch] leading-relaxed text-muted">{f.sentBody}</p>
        <button type="button" onClick={() => { setSent(false); setTouched(false); setErrors({}); }} className="press mt-8 inline-flex h-11 items-center rounded-full border border-line px-5 font-semibold hover:border-ink">{f.again}</button>
      </div>
    );
  }

  const input = "mt-2 block w-full rounded-xl border bg-bg px-4 text-[16px] text-ink transition-colors placeholder:text-muted/80 hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25";
  const border = (k: Field) => (errors[k] ? "border-danger" : "border-line");
  const err = (k: Field) => errors[k] && <p id={`${id}-${k}`} className="mt-2 flex items-start gap-1.5 text-[14px] leading-snug font-medium text-danger"><I.Info className="mt-0.5 shrink-0" aria-hidden />{errors[k]}</p>;
  const desc = (k: Field) => (errors[k] ? `${id}-${k}` : undefined);

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} onInput={onInput} className="rounded-3xl border border-line bg-surface p-6 sm:p-8 md:p-10">
      <h2 className="font-display-tight text-[24px]">{f.title}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-n`} className="text-[14px] font-semibold">{f.name}</label>
          <input id={`${id}-n`} name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={desc("name")} className={`${input} h-12 ${border("name")}`} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${id}-e`} className="text-[14px] font-semibold">{f.email}</label>
          <input id={`${id}-e`} name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={desc("email")} className={`${input} h-12 ${border("email")}`} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${id}-o`} className="text-[14px] font-semibold">{f.org} <span className="font-normal text-muted">({f.optional})</span></label>
          <input id={`${id}-o`} name="org" autoComplete="organization" className={`${input} h-12 border-line`} />
        </div>
        <div>
          <label htmlFor={`${id}-t`} className="text-[14px] font-semibold">{f.topic}</label>
          <div className="relative">
            <select ref={topicRef} id={`${id}-t`} name="topic" defaultValue={0} className={`${input} h-12 appearance-none border-line pr-10`}>
              {f.topics.map((x, i) => <option key={x} value={i}>{x}</option>)}
            </select>
            <I.CaretRight className="pointer-events-none absolute top-1/2 right-4 mt-1 -translate-y-1/2 rotate-90 text-muted" aria-hidden />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-m`} className="text-[14px] font-semibold">{f.message}</label>
          <p id={`${id}-mh`} className="mt-1 text-[14px] text-muted">{f.messageHint}</p>
          <textarea id={`${id}-m`} name="message" rows={5} aria-invalid={!!errors.message} aria-describedby={[`${id}-mh`, desc("message")].filter(Boolean).join(" ")} className={`${input} min-h-[140px] resize-y py-3 ${border("message")}`} />
          {err("message")}
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-[15px]">
            <input type="checkbox" name="consent" aria-invalid={!!errors.consent} aria-describedby={desc("consent")} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-[var(--accent)]" />
            <span>{f.consent} <Link href={privacyHref} className="font-medium text-accent underline underline-offset-2">{f.privacy}</Link></span>
          </label>
          {err("consent")}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
        <button type="submit" className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
          {f.submit}<I.ArrowRight weight="bold" aria-hidden />
        </button>
        <p className="text-[14px] text-muted">{f.submitNote}</p>
      </div>
    </form>
  );
}
