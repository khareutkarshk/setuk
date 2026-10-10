"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { Pages } from "@/content/types";
import * as I from "@/components/icons";

type E = Pages["common"]["engage"];
type Ico = typeof I.Copy;

/* storage can be missing or throw (private windows, blocked site data); everything works without it */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} }
};

/* a stored answer read like any outside value: null on the server, the saved one after hydration */
const VOTED = "setuk:helpful";
const onVote = (cb: () => void) => {
  addEventListener(VOTED, cb);
  addEventListener("storage", cb);
  return () => { removeEventListener(VOTED, cb); removeEventListener("storage", cb); };
};
const never = () => () => {};

const ROUND = "press grid shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-accent hover:text-accent";

/**
 * Share links for one article. The networks are plain links (they work before hydration); copying
 * and the device's own share sheet need JavaScript, and the share sheet only shows where it exists.
 */
export function ShareBar({ e, url, title, compact = false }: { e: E; url: string; title: string; compact?: boolean }) {
  /* the sidebar is narrow: smaller circles keep every network on one row there */
  const round = `${ROUND} ${compact ? "h-9 w-9" : "h-11 w-11"}`;
  const [copied, setCopied] = useState(false);
  const native = useSyncExternalStore(never, () => typeof navigator.share === "function", () => false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links: { name: string; icon: Ico; href: string; className?: string }[] = [
    { name: "WhatsApp", icon: I.WhatsappLogo, href: `https://wa.me/?text=${t}%20${u}`, className: "hover:text-leaf hover:border-leaf" },
    { name: "LinkedIn", icon: I.LinkedinLogo, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", icon: I.XLogo, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "Facebook", icon: I.FacebookLogo, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` }
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* older browsers and insecure origins: fall back to a hidden field */
      const f = Object.assign(document.createElement("textarea"), { value: url });
      document.body.append(f);
      f.select();
      document.execCommand("copy");
      f.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2400);
  };

  const share = () => navigator.share({ title, url }).catch(() => {});

  return (
    <div className={compact ? "" : "flex flex-wrap items-center gap-x-5 gap-y-3"}>
      <p className={compact ? "text-[14px] font-semibold" : "text-[15px] font-semibold"}>{e.share}</p>
      <ul className={`flex flex-wrap items-center ${compact ? "mt-3 gap-1" : "gap-2"}`}>
        {links.map(({ name, icon: Icon, href, className = "" }) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={e.shareOn.replace("{name}", name)} title={name} className={`${round} ${className}`}>
              <Icon size={compact ? 17 : 19} aria-hidden />
            </a>
          </li>
        ))}
        <li>
          <a href={`mailto:?subject=${t}&body=${u}`} aria-label={e.email} title={e.email} className={round}><I.EnvelopeSimple size={compact ? 17 : 19} aria-hidden /></a>
        </li>
        {native && (
          <li>
            <button type="button" onClick={share} aria-label={e.more} title={e.more} className={round}><I.ShareNetwork size={compact ? 17 : 19} aria-hidden /></button>
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={copy}
            title={compact ? e.copy : undefined}
            aria-label={compact ? e.copy : undefined}
            className={`press inline-flex items-center gap-2 rounded-full border text-[15px] font-semibold transition-colors ${copied ? "border-leaf bg-leaf-soft text-leaf" : "border-line bg-surface hover:border-accent hover:text-accent"} ${compact ? "h-9 w-9 justify-center" : "h-11 px-4"}`}
          >
            {copied ? <I.Check size={compact ? 16 : 18} weight="bold" aria-hidden /> : <I.LinkSimple size={compact ? 17 : 18} weight="bold" aria-hidden />}
            {!compact && <span>{copied ? e.copied : e.copy}</span>}
          </button>
        </li>
      </ul>
      {/* announced for screen readers whichever button was used */}
      <span role="status" className="sr-only">{copied ? e.copied : ""}</span>
    </div>
  );
}

/**
 * "Was this guide helpful?" The answer is kept in this browser only, so a returning reader sees
 * their thanks instead of the question. There is no backend yet: to count answers, send `vote`
 * to analytics or a form endpoint where it is stored below.
 */
export function Feedback({ e, slug, contactHref }: { e: E; slug: string; contactHref: string }) {
  const key = `${VOTED}:${slug}`;
  const [picked, setPicked] = useState<"yes" | "no" | null>(null);
  const saved = useSyncExternalStore(onVote, () => store.get(key), () => null);
  const vote = picked ?? (saved === "yes" || saved === "no" ? saved : null);
  const thanks = useRef<HTMLParagraphElement>(null);

  const answer = (v: "yes" | "no") => {
    setPicked(v);
    store.set(key, v);
    dispatchEvent(new Event(VOTED));
    requestAnimationFrame(() => thanks.current?.focus());
  };

  if (vote) {
    return (
      <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2">
        <p ref={thanks} tabIndex={-1} role="status" className="flex items-center gap-2 text-[15px] font-semibold outline-none">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-leaf-soft text-leaf"><I.Check size={15} weight="bold" aria-hidden /></span>
          {vote === "yes" ? e.thanksYes : e.thanksNo}
        </p>
        {vote === "no" && (
          <Link href={contactHref} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent">
            {e.tellUs}<I.ArrowRight aria-hidden />
          </Link>
        )}
      </div>
    );
  }

  const btn = "press inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[15px] font-semibold transition-colors hover:border-accent hover:text-accent";
  return (
    <div role="group" aria-labelledby={`${key}-q`} className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <p id={`${key}-q`} className="text-[15px] font-semibold">{e.helpful}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => answer("yes")} className={btn}><I.ThumbsUp size={18} aria-hidden />{e.yes}</button>
        <button type="button" onClick={() => answer("no")} className={btn}><I.ThumbsDown size={18} aria-hidden />{e.no}</button>
      </div>
    </div>
  );
}

/**
 * Newsletter sign-up. There is no mailing list backend yet, so subscribing composes a request in the
 * reader's own mail app (like the contact form) and the form says so. Swap `onSubmit` for a call to
 * the list provider when there is one.
 */
export function Newsletter({ e, to, source }: { e: E; to: string; source: string }) {
  const n = e.newsletter;
  const id = useId();
  const [error, setError] = useState(false);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const done = useRef<HTMLDivElement>(null);

  const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const email = input.current?.value.trim() ?? "";
    setTouched(true);
    if (!valid(email)) { setError(true); input.current?.focus(); return; }
    const body = `Please add ${email} to the Setuk newsletter.\n\nSigned up from: ${source}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent("Newsletter: subscribe")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  useEffect(() => { if (sent) done.current?.focus(); }, [sent]);

  if (sent) {
    return (
      <div ref={done} tabIndex={-1} role="status" className="outline-none">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf-soft text-leaf"><I.EnvelopeSimpleOpen size={22} aria-hidden /></span>
        <p className="font-display-tight mt-4 text-[22px] leading-tight">{n.sentTitle}</p>
        <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-muted">{n.sentBody}</p>
        <button type="button" onClick={() => { setSent(false); setTouched(false); setError(false); }} className="press mt-5 inline-flex h-11 items-center rounded-full border border-line px-5 text-[15px] font-semibold hover:border-ink">{n.again}</button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} onInput={() => touched && setError(!valid(input.current?.value ?? ""))}>
      <label htmlFor={`${id}-e`} className="text-[14px] font-semibold">{n.label}</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          ref={input}
          id={`${id}-e`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={n.placeholder}
          aria-invalid={error}
          aria-describedby={`${id}-n${error ? ` ${id}-x` : ""}`}
          className={`block h-12 w-full min-w-0 rounded-xl border bg-bg px-4 text-[16px] text-ink transition-colors placeholder:text-muted/80 hover:border-muted focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25 ${error ? "border-danger" : "border-line"}`}
        />
        <button type="submit" className="press inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
          {n.submit}<I.PaperPlaneTilt weight="bold" aria-hidden />
        </button>
      </div>
      {error && <p id={`${id}-x`} className="mt-2 flex items-start gap-1.5 text-[14px] leading-snug font-medium text-danger"><I.Info className="mt-0.5 shrink-0" aria-hidden />{n.error}</p>}
      <p id={`${id}-n`} className="mt-2 text-[14px] text-muted">{n.note}</p>
    </form>
  );
}
