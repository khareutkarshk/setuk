"use client";

import { useEffect, useId, useRef, useState } from "react";
import type Lenis from "lenis";
import * as I from "@/components/icons";
import { watchLenis } from "@/lib/smooth-scroll";

/** What each figure in the dialog shows, by key, so the server can hand it over without components */
const ICONS = { acs: I.UsersThree, pcs: I.Bank, booths: I.HouseLine, files: I.FileXls, districts: I.MapTrifold } as const;
export type StatKey = keyof typeof ICONS;

/**
 * One card's order, carried on its order link as data-order (JSON). Kept short, as a state's list
 * can hold hundreds of cards: the labels and the rate come once, through OrderHost's props, and the
 * WhatsApp message is the link's own href.
 */
export type OrderPayload = {
  /** The line over the title, "State" or "Assembly constituency · AC 181" */
  code: string;
  /** "Complete Digha voter list" */
  title: string;
  roll: string;
  /** "₹10,06,600" */
  price: string;
  /** The figures, in order, as [what, how many] */
  stats: [StatKey, string][];
  /** The Lok Sabha seat of a constituency, "30 · Patna Sahib" */
  seat?: string;
};

export type OrderCopy = { from: string; price: string; buy: string; buyNote: string; or: string; chat: string; close: string };
type OrderLabels = { stats: Record<StatKey, string>; seat: string; rate: string };

/**
 * The order dialog, one per page. Every card's order button is a plain WhatsApp link (so it still
 * works without script) carrying its order as data-order; a click on one opens this dialog instead:
 * the area, the roll it comes from, its figures first, then the price, then the WhatsApp order and,
 * on wider screens, the number to write to. The price shows only here, never on the card. A native
 * <dialog>: Escape and the backdrop close it, focus stays inside and goes back to the button after,
 * and the page under it holds still (Lenis stops while it is open).
 */
export function OrderHost({ copy, labels, chat }: { copy: OrderCopy; labels: OrderLabels; chat: { href: string; label: string } }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [order, setOrder] = useState<(OrderPayload & { href: string }) | null>(null);
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-order]");
      if (!el?.dataset.order) return;
      e.preventDefault();
      setOrder({ ...(JSON.parse(el.dataset.order) as OrderPayload), href: el.getAttribute("href") ?? chat.href });
      ref.current?.showModal();
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [chat.href]);

  useEffect(() => {
    if (!open) return;
    let l: Lenis | null = null;
    const stop = watchLenis((x) => { l?.start(); l = x; l?.stop(); });
    return () => { stop(); l?.start(); };
  }, [open]);

  const hide = () => ref.current?.close();

  return (
    <dialog ref={ref} aria-labelledby={`${id}-t`} onClose={() => setOpen(false)} data-lenis-prevent
      /* a click on the backdrop lands on the dialog itself, outside its panel */
      onClick={(e) => { if (e.target === e.currentTarget) hide(); }}
      className="m-auto w-[calc(100%-32px)] max-w-[480px] overflow-visible bg-transparent p-0 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-[2px]">
      {order && (
        <div className="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-3xl border border-line bg-bg p-6 shadow-[0_40px_90px_-40px_color-mix(in_srgb,var(--ink)_60%,transparent)] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[.08em] text-muted">{order.code}</p>
              <h2 id={`${id}-t`} className="font-display-tight mt-1.5 text-[24px] leading-tight text-balance">{order.title}</h2>
            </div>
            <button type="button" onClick={hide} aria-label={copy.close}
              className="press -mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink hover:border-ink">
              <I.X size={18} weight="bold" aria-hidden />
            </button>
          </div>
          <p className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent">
            <I.FileXls className="shrink-0" aria-hidden /><span className="sr-only">{copy.from}: </span><span className="truncate">{order.roll}</span>
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-5">
            {order.stats.map(([key, value]) => {
              const Icon = ICONS[key];
              return (
                <div key={key} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon size={18} aria-hidden /></span>
                  <span className="flex min-w-0 flex-col-reverse">
                    <dt className="text-[12.5px] leading-snug text-muted">{labels.stats[key]}</dt>
                    <dd className="text-[17px] leading-tight font-semibold tabular-nums">{value}</dd>
                  </span>
                </div>
              );
            })}
          </dl>
          {order.seat && (
            <p className="mt-2 flex items-center gap-2 rounded-xl bg-surface px-3.5 py-3 text-[14px]">
              <I.Bank className="shrink-0 text-accent" aria-hidden /><span className="text-muted">{labels.seat}</span><span className="font-semibold">{order.seat}</span>
            </p>
          )}

          <div className="mt-5 border-t border-line pt-5">
            <p className="text-[13px] text-muted">{copy.price}</p>
            <p className="mt-1 text-[32px] leading-none font-semibold tabular-nums">{order.price}</p>
            <p className="mt-2 text-[14px] font-medium text-accent">{labels.rate}</p>
          </div>

          <a href={order.href} target="_blank" rel="noopener noreferrer"
            className="press mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[16px] font-semibold text-accent-ink hover:brightness-110">
            <I.WhatsappLogo size={20} aria-hidden />{copy.buy}<I.ArrowRight weight="bold" aria-hidden />
          </a>
          <p className="mt-3 text-center text-[13.5px] leading-snug text-muted">{copy.buyNote}</p>
          {/* the number to write to: desktop only, as a phone's WhatsApp is one tap away through the button above */}
          <p className="my-4 hidden items-center gap-3 text-[12px] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line md:flex">{copy.or}</p>
          <a href={chat.href} target="_blank" rel="noopener noreferrer"
            className="hidden min-h-11 items-center justify-center gap-2 text-[15px] font-semibold text-leaf md:flex">
            <I.WhatsappLogo size={20} className="shrink-0" aria-hidden />
            <span className="underline decoration-leaf/30 underline-offset-4 hover:decoration-leaf">{chat.label}</span>
          </a>
        </div>
      )}
    </dialog>
  );
}
